import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { packages } from "@/data/packages";
import { formatNumberVN } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bao-gia")({
  head: () => ({
    meta: [
      { title: "Bảng giá đăng tin — NhàĐất Hub" },
      {
        name: "description",
        content:
          "Bảng giá các gói đăng tin bất động sản: Tin thường miễn phí, VIP Bạc, VIP Vàng và VIP Kim Cương.",
      },
      { property: "og:title", content: "Bảng giá đăng tin — NhàĐất Hub" },
      {
        property: "og:description",
        content: "Chọn gói tin phù hợp để bán nhà nhanh hơn với vị trí hiển thị ưu tiên.",
      },
    ],
  }),
  component: PricingPage,
});

const faqs: [string, string][] = [
  ["Tin đăng được duyệt trong bao lâu?", "Tin thường được duyệt trong vòng 15-60 phút làm việc. Tin VIP được ưu tiên duyệt trước."],
  ["Tôi có thể gia hạn tin đã hết hạn không?", "Có. Trong mục Quản lý tin đăng, bạn chọn Gia hạn và chọn số ngày muốn hiển thị thêm."],
  ["Đẩy tin là gì?", "Đẩy tin đưa tin của bạn lên đầu danh sách theo thời gian đăng, giúp tăng lượt xem đáng kể."],
  ["Thanh toán bằng hình thức nào?", "Bạn có thể nạp tiền vào tài khoản qua chuyển khoản ngân hàng, ví điện tử hoặc thẻ nội địa."],
];

function PricingPage() {
  return (
    <div className="container-page py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Bảng giá đăng tin</h1>
        <p className="mt-2 text-muted-foreground">
          Chọn gói phù hợp để tin của bạn tiếp cận đúng người mua.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {packages.map((p) => (
          <div
            key={p.id}
            className={cn(
              "relative flex flex-col rounded-xl border bg-card p-5 shadow-card",
              p.recommended ? "border-primary ring-2 ring-primary/20" : "border-border",
            )}
          >
            {p.recommended && (
              <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Được chọn nhiều nhất
              </span>
            )}
            <h2 className="font-semibold text-navy">{p.name}</h2>
            <p className="mt-2 text-2xl font-bold text-primary">
              {p.pricePerDay === 0 ? "Miễn phí" : `${formatNumberVN(p.pricePerDay)} đ`}
              {p.pricePerDay > 0 && (
                <span className="text-sm font-normal text-muted-foreground">/ngày</span>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{p.position}</p>
            <p className="text-sm text-muted-foreground">Tối đa {p.imageLimit} hình ảnh</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-5 w-full" variant={p.recommended ? "default" : "outline"}>
              <Link to="/dang-tin">Chọn gói này</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="mb-3 text-xl font-bold text-navy">Câu hỏi thường gặp</h2>
        <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-4">
          {faqs.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left text-sm font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
