"""Claude đọc lời thoại và lên "kịch bản edit" theo 7 trụ cột của Dạng 2.

Sau khi Claude trả JSON, code tự kiểm luật: hiệu ứng lớn cách nhau ≥6s,
tổng thời lượng hiệu ứng ≤40%, crop-bám-mặt ≤1 lần ở giữa video (5-6s),
so sánh đặt về cuối, không lặp kiểu overlay.
"""
import json
import os
import re

LAYOUTS = ["stack_hierarchy", "magazine", "serif_mix", "lifestyle", "brand_word", "spaced_caps"]
OVERLAY_STYLES = ["rail", "vertical", "stairs", "chevron", "checklist"]
COMPARE = ["before_after", "vs", "side_by_side"]
MODEL = os.environ.get("DANG2_MODEL", "claude-sonnet-5-5")

SYSTEM = """Bạn là editor video talking-head cao cấp người Việt. Bạn nhận lời thoại (đã cắt gọn, có mốc giây và chỉ số năng lượng giọng 'energy', càng cao càng nhấn mạnh) của một video dọc 9:16 và trả về DUY NHẤT một JSON kịch bản edit. Không viết gì ngoài JSON.

Nguyên tắc:
- Không nhồi nhét. Hiệu ứng lớn (overlays, broll, face_crop, compare) cách nhau ≥6 giây; tổng thời lượng hiệu ứng lớn ≤40% video. Đoạn kể chuyện thường để yên.
- Nội dung mỗi hiệu ứng lấy từ CHÍNH câu nói tại thời điểm đó; chữ ngắn gọn (mỗi bước 1-5 từ), tiếng Việt có dấu chuẩn, không bịa thông tin ngoài lời thoại.
- Đa dạng: mỗi overlay một style khác nhau.
- zooms: 3-8 điểm, đặt ở chỗ energy cao (cao trào, nhấn mạnh) hoặc đầu ý mới. amount 0.04-0.08, dur 1.2-3.5s.
- keywords: 4-12 từ/cụm "đắt" (1-3 từ), phải nằm NGUYÊN VĂN trong lời thoại; color 1 hoặc 2 xen kẽ.
- overlays: 0-3, dùng khi người nói liệt kê bước/quy trình/các ý. style ∈ rail|vertical|stairs|chevron|checklist. 2-5 steps. Thời lượng 3-7s.
- broll: 0-2, dùng cho đoạn số liệu hoặc liệt kê ngắn. kind ∈ number|list. number là con số nói trong lời thoại (vd "3 lần", "70%").
- face_crop: tối đa 1, khoảng giữa video, dài 5-6s, shape ∈ circle|square, kèm title + 2-4 points tóm ý đoạn đó. null nếu video < 20s.
- compare: tối đa 1, chỉ khi có ý "thay vì A hãy B", "cũ vs mới", "trước/sau"; đặt khoảng cuối video, 4-6s. variant ∈ before_after|vs|side_by_side. null nếu không có.
- thumbnail: layout ∈ stack_hierarchy|magazine|serif_mix|lifestyle|brand_word|spaced_caps chọn theo tông video; title 4-9 từ viết lại cho tò mò (không chép câu chào); accent là 1 cụm nằm nguyên văn trong title; sub: dòng phụ ngắn (có thể rỗng).

Schema:
{"thumbnail":{"layout":"","title":"","accent":"","sub":""},
 "zooms":[{"t":0.0,"dur":2.0,"amount":0.06}],
 "keywords":[{"text":"","color":1}],
 "overlays":[{"start":0.0,"end":0.0,"style":"","title":"","steps":[""]}],
 "broll":[{"start":0.0,"end":0.0,"kind":"number","headline":"","number":"","items":[]}],
 "face_crop":{"start":0.0,"end":0.0,"shape":"circle","title":"","points":[""]},
 "compare":{"start":0.0,"end":0.0,"variant":"vs","left_label":"","left":"","right_label":"","right":""}}"""


def ask_claude(lines, duration, api_key=None):
    import anthropic
    client = anthropic.Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"))
    body = "\n".join(f"[{l['s']:.2f}-{l['e']:.2f}] (energy {l['energy']}) {l['text']}" for l in lines)
    msg = client.messages.create(
        model=MODEL, max_tokens=4000, system=SYSTEM,
        messages=[{"role": "user", "content":
                   f"Thời lượng video: {duration:.1f}s.\nLời thoại:\n{body}\n\nTrả JSON kịch bản."}])
    text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise RuntimeError("Claude không trả về JSON hợp lệ")
    return json.loads(m.group(0))


def heuristic_plan(lines, words, duration):
    """Dự phòng khi không có API key: chỉ zoom + từ khoá + thumbnail."""
    peaks = sorted(lines, key=lambda l: l["energy"], reverse=True)[:6]
    zooms = [{"t": l["s"], "dur": min(2.5, l["e"] - l["s"] + 0.4), "amount": 0.06} for l in peaks]
    cand = sorted([w for w in words if len(w["w"]) >= 4], key=lambda w: w.get("en", 0), reverse=True)
    kws, seen = [], set()
    for w in cand:
        t = re.sub(r"[^\wÀ-ỹ]", "", w["w"])
        if t.lower() not in seen and t:
            seen.add(t.lower())
            kws.append({"text": t, "color": 1 + len(kws) % 2})
        if len(kws) >= 8:
            break
    first = lines[0]["text"] if lines else "Video mới"
    title = " ".join(first.split()[:7])
    return {"thumbnail": {"layout": "stack_hierarchy", "title": title,
                          "accent": " ".join(title.split()[-2:]), "sub": ""},
            "zooms": zooms, "keywords": kws, "overlays": [], "broll": [],
            "face_crop": None, "compare": None}


def _f(x, d=0.0):
    try:
        return float(x)
    except (TypeError, ValueError):
        return d


def validate(plan, duration, lines):
    """Ép kịch bản theo luật Dạng 2. Trả về kịch bản sạch."""
    out = {}
    th = plan.get("thumbnail") or {}
    title = (th.get("title") or "").strip() or (lines[0]["text"] if lines else "Video mới")
    title = " ".join(title.split()[:10])
    accent = (th.get("accent") or "").strip()
    if not accent or accent.lower() not in title.lower():
        accent = " ".join(title.split()[-2:])
    out["thumbnail"] = {"layout": th.get("layout") if th.get("layout") in LAYOUTS else "stack_hierarchy",
                        "title": title, "accent": accent, "sub": (th.get("sub") or "")[:60]}

    zooms = []
    for z in plan.get("zooms") or []:
        t, d = _f(z.get("t")), _f(z.get("dur"), 2)
        if 0.3 <= t < duration - 0.8:
            zooms.append({"t": round(t, 2), "dur": round(min(max(d, 1.0), 3.5, duration - t), 2),
                          "amount": round(min(max(_f(z.get("amount"), 0.06), 0.03), 0.08), 3)})
    zooms.sort(key=lambda z: z["t"])
    clean = []
    for z in zooms:
        if not clean or z["t"] >= clean[-1]["t"] + clean[-1]["dur"] + 0.4:
            clean.append(z)
    out["zooms"] = clean[:10]

    full = " ".join(l["text"] for l in lines).lower()
    kws = []
    for k in plan.get("keywords") or []:
        t = (k.get("text") or "").strip(" .,!?")
        if t and t.lower() in full and len(t.split()) <= 3:
            kws.append({"text": t, "color": 2 if int(_f(k.get("color"), 1)) == 2 else 1})
    out["keywords"] = kws[:12]

    def span(e, lo=3.0, hi=7.0):
        s, en = _f(e.get("start")), _f(e.get("end"))
        if en - s < lo:
            en = s + lo
        en = min(en, s + hi, duration - 0.2)
        return round(max(s, 2.8), 2), round(en, 2)

    cands = []
    fc = plan.get("face_crop")
    if fc and duration >= 20:
        s, e = span(fc, 5, 6)
        mid_lo, mid_hi = duration * 0.3, duration * 0.7
        if not (mid_lo <= s <= mid_hi):
            s = round(duration * 0.45, 2)
            e = round(s + 5.5, 2)
        cands.append(("face_crop", 0, {"start": s, "end": e,
                                        "shape": fc.get("shape") if fc.get("shape") in ("circle", "square") else "circle",
                                        "title": (fc.get("title") or "")[:40],
                                        "points": [p[:40] for p in (fc.get("points") or [])][:4]}))
    cp = plan.get("compare")
    if cp and cp.get("left") and cp.get("right"):
        s, e = span(cp, 4, 6)
        cands.append(("compare", 1, {"start": s, "end": e,
                                      "variant": cp.get("variant") if cp.get("variant") in COMPARE else "vs",
                                      "left_label": (cp.get("left_label") or "Trước")[:20],
                                      "left": cp["left"][:60],
                                      "right_label": (cp.get("right_label") or "Sau")[:20],
                                      "right": cp["right"][:60]}))
    used_styles = set()
    for o in plan.get("overlays") or []:
        steps = [x[:36] for x in (o.get("steps") or []) if x][:5]
        if len(steps) < 2:
            continue
        st = o.get("style")
        if st not in OVERLAY_STYLES or st in used_styles:
            st = next((x for x in OVERLAY_STYLES if x not in used_styles), "rail")
        used_styles.add(st)
        s, e = span(o, 3, 7)
        cands.append(("overlay", 2, {"start": s, "end": e, "style": st,
                                      "title": (o.get("title") or "")[:40], "steps": steps}))
    for b in plan.get("broll") or []:
        s, e = span(b, 3, 6)
        kind = b.get("kind") if b.get("kind") in ("number", "list") else "list"
        items = [x[:36] for x in (b.get("items") or [])][:4]
        if kind == "list" and len(items) < 2:
            continue
        if kind == "number" and not b.get("number"):
            continue
        cands.append(("broll", 3, {"start": s, "end": e, "kind": kind,
                                    "headline": (b.get("headline") or "")[:40],
                                    "number": str(b.get("number") or "")[:12], "items": items}))

    # chọn theo ưu tiên, giữ khoảng cách ≥6s, tổng ≤40%
    chosen, total = [], 0.0
    for kind, _, eff in sorted(cands, key=lambda c: c[1]):
        d = eff["end"] - eff["start"]
        if total + d > 0.4 * duration:
            continue
        ok = all(eff["start"] >= c["end"] + 6 or eff["end"] + 6 <= c["start"] for _, c in chosen)
        if ok:
            chosen.append((kind, eff))
            total += d
    chosen.sort(key=lambda c: c[1]["start"])
    out["effects"] = [dict(type=k, **e) for k, e in chosen]
    # không zoom khi đang có hiệu ứng lớn
    out["zooms"] = [z for z in out["zooms"]
                    if all(z["t"] + z["dur"] < e["start"] or z["t"] > e["end"] for e in out["effects"])]
    return out


def make_plan(lines, words, duration, api_key=None, log=print):
    key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if key:
        try:
            raw = ask_claude(lines, duration, key)
            return validate(raw, duration, lines), raw
        except Exception as ex:  # vẫn ra video dù API lỗi
            log(f"Claude lỗi, dùng kịch bản dự phòng: {ex}")
    raw = heuristic_plan(lines, words, duration)
    return validate(raw, duration, lines), raw
