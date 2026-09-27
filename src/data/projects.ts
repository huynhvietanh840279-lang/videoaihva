export interface Project {
  id: string;
  slug: string;
  name: string;
  developer: string;
  provinceId: string;
  districtId: string;
  address: string;
  status: "Đang mở bán" | "Sắp mở bán" | "Đã bàn giao";
  priceRange: string;
  scale: string;
  units: number;
  progress: string;
  legal: string;
  amenities: string[];
  images: string[];
  description: string;
  lat: number;
  lng: number;
}

const img = (id: string) => `https://images.unsplash.com/${id}?w=1000&q=80`;

export const projects: Project[] = [
  {
    id: "p1",
    slug: "the-sun-riverside",
    name: "The Sun Riverside",
    developer: "Tập đoàn Nam Long",
    provinceId: "hcm",
    districtId: "hcm-17",
    address: "Đường Võ Chí Công, TP. Thủ Đức, TP. Hồ Chí Minh",
    status: "Đang mở bán",
    priceRange: "52 – 78 triệu/m²",
    scale: "4,2 ha",
    units: 1250,
    progress: "Đang hoàn thiện tầng 18",
    legal: "Sổ hồng từng căn",
    amenities: ["Hồ bơi tràn bờ", "Phòng gym", "Công viên ven sông", "Trường mầm non", "Khu BBQ", "An ninh 24/7"],
    images: [img("photo-1545324418-cc1a3fa10c00"), img("photo-1512917774080-9991f1c4c750"), img("photo-1493809842364-78817add7ffb")],
    description:
      "Khu căn hộ cao cấp ven sông Sài Gòn với hệ tiện ích nội khu hoàn chỉnh, kết nối trực tiếp vào trung tâm Quận 1 chỉ 15 phút qua hầm Thủ Thiêm.",
    lat: 10.803,
    lng: 106.742,
  },
  {
    id: "p2",
    slug: "an-khanh-garden-city",
    name: "An Khánh Garden City",
    developer: "Vinhomes",
    provinceId: "hn",
    districtId: "hn-16",
    address: "Đại lộ Thăng Long, Hoài Đức, Hà Nội",
    status: "Đang mở bán",
    priceRange: "120 – 180 triệu/m²",
    scale: "28 ha",
    units: 860,
    progress: "Bàn giao thô giai đoạn 1",
    legal: "Sổ đỏ lâu dài",
    amenities: ["Công viên trung tâm", "Trường liên cấp", "TTTM", "Bể bơi", "Sân tennis", "Hồ điều hòa"],
    images: [img("photo-1570129477492-45c003edd2be"), img("photo-1568605114967-8130f3a36994")],
    description:
      "Khu đô thị biệt thự và liền kề phía Tây Hà Nội, quy hoạch đồng bộ, mật độ xây dựng thấp, không gian sống xanh.",
    lat: 21.01,
    lng: 105.73,
  },
  {
    id: "p3",
    slug: "ocean-bay-da-nang",
    name: "Ocean Bay Đà Nẵng",
    developer: "Sun Group",
    provinceId: "dn",
    districtId: "dn-3",
    address: "Đường Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
    status: "Sắp mở bán",
    priceRange: "68 – 95 triệu/m²",
    scale: "6,8 ha",
    units: 940,
    progress: "Đang thi công móng",
    legal: "Hợp đồng mua bán",
    amenities: ["Bãi biển riêng", "Spa", "Nhà hàng", "Hồ bơi vô cực", "Khu thể thao biển"],
    images: [img("photo-1559592413-7cec4d0cae2b"), img("photo-1502672260266-1c1ef2d93688")],
    description: "Tổ hợp căn hộ nghỉ dưỡng mặt tiền biển Mỹ Khê, khai thác cho thuê du lịch quanh năm.",
    lat: 16.06,
    lng: 108.245,
  },
  {
    id: "p4",
    slug: "binh-duong-new-central",
    name: "Bình Dương New Central",
    developer: "Becamex IDC",
    provinceId: "bd",
    districtId: "bd-1",
    address: "TP. Thủ Dầu Một, Bình Dương",
    status: "Đang mở bán",
    priceRange: "32 – 45 triệu/m²",
    scale: "12 ha",
    units: 1600,
    progress: "Bàn giao quý 2/2027",
    legal: "Sổ hồng từng căn",
    amenities: ["Trung tâm thương mại", "Công viên", "Gym", "Hồ bơi", "Khu vui chơi trẻ em"],
    images: [img("photo-1486406146926-c627a92ad1ab"), img("photo-1560448204-e02f11c3d0e2")],
    description: "Dự án căn hộ giá hợp lý dành cho chuyên gia và kỹ sư làm việc tại các khu công nghiệp Bình Dương.",
    lat: 10.98,
    lng: 106.652,
  },
  {
    id: "p5",
    slug: "long-thanh-airport-city",
    name: "Long Thành Airport City",
    developer: "DIC Corp",
    provinceId: "dnai",
    districtId: "dnai-3",
    address: "Huyện Long Thành, Đồng Nai",
    status: "Đang mở bán",
    priceRange: "22 – 35 triệu/m²",
    scale: "45 ha",
    units: 2100,
    progress: "Hoàn thiện hạ tầng",
    legal: "Sổ đỏ từng nền",
    amenities: ["Đường nội khu 20m", "Công viên", "Trường học", "Chợ", "Điện âm"],
    images: [img("photo-1500382017468-9049fed747ef"), img("photo-1464822759023-fed622ff2c3b")],
    description: "Khu đất nền liền kề sân bay Long Thành, hưởng lợi trực tiếp từ hạ tầng vùng.",
    lat: 10.82,
    lng: 106.95,
  },
  {
    id: "p6",
    slug: "dalat-pine-hills",
    name: "Đà Lạt Pine Hills",
    developer: "Hưng Thịnh Land",
    provinceId: "ld",
    districtId: "ld-1",
    address: "TP. Đà Lạt, Lâm Đồng",
    status: "Sắp mở bán",
    priceRange: "40 – 60 triệu/m²",
    scale: "18 ha",
    units: 380,
    progress: "Chuẩn bị khởi công",
    legal: "Sổ đỏ lâu dài",
    amenities: ["Rừng thông", "Khu nghỉ dưỡng", "Nhà hàng", "Đường dạo bộ"],
    images: [img("photo-1449844908441-8829872d2607"), img("photo-1600596542815-ffad4c1539a9")],
    description: "Biệt thự nghỉ dưỡng đồi thông, khí hậu quanh năm mát mẻ, phù hợp second home.",
    lat: 11.94,
    lng: 108.44,
  },
  {
    id: "p7",
    slug: "hai-phong-harbor-view",
    name: "Hải Phòng Harbor View",
    developer: "Hoàng Huy Group",
    provinceId: "hp",
    districtId: "hp-4",
    address: "Quận Hải An, Hải Phòng",
    status: "Đã bàn giao",
    priceRange: "35 – 50 triệu/m²",
    scale: "8 ha",
    units: 720,
    progress: "Đã bàn giao 2025",
    legal: "Sổ hồng từng căn",
    amenities: ["Bể bơi", "Gym", "Sân chơi", "Siêu thị mini", "Bãi xe rộng"],
    images: [img("photo-1522708323590-d24dbb6b0267"), img("photo-1497366754035-f200968a6e72")],
    description: "Khu căn hộ hiện đại gần cảng Hải Phòng, cư dân đã vào ở ổn định.",
    lat: 20.83,
    lng: 106.73,
  },
  {
    id: "p8",
    slug: "can-tho-mekong-riverside",
    name: "Cần Thơ Mekong Riverside",
    developer: "Nam Miền Trung Group",
    provinceId: "ct",
    districtId: "ct-1",
    address: "Quận Ninh Kiều, Cần Thơ",
    status: "Đang mở bán",
    priceRange: "28 – 42 triệu/m²",
    scale: "10 ha",
    units: 640,
    progress: "Xây thô giai đoạn 2",
    legal: "Hợp đồng mua bán",
    amenities: ["Bến du thuyền", "Công viên ven sông", "Phố thương mại", "Gym"],
    images: [img("photo-1473448912268-2022ce9509d8"), img("photo-1523217582562-09d0def993a6")],
    description: "Khu đô thị ven sông Hậu, kết hợp nhà phố thương mại và căn hộ.",
    lat: 10.03,
    lng: 105.78,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
