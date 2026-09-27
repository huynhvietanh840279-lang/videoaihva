export interface ListingPackage {
  id: string;
  name: string;
  pricePerDay: number;
  position: string;
  imageLimit: number;
  recommended?: boolean;
  color: string;
  features: string[];
}

export const packages: ListingPackage[] = [
  {
    id: "normal",
    name: "Tin thường",
    pricePerDay: 0,
    position: "Hiển thị sau tin VIP",
    imageLimit: 6,
    color: "muted",
    features: ["Miễn phí đăng tin", "Tối đa 6 hình ảnh", "Hiển thị 10 ngày", "Tiêu đề chữ thường"],
  },
  {
    id: "vip_silver",
    name: "Tin VIP Bạc",
    pricePerDay: 30000,
    position: "Trên tin thường",
    imageLimit: 12,
    color: "secondary",
    features: ["Tối đa 12 hình ảnh", "Tiêu đề in đậm", "Huy hiệu VIP Bạc", "Ưu tiên hiển thị"],
  },
  {
    id: "vip_gold",
    name: "Tin VIP Vàng",
    pricePerDay: 60000,
    position: "Top trang danh mục",
    imageLimit: 18,
    recommended: true,
    color: "gold",
    features: [
      "Tối đa 18 hình ảnh",
      "Tiêu đề in đậm màu cam",
      "Huy hiệu Nổi bật",
      "Hiển thị trang chủ",
      "Báo cáo lượt xem",
    ],
  },
  {
    id: "vip_diamond",
    name: "Tin VIP Kim Cương",
    pricePerDay: 120000,
    position: "Top toàn trang",
    imageLimit: 24,
    color: "primary",
    features: [
      "Tối đa 24 hình ảnh",
      "Vị trí cao nhất mọi danh mục",
      "Huy hiệu Kim Cương",
      "Đẩy tin tự động mỗi ngày",
      "Hỗ trợ chăm sóc riêng",
    ],
  },
];
