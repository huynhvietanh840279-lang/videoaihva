"""Dựng đồ hoạ động (thumbnail, overlay, B-roll, crop-mặt, so sánh) bằng Chromium.

Mỗi hiệu ứng = 1 chuỗi PNG trong suốt 30fps, sau đó ffmpeg chồng lên video.
Hoạt hoạ tính theo thời gian t (seek-safe), không phụ thuộc CSS animation.
"""
import json
from pathlib import Path

from .util import FONTS, FPS, H, W

STAGE = Path(__file__).with_name("stage.html")

# Vị trí khung mặt (picture-in-picture) cho từng kiểu
PIP = {
    "circle": {"shape": "circle", "x": 70, "y": 170, "w": 420, "h": 420},
    "square": {"shape": "square", "x": 200, "y": 210, "w": 680, "h": 680},
    "side": {"shape": "rect", "x": 40, "y": 620, "w": 480, "h": 640},
}


def pip_for(effect):
    if effect["type"] == "face_crop":
        return PIP[effect["shape"]]
    if effect["type"] == "compare" and effect["variant"] == "side_by_side":
        return PIP["side"]
    return None


class Renderer:
    def __init__(self, colors, chin_px):
        from playwright.sync_api import sync_playwright
        self._pw = sync_playwright().start()
        self._browser = self._pw.chromium.launch()
        self.colors = colors
        self.chin = chin_px

    def close(self):
        self._browser.close()
        self._pw.stop()

    def render(self, kind, dur, outdir, eff=None, thumb=None, chin=None):
        outdir = Path(outdir)
        outdir.mkdir(parents=True, exist_ok=True)
        data = {"kind": kind, "dur": dur, "c1": self.colors[0], "c2": self.colors[1],
                "chin": chin if chin is not None else self.chin,
                "eff": eff or {}, "thumb": thumb or {}, "pip": pip_for(eff) if eff else None}
        html = STAGE.read_text(encoding="utf-8")
        html = html.replace("__FONTS__", FONTS.as_uri()).replace("__DATA__", json.dumps(data, ensure_ascii=False))
        page_file = outdir / "stage.html"
        page_file.write_text(html, encoding="utf-8")
        page = self._browser.new_page(viewport={"width": W, "height": H})
        page.goto(page_file.as_uri())
        page.evaluate("window.READY")
        n = max(1, int(round(dur * FPS)))
        for i in range(n):
            page.evaluate(f"window.R({i / FPS})")
            page.screenshot(path=str(outdir / f"{i:05d}.png"), omit_background=True)
        page.close()
        return n
