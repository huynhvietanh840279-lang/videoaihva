"""SFX tự tổng hợp bằng ffmpeg (không cần tải, không lo bản quyền)."""
from .util import ASSETS, run

SFX_DIR = ASSETS / "sfx"

RECIPES = {
    "whoosh": "anoisesrc=d=0.55:c=pink:a=0.6,highpass=f=400,lowpass=f=5000,"
              "afade=t=in:d=0.22:curve=exp,afade=t=out:st=0.22:d=0.33,volume=0.9",
    "pop": "sine=f=740:d=0.11,afade=t=out:st=0.015:d=0.095,volume=0.8",
    "tick": "sine=f=1900:d=0.045,afade=t=out:st=0.005:d=0.04,volume=0.45",
}


def ensure_sfx():
    SFX_DIR.mkdir(parents=True, exist_ok=True)
    out = {}
    for name, recipe in RECIPES.items():
        p = SFX_DIR / f"{name}.wav"
        if not p.exists():
            run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", recipe,
                 "-ar", "48000", "-ac", "2", str(p)])
        out[name] = p
    return out


def step_times(n, dur):
    span = max(dur - 1.2, n * 0.5)
    return [0.45 + i * span / n for i in range(n)]


def events_for(plan):
    """Danh sách (giây, loại sfx) khớp đúng lúc hình xuất hiện."""
    ev = [(0.05, "pop")]
    for e in plan["effects"]:
        s, d = e["start"], e["end"] - e["start"]
        ev.append((max(s - 0.15, 0), "whoosh"))
        if e["type"] == "overlay":
            ev += [(s + t, "tick") for t in step_times(len(e["steps"]), d)]
        elif e["type"] == "broll" and e["kind"] == "list":
            ev += [(s + t, "tick") for t in step_times(len(e["items"]), d)]
        elif e["type"] == "broll":
            ev.append((s + 1.3, "pop"))
        elif e["type"] == "face_crop":
            ev += [(s + t, "tick") for t in step_times(len(e["points"]), d)]
        elif e["type"] == "compare":
            ev.append((s + 0.6, "pop"))
    return ev
