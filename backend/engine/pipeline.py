"""Chạy toàn bộ Dạng 2 cho 1 video: input -> output/<tên>-dang2.mp4."""
import time
from pathlib import Path

from . import analyze, autocut, captions, compose, graphics, planner, prep, sfx
from .util import H, load_json, probe, save_json

DEFAULT_COLORS = ("#F5FF3B", "#3BF5FF")  # neon vàng + neon xanh
THUMB_DUR = 2.6


def run_job(src, workdir, dst, colors=DEFAULT_COLORS, api_key=None, language="vi",
            whisper_model="small", words_override=None, plan_override=None, progress=None):
    t_start = time.time()
    workdir = Path(workdir)
    workdir.mkdir(parents=True, exist_ok=True)

    def step(pct, msg):
        if progress:
            progress(pct, msg)
        print(f"[{pct:3d}%] {msg}", flush=True)

    step(2, "Chuẩn hoá video về 9:16")
    norm = workdir / "norm.mp4"
    info = probe(src)
    face_cx = 0.5
    if info["width"] > info["height"]:
        tmp_faces = analyze.track_faces(src)
        face_cx = analyze.face_at(tmp_faces, 0, info["duration"])["cx"]
    prep.normalize(src, norm, face_cx)

    step(10, "Tách lời nói (Whisper)")
    wav = workdir / "audio.wav"
    prep.extract_wav(norm, wav)
    words = words_override if words_override is not None else prep.transcribe(wav, language, whisper_model)
    save_json(words, workdir / "words_raw.json")

    step(35, "Cắt khoảng lặng, từ đệm, đoạn lấy đà")
    dur0 = probe(norm)["duration"]
    keeps = autocut.plan_cuts(dur0, words, autocut.detect_silences(norm))
    cut = workdir / "cut.mp4"
    autocut.apply_cuts(norm, cut, keeps)
    words, _ = autocut.remap_words(words, keeps)  # mốc thời gian SAU cắt
    duration = probe(cut)["duration"]
    save_json({"keeps": keeps, "words": words}, workdir / "words_cut.json")

    step(45, "Nhận diện khuôn mặt + năng lượng giọng")
    faces = analyze.track_faces(cut)
    wav2 = workdir / "audio_cut.wav"
    prep.extract_wav(cut, wav2)
    if words:
        analyze.word_energy(wav2, words)
    lines = analyze.group_lines(words)

    step(55, "Claude lên kịch bản edit")
    if plan_override is not None:
        plan = planner.validate(plan_override, duration, lines)
        raw = plan_override
    else:
        plan, raw = planner.make_plan(lines, words, duration, api_key)
    save_json({"raw": raw, "plan": plan}, workdir / "plan.json")

    step(62, "Dựng đồ hoạ động")
    chin = analyze.face_at(faces, 0, duration)
    chin_px = int((chin["cy"] + chin["h"] / 2) * H)
    layers = []
    rnd = graphics.Renderer(colors, chin_px)
    try:
        tdir = workdir / "g_thumb"
        rnd.render("thumbnail", THUMB_DUR, tdir, thumb=plan["thumbnail"])
        layers.append({"kind": "thumbnail", "dir": tdir, "start": 0.0, "dur": THUMB_DUR})
        for i, e in enumerate(plan["effects"]):
            d = round(e["end"] - e["start"], 3)
            f = analyze.face_at(faces, e["start"], e["end"])
            gdir = workdir / f"g_{i}_{e['type']}"
            rnd.render(e["type"], d, gdir, eff=e, chin=int((f["cy"] + f["h"] / 2) * H))
            layers.append({"kind": e["type"], "dir": gdir, "start": e["start"], "dur": d, "effect": e})
            step(62 + int(18 * (i + 1) / max(len(plan["effects"]), 1)), f"Dựng hiệu ứng {i + 1}/{len(plan['effects'])}")
    finally:
        rnd.close()

    step(82, "Caption động + từ khoá 2 màu")
    blocked = [(0, THUMB_DUR)] + [(e["start"], e["end"]) for e in plan["effects"]]
    ass = workdir / "captions.ass"
    captions.build_ass(words, plan["keywords"], blocked, colors, ass)

    step(86, "Ghép video, hiệu ứng, âm thanh")
    sounds = sfx.ensure_sfx()
    Path(dst).parent.mkdir(parents=True, exist_ok=True)
    compose.compose(cut, duration, plan, faces, layers, ass, sounds, sfx.events_for(plan),
                    dst, workdir)
    step(100, f"Xong sau {int(time.time() - t_start)} giây")
    return {"output": str(dst), "duration": duration, "plan": plan}
