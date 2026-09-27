export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  category: string;
  categorySlug: string;
  author: string;
  publishedAt: string;
  views: number;
}

export const newsCategories = [
  { slug: "tin-tuc-thi-truong", name: "Tin tức thị trường", group: "news" },
  { slug: "thong-tin-quy-hoach", name: "Thông tin quy hoạch", group: "news" },
  { slug: "kinh-nghiem-mua", name: "Kinh nghiệm mua", group: "guide" },
  { slug: "kinh-nghiem-ban", name: "Kinh nghiệm bán", group: "guide" },
  { slug: "kinh-nghiem-thue", name: "Kinh nghiệm thuê", group: "guide" },
  { slug: "nghe-thuat-song", name: "Nghệ thuật sống", group: "guide" },
];

const titles: [string, string][] = [
  ["Thị trường căn hộ TP.HCM khởi sắc trong quý cuối năm", "tin-tuc-thi-truong"],
  ["Giá nhà phố Hà Nội tăng 8% so với cùng kỳ", "tin-tuc-thi-truong"],
  ["Dòng vốn ngoại tiếp tục đổ vào bất động sản công nghiệp", "tin-tuc-thi-truong"],
  ["Lãi suất cho vay mua nhà giảm về mức hấp dẫn", "tin-tuc-thi-truong"],
  ["Quy hoạch tuyến metro số 2 tác động thế nào tới giá đất?", "thong-tin-quy-hoach"],
  ["Công bố quy hoạch phân khu đô thị sông Hồng", "thong-tin-quy-hoach"],
  ["Vành đai 3 TP.HCM: những khu vực hưởng lợi rõ nét", "thong-tin-quy-hoach"],
  ["10 điều cần kiểm tra trước khi xuống tiền mua nhà", "kinh-nghiem-mua"],
  ["Cách thẩm định giá bất động sản không cần môi giới", "kinh-nghiem-mua"],
  ["Hướng dẫn kiểm tra pháp lý sổ đỏ chi tiết từ A-Z", "kinh-nghiem-mua"],
  ["Bí quyết chụp ảnh nhà đẹp giúp bán nhanh hơn 3 lần", "kinh-nghiem-ban"],
  ["Định giá đúng: chìa khóa bán nhà trong 30 ngày", "kinh-nghiem-ban"],
  ["Mẫu hợp đồng đặt cọc an toàn cho người bán", "kinh-nghiem-ban"],
  ["Kinh nghiệm thuê căn hộ cho người đi làm xa", "kinh-nghiem-thue"],
  ["Những điều khoản cần đọc kỹ trong hợp đồng thuê nhà", "kinh-nghiem-thue"],
  ["Thuê văn phòng: chọn diện tích bao nhiêu là đủ?", "kinh-nghiem-thue"],
  ["Thiết kế căn hộ nhỏ 45m² tối ưu không gian", "nghe-thuat-song"],
  ["Xu hướng nội thất tối giản kiểu Nhật cho nhà phố", "nghe-thuat-song"],
];

const covers = [
  "photo-1486406146926-c627a92ad1ab",
  "photo-1560518883-ce09059eeffa",
  "photo-1449844908441-8829872d2607",
  "photo-1600585154340-be6161a56a0c",
  "photo-1502005229762-cf1b2da7c5d6",
  "photo-1524758631624-e2822e304c36",
];

const authors = ["Minh Khôi", "Thu Trang", "Bảo Ngọc", "Hoàng Long", "Kim Chi"];

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const articles: Article[] = titles.map(([title, categorySlug], i) => ({
  id: String(i + 1),
  slug: slugify(title),
  title,
  excerpt:
    "Cập nhật những phân tích mới nhất về thị trường bất động sản Việt Nam, giúp bạn đưa ra quyết định mua bán chính xác và kịp thời.",
  content: [
    "Thị trường bất động sản Việt Nam đang bước vào giai đoạn phục hồi rõ nét sau thời gian trầm lắng. Thanh khoản cải thiện ở hầu hết phân khúc, đặc biệt là nhà ở thực tại các đô thị lớn.",
    "Theo ghi nhận từ các sàn giao dịch, lượng khách hàng tìm kiếm tăng mạnh trong ba tháng gần đây. Nhóm sản phẩm có pháp lý đầy đủ và mức giá dưới 5 tỷ đồng được quan tâm nhiều nhất.",
    "Các chuyên gia khuyến nghị người mua nên kiểm tra kỹ quy hoạch, pháp lý và năng lực chủ đầu tư trước khi xuống tiền, đồng thời cân đối tỷ lệ vay không vượt quá 50% giá trị tài sản.",
    "Về dài hạn, hạ tầng giao thông và các dự án vành đai tiếp tục là động lực chính giúp mặt bằng giá tại vùng ven duy trì xu hướng đi lên.",
  ].join("\n\n"),
  cover: `https://images.unsplash.com/${covers[i % covers.length]}?w=1000&q=80`,
  category: newsCategories.find((c) => c.slug === categorySlug)!.name,
  categorySlug,
  author: authors[i % authors.length],
  publishedAt: new Date(Date.now() - (i + 1) * 36 * 3600000).toISOString(),
  views: 500 + i * 317,
}));
