import { useEffect, useRef, useState } from "react";
import { API_URL, PRESETS, STAGES } from "@/config/site";

type Health = {
  require_code?: boolean;
  max_seconds?: number;
  queue?: number;
  telegram?: string;
};
export type ServerState = "checking" | "online" | "demo";

const fmt = (s: number) => {
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};

export function useServer() {
  const [state, setState] = useState<ServerState>("checking");
  const [health, setHealth] = useState<Health>({});
  useEffect(() => {
    if (!API_URL) {
      setState("demo");
      return;
    }
    fetch(API_URL + "/api/health", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((h: Health) => {
        setHealth(h);
        setState("online");
      })
      .catch(() => setState("demo"));
  }, []);
  return { state, health };
}

function Stages({ pct }: { pct: number }) {
  return (
    <ol className="stages">
      {STAGES.map(([p, name], i) => {
        const next = STAGES[i + 1]?.[0] ?? 101;
        const cls = pct >= next || pct >= 100 ? "done" : pct >= p ? "cur" : "";
        return (
          <li key={name} className={cls}>
            {name}
          </li>
        );
      })}
    </ol>
  );
}

export function Studio({ server }: { server: ReturnType<typeof useServer> }) {
  const demo = server.state !== "online";
  const maxSeconds = server.health.max_seconds ?? 300;
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [meta, setMeta] = useState("");
  const [warn, setWarn] = useState<{ text: string; soft?: boolean } | null>(null);
  const [tooLong, setTooLong] = useState(false);
  const [drag, setDrag] = useState(false);
  const [preset, setPreset] = useState<number | null>(0);
  const [c1, setC1] = useState(PRESETS[0]?.c1 ?? "#FFB020");
  const [c2, setC2] = useState(PRESETS[0]?.c2 ?? "#38D3F5");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"setup" | "run" | "done">("setup");
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [out, setOut] = useState<string | null>(null);

  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  const pick = (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setWarn({ text: "File này không phải video. Hãy chọn file MP4 hoặc MOV." });
      return;
    }
    setFile(f);
    setWarn(null);
    setTooLong(false);
    setMeta(`${(f.size / 1048576).toFixed(1)} MB`);
    setUrl(URL.createObjectURL(f));
  };

  const onMeta = (v: HTMLVideoElement) => {
    if (!file) return;
    setMeta(
      `${(file.size / 1048576).toFixed(1)} MB · ${fmt(v.duration)} · ${v.videoWidth}×${v.videoHeight}`,
    );
    v.currentTime = Math.min(1, v.duration / 2);
    if (v.duration > maxSeconds) {
      setTooLong(true);
      setWarn({
        text: `Video dài ${fmt(v.duration)}, vượt giới hạn ${fmt(maxSeconds)}. Hãy cắt ngắn trước khi tải lên.`,
      });
    } else if (v.videoWidth > v.videoHeight) {
      setWarn({ text: "Video ngang: app sẽ tự crop dọc theo khuôn mặt.", soft: true });
    }
  };

  const clear = () => {
    setFile(null);
    setUrl("");
    setWarn(null);
    setTooLong(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const show = (p: number, m?: string) => {
    setPct(p);
    if (m) setMsg(m);
  };

  const fail = (m: string) => setErr(m);

  const poll = (id: string) => {
    fetch(`${API_URL}/api/jobs/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        show(Math.max(2, s.pct || 0), s.msg);
        if (s.state === "done") {
          setOut(`${API_URL}/api/jobs/${id}/video`);
          setPhase("done");
        } else if (s.state === "error") {
          fail(`Edit không thành công: ${s.msg || "lỗi không rõ"}. Lượt của bạn đã được hoàn lại.`);
        } else setTimeout(() => poll(id), 2000);
      })
      .catch(() => setTimeout(() => poll(id), 4000));
  };

  const runDemo = () => {
    let p = 0;
    let i = 0;
    const tick = () => {
      p = Math.min(100, p + 1.4);
      while (i < STAGES.length - 1 && p >= (STAGES[i + 1]?.[0] ?? 101)) i++;
      show(p, `${STAGES[i]?.[1] ?? ""}… (mô phỏng)`);
      if (p < 100) setTimeout(tick, 70);
      else {
        setOut(null);
        setPhase("done");
      }
    };
    tick();
  };

  const start = () => {
    if (!file) return;
    setErr("");
    setPhase("run");
    show(0, "Đang tải lên…");
    if (demo) return runDemo();
    const fd = new FormData();
    fd.append("video", file);
    fd.append("c1", c1);
    fd.append("c2", c2);
    fd.append("code", code);
    const x = new XMLHttpRequest();
    x.open("POST", `${API_URL}/api/jobs`);
    x.upload.onprogress = (e) => {
      if (e.lengthComputable)
        show((e.loaded / e.total) * 2, `Đang tải lên… ${Math.round((e.loaded / e.total) * 100)}%`);
    };
    x.onload = () => {
      let r: { id?: string; detail?: string } = {};
      try {
        r = JSON.parse(x.responseText);
      } catch {
        /* bỏ qua */
      }
      if (x.status !== 200 || !r.id)
        return fail(r.detail || "Tải lên không thành công. Kiểm tra kết nối rồi thử lại.");
      poll(r.id);
    };
    x.onerror = () => fail("Mất kết nối tới máy chủ. Kiểm tra mạng rồi thử lại.");
    x.send(fd);
  };

  const back = () => {
    setPhase("setup");
    setErr("");
    setPct(0);
  };

  const step = phase === "setup" ? (file ? 2 : 1) : phase === "run" ? 3 : 4;
  const stepCls = (i: number) => "step" + (i < step ? " done" : i === step ? " cur" : "");

  return (
    <section id="studio">
      <div className="wrap">
        <div className="sh">
          <span className="eyebrow mono">Studio</span>
          <h2>3 bước, không cần chỉnh tay</h2>
          <p>Tải video lên, chọn màu thương hiệu, bấm Edit. Mọi việc còn lại app tự làm.</p>
        </div>

        <div className="studio">
          {server.state === "demo" && (
            <div className="banner">
              <strong>Chế độ xem thử.</strong>
              <span>
                Web chưa nối với máy chủ edit, nên tiến trình bên dưới chỉ là mô phỏng và không tạo
                video thật.
              </span>
            </div>
          )}
          {server.health.telegram && (
            <div className="banner tg">
              <strong>Dùng Telegram?</strong>
              <span>
                Gửi video cho bot{" "}
                <a href={`https://t.me/${server.health.telegram}`} target="_blank" rel="noopener">
                  @{server.health.telegram}
                </a>{" "}
                và nhận video thành phẩm ngay trong chat (video tối đa 20 MB).
              </span>
            </div>
          )}
          <div className="steps" aria-label="Các bước">
            <div className={stepCls(1)}>
              <b>1</b>Tải video
            </div>
            <div className={stepCls(2)}>
              <b>2</b>Màu &amp; mã
            </div>
            <div className={stepCls(3)}>
              <b>3</b>Xử lý &amp; tải về
            </div>
          </div>

          {phase === "setup" ? (
            <div className="panel">
              <div>
                {!file ? (
                  <div
                    className={"drop" + (drag ? " on" : "")}
                    tabIndex={0}
                    role="button"
                    aria-label="Chọn video"
                    onClick={() => fileInput.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInput.current?.click();
                      }
                    }}
                    onDragEnter={(e) => (e.preventDefault(), setDrag(true))}
                    onDragOver={(e) => (e.preventDefault(), setDrag(true))}
                    onDragLeave={(e) => (e.preventDefault(), setDrag(false))}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDrag(false);
                      pick(e.dataTransfer.files[0]);
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4" />
                      <path d="m7 9 5-5 5 5" />
                      <path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" />
                    </svg>
                    <strong>Kéo video vào đây</strong>
                    <small>
                      hoặc bấm để chọn · MP4, MOV · tối đa {Math.round(maxSeconds / 60)} phút · 1
                      người nói
                    </small>
                  </div>
                ) : (
                  <div className="file">
                    <video
                      src={url}
                      muted
                      playsInline
                      onLoadedMetadata={(e) => onMeta(e.currentTarget)}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div className="n">{file.name}</div>
                      <div className="d">{meta}</div>
                    </div>
                    <button className="btn btn-g x" type="button" onClick={clear}>
                      Đổi video
                    </button>
                  </div>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => pick(e.target.files?.[0])}
                />
                {warn && (
                  <div className="warn" style={warn.soft ? { color: "var(--mute)" } : undefined}>
                    {warn.text}
                  </div>
                )}
              </div>

              <div className="side">
                <div>
                  <span className="lbl">Màu thương hiệu</span>
                  <div className="presets">
                    {PRESETS.map((p, i) => (
                      <button
                        key={p.name}
                        type="button"
                        className="pre"
                        aria-pressed={preset === i}
                        onClick={() => {
                          setPreset(i);
                          setC1(p.c1);
                          setC2(p.c2);
                        }}
                      >
                        <i>
                          <span style={{ background: p.c1 }} />
                          <span style={{ background: p.c2 }} />
                        </i>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div className="custom">
                    Tự chọn
                    <input
                      type="color"
                      value={c1}
                      aria-label="Màu 1"
                      onChange={(e) => (setC1(e.target.value), setPreset(null))}
                    />
                    <input
                      type="color"
                      value={c2}
                      aria-label="Màu 2"
                      onChange={(e) => (setC2(e.target.value), setPreset(null))}
                    />
                  </div>
                </div>
                {server.health.require_code && (
                  <div>
                    <label className="lbl" htmlFor="code">
                      Mã truy cập
                    </label>
                    <input
                      className="inp"
                      id="code"
                      placeholder="VD: KHACH01"
                      autoComplete="off"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                )}
                <button
                  className="btn btn-p go"
                  type="button"
                  disabled={!file || tooLong}
                  onClick={start}
                >
                  Edit video
                </button>
                <p className="hint">
                  {file ? "Sẵn sàng. Bấm Edit video." : "Chọn video để bắt đầu."}
                </p>
              </div>
            </div>
          ) : (
            <div className="run">
              <div>
                {phase === "run" && (
                  <div>
                    <div className="pct">{Math.round(pct)}%</div>
                    <div className="bar">
                      <i style={{ width: pct + "%" }} />
                    </div>
                    <p className="msg">{msg}</p>
                    <p className="hint" style={{ marginTop: 18 }}>
                      Bạn có thể để tab này mở và làm việc khác. Video 1 phút thường xong trong 3–8
                      phút.
                    </p>
                  </div>
                )}
                {phase === "done" && (
                  <div className="result">
                    {out ? (
                      <video src={out} controls playsInline />
                    ) : (
                      <div className="demo-v">Video thành phẩm sẽ hiện ở đây</div>
                    )}
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <span className="mono" style={{ color: "var(--ok)" }}>
                        Hoàn tất
                      </span>
                      <h3 style={{ marginTop: 8 }}>Video đã sẵn sàng</h3>
                      <p className="hint" style={{ marginTop: 8 }}>
                        MP4 1080×1920, có sẵn caption, hiệu ứng và âm thanh. Đăng thẳng lên TikTok,
                        Reels, Shorts.
                      </p>
                      <div className="acts">
                        {out && (
                          <a
                            className="btn btn-p"
                            href={`${out}?download=1`}
                            target="_blank"
                            rel="noopener"
                          >
                            Tải video về
                          </a>
                        )}
                        <button
                          className="btn btn-g"
                          type="button"
                          onClick={() => (clear(), back())}
                        >
                          Edit video khác
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {err && (
                  <>
                    <div className="err">{err}</div>
                    <button
                      className="btn btn-g"
                      type="button"
                      style={{ marginTop: 14 }}
                      onClick={back}
                    >
                      Quay lại
                    </button>
                  </>
                )}
              </div>
              <Stages pct={phase === "done" ? 100 : pct} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
