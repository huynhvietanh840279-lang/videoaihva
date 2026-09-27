import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { packages } from "@/data/packages";

export const Route = createFileRoute("/dang-tin")({
  head: () => ({
    meta: [
      { title: "Đăng tin bất động sản — NhàĐất Hub" },
      { name: "description", content: "Đăng tin bán hoặc cho thuê nhà đất miễn phí, duyệt nhanh trong 15 phút." },
      { property: "og:title", content: "Đăng tin bất động sản — NhàĐất Hub" },
      { property: "og:description", content: "Tiếp cận hàng triệu người mua mỗi tháng." },
    ],
  }),
  component: PostListingPage,
});

function PostListingPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-navy">Đăng tin bất động sản</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Trình đăng tin nhiều bước (nhu cầu, vị trí, thông tin chính, đặc điểm, hình ảnh, gói tin)
        đang được hoàn thiện. Bạn có thể xem trước các gói tin dưới đây.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {packages.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.position}</p>
            <p className="mt-2 font-bold text-primary">
              {p.pricePerDay === 0 ? "Miễn phí" : `${p.pricePerDay.toLocaleString("vi-VN")} đ/ngày`}
            </p>
          </div>
        ))}
      </div>
      <Button asChild className="mt-6">
        <Link to="/bao-gia">
          <Plus className="h-4 w-4" /> Xem bảng giá chi tiết
        </Link>
      </Button>
    </div>
  );
}
