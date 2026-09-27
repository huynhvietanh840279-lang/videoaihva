export interface Category {
  id: string;
  name: string;
  slug: string;
  transactionType: "sale" | "rent";
}

export const saleCategories: Category[] = [
  { id: "can-ho-chung-cu", name: "Căn hộ chung cư", slug: "can-ho-chung-cu", transactionType: "sale" },
  { id: "nha-biet-thu", name: "Nhà biệt thự liền kề", slug: "nha-biet-thu-lien-ke", transactionType: "sale" },
  { id: "nha-mat-pho", name: "Nhà mặt phố", slug: "nha-mat-pho", transactionType: "sale" },
  { id: "nha-rieng", name: "Nhà riêng", slug: "nha-rieng", transactionType: "sale" },
  { id: "trang-trai", name: "Trang trại khu nghỉ dưỡng", slug: "trang-trai-khu-nghi-duong", transactionType: "sale" },
  { id: "kho-xuong", name: "Kho nhà xưởng", slug: "kho-nha-xuong", transactionType: "sale" },
  { id: "dat-nen-du-an", name: "Đất nền dự án", slug: "dat-nen-du-an", transactionType: "sale" },
  { id: "dat", name: "Đất", slug: "dat", transactionType: "sale" },
];

export const rentCategories: Category[] = [
  { id: "thue-can-ho", name: "Căn hộ chung cư", slug: "thue-can-ho-chung-cu", transactionType: "rent" },
  { id: "thue-nha-rieng", name: "Nhà riêng", slug: "thue-nha-rieng", transactionType: "rent" },
  { id: "thue-nha-mat-pho", name: "Nhà mặt phố", slug: "thue-nha-mat-pho", transactionType: "rent" },
  { id: "thue-phong-tro", name: "Nhà trọ phòng trọ", slug: "thue-nha-tro-phong-tro", transactionType: "rent" },
  { id: "thue-van-phong", name: "Văn phòng", slug: "thue-van-phong", transactionType: "rent" },
  { id: "thue-cua-hang", name: "Cửa hàng ki ốt", slug: "thue-cua-hang-ki-ot", transactionType: "rent" },
  { id: "thue-kho-xuong", name: "Kho nhà xưởng đất", slug: "thue-kho-nha-xuong", transactionType: "rent" },
];

export const allCategories: Category[] = [...saleCategories, ...rentCategories];

export function getCategory(id: string): Category | undefined {
  return allCategories.find((c) => c.id === id);
}

export const quickCategories = [
  { id: "can-ho-chung-cu", label: "Căn hộ chung cư" },
  { id: "nha-rieng", label: "Nhà riêng" },
  { id: "nha-mat-pho", label: "Nhà mặt phố" },
  { id: "nha-biet-thu", label: "Biệt thự liền kề" },
  { id: "dat-nen-du-an", label: "Đất nền dự án" },
  { id: "dat", label: "Đất" },
  { id: "kho-xuong", label: "Kho nhà xưởng" },
  { id: "trang-trai", label: "Trang trại nghỉ dưỡng" },
  { id: "thue-phong-tro", label: "Phòng trọ" },
  { id: "thue-van-phong", label: "Văn phòng" },
];

export const directions = [
  "Đông",
  "Tây",
  "Nam",
  "Bắc",
  "Đông Bắc",
  "Đông Nam",
  "Tây Bắc",
  "Tây Nam",
];

export const legalOptions = ["Sổ đỏ/Sổ hồng", "Hợp đồng mua bán", "Đang chờ sổ"] as const;
export const furnitureOptions = ["Đầy đủ", "Cơ bản", "Không"] as const;

export const priceRangesSale = [
  { id: "all", label: "Tất cả mức giá", min: 0, max: Infinity },
  { id: "u500", label: "Dưới 500 triệu", min: 0, max: 500_000_000 },
  { id: "500-1", label: "500 - 800 triệu", min: 500_000_000, max: 800_000_000 },
  { id: "800-1t", label: "800 triệu - 1 tỷ", min: 800_000_000, max: 1_000_000_000 },
  { id: "1-2", label: "1 - 2 tỷ", min: 1_000_000_000, max: 2_000_000_000 },
  { id: "2-3", label: "2 - 3 tỷ", min: 2_000_000_000, max: 3_000_000_000 },
  { id: "3-5", label: "3 - 5 tỷ", min: 3_000_000_000, max: 5_000_000_000 },
  { id: "5-7", label: "5 - 7 tỷ", min: 5_000_000_000, max: 7_000_000_000 },
  { id: "7-10", label: "7 - 10 tỷ", min: 7_000_000_000, max: 10_000_000_000 },
  { id: "o10", label: "Trên 10 tỷ", min: 10_000_000_000, max: Infinity },
];

export const priceRangesRent = [
  { id: "all", label: "Tất cả mức giá", min: 0, max: Infinity },
  { id: "u3", label: "Dưới 3 triệu", min: 0, max: 3_000_000 },
  { id: "3-5", label: "3 - 5 triệu", min: 3_000_000, max: 5_000_000 },
  { id: "5-10", label: "5 - 10 triệu", min: 5_000_000, max: 10_000_000 },
  { id: "10-20", label: "10 - 20 triệu", min: 10_000_000, max: 20_000_000 },
  { id: "20-40", label: "20 - 40 triệu", min: 20_000_000, max: 40_000_000 },
  { id: "o40", label: "Trên 40 triệu", min: 40_000_000, max: Infinity },
];

export const areaRanges = [
  { id: "all", label: "Tất cả diện tích", min: 0, max: Infinity },
  { id: "u30", label: "Dưới 30 m²", min: 0, max: 30 },
  { id: "30-50", label: "30 - 50 m²", min: 30, max: 50 },
  { id: "50-80", label: "50 - 80 m²", min: 50, max: 80 },
  { id: "80-100", label: "80 - 100 m²", min: 80, max: 100 },
  { id: "100-150", label: "100 - 150 m²", min: 100, max: 150 },
  { id: "150-300", label: "150 - 300 m²", min: 150, max: 300 },
  { id: "o300", label: "Trên 300 m²", min: 300, max: Infinity },
];
