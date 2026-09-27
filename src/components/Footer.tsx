import { Link } from "@tanstack/react-router";
import { Building2, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

import { provinces } from "@/data/locations";

export function Footer() {
  return (
    <footer className="mt-16">
      <div className="border-t border-border bg-card py-8">
        <div className="container-page">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Mua bán nhà đất theo Tỉnh/TP
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {provinces.map((p) => (
              <li key={p.id}>
                <Link
                  to="/tim-kiem"
                  search={{ transactionType: "sale", provinceId: p.id }}
                  className="transition-colors hover:text-primary"
                >
                  Nhà đất {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-navy py-10 text-navy-foreground">
        <div className="container-page grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <span className="flex items-center gap-2 text-lg font-bold">
              <Building2 className="h-6 w-6 text-primary" />
              NhàĐất<span className="text-primary">Hub</span>
            </span>
            <p className="flex items-start gap-2 text-sm opacity-80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              Tầng 12, Toà nhà Sunrise, 25 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
            </p>
            <p className="flex items-center gap-2 text-sm opacity-80">
              <Phone className="h-4 w-4" /> Hotline/Zalo: 1900 6969
            </p>
            <p className="flex items-center gap-2 text-sm opacity-80">
              <Mail className="h-4 w-4" /> hotro@nhadathub.vn
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Nhà đất nổi bật</h3>
            <ul className="space-y-2 text-sm opacity-80">
              {[
                { label: "Căn hộ chung cư TP.HCM", provinceId: "hcm", categoryId: "can-ho-chung-cu" },
                { label: "Nhà riêng Hà Nội", provinceId: "hn", categoryId: "nha-rieng" },
                { label: "Đất nền Bình Dương", provinceId: "bd", categoryId: "dat-nen-du-an" },
                { label: "Nhà mặt phố Đà Nẵng", provinceId: "dn", categoryId: "nha-mat-pho" },
                { label: "Biệt thự Đồng Nai", provinceId: "dnai", categoryId: "nha-biet-thu" },
              ].map((x) => (
                <li key={x.label}>
                  <Link
                    to="/tim-kiem"
                    search={{ transactionType: "sale", provinceId: x.provinceId, categoryId: x.categoryId }}
                    className="transition-colors hover:text-primary"
                  >
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Quy định</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Chính sách bảo mật</li>
              <li>Quy chế hoạt động</li>
              <li>Quy định đăng tin</li>
              <li>Về chúng tôi</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Kết nối</h3>
            <div className="flex gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-foreground/10">
                <Facebook className="h-4 w-4" />
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-foreground/10">
                <Youtube className="h-4 w-4" />
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-foreground/10">
                <Mail className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 text-xs opacity-60">
              © 2026 NhàĐất Hub. Sàn giao dịch bất động sản trực tuyến.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
