"""Ghép tất cả bằng 1 lệnh ffmpeg: zoom cảm xúc → panel → khung mặt → overlay
→ thumbnail → caption → trộn SFX."""
from pathlib import Path

from .analyze import face_at
from .graphics import pip_for
from .util import FONTS, FPS, H, W, clamp, run


def zoom_expr(zooms):
    terms = []
    for z in zooms:
        t0, t1, a = z["t"], z["t"] + z["dur"], z["amount"]
        m = f"min(min(1,(t-{t0:.3f})/0.35),min(1,({t1:.3f}-t)/0.5))"
        terms.append(f"if(between(t,{t0:.3f},{t1:.3f}),{a}*({m})*({m})*(3-2*({m})),0)")
    return "1+" + "+".join(terms) if terms else "1"


def make_mask(path, shape, w, h):
    if shape == "circle":
        expr = f"if(lte(hypot(X-{w / 2},Y-{h / 2}),{min(w, h) / 2 - 1}),255,0)"
    else:
        r = 44
        expr = (f"if(gt(abs(X-{w / 2}),{w / 2 - r})*gt(abs(Y-{h / 2}),{h / 2 - r}),"
                f"if(lte(hypot(abs(X-{w / 2})-{w / 2 - r},abs(Y-{h / 2})-{h / 2 - r}),{r}),255,0),255)")
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
         f"color=black:s={w}x{h}:d=1", "-vf", f"format=gray,geq=lum='{expr}'",
         "-frames:v", "1", str(path)])


def pip_crop(face, pip):
    """Crop RỘNG: đầu + mặt + thân tới ngực, không cắt đầu."""
    fw, fh = face["w"] * W, face["h"] * H
    cx, cy = face["cx"] * W, face["cy"] * H
    aspect = pip["w"] / pip["h"]
    ch = clamp(fh * 3.4, 420, H)
    cw = ch * aspect
    if cw > W:
        cw, ch = W, W / aspect
    x = clamp(cx - cw / 2, 0, W - cw)
    y = clamp(cy - fh * 1.15, 0, H - ch)
    return int(cw) // 2 * 2, int(ch) // 2 * 2, int(x), int(y)


def compose(video, duration, plan, faces, layers, ass_path, sfx, events, dst, workdir, log=print):
    """layers: list dict {dir, start, kind, effect|None}; thumbnail đầu tiên là layer start=0."""
    workdir = Path(workdir)
    inputs = ["-i", str(video)]
    idx = 1
    fc = []
    anchor = face_at(faces, 0, duration)
    ax, ay = anchor["cx"], clamp(anchor["cy"], 0.2, 0.6)
    z = zoom_expr(plan["zooms"])
    fc.append(f"[0:v]split=2[vz][vp]")
    fc.append(f"[vz]scale=w='trunc({W}*({z})/2)*2':h='trunc({H}*({z})/2)*2':eval=frame,"
              f"crop={W}:{H}:'clip(iw*{ax:.4f}-{W}/2,0,iw-{W})':'clip(ih*{ay:.4f}-{H}/2,0,ih-{H})',"
              f"setsar=1[base]")
    cur = "base"

    pip_effects = [l for l in layers if l.get("effect") and pip_for(l["effect"])]
    if pip_effects:
        fc.append(f"[vp]split={len(pip_effects)}" + "".join(f"[p{i}]" for i in range(len(pip_effects))))
    else:
        fc.append("[vp]nullsink")

    def add_layer(l, label_in):
        nonlocal idx
        inputs.extend(["-framerate", str(FPS), "-i", str(Path(l["dir"]) / "%05d.png")])
        k = idx
        idx += 1
        s = l["start"]
        e = s + l["dur"]
        fc.append(f"[{k}:v]format=rgba,setpts=PTS-STARTPTS+{s:.3f}/TB[g{k}]")
        out = f"o{k}"
        fc.append(f"[{label_in}][g{k}]overlay=eof_action=pass:enable='between(t,{s:.3f},{e:.3f})'[{out}]")
        return out

    pi = 0
    for l in layers:
        eff = l.get("effect")
        if l["kind"] == "thumbnail":
            continue
        cur = add_layer(l, cur)
        if eff and pip_for(eff):
            pip = pip_for(eff)
            s, e = eff["start"], eff["end"]
            face = face_at(faces, s, e)
            cw, ch, x, y = pip_crop(face, pip)
            mask = workdir / f"mask_{pi}.png"
            make_mask(mask, "circle" if pip["shape"] == "circle" else "rect", pip["w"], pip["h"])
            inputs.extend(["-loop", "1", "-i", str(mask)])
            mk = idx
            idx += 1
            fc.append(f"[p{pi}]crop={cw}:{ch}:{x}:{y},scale={pip['w']}:{pip['h']},format=rgba[pc{pi}]")
            fc.append(f"[{mk}:v]format=gray,scale={pip['w']}:{pip['h']}[mk{pi}]")
            fc.append(f"[pc{pi}][mk{pi}]alphamerge,fade=t=in:st={s + 0.1:.3f}:d=0.3:alpha=1,"
                      f"fade=t=out:st={e - 0.3:.3f}:d=0.3:alpha=1[pa{pi}]")
            out = f"pp{pi}"
            fc.append(f"[{cur}][pa{pi}]overlay={pip['x']}:{pip['y']}:shortest=1:"
                      f"enable='between(t,{s:.3f},{e:.3f})'[{out}]")
            cur = out
            pi += 1
    for l in layers:
        if l["kind"] == "thumbnail":
            cur = add_layer(l, cur)

    ass = str(ass_path).replace("\\", "/").replace(":", r"\:")
    fonts = str(FONTS).replace("\\", "/").replace(":", r"\:")
    fc.append(f"[{cur}]subtitles='{ass}':fontsdir='{fonts}',format=yuv420p[vout]")

    # âm thanh
    alabels = ["[0:a]"]
    by_type = {}
    for t, name in events:
        if t < duration - 0.1:
            by_type.setdefault(name, []).append(t)
    for name, times in by_type.items():
        inputs.extend(["-i", str(sfx[name])])
        k = idx
        idx += 1
        fc.append(f"[{k}:a]asplit={len(times)}" + "".join(f"[{name}{j}]" for j in range(len(times))))
        for j, t in enumerate(times):
            ms = int(t * 1000)
            fc.append(f"[{name}{j}]adelay={ms}|{ms},volume=0.55[{name}d{j}]")
            alabels.append(f"[{name}d{j}]")
    if len(alabels) > 1:
        fc.append("".join(alabels) + f"amix=inputs={len(alabels)}:duration=first:normalize=0,"
                  "alimiter=limit=0.95[aout]")
    else:
        fc.append("[0:a]anull[aout]")

    script = workdir / "compose.filter.txt"
    script.write_text(";\n".join(fc), encoding="utf-8")
    log("Đang xuất video cuối…")
    run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex_script", str(script),
         "-map", "[vout]", "-map", "[aout]", "-t", f"{duration:.3f}", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dst)])
