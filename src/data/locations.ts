export interface Ward {
  id: string;
  name: string;
  districtId: string;
}
export interface District {
  id: string;
  name: string;
  provinceId: string;
}
export interface Province {
  id: string;
  name: string;
  slug: string;
}

const P = (id: string, name: string, slug: string): Province => ({ id, name, slug });

export const provinces: Province[] = [
  P("hcm", "TP. Hồ Chí Minh", "tp-ho-chi-minh"),
  P("hn", "Hà Nội", "ha-noi"),
  P("dn", "Đà Nẵng", "da-nang"),
  P("bd", "Bình Dương", "binh-duong"),
  P("dnai", "Đồng Nai", "dong-nai"),
  P("hp", "Hải Phòng", "hai-phong"),
  P("la", "Long An", "long-an"),
  P("ld", "Lâm Đồng", "lam-dong"),
  P("ct", "Cần Thơ", "can-tho"),
  P("brvt", "Bà Rịa - Vũng Tàu", "ba-ria-vung-tau"),
  P("kh", "Khánh Hòa", "khanh-hoa"),
  P("qn", "Quảng Ninh", "quang-ninh"),
  P("bn", "Bắc Ninh", "bac-ninh"),
  P("hd", "Hải Dương", "hai-duong"),
  P("hy", "Hưng Yên", "hung-yen"),
  P("tb", "Thái Bình", "thai-binh"),
  P("nd", "Nam Định", "nam-dinh"),
  P("nb", "Ninh Bình", "ninh-binh"),
  P("th", "Thanh Hóa", "thanh-hoa"),
  P("na", "Nghệ An", "nghe-an"),
  P("ht", "Hà Tĩnh", "ha-tinh"),
  P("qb", "Quảng Bình", "quang-binh"),
  P("qt", "Quảng Trị", "quang-tri"),
  P("tth", "Thừa Thiên Huế", "thua-thien-hue"),
  P("qnam", "Quảng Nam", "quang-nam"),
  P("qng", "Quảng Ngãi", "quang-ngai"),
  P("bdinh", "Bình Định", "binh-dinh"),
  P("py", "Phú Yên", "phu-yen"),
  P("nt", "Ninh Thuận", "ninh-thuan"),
  P("bt", "Bình Thuận", "binh-thuan"),
  P("kt", "Kon Tum", "kon-tum"),
  P("gl", "Gia Lai", "gia-lai"),
  P("dl", "Đắk Lắk", "dak-lak"),
  P("dno", "Đắk Nông", "dak-nong"),
  P("bp", "Bình Phước", "binh-phuoc"),
  P("tn", "Tây Ninh", "tay-ninh"),
  P("tg", "Tiền Giang", "tien-giang"),
  P("bl", "Bạc Liêu", "bac-lieu"),
  P("bre", "Bến Tre", "ben-tre"),
  P("tv", "Trà Vinh", "tra-vinh"),
  P("vl", "Vĩnh Long", "vinh-long"),
  P("dt", "Đồng Tháp", "dong-thap"),
  P("ag", "An Giang", "an-giang"),
  P("kg", "Kiên Giang", "kien-giang"),
  P("hg", "Hậu Giang", "hau-giang"),
  P("st", "Sóc Trăng", "soc-trang"),
  P("cm", "Cà Mau", "ca-mau"),
  P("lc", "Lào Cai", "lao-cai"),
  P("yb", "Yên Bái", "yen-bai"),
  P("dbien", "Điện Biên", "dien-bien"),
  P("lchau", "Lai Châu", "lai-chau"),
  P("sl", "Sơn La", "son-la"),
  P("hb", "Hòa Bình", "hoa-binh"),
  P("hgiang", "Hà Giang", "ha-giang"),
  P("cb", "Cao Bằng", "cao-bang"),
  P("bk", "Bắc Kạn", "bac-kan"),
  P("ls", "Lạng Sơn", "lang-son"),
  P("tq", "Tuyên Quang", "tuyen-quang"),
  P("tng", "Thái Nguyên", "thai-nguyen"),
  P("pt", "Phú Thọ", "phu-tho"),
  P("vp", "Vĩnh Phúc", "vinh-phuc"),
  P("bg", "Bắc Giang", "bac-giang"),
  P("hnam", "Hà Nam", "ha-nam"),
];

const d = (provinceId: string, names: string[]): District[] =>
  names.map((name, i) => ({
    id: `${provinceId}-${i + 1}`,
    name,
    provinceId,
  }));

export const districts: District[] = [
  ...d("hcm", [
    "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10",
    "Quận 11", "Quận 12", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận",
    "Quận Tân Bình", "Quận Tân Phú", "Quận Bình Tân", "TP. Thủ Đức", "Huyện Nhà Bè",
    "Huyện Bình Chánh", "Huyện Hóc Môn", "Huyện Củ Chi", "Huyện Cần Giờ",
  ]),
  ...d("hn", [
    "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Tây Hồ", "Quận Long Biên", "Quận Cầu Giấy",
    "Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Hoàng Mai", "Quận Thanh Xuân",
    "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Hà Đông", "Huyện Gia Lâm",
    "Huyện Đông Anh", "Huyện Thanh Trì", "Huyện Hoài Đức", "Huyện Đan Phượng",
  ]),
  ...d("dn", [
    "Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn",
    "Quận Liên Chiểu", "Quận Cẩm Lệ", "Huyện Hòa Vang",
  ]),
  ...d("bd", [
    "TP. Thủ Dầu Một", "TP. Dĩ An", "TP. Thuận An", "TP. Tân Uyên", "TX. Bến Cát",
    "Huyện Bàu Bàng", "Huyện Phú Giáo", "Huyện Dầu Tiếng",
  ]),
  ...d("dnai", [
    "TP. Biên Hòa", "TP. Long Khánh", "Huyện Long Thành", "Huyện Nhơn Trạch",
    "Huyện Trảng Bom", "Huyện Vĩnh Cửu", "Huyện Thống Nhất",
  ]),
  ...d("hp", [
    "Quận Hồng Bàng", "Quận Lê Chân", "Quận Ngô Quyền", "Quận Hải An", "Quận Kiến An",
    "Quận Dương Kinh", "Huyện Thủy Nguyên", "Huyện An Dương",
  ]),
  ...d("la", [
    "TP. Tân An", "Huyện Bến Lức", "Huyện Đức Hòa", "Huyện Cần Giuộc", "Huyện Cần Đước",
    "Huyện Thủ Thừa",
  ]),
  ...d("ld", [
    "TP. Đà Lạt", "TP. Bảo Lộc", "Huyện Đức Trọng", "Huyện Lâm Hà", "Huyện Di Linh",
    "Huyện Bảo Lâm",
  ]),
  ...d("ct", ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn"]),
  ...d("brvt", ["TP. Vũng Tàu", "TP. Bà Rịa", "TX. Phú Mỹ", "Huyện Long Điền", "Huyện Xuyên Mộc"]),
  ...d("kh", ["TP. Nha Trang", "TP. Cam Ranh", "TX. Ninh Hòa", "Huyện Diên Khánh"]),
  ...d("qn", ["TP. Hạ Long", "TP. Cẩm Phả", "TP. Uông Bí", "TX. Quảng Yên", "TP. Móng Cái"]),
  ...d("bn", ["TP. Bắc Ninh", "TX. Từ Sơn", "Huyện Tiên Du", "Huyện Yên Phong"]),
  ...d("bt", ["TP. Phan Thiết", "TX. La Gi", "Huyện Hàm Thuận Nam", "Huyện Bắc Bình"]),
  ...d("tth", ["TP. Huế", "TX. Hương Thủy", "TX. Hương Trà", "Huyện Phú Vang"]),
  ...d("qnam", ["TP. Hội An", "TP. Tam Kỳ", "TX. Điện Bàn", "Huyện Duy Xuyên"]),
  ...d("dl", ["TP. Buôn Ma Thuột", "TX. Buôn Hồ", "Huyện Cư M'gar", "Huyện Krông Pắc"]),
  ...d("kg", ["TP. Rạch Giá", "TP. Phú Quốc", "TP. Hà Tiên", "Huyện Kiên Lương"]),
  ...d("na", ["TP. Vinh", "TX. Cửa Lò", "Huyện Nghi Lộc", "Huyện Hưng Nguyên"]),
  ...d("th", ["TP. Thanh Hóa", "TP. Sầm Sơn", "TX. Bỉm Sơn", "Huyện Hoằng Hóa"]),
  ...d("hy", ["TP. Hưng Yên", "TX. Mỹ Hào", "Huyện Văn Giang", "Huyện Yên Mỹ"]),
  ...d("vp", ["TP. Vĩnh Yên", "TP. Phúc Yên", "Huyện Bình Xuyên", "Huyện Yên Lạc"]),
  ...d("bg", ["TP. Bắc Giang", "Huyện Việt Yên", "Huyện Yên Dũng", "Huyện Hiệp Hòa"]),
  ...d("tng", ["TP. Thái Nguyên", "TP. Sông Công", "TX. Phổ Yên", "Huyện Đại Từ"]),
  ...d("bp", ["TP. Đồng Xoài", "TX. Chơn Thành", "Huyện Hớn Quản", "TX. Bình Long"]),
  ...d("tn", ["TP. Tây Ninh", "TX. Trảng Bàng", "TX. Hòa Thành", "Huyện Gò Dầu"]),
  ...d("tg", ["TP. Mỹ Tho", "TX. Gò Công", "Huyện Châu Thành", "Huyện Cai Lậy"]),
  ...d("ag", ["TP. Long Xuyên", "TP. Châu Đốc", "TX. Tân Châu", "Huyện Chợ Mới"]),
  ...d("hd", ["TP. Hải Dương", "TP. Chí Linh", "Huyện Cẩm Giàng", "Huyện Bình Giang"]),
  ...d("qb", ["TP. Đồng Hới", "TX. Ba Đồn", "Huyện Bố Trạch", "Huyện Lệ Thủy"]),
];

const wardNamesByDistrict: Record<string, string[]> = {};
const genericWards = ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5"];
const namedWards: Record<string, string[]> = {
  "hcm-1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao", "Phường Nguyễn Thái Bình"],
  "hcm-6": ["Phường Tân Phong", "Phường Tân Phú", "Phường Phú Mỹ", "Phường Bình Thuận"],
  "hcm-17": ["Phường Thảo Điền", "Phường An Phú", "Phường Linh Trung", "Phường Hiệp Bình Chánh"],
  "hn-3": ["Phường Quảng An", "Phường Xuân La", "Phường Nhật Tân", "Phường Bưởi"],
  "hn-5": ["Phường Dịch Vọng", "Phường Yên Hòa", "Phường Trung Hòa", "Phường Mai Dịch"],
  "hn-10": ["Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Mễ Trì", "Phường Trung Văn"],
  "dn-3": ["Phường An Hải Bắc", "Phường Mân Thái", "Phường Phước Mỹ", "Phường Nại Hiên Đông"],
};

export const wards: Ward[] = districts.flatMap((dist) => {
  const names = namedWards[dist.id] ?? wardNamesByDistrict[dist.id] ?? genericWards;
  return names.map((name, i) => ({ id: `${dist.id}-w${i + 1}`, name, districtId: dist.id }));
});

export const getProvince = (id: string) => provinces.find((p) => p.id === id);
export const getDistrict = (id: string) => districts.find((x) => x.id === id);
export const getWard = (id: string) => wards.find((w) => w.id === id);
export const districtsOf = (provinceId: string) =>
  districts.filter((x) => x.provinceId === provinceId);
export const wardsOf = (districtId: string) => wards.filter((w) => w.districtId === districtId);

export const featuredCities = [
  { provinceId: "hcm", name: "TP. Hồ Chí Minh", image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80" },
  { provinceId: "hn", name: "Hà Nội", image: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800&q=80" },
  { provinceId: "dn", name: "Đà Nẵng", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { provinceId: "bd", name: "Bình Dương", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" },
  { provinceId: "dnai", name: "Đồng Nai", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80" },
];
