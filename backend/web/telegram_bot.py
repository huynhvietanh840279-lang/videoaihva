"""Bot Telegram: khách gửi video cho bot -> chọn màu -> nhận video thành phẩm.

Chạy chung tiến trình với web (web/app.py tự bật khi có TELEGRAM_BOT_TOKEN),
dùng chung hàng đợi, mã truy cập và engine Dạng 2.

Giới hạn của Telegram Bot API thường: bot chỉ tải được file ≤ 20 MB và gửi
file ≤ 50 MB. Video lớn hơn -> bot gửi link trang web để khách tải lên / tải về.
"""
import json
import os
import re
import subprocess
import tempfile
import threading
import time
import traceback
from pathlib import Path

import httpx

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
API = f"https://api.telegram.org/bot{TOKEN}"
FILE_API = f"https://api.telegram.org/file/bot{TOKEN}"
MAX_IN = 20 * 1024 * 1024
MAX_OUT = 49 * 1024 * 1024

PRESETS = [
    ("Hổ phách", "#FFB020", "#38D3F5"),
    ("Neon", "#F5FF3B", "#3BF5FF"),
    ("Navy & Vàng", "#FFC93C", "#4D7CFE"),
    ("Đỏ & Trắng", "#FF3B3B", "#FFFFFF"),
    ("Hồng & Tím", "#FF4FA3", "#9B6CFF"),
    ("Xanh lá", "#2EE59D", "#FFE14D"),
]

WELCOME = (
    "Chào bạn! Mình là *HVA Video Studio*.\n\n"
    "Gửi cho mình 1 video nói chuyện (quay dọc, 1 người nói, tối đa {mins} phút). "
    "Mình sẽ tự cắt khoảng lặng, zoom theo cảm xúc, thêm caption, từ khoá 2 màu, "
    "hoạt hoạ và âm thanh, rồi gửi lại video thành phẩm.\n\n"
    "Video Telegram cho bot tối đa 20 MB. Video lớn hơn thì gửi qua web: {web}"
)

app = None  # module web.app, gán khi start()
_http = httpx.Client(timeout=httpx.Timeout(60, read=70))
_state_lock = threading.Lock()


# ---------- tiện ích ----------
def call(method, **params):
    try:
        r = _http.post(f"{API}/{method}", json=params)
        d = r.json()
        if not d.get("ok"):
            print("Telegram lỗi", method, d.get("description"))
        return d.get("result")
    except Exception as ex:
        print("Telegram không gọi được", method, ex)
        return None


def send(chat, text, **kw):
    r = call("sendMessage", chat_id=chat, text=text, parse_mode="Markdown",
             disable_web_page_preview=True, **kw)
    if r is None:  # chữ có ký tự Markdown lạ -> gửi lại dạng thường
        r = call("sendMessage", chat_id=chat, text=text.replace("*", "").replace("`", ""),
                 disable_web_page_preview=True, **kw)
    return r


def edit(chat, msg_id, text):
    if call("editMessageText", chat_id=chat, message_id=msg_id, text=text,
            parse_mode="Markdown", disable_web_page_preview=True) is None:
        call("editMessageText", chat_id=chat, message_id=msg_id,
             text=text.replace("*", "").replace("`", ""), disable_web_page_preview=True)


def web_link():
    u = app.public_url() if app else ""
    return u or "(máy chủ chưa có địa chỉ công khai)"


def users_path():
    return app.DATA / "telegram_users.json"


def load_users():
    p = users_path()
    return json.loads(p.read_text()) if p.exists() else {}


def save_users(u):
    users_path().write_text(json.dumps(u, ensure_ascii=False, indent=2))


def user(chat):
    with _state_lock:
        return load_users().get(str(chat), {})


def set_user(chat, **kw):
    with _state_lock:
        u = load_users()
        cur = u.get(str(chat), {})
        cur.update(kw)
        u[str(chat)] = cur
        save_users(u)


def color_keyboard():
    rows, row = [], []
    for i, (name, _, _) in enumerate(PRESETS):
        row.append({"text": name, "callback_data": f"c{i}"})
        if len(row) == 2:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([{"text": "Huỷ", "callback_data": "cancel"}])
    return {"inline_keyboard": rows}


def bar(pct):
    n = int(pct / 10)
    return "▰" * n + "▱" * (10 - n)


# ---------- nhận tin ----------
def on_message(m):
    chat = m["chat"]["id"]
    text = (m.get("text") or "").strip()

    if text.startswith("/start") or text.startswith("/help"):
        msg = WELCOME.format(mins=int(app.MAX_SECONDS // 60), web=web_link())
        if app.REQUIRE_CODE:
            msg += "\n\nTrước khi gửi video, nhập mã truy cập: `/ma MÃ_CỦA_BẠN`"
        send(chat, msg)
        return

    if text.lower().startswith("/ma"):
        code = text[3:].strip().upper()
        if not code:
            send(chat, "Gõ theo mẫu: `/ma KHACH01`")
            return
        left = app._codes().get(code, 0)
        if left <= 0:
            send(chat, "Mã không đúng hoặc đã hết lượt. Kiểm tra lại hoặc nhắn người bán để mua thêm.")
            return
        set_user(chat, code=code)
        send(chat, f"Đã lưu mã *{code}*, còn {left} lượt. Giờ gửi video cho mình nhé.")
        return

    if text.lower().startswith("/luot"):
        code = user(chat).get("code")
        if not code:
            send(chat, "Bạn chưa nhập mã. Gõ `/ma MÃ_CỦA_BẠN`.")
        else:
            send(chat, f"Mã *{code}* còn {app._codes().get(code, 0)} lượt.")
        return

    vid = m.get("video") or m.get("document")
    if vid and (m.get("video") or str(vid.get("mime_type", "")).startswith("video/")):
        on_video(chat, m, vid)
        return

    send(chat, "Gửi cho mình *1 video* để edit nhé. Gõ /start để xem hướng dẫn.")


def on_video(chat, m, vid):
    if app.REQUIRE_CODE and not user(chat).get("code"):
        send(chat, "Bạn cần nhập mã truy cập trước: `/ma MÃ_CỦA_BẠN`")
        return
    size = vid.get("file_size") or 0
    if size > MAX_IN:
        send(chat, f"Video nặng {size / 1048576:.0f} MB, Telegram chỉ cho bot nhận tối đa 20 MB.\n"
                   f"Bạn gửi video này qua web nhé: {web_link()}\n"
                   "Hoặc nén video nhỏ lại (xuất 720p) rồi gửi lại đây.")
        return
    dur = vid.get("duration") or 0
    if dur and dur > app.MAX_SECONDS:
        send(chat, f"Video dài quá {int(app.MAX_SECONDS // 60)} phút. Cắt ngắn rồi gửi lại nhé.")
        return
    set_user(chat, pending={"file_id": vid["file_id"], "name": vid.get("file_name") or "video.mp4"})
    send(chat, "Đã nhận video. Chọn bộ màu thương hiệu cho chữ và hiệu ứng:",
         reply_markup=color_keyboard())


def on_callback(cb):
    chat = cb["message"]["chat"]["id"]
    data = cb.get("data", "")
    call("answerCallbackQuery", callback_query_id=cb["id"])
    call("editMessageReplyMarkup", chat_id=chat, message_id=cb["message"]["message_id"],
         reply_markup={"inline_keyboard": []})
    pending = user(chat).get("pending")
    if data == "cancel" or not pending:
        set_user(chat, pending=None)
        send(chat, "Đã huỷ. Gửi video khác bất cứ lúc nào.")
        return
    i = int(data[1:]) if re.fullmatch(r"c\d", data) else 0
    name, c1, c2 = PRESETS[min(i, len(PRESETS) - 1)]
    set_user(chat, pending=None)
    status = send(chat, f"Màu *{name}*. Đang tải video về máy chủ…")
    threading.Thread(target=start_job, args=(chat, pending, c1, c2, status), daemon=True).start()


def start_job(chat, pending, c1, c2, status):
    msg_id = status["message_id"] if status else None
    code = ""
    try:
        f = call("getFile", file_id=pending["file_id"])
        if not f or not f.get("file_path"):
            send(chat, f"Không tải được video từ Telegram. Gửi qua web nhé: {web_link()}")
            return
        ext = Path(f["file_path"]).suffix or Path(pending["name"]).suffix or ".mp4"
        tmp = Path(tempfile.mkdtemp()) / ("tg" + ext)
        with _http.stream("GET", f"{FILE_API}/{f['file_path']}") as r:
            r.raise_for_status()
            with open(tmp, "wb") as out:
                for chunk in r.iter_bytes(1 << 20):
                    out.write(chunk)
        if app.REQUIRE_CODE:
            code = user(chat).get("code", "")
            if not app._use_code(code):
                send(chat, "Mã của bạn đã hết lượt. Nhắn người bán để mua thêm, rồi gõ `/ma MÃ_MỚI`.")
                return
        jid, err = app.enqueue_file(tmp, c1, c2, code=code,
                                    extra={"tg_chat": chat, "tg_msg": msg_id})
        if err:
            app._refund(code)
            send(chat, err)
            return
        if msg_id:
            edit(chat, msg_id, f"⏳ Đang xếp hàng (trước bạn: {max(0, app._q.qsize() - 1)})…")
    except Exception as ex:
        traceback.print_exc()
        app._refund(code)
        send(chat, f"Có lỗi khi nhận video: {ex}")


# ---------- báo tiến độ / gửi kết quả ----------
_last_edit = {}


def listener(jid, meta, state, pct, msg):
    chat, msg_id = meta.get("tg_chat"), meta.get("tg_msg")
    if not chat:
        return
    if state == "running":
        now = time.time()
        if msg_id and now - _last_edit.get(jid, 0) > 4:
            _last_edit[jid] = now
            edit(chat, msg_id, f"⚙️ {bar(pct)} {int(pct)}%\n{msg}")
        return
    if state == "error":
        send(chat, f"Edit không thành công: {msg}\nLượt của bạn đã được hoàn lại. Thử video khác nhé.")
        return
    if state == "done":
        if msg_id:
            edit(chat, msg_id, f"✅ {bar(100)} 100%\nĐang gửi video…")
        threading.Thread(target=deliver, args=(jid, chat), daemon=True).start()


def fit_for_telegram(src, dst):
    """Nén bản xem trước ≤ 49 MB để gửi qua Telegram."""
    from engine.util import probe
    dur = max(probe(src)["duration"], 1)
    kbps = int((MAX_OUT * 8 / 1000) / dur * 0.92) - 128
    kbps = max(kbps, 400)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf", "scale=720:1280",
                    "-c:v", "libx264", "-preset", "veryfast", "-b:v", f"{kbps}k",
                    "-maxrate", f"{kbps}k", "-bufsize", f"{kbps * 2}k",
                    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(dst)], check=True)


def deliver(jid, chat):
    out = app.JOBS / jid / "ket-qua-dang2.mp4"
    link = f"{app.public_url()}/api/jobs/{jid}/video?download=1" if app.public_url() else ""
    try:
        path, note = out, ""
        if out.stat().st_size > MAX_OUT:
            small = app.JOBS / jid / "telegram.mp4"
            fit_for_telegram(out, small)
            path = small
            note = "\n(Bản gửi qua Telegram đã nén 720p.)"
        caption = "Video của bạn đây! 🎬" + note
        if link:
            caption += f"\nTải bản gốc 1080p: {link}"
        with open(path, "rb") as fh:
            r = _http.post(f"{API}/sendVideo",
                           data={"chat_id": str(chat), "caption": caption, "supports_streaming": "true",
                                 "width": "1080", "height": "1920"},
                           files={"video": ("ket-qua.mp4", fh, "video/mp4")},
                           timeout=httpx.Timeout(600))
        if not r.json().get("ok"):
            raise RuntimeError(r.json().get("description"))
        send(chat, "Gửi video khác bất cứ lúc nào nhé.")
    except Exception as ex:
        traceback.print_exc()
        send(chat, "Video đã xong nhưng gửi qua Telegram không được."
                   + (f"\nTải tại đây: {link}" if link else f" Lỗi: {ex}"))


# ---------- vòng lặp ----------
def loop():
    me = call("getMe")
    if me:
        app.BOT_USERNAME = me.get("username", "")
    print("Bot Telegram chạy:", me and "@" + me.get("username", "?"))
    call("setMyCommands", commands=[
        {"command": "start", "description": "Hướng dẫn dùng bot"},
        {"command": "ma", "description": "Nhập mã truy cập"},
        {"command": "luot", "description": "Xem số lượt còn lại"},
    ])
    offset = 0
    while True:
        try:
            r = _http.get(f"{API}/getUpdates", params={"timeout": 50, "offset": offset})
            for upd in r.json().get("result", []):
                offset = upd["update_id"] + 1
                try:
                    if "message" in upd:
                        on_message(upd["message"])
                    elif "callback_query" in upd:
                        on_callback(upd["callback_query"])
                except Exception:
                    traceback.print_exc()
        except Exception as ex:
            print("Mất kết nối Telegram, thử lại sau 5 giây:", ex)
            time.sleep(5)


def start(app_module):
    global app
    app = app_module
    app.LISTENERS.append(listener)
    threading.Thread(target=loop, daemon=True).start()
