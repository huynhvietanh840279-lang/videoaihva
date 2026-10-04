"""Web app: khách kéo video vào -> Dạng 2 chạy -> tải MP4 về.

Chạy:  uvicorn web.app:app --host 0.0.0.0 --port 8000
Biến môi trường:
  ANTHROPIC_API_KEY  key Claude (bắt buộc để có kịch bản edit thông minh)
  DANG2_REQUIRE_CODE 1 = bắt khách nhập mã truy cập (bán theo lượt)
  DANG2_MAX_SECONDS  thời lượng video tối đa (mặc định 300)
  TELEGRAM_BOT_TOKEN token bot Telegram (lấy từ @BotFather) — có thì bot tự chạy cùng web
"""
import json
import os
import queue
import re
import shutil
import sys
import threading
import traceback
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from engine.pipeline import run_job  # noqa: E402
from engine.util import probe  # noqa: E402

STORAGE = Path(os.environ.get("DANG2_STORAGE", str(ROOT)))  # ổ đĩa lưu bền trên máy chủ
JOBS = STORAGE / "jobs"
DATA = STORAGE / "data"
JOBS.mkdir(parents=True, exist_ok=True)
DATA.mkdir(parents=True, exist_ok=True)
CODES = DATA / "codes.json"
MAX_SECONDS = float(os.environ.get("DANG2_MAX_SECONDS", 300))
REQUIRE_CODE = os.environ.get("DANG2_REQUIRE_CODE", "0") == "1"
HEX = re.compile(r"^#[0-9a-fA-F]{6}$")

app = FastAPI(title="HVA Video Studio API")
# Cho phép web frontend (Lovable) ở tên miền khác gọi API. Đặt DANG2_ORIGINS="https://videoaihva.lovable.app,https://tenmien.vn"
_origins = [o.strip() for o in os.environ.get("DANG2_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=_origins, allow_methods=["*"], allow_headers=["*"])
_lock = threading.Lock()
_q: "queue.Queue[str]" = queue.Queue()


def _status_path(jid):
    return JOBS / jid / "status.json"


def _set(jid, **kw):
    p = _status_path(jid)
    cur = json.loads(p.read_text()) if p.exists() else {}
    cur.update(kw)
    p.write_text(json.dumps(cur, ensure_ascii=False))


def _codes():
    return json.loads(CODES.read_text()) if CODES.exists() else {}


def _use_code(code):
    with _lock:
        c = _codes()
        if c.get(code, 0) <= 0:
            return False
        c[code] -= 1
        CODES.write_text(json.dumps(c, indent=2))
        return True


def _refund(code):
    if not code:
        return
    with _lock:
        c = _codes()
        c[code] = c.get(code, 0) + 1
        CODES.write_text(json.dumps(c, indent=2))


BOT_USERNAME = ""  # bot Telegram điền vào khi chạy
LISTENERS = []  # hàm(jid, meta, state, pct, msg) — bot Telegram đăng ký vào đây


def _notify(jid, meta, state, pct, msg):
    for fn in LISTENERS:
        try:
            fn(jid, meta, state, pct, msg)
        except Exception:
            traceback.print_exc()


def _worker():
    while True:
        jid = _q.get()
        d = JOBS / jid
        meta = json.loads((d / "meta.json").read_text())
        try:
            _set(jid, state="running", pct=1, msg="Bắt đầu")
            _notify(jid, meta, "running", 1, "Bắt đầu")

            def prog(p, m):
                _set(jid, pct=p, msg=m)
                _notify(jid, meta, "running", p, m)

            run_job(d / meta["file"], d / "work", d / "ket-qua-dang2.mp4",
                    colors=(meta["c1"], meta["c2"]), progress=prog)
            _set(jid, state="done", pct=100, msg="Xong")
            shutil.rmtree(d / "work", ignore_errors=True)
            _notify(jid, meta, "done", 100, "Xong")
        except Exception as ex:  # trả lượt cho khách nếu lỗi
            traceback.print_exc()
            _refund(meta.get("code"))
            _set(jid, state="error", msg=str(ex)[-400:])
            _notify(jid, meta, "error", 0, str(ex)[-300:])
        finally:
            _q.task_done()


def enqueue_file(src, c1, c2, code="", extra=None):
    """Đưa 1 file video (đã có trên đĩa) vào hàng đợi. Trả về (jid, lỗi)."""
    src = Path(src)
    ext = src.suffix.lower() or ".mp4"
    jid = uuid.uuid4().hex[:12]
    d = JOBS / jid
    d.mkdir()
    fname = "input" + ext
    shutil.move(str(src), d / fname)
    try:
        dur = probe(d / fname)["duration"]
    except Exception:
        shutil.rmtree(d)
        return None, "Không đọc được video"
    if dur > MAX_SECONDS:
        shutil.rmtree(d)
        return None, f"Video dài quá {int(MAX_SECONDS)} giây"
    meta = {"file": fname, "c1": c1, "c2": c2, "code": code}
    meta.update(extra or {})
    (d / "meta.json").write_text(json.dumps(meta))
    _set(jid, state="queued", pct=0, msg=f"Đang xếp hàng (trước bạn: {_q.qsize()})")
    _q.put(jid)
    return jid, None


def public_url():
    """Địa chỉ công khai (đường hầm Cloudflare) nếu đang có."""
    env = os.environ.get("DANG2_PUBLIC_URL", "").rstrip("/")
    if env:
        return env
    f = ROOT / "dia-chi-may-chu.txt"
    return f.read_text().strip().rstrip("/") if f.exists() else ""


def _janitor(days=7):
    """Xoá video của khách sau 7 ngày (đúng như trang web cam kết)."""
    import time
    while True:
        cutoff = time.time() - days * 86400
        for d in JOBS.iterdir():
            try:
                if d.is_dir() and d.stat().st_mtime < cutoff:
                    shutil.rmtree(d, ignore_errors=True)
            except OSError:
                pass
        time.sleep(3600)


threading.Thread(target=_worker, daemon=True).start()
threading.Thread(target=_janitor, daemon=True).start()

if os.environ.get("TELEGRAM_BOT_TOKEN", "").strip():
    from web import telegram_bot  # noqa: E402
    telegram_bot.start(sys.modules[__name__])


@app.get("/", response_class=HTMLResponse)
def index():
    body = (Path(__file__).with_name("index.html")).read_text(encoding="utf-8")
    return ('<!doctype html><html lang="vi"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '</head><body>' + body + '</body></html>')


@app.get("/api/health")
def health():
    return {"ok": True, "require_code": REQUIRE_CODE, "max_seconds": MAX_SECONDS, "queue": _q.qsize(),
            "telegram": BOT_USERNAME}


@app.post("/api/jobs")
async def create_job(video: UploadFile = File(...), c1: str = Form("#F5FF3B"),
                     c2: str = Form("#3BF5FF"), code: str = Form("")):
    if not HEX.match(c1) or not HEX.match(c2):
        raise HTTPException(400, "Màu không hợp lệ")
    ext = Path(video.filename or "v.mp4").suffix.lower()
    if ext not in {".mp4", ".mov", ".m4v", ".webm", ".mkv"}:
        raise HTTPException(400, "Chỉ nhận video MP4, MOV, WEBM, MKV")
    code = code.strip().upper()
    if REQUIRE_CODE and not _use_code(code):
        raise HTTPException(402, "Mã truy cập không đúng hoặc đã hết lượt")
    jid = uuid.uuid4().hex[:12]
    d = JOBS / jid
    d.mkdir()
    fname = "input" + ext
    with open(d / fname, "wb") as f:
        while chunk := await video.read(1 << 20):
            f.write(chunk)
    try:
        dur = probe(d / fname)["duration"]
    except Exception:
        _refund(code if REQUIRE_CODE else "")
        shutil.rmtree(d)
        raise HTTPException(400, "Không đọc được video")
    if dur > MAX_SECONDS:
        _refund(code if REQUIRE_CODE else "")
        shutil.rmtree(d)
        raise HTTPException(400, f"Video dài quá {int(MAX_SECONDS)} giây")
    (d / "meta.json").write_text(json.dumps({"file": fname, "c1": c1, "c2": c2,
                                             "code": code if REQUIRE_CODE else ""}))
    _set(jid, state="queued", pct=0, msg=f"Đang xếp hàng (trước bạn: {_q.qsize()})")
    _q.put(jid)
    return {"id": jid}


@app.get("/api/jobs/{jid}")
def job_status(jid: str):
    if not re.fullmatch(r"[0-9a-f]{12}", jid) or not _status_path(jid).exists():
        raise HTTPException(404, "Không tìm thấy")
    return json.loads(_status_path(jid).read_text())


@app.get("/api/jobs/{jid}/video")
def job_video(jid: str, download: int = 0):
    p = JOBS / jid / "ket-qua-dang2.mp4"
    if not re.fullmatch(r"[0-9a-f]{12}", jid) or not p.exists():
        raise HTTPException(404, "Chưa có video")
    return FileResponse(p, media_type="video/mp4",
                        filename="ket-qua-dang2.mp4" if download else None)
