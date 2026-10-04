// Cấu hình web: sửa giá, màu, số Zalo ở đây.
// Địa chỉ máy chủ edit video đặt trong biến môi trường VITE_API_URL
// (vd: https://hva-video-api.onrender.com). Để trống = chế độ xem thử.

export const API_URL: string = (
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? ""
).replace(/\/$/, "");

export const ZALO = "0981081462";

export const PRESETS = [
  { name: "Hổ phách", c1: "#FFB020", c2: "#38D3F5" },
  { name: "Neon", c1: "#F5FF3B", c2: "#3BF5FF" },
  { name: "Navy & Vàng", c1: "#FFC93C", c2: "#4D7CFE" },
  { name: "Đỏ & Trắng", c1: "#FF3B3B", c2: "#FFFFFF" },
  { name: "Hồng & Tím", c1: "#FF4FA3", c2: "#9B6CFF" },
  { name: "Xanh lá", c1: "#2EE59D", c2: "#FFE14D" },
];

// GIÁ MẪU — đổi theo giá bạn bán
export const PLANS = [
  {
    name: "Dùng thử",
    price: "0đ",
    unit: "1 video",
    items: ["Đủ 7 hiệu ứng", "Video tối đa 1 phút", "Có logo nhỏ cuối video"],
    cta: "Nhận mã dùng thử",
    hot: false,
  },
  {
    name: "Creator",
    price: "199K",
    unit: "10 video",
    items: ["Đủ 7 hiệu ứng", "Video tối đa 5 phút", "Tự chọn màu thương hiệu", "Hoàn lượt nếu lỗi"],
    cta: "Mua gói Creator",
    hot: true,
  },
  {
    name: "Agency",
    price: "499K",
    unit: "30 video",
    items: ["Mọi thứ trong Creator", "Ưu tiên xếp hàng", "Hỗ trợ qua Zalo"],
    cta: "Mua gói Agency",
    hot: false,
  },
];

export const STAGES: [number, string][] = [
  [2, "Chuẩn hoá video 9:16"],
  [10, "Tách lời nói tiếng Việt"],
  [35, "Cắt khoảng lặng, từ đệm"],
  [45, "Nhận diện khuôn mặt"],
  [55, "Claude lên kịch bản edit"],
  [62, "Dựng hoạt hoạ"],
  [82, "Caption & từ khoá 2 màu"],
  [86, "Ghép hình, hiệu ứng, âm thanh"],
  [100, "Hoàn tất"],
];
