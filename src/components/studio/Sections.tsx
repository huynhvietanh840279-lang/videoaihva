import { useState } from "react";
import { PLANS, ZALO } from "@/config/site";
import type { ServerState } from "./Studio";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";

export function TopBar({ state, queue }: { state: ServerState; queue?: number | undefined }) {
  const label =
    state === "checking"
      ? "Đang kiểm tra máy chủ"
      : state === "online"
        ? queue
          ? `Đang xếp hàng: ${queue}`
          : "Máy chủ sẵn sàng"
        : "Chế độ xem thử";
  return (
    <header className="top">
      <div className="wrap">
        <a className="logo" href="#">
          <i>H</i>HVA Video Studio
        </a>
        <nav className="nav" aria-label="Điều hướng">
          <a href="#studio">Studio</a>
          <a href="#hieu-ung">Hiệu ứng</a>
          <a href="#bang-gia">Bảng giá</a>
          <a href="#hoi-dap">Hỏi đáp</a>
        </nav>
        <div className={"status" + (state === "online" ? " on" : state === "demo" ? " demo" : "")}>
          <b />
          <span>{label}</span>
        </div>
        <a className="btn btn-p" href="#studio">
          Edit video
        </a>
      </div>
    </header>
  );
}

const LANES: [string, string, [number, number][]][] = [
  [
    "V1",
    "c-v",
    [
      [0, 24],
      [25, 31],
      [57, 43],
    ],
  ],
  [
    "ZOOM",
    "c-a",
    [
      [6, 6],
      [30, 5],
      [62, 7],
      [86, 5],
    ],
  ],
  [
    "HOẠ",
    "c-c",
    [
      [16, 12],
      [44, 10],
      [74, 11],
    ],
  ],
  [
    "SFX",
    "c-a",
    [
      [1, 2],
      [15, 2],
      [43, 2],
      [73, 2],
    ],
  ],
  [
    "CAP",
    "c-v",
    [
      [3, 12],
      [29, 14],
      [55, 18],
      [86, 13],
    ],
  ],
];

const PLAN_ROWS: [string, string][] = [
  ["Khoảng lặng đã cắt", "14 đoạn · 9,6s"],
  ["Điểm zoom cảm xúc", "6"],
  ["Hoạt hoạ minh hoạ", "2"],
  ["Từ khoá 2 màu", "9"],
  ["Crop bám mặt", "00:41 → 00:46"],
  ["So sánh trước/sau", "00:58"],
];

export function Hero() {
  return (
    <section className="hero">
      <img className="hero-space" src={cosmicNebula} alt="" aria-hidden="true" width={1536} height={1024} />
      <div className="wrap">
        <div>
          <span className="eyebrow mono">AI edit video nói chuyện</span>
          <h1>
            Thả video vào.
            <br />
            Nhận bản edit <em>cao cấp</em> trong vài phút.
          </h1>
          <p className="sub">
            Tự cắt khoảng lặng, zoom theo cảm xúc giọng nói, chèn hoạt hoạ minh hoạ, caption động,
            từ khoá 2 màu, crop bám mặt và so sánh trước/sau. Không cần biết dựng phim.
          </p>
          <div className="cta">
            <a className="btn btn-p" href="#studio">
              Edit video đầu tiên
            </a>
            <a className="btn btn-g" href="#hieu-ung">
              Xem 7 hiệu ứng
            </a>
          </div>
          <div className="facts">
            <div>
              <strong>1080×1920</strong>
              <span>Dọc 9:16, đăng ngay TikTok, Reels</span>
            </div>
            <div>
              <strong>≤ 5 phút</strong>
              <span>Độ dài video mỗi lần</span>
            </div>
            <div>
              <strong>Tiếng Việt</strong>
              <span>Nhận giọng có dấu chuẩn</span>
            </div>
          </div>
        </div>

        <div className="bay" aria-label="Mô phỏng bàn dựng">
          <div className="bay-top">
            <div className="phone">
              <div className="tc">00:00:12:04</div>
              <div className="body" />
              <div className="face" />
              <div className="cap">
                3 bước <span>CHỐT ĐƠN</span>
              </div>
              <div className="ovr">
                <div>Chào khách</div>
                <div>Hỏi nhu cầu</div>
                <div>Gửi giá &amp; chốt</div>
              </div>
            </div>
            <div className="meta">
              <span className="mono" style={{ color: "var(--mute)" }}>
                Kịch bản edit · Claude
              </span>
              {PLAN_ROWS.map(([k, v]) => (
                <div className="row" key={k}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tl">
            <div className="playhead" />
            {LANES.map(([k, cls, clips]) => (
              <div className="lane" key={k}>
                <span className="k">{k}</span>
                <div className="t">
                  {clips.map(([l, w]) => (
                    <i
                      key={l}
                      className={"clip " + cls}
                      style={{ left: l + "%", width: w + "%" }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const FX: [string, string, string][] = [
  [
    "ZOOM",
    "Zoom theo cảm xúc",
    "Phóng nhẹ 4–8% đúng lúc giọng lên cao hoặc bắt đầu ý mới, vào ra mượt.",
  ],
  [
    "HOẠ",
    "Hoạt hoạ minh hoạ",
    "Các bước hiện dần, đường nối tự vẽ, đặt dưới cằm nên không bao giờ che mặt.",
  ],
  [
    "SFX",
    "Âm thanh hiệu ứng",
    "Whoosh, pop, tick khớp đúng khoảnh khắc hình xuất hiện, tinh tế, không lố.",
  ],
  [
    "KEY",
    "Từ khoá 2 màu",
    "Từ đắt nhất được phóng to theo màu thương hiệu. Caption tự tạm dừng khi có hiệu ứng.",
  ],
  [
    "B-ROLL",
    "Lớp phủ số liệu",
    "Đoạn nói con số hoặc liệt kê được biến thành màn hình minh hoạ riêng.",
  ],
  [
    "CROP",
    "Crop bám mặt",
    "Mặt lùi vào khung tròn để nhường chỗ cho nội dung. Cắt rộng, thấy tới ngực.",
  ],
  [
    "VS",
    "So sánh trước / sau",
    "Khi bạn nói “thay vì A hãy làm B”, app dựng thẻ so sánh 2 bên rõ ràng.",
  ],
];

const FILTERS = ["Tất cả", "Hình", "Chữ", "Âm thanh"] as const;
const GROUP: Record<string, (typeof FILTERS)[number]> = {
  ZOOM: "Hình",
  HOẠ: "Hình",
  SFX: "Âm thanh",
  KEY: "Chữ",
  "B-ROLL": "Hình",
  CROP: "Hình",
  VS: "Chữ",
  NỀN: "Chữ",
};

export function Effects() {
  const [f, setF] = useState<(typeof FILTERS)[number]>("Tất cả");
  const show = (tag: string) => f === "Tất cả" || GROUP[tag] === f;
  return (
    <section id="hieu-ung">
      <div className="wrap">
        <div className="sh">
          <span className="eyebrow mono">Hiệu ứng</span>
          <h2>7 lớp hiệu ứng, đặt đúng chỗ</h2>
          <p>
            Claude nghe cả video rồi mới quyết định chỗ nào cần hiệu ứng. Hiệu ứng lớn cách nhau ít
            nhất 6 giây và không chiếm quá 40% video, để người xem không bị rối.
          </p>
        </div>
        <div className="chips" role="group" aria-label="Lọc hiệu ứng">
          {FILTERS.map((x) => (
            <button
              key={x}
              type="button"
              className="chip"
              aria-pressed={f === x}
              onClick={() => setF(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="fx">
          {FX.map(([tag, h, p]) => (
            <article key={tag} hidden={!show(tag)}>
              <span className="tag">{tag}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
          <article className="wide" hidden={!show("NỀN")}>
            <span className="tag">NỀN</span>
            <h3>Cắt gọn + thumbnail</h3>
            <p>
              Bỏ khoảng lặng, tiếng “ừm, à”, đoạn đếm 1-2-3 đầu video. Thêm tiêu đề mở đầu gây tò
              mò.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(ZALO)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => undefined);
  };
  return (
    <section id="bang-gia">
      <div className="wrap">
        <div className="sh">
          <span className="eyebrow mono">Bảng giá</span>
          <h2>Trả theo số video</h2>
          <p>Mua gói, nhận mã truy cập, nhập mã khi edit. Video lỗi được hoàn lượt tự động.</p>
        </div>
        <div className="plans">
          {PLANS.map((p) => (
            <div key={p.name} className={"plan" + (p.hot ? " hot" : "")}>
              <div className="pn">
                {p.name}
                {p.hot && <span className="badge">PHỔ BIẾN</span>}
              </div>
              <div className="price">
                {p.price} <small>/ {p.unit}</small>
              </div>
              <ul>
                {p.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <a
                className={"btn " + (p.hot ? "btn-p" : "btn-g")}
                href={`https://zalo.me/${ZALO}`}
                target="_blank"
                rel="noopener"
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
        <div className="contact">
          Mua gói qua Zalo <code>{ZALO}</code>
          <button className="btn btn-g" type="button" style={{ height: 36 }} onClick={copy}>
            Sao chép số
          </button>
          {copied && <span className="hint">Đã sao chép</span>}
        </div>
      </div>
    </section>
  );
}

const QA: [string, string][] = [
  [
    "Video như thế nào thì edit đẹp nhất?",
    "Video 1 người nói chuyện trước camera, quay dọc, mặt rõ, âm thanh sạch, dài 30 giây đến 5 phút. Video ngang vẫn nhận, app tự crop theo mặt.",
  ],
  [
    "Mất bao lâu?",
    "Thường 3–8 phút cho video 1 phút, tuỳ số người đang xếp hàng. Thanh tiến trình cho biết app đang làm bước nào.",
  ],
  [
    "Có đổi màu chữ theo thương hiệu được không?",
    "Có. Chọn 1 bộ màu có sẵn hoặc tự chọn 2 màu. Từ khoá và hoạt hoạ sẽ dùng 2 màu đó.",
  ],
  [
    "Video của tôi có bị lưu lại không?",
    "Video chỉ dùng để edit và tự xoá khỏi máy chủ sau 7 ngày. Hãy tải bản thành phẩm về trước thời hạn đó.",
  ],
  [
    "Có dùng nhạc trend không?",
    "App chỉ thêm âm thanh hiệu ứng tự tạo, không chèn nhạc có bản quyền. Bạn có thể ghép nhạc trong TikTok khi đăng.",
  ],
  [
    "Edit lỗi thì sao?",
    "Nếu app báo lỗi, lượt của bạn được hoàn lại ngay. Bạn có thể thử lại với video khác hoặc nhắn Zalo để được hỗ trợ.",
  ],
];

export function Faq() {
  return (
    <section id="hoi-dap">
      <div className="wrap">
        <div className="sh">
          <span className="eyebrow mono">Hỏi đáp</span>
          <h2>Câu hỏi thường gặp</h2>
        </div>
        <div className="faq">
          {QA.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <span>© 2026 HVA Video Studio</span>
        <span>Video dọc 9:16 · Tiếng Việt · Edit bằng AI</span>
      </div>
    </footer>
  );
}
