"""Caption động 1-3 từ + từ khoá đắt 2 màu (file .ass cho libass)."""
import re

from .util import ass_color

CAPTION_Y = 1450  # tâm caption, nằm 1/3 dưới khung


def _fmt(t):
    t = max(0, t)
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def _norm(s):
    return re.sub(r"[^\wÀ-ỹ ]", "", s.lower()).strip()


def chunk_words(words, max_words=3, max_chars=18):
    chunks, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        txt = " ".join(x["w"] for x in cur)
        gap = (words[i + 1]["s"] - w["e"]) if i + 1 < len(words) else 9
        if len(cur) >= max_words or len(txt) >= max_chars or gap > 0.3 or w["w"][-1:] in ".?!,;:":
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def build_ass(words, keywords, blocked, colors, path):
    """blocked: list (start, end) – những lúc tạm ngưng caption (thumbnail/hiệu ứng lớn)."""
    c1, c2 = colors
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Be Vietnam Pro Black,82,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,7,3,5,60,60,0,1
Style: Key1,Be Vietnam Pro Black,112,{ass_color(c1)},&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,8,4,5,60,60,0,1
Style: Key2,Be Vietnam Pro Black,112,{ass_color(c2)},&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,8,4,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    kw = [(_norm(k["text"]), k["color"]) for k in keywords if _norm(k["text"])]
    used = set()
    lines = []
    chunks = chunk_words(words)
    for i, ch in enumerate(chunks):
        s = ch[0]["s"]
        e = ch[-1]["e"]
        nxt = chunks[i + 1][0]["s"] if i + 1 < len(chunks) else e + 0.5
        if nxt - e < 0.35:
            e = nxt
        else:
            e += 0.15
        if any(s < b and e > a for a, b in blocked):
            continue
        text = " ".join(w["w"] for w in ch).strip(" ,.;:")
        n = _norm(text)
        style = "Cap"
        for k, col in kw:
            if k and k in n and k not in used:
                style = f"Key{col}"
                used.add(k)
                break
        if style == "Cap":
            fx = r"{\fscx88\fscy88\t(0,90,\fscx100\fscy100)}"
        else:
            fx = r"{\fscx60\fscy60\t(0,120,\fscx112\fscy112)\t(120,220,\fscx100\fscy100)}"
        y = CAPTION_Y - (20 if style != "Cap" else 0)
        lines.append(f"Dialogue: 0,{_fmt(s)},{_fmt(e)},{style},,0,0,0,,{{\\pos(540,{y})}}{fx}{text.upper() if style != 'Cap' else text}")
    open(path, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
    return len(lines)
