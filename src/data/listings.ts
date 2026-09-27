import { districtsOf, getProvince, wardsOf } from "./locations";
import { agents } from "./agents";

export type Tier = "vip_diamond" | "vip_gold" | "vip_silver" | "normal";

export interface Listing {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  transactionType: "sale" | "rent";
  categoryId: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  street: string;
  projectId?: string | undefined;
  price: number | null;
  area: number;
  frontage?: number | undefined;
  roadWidth?: number | undefined;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  floors?: number | undefined;
  direction?: string | undefined;
  balconyDirection?: string | undefined;
  legal: "Sổ đỏ/Sổ hồng" | "Hợp đồng mua bán" | "Đang chờ sổ";
  furniture: "Đầy đủ" | "Cơ bản" | "Không";
  images: string[];
  lat: number;
  lng: number;
  tier: Tier;
  isOwner: boolean;
  postedAt: string;
  expiresAt: string;
  views: number;
  agentId: string;
  status: "active" | "pending" | "expired" | "rejected" | "draft";
}

// deterministic pseudo-random
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IMG = {
  apartment: [
    "photo-1545324418-cc1a3fa10c00",
    "photo-1502672260266-1c1ef2d93688",
    "photo-1560448204-e02f11c3d0e2",
    "photo-1493809842364-78817add7ffb",
    "photo-1522708323590-d24dbb6b0267",
  ],
  house: [
    "photo-1568605114967-8130f3a36994",
    "photo-1570129477492-45c003edd2be",
    "photo-1512917774080-9991f1c4c750",
    "photo-1523217582562-09d0def993a6",
    "photo-1600596542815-ffad4c1539a9",
  ],
  land: [
    "photo-1500382017468-9049fed747ef",
    "photo-1464822759023-fed622ff2c3b",
    "photo-1416879595882-3373a0480b5b",
    "photo-1473448912268-2022ce9509d8",
  ],
  office: [
    "photo-1497366754035-f200968a6e72",
    "photo-1497215728101-856f4ea42174",
    "photo-1524758631624-e2822e304c36",
  ],
};

function imagesFor(categoryId: string, rnd: () => number): string[] {
  const pool =
    categoryId.includes("dat") && !categoryId.includes("nha")
      ? IMG.land
      : categoryId.includes("van-phong") || categoryId.includes("kho") || categoryId.includes("cua-hang")
        ? IMG.office
        : categoryId.includes("can-ho") || categoryId.includes("phong-tro")
          ? IMG.apartment
          : IMG.house;
  const count = 4 + Math.floor(rnd() * 5);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(`https://images.unsplash.com/${pool[(i + Math.floor(rnd() * pool.length)) % pool.length]!}?w=900&q=80`);
  }
  return out;
}

const saleCats = [
  "can-ho-chung-cu",
  "nha-rieng",
  "nha-mat-pho",
  "nha-biet-thu",
  "dat-nen-du-an",
  "dat",
  "kho-xuong",
  "trang-trai",
];
const rentCats = [
  "thue-can-ho",
  "thue-nha-rieng",
  "thue-nha-mat-pho",
  "thue-phong-tro",
  "thue-van-phong",
  "thue-cua-hang",
  "thue-kho-xuong",
];

const catLabel: Record<string, string> = {
  "can-ho-chung-cu": "căn hộ chung cư",
  "nha-rieng": "nhà riêng",
  "nha-mat-pho": "nhà mặt phố",
  "nha-biet-thu": "biệt thự liền kề",
  "dat-nen-du-an": "đất nền dự án",
  dat: "đất thổ cư",
  "kho-xuong": "kho nhà xưởng",
  "trang-trai": "trang trại nghỉ dưỡng",
  "thue-can-ho": "căn hộ chung cư",
  "thue-nha-rieng": "nhà riêng",
  "thue-nha-mat-pho": "nhà mặt phố",
  "thue-phong-tro": "phòng trọ",
  "thue-van-phong": "văn phòng",
  "thue-cua-hang": "cửa hàng ki ốt",
  "thue-kho-xuong": "kho nhà xưởng",
};

const streets = [
  "Nguyễn Huệ", "Lê Lợi", "Trần Hưng Đạo", "Điện Biên Phủ", "Phan Xích Long",
  "Nguyễn Thị Minh Khai", "Xuân Thủy", "Láng Hạ", "Nguyễn Trãi", "Võ Văn Kiệt",
  "Hoàng Diệu", "Tô Hiến Thành", "Cách Mạng Tháng 8", "Trường Chinh", "Lạc Long Quân",
];

const provinceWeights = [
  "hcm", "hcm", "hcm", "hcm", "hn", "hn", "hn", "hn", "dn", "dn", "bd", "bd",
  "dnai", "hp", "la", "ld", "ct", "brvt", "kh", "qn", "bn", "bt", "tth", "qnam",
];

const provinceCoords: Record<string, [number, number]> = {
  hcm: [10.776, 106.7],
  hn: [21.028, 105.834],
  dn: [16.047, 108.206],
  bd: [10.98, 106.65],
  dnai: [10.945, 106.824],
  hp: [20.844, 106.688],
  la: [10.535, 106.413],
  ld: [11.94, 108.458],
  ct: [10.045, 105.746],
  brvt: [10.346, 107.084],
  kh: [12.238, 109.196],
  qn: [20.951, 107.076],
  bn: [21.186, 106.076],
  bt: [10.928, 108.102],
  tth: [16.463, 107.59],
  qnam: [15.879, 108.335],
};

function priceFor(categoryId: string, provinceId: string, area: number, rnd: () => number): number | null {
  const tier1 = provinceId === "hcm" || provinceId === "hn";
  const r = (a: number, b: number) => a + rnd() * (b - a);
  if (rnd() < 0.05) return null; // Thỏa thuận
  switch (categoryId) {
    case "can-ho-chung-cu":
      return Math.round(r(2e9, tier1 ? 8e9 : 4e9) / 1e7) * 1e7;
    case "nha-mat-pho":
    case "nha-biet-thu":
      return Math.round(r(tier1 ? 6e9 : 3e9, tier1 ? 15e9 : 8e9) / 1e7) * 1e7;
    case "nha-rieng":
      return Math.round(r(tier1 ? 3e9 : 1.5e9, tier1 ? 12e9 : 6e9) / 1e7) * 1e7;
    case "dat":
    case "dat-nen-du-an":
      return Math.round(r(3e8, tier1 ? 6e9 : 3e9) / 1e7) * 1e7;
    case "kho-xuong":
      return Math.round(r(4e9, 20e9) / 1e8) * 1e8;
    case "trang-trai":
      return Math.round(r(2e9, 12e9) / 1e8) * 1e8;
    case "thue-phong-tro":
      return Math.round(r(2e6, 6e6) / 1e5) * 1e5;
    case "thue-can-ho":
      return Math.round(r(6e6, 30e6) / 1e5) * 1e5;
    case "thue-nha-rieng":
    case "thue-nha-mat-pho":
      return Math.round(r(10e6, 60e6) / 1e5) * 1e5;
    case "thue-van-phong":
      return Math.round(r(15e6, 80e6) / 1e5) * 1e5;
    default:
      return Math.round(r(8e6, 50e6) / 1e5) * 1e5;
  }
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function describe(cat: string, district: string, province: string, area: number, bedrooms?: number) {
  return [
    `**Vị trí:** Bất động sản tọa lạc tại ${district}, ${province} — khu dân cư hiện hữu, an ninh đảm bảo, di chuyển vào trung tâm chỉ 10-15 phút. Xung quanh đầy đủ tiện ích: chợ, trường học, bệnh viện, siêu thị.`,
    `**Thiết kế:** Diện tích ${area} m²${bedrooms ? `, ${bedrooms} phòng ngủ` : ""}, bố trí công năng hợp lý, thoáng sáng tự nhiên cả ngày. Kết cấu chắc chắn, vật liệu hoàn thiện cao cấp, có thể dọn vào ở ngay.`,
    `**Ưu điểm:** Đường trước nhà rộng rãi, ô tô đỗ cửa. Khu vực dân trí cao, tiềm năng tăng giá tốt trong 2-3 năm tới. Phù hợp cho gia đình ở hoặc đầu tư khai thác dòng tiền.`,
    `**Pháp lý:** Sổ sách rõ ràng, hỗ trợ công chứng sang tên nhanh chóng trong ngày. Hỗ trợ vay ngân hàng lên đến 70% giá trị ${catLabel[cat] ?? "bất động sản"}.`,
  ].join("\n\n");
}

function build(): Listing[] {
  const rnd = mulberry(20260927);
  const out: Listing[] = [];
  const total = 64;
  for (let i = 0; i < total; i++) {
    const isRent = i >= 48;
    const transactionType: "sale" | "rent" = isRent ? "rent" : "sale";
    const categoryId = (isRent ? rentCats[i % rentCats.length] : saleCats[i % saleCats.length])!;
    const provinceId = provinceWeights[i % provinceWeights.length]!;
    const province = getProvince(provinceId)!;
    const ds = districtsOf(provinceId);
    const district = ds[Math.floor(rnd() * ds.length)]!;
    const ws = wardsOf(district.id);
    const ward = ws[Math.floor(rnd() * ws.length)]!;
    const street = streets[Math.floor(rnd() * streets.length)]!;

    const isLand = categoryId === "dat" || categoryId === "dat-nen-du-an" || categoryId === "trang-trai";
    const isRoom = categoryId === "thue-phong-tro";
    const area = isRoom
      ? 18 + Math.round(rnd() * 20)
      : isLand
        ? 80 + Math.round(rnd() * 400)
        : 45 + Math.round(rnd() * 130);
    const bedrooms = isLand ? undefined : isRoom ? 1 : 1 + Math.floor(rnd() * 4);
    const bathrooms = isLand ? undefined : isRoom ? 1 : 1 + Math.floor(rnd() * 3);
    const floors = isLand || categoryId.includes("can-ho") ? undefined : 1 + Math.floor(rnd() * 4);
    const price = priceFor(categoryId, provinceId, area, rnd);
    const dirs = ["Đông", "Tây", "Nam", "Bắc", "Đông Bắc", "Đông Nam", "Tây Bắc", "Tây Nam"];
    const tierRoll = rnd();
    const tier: Tier =
      tierRoll > 0.9 ? "vip_diamond" : tierRoll > 0.75 ? "vip_gold" : tierRoll > 0.5 ? "vip_silver" : "normal";
    const postedAt = new Date(Date.now() - Math.floor(rnd() * 30 * 86400000)).toISOString();
    const expiresAt = new Date(new Date(postedAt).getTime() + 30 * 86400000).toISOString();
    const [baseLat, baseLng] = provinceCoords[provinceId] ?? [16.0, 107.0];
    const title = `${isRent ? "Cho thuê" : "Bán"} ${catLabel[categoryId]!} ${area} m²${
      bedrooms && !isLand ? `, ${bedrooms} phòng ngủ` : ""
    } đường ${street}, ${district.name}`;
    const id = String(i + 1);

    out.push({
      id,
      code: String(100000 + i * 137 + 11),
      slug: slugify(`${title}-${id}`),
      title,
      description: describe(categoryId, district.name, province.name, area, bedrooms),
      transactionType,
      categoryId,
      provinceId,
      districtId: district.id,
      wardId: ward.id,
      street: `Đường ${street}`,
      price,
      area,
      frontage: isLand || rnd() > 0.4 ? Math.round((4 + rnd() * 8) * 10) / 10 : undefined,
      roadWidth: Math.round((3 + rnd() * 12) * 10) / 10,
      bedrooms,
      bathrooms,
      floors,
      direction: dirs[Math.floor(rnd() * dirs.length)]!,
      balconyDirection: isLand ? undefined : dirs[Math.floor(rnd() * dirs.length)]!,
      legal: (["Sổ đỏ/Sổ hồng", "Sổ đỏ/Sổ hồng", "Hợp đồng mua bán", "Đang chờ sổ"] as const)[
        Math.floor(rnd() * 4)
      ],
      furniture: (["Đầy đủ", "Cơ bản", "Không"] as const)[Math.floor(rnd() * 3)]!,
      images: imagesFor(categoryId, rnd),
      lat: baseLat + (rnd() - 0.5) * 0.14,
      lng: baseLng + (rnd() - 0.5) * 0.14,
      tier,
      isOwner: rnd() > 0.6,
      postedAt,
      expiresAt,
      views: 40 + Math.floor(rnd() * 4000),
      agentId: agents[i % agents.length]!.id,
      status: "active",
    });
  }
  return out;
}

export const listings: Listing[] = build();

export const tierRank: Record<Tier, number> = {
  vip_diamond: 4,
  vip_gold: 3,
  vip_silver: 2,
  normal: 1,
};

export const tierLabel: Record<Tier, string | null> = {
  vip_diamond: "Kim cương",
  vip_gold: "Nổi bật",
  vip_silver: "VIP",
  normal: null,
};
