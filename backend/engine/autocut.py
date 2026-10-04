"""Cắt gọn tự nhiên: khoảng lặng ≥0.6s, từ đệm, đoạn lấy đà ở đầu.

Luật (theo skill Dạng 2):
- chỉ cắt khoảng lặng ≥0.6s, chừa ≥0.15s đệm mỗi bên
- 2 điểm cắt cách nhau <0.4s thì gộp
- không cắt quá 40% tổng thời lượng
- mốc thời gian sau cắt được tính lại cho từng từ (không dùng mốc gốc)
"""
import re

from .prep import clean_token
from .util import run

PAD = 0.15
FILLERS = {"ừm", "ừ", "ờ", "à", "ơ", "um", "uhm", "hmm", "ah", "uh"}
LEADIN = {"một", "hai", "ba", "bốn", "năm", "1", "2", "3", "4", "5", "ok", "oke",
          "okay", "rồi", "bắt", "đầu", "nhé", "nha", "quay", "à", "ừ", "ờ", "ừm",
          "alo", "test", "chưa", "được"}


def detect_silences(src, noise_db=-30, min_d=0.6):
    p = run(["ffmpeg", "-hide_banner", "-i", str(src), "-af",
             f"silencedetect=noise={noise_db}dB:d={min_d}", "-f", "null", "-"])
    out, starts = [], []
    for line in p.stderr.splitlines():
        m = re.search(r"silence_start: ([\d.]+)", line)
        if m:
            starts.append(float(m.group(1)))
        m = re.search(r"silence_end: ([\d.]+)", line)
        if m and starts:
            out.append((starts.pop(), float(m.group(1))))
    return out


def find_leadin_end(words, limit=8.0):
    """Tìm câu nội dung thật đầu tiên; trả về mốc bắt đầu của nó (0 nếu không có lấy đà)."""
    i = 0
    while i < len(words) and words[i]["s"] < limit:
        tok = clean_token(words[i]["w"])
        if tok in LEADIN or tok.isdigit() or tok == "":
            i += 1
            continue
        break
    if i == 0 or i >= len(words):
        return 0.0
    # chỉ coi là lấy đà nếu có khoảng nghỉ trước câu thật, tránh cắt nhầm hook
    gap = words[i]["s"] - words[i - 1]["e"]
    return max(0.0, words[i]["s"] - PAD) if gap >= 0.25 else 0.0


def plan_cuts(duration, words, silences):
    cuts = []
    lead = find_leadin_end(words)
    if lead > 0.3:
        cuts.append((0.0, lead))
    for s, e in silences:
        a, b = s + PAD, e - PAD
        if b - a >= 0.3:
            cuts.append((a, min(b, duration)))
    for i, wd in enumerate(words):
        if clean_token(wd["w"]) in FILLERS:
            prev_e = words[i - 1]["e"] if i else 0
            next_s = words[i + 1]["s"] if i + 1 < len(words) else duration
            a = max(prev_e + 0.05, wd["s"] - 0.05)
            b = min(next_s - 0.05, wd["e"] + 0.05)
            if b - a > 0.12:
                cuts.append((a, b))
    # gộp
    cuts.sort()
    merged = []
    for a, b in cuts:
        if merged and a - merged[-1][1] < 0.4:
            merged[-1] = (merged[-1][0], max(merged[-1][1], b))
        else:
            merged.append((a, b))
    # giới hạn 40%
    total = sum(b - a for a, b in merged)
    if total > 0.4 * duration:
        keep, acc = [], 0.0
        for c in sorted(merged, key=lambda c: c[1] - c[0], reverse=True):
            if acc + (c[1] - c[0]) <= 0.4 * duration:
                keep.append(c)
                acc += c[1] - c[0]
        merged = sorted(keep)
    # đoạn giữ lại
    keeps, t = [], 0.0
    for a, b in merged:
        if a - t > 0.05:
            keeps.append((round(t, 3), round(a, 3)))
        t = b
    if duration - t > 0.05:
        keeps.append((round(t, 3), round(duration, 3)))
    return keeps


def remap_words(words, keeps):
    out, offset_list, acc = [], [], 0.0
    for a, b in keeps:
        offset_list.append((a, b, acc))
        acc += b - a
    for wd in words:
        mid = (wd["s"] + wd["e"]) / 2
        for a, b, off in offset_list:
            if a <= mid <= b:
                s = max(wd["s"], a) - a + off
                e = min(wd["e"], b) - a + off
                out.append({"w": wd["w"], "s": round(s, 3), "e": round(e, 3)})
                break
    return out, acc


def apply_cuts(src, dst, keeps):
    if len(keeps) == 1 and keeps[0][0] < 0.05:
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-t",
             str(keeps[0][1]), "-c:v", "libx264", "-preset", "veryfast", "-crf", "16",
             "-c:a", "aac", "-b:a", "192k", str(dst)])
        return
    parts, labels = [], []
    for i, (a, b) in enumerate(keeps):
        parts.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];"
                     f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d=0.01,afade=t=out:st={max(b - a - 0.012, 0):.3f}:d=0.012[a{i}]")
        labels.append(f"[v{i}][a{i}]")
    fc = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(keeps)}:v=1:a=1[v][a]"
    script = dst.with_suffix(".filter.txt")
    script.write_text(fc)
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-filter_complex_script",
         str(script), "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset",
         "veryfast", "-crf", "16", "-c:a", "aac", "-b:a", "192k", str(dst)])
