"""Chạy không cần web:  python cli.py input/video.mp4 [--mau1 #hex --mau2 #hex]

Quản lý mã bán lượt:  python cli.py tao-ma ABC123 10   (mã ABC123 dùng được 10 video)
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

if len(sys.argv) > 1 and sys.argv[1] == "tao-ma":
    code, n = sys.argv[2].upper(), int(sys.argv[3])
    import os
    p = Path(os.environ.get("DANG2_STORAGE", str(ROOT))) / "data" / "codes.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    c = json.loads(p.read_text()) if p.exists() else {}
    c[code] = c.get(code, 0) + n
    p.write_text(json.dumps(c, indent=2))
    print(f"Mã {code}: còn {c[code]} lượt")
    sys.exit(0)

from engine.pipeline import run_job  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("--mau1", default="#F5FF3B")
ap.add_argument("--mau2", default="#3BF5FF")
a = ap.parse_args()
src = Path(a.video)
out = ROOT / "output" / f"{src.stem}-dang2.mp4"
run_job(src, ROOT / "jobs" / f"cli-{src.stem}", out, colors=(a.mau1, a.mau2))
print("Thành phẩm:", out)
