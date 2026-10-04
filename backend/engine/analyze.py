"""Nhận diện khuôn mặt theo thời gian + năng lượng giọng nói từng từ."""
import cv2
import numpy as np

SAMPLE_FPS = 5


def track_faces(video):
    """Trả về list mẫu {t, cx, cy, w, h} (chuẩn hoá 0-1), đã làm mượt."""
    import subprocess
    from .util import probe
    info = probe(video)
    sw = 360
    sh = int(round(info["height"] * sw / info["width"] / 2) * 2)
    # ffmpeg giải mã thẳng ra ảnh xám nhỏ 5fps -> nhanh hơn nhiều so với đọc full HD
    proc = subprocess.Popen(
        ["ffmpeg", "-loglevel", "error", "-i", str(video), "-vf",
         f"fps={SAMPLE_FPS},scale={sw}:{sh},format=gray", "-f", "rawvideo", "-"],
        stdout=subprocess.PIPE)
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    raw, idx, size = [], 0, sw * sh
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        gray = cv2.equalizeHist(np.frombuffer(buf, np.uint8).reshape(sh, sw))
        faces = casc.detectMultiScale(gray, 1.1, 6, minSize=(36, 36))
        t = idx / SAMPLE_FPS
        # bỏ nhận nhầm: mặt phải nằm 3/4 trên khung và không quá nhỏ/quá to
        faces = [f for f in faces if (f[1] + f[3] / 2) < 0.75 * sh and 0.07 * sh < f[3] < 0.6 * sh]
        if len(faces):
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            raw.append([t, (x + w / 2) / sw, (y + h / 2) / sh, w / sw, h / sh])
        else:
            raw.append([t, np.nan, np.nan, np.nan, np.nan])
        idx += 1
    proc.wait()
    if not raw:
        return [{"t": 0, "cx": 0.5, "cy": 0.33, "w": 0.4, "h": 0.22}]
    arr = np.array(raw, dtype=float)
    for c in range(1, 5):
        col = arr[:, c]
        good = ~np.isnan(col)
        if good.sum() == 0:
            arr[:, c] = [0, 0.5, 0.33, 0.4, 0.22][c]
            continue
        arr[:, c] = np.interp(arr[:, 0], arr[good, 0], col[good])
        k = SAMPLE_FPS  # median ~1s để chống rung
        padded = np.pad(arr[:, c], (k, k), mode="edge")
        arr[:, c] = [np.median(padded[i:i + 2 * k + 1]) for i in range(len(arr))]
    return [{"t": round(r[0], 2), "cx": round(r[1], 4), "cy": round(r[2], 4),
             "w": round(r[3], 4), "h": round(r[4], 4)} for r in arr]


def face_at(track, t0, t1=None):
    """Hộp mặt trung bình trong khoảng [t0, t1]."""
    t1 = t0 if t1 is None else t1
    sel = [f for f in track if t0 - 0.2 <= f["t"] <= t1 + 0.2] or [
        min(track, key=lambda f: abs(f["t"] - t0))]
    return {k: float(np.mean([f[k] for f in sel])) for k in ("cx", "cy", "w", "h")}


def word_energy(wav, words):
    import librosa
    y, sr = librosa.load(str(wav), sr=16000, mono=True)
    hop = 160
    rms = librosa.feature.rms(y=y, frame_length=640, hop_length=hop)[0]
    try:
        f0 = librosa.yin(y, fmin=70, fmax=400, sr=sr, frame_length=1024, hop_length=hop)
    except Exception:
        f0 = np.zeros_like(rms)
    vals = []
    for wd in words:
        a, b = int(wd["s"] * sr / hop), max(int(wd["e"] * sr / hop), int(wd["s"] * sr / hop) + 1)
        vals.append((float(np.mean(rms[a:b])) if b <= len(rms) else 0.0,
                     float(np.median(f0[a:b])) if b <= len(f0) else 0.0))
    e = np.array([v[0] for v in vals]) if vals else np.array([0.0])
    p = np.array([v[1] for v in vals]) if vals else np.array([0.0])
    ez = (e - e.mean()) / (e.std() + 1e-6)
    pz = (p - p.mean()) / (p.std() + 1e-6)
    for wd, a, b in zip(words, ez, pz):
        wd["en"] = round(float(0.65 * a + 0.35 * b), 2)
    return words


def group_lines(words, max_words=14, gap=0.45):
    """Gom từ thành câu/ý để đưa cho Claude đọc."""
    lines, cur = [], []
    for i, wd in enumerate(words):
        cur.append(wd)
        end_punct = wd["w"][-1:] in ".?!,;:"
        nxt_gap = (words[i + 1]["s"] - wd["e"]) if i + 1 < len(words) else 9
        if len(cur) >= max_words or nxt_gap >= gap or (end_punct and len(cur) >= 4):
            lines.append(cur)
            cur = []
    if cur:
        lines.append(cur)
    out = []
    for i, ln in enumerate(lines):
        out.append({
            "i": i, "s": ln[0]["s"], "e": ln[-1]["e"],
            "text": " ".join(w["w"] for w in ln),
            "energy": round(max(w.get("en", 0) for w in ln), 2),
        })
    return out
