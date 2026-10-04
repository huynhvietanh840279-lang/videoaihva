"""Bước chuẩn bị: đưa video về 1080x1920/30fps, tách lời nói (Whisper)."""
import re

from .util import W, H, FPS, run, probe


def normalize(src, dst, face_cx=0.5):
    """Đưa video về dọc 9:16. Video ngang thì crop quanh tâm mặt."""
    info = probe(src)
    w, h = info["width"], info["height"]
    target = W / H
    if w / h > target + 0.01:  # ngang hơn 9:16 -> crop bề ngang theo mặt
        cw = int(h * target) // 2 * 2
        x = int(min(max(face_cx * w - cw / 2, 0), w - cw))
        vf = f"crop={cw}:{h}:{x}:0,scale={W}:{H}"
    elif w / h < target - 0.01:  # cao hơn 9:16 -> crop bề dọc, giữ phần trên
        ch = int(w / target) // 2 * 2
        y = int(max((h - ch) * 0.3, 0))
        vf = f"crop={w}:{ch}:0:{y},scale={W}:{H}"
    else:
        vf = f"scale={W}:{H}"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src)]
    if not info["has_audio"]:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest"]
    cmd += ["-vf", f"{vf},fps={FPS},format=yuv420p", "-c:v", "libx264",
            "-preset", "veryfast", "-crf", "16", "-c:a", "aac", "-ar", "48000",
            "-ac", "2", "-b:a", "192k", str(dst)]
    run(cmd)


def extract_wav(src, dst):
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1",
         "-ar", "16000", str(dst)])


_model_cache = {}


def transcribe(wav, language="vi", model_size="small"):
    """Trả về danh sách từ: [{w, s, e}] với mốc thời gian từng từ."""
    from faster_whisper import WhisperModel
    key = model_size
    if key not in _model_cache:
        _model_cache[key] = WhisperModel(model_size, device="auto", compute_type="int8")
    model = _model_cache[key]
    segments, _ = model.transcribe(
        str(wav), language=language, word_timestamps=True, vad_filter=False,
        beam_size=5, condition_on_previous_text=False)
    words = []
    for seg in segments:
        for wd in seg.words or []:
            t = wd.word.strip()
            if not t:
                continue
            words.append({"w": t, "s": round(wd.start, 3), "e": round(wd.end, 3)})
    return words


def clean_token(t):
    return re.sub(r"[^\wÀ-ỹ]", "", t.lower())
