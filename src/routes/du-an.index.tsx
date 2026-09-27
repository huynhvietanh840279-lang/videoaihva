import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { projects } from "@/data/projects";
import { getProvince } from "@/data/locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/du-an/")({
  head: () => ({
    meta: [
      { title: "Dự án bất động sản — NhàĐất Hub" },
      {
        name: "description",
        content: "Danh sách dự án căn hộ, khu đô thị và đất nền đang mở bán trên toàn quốc.",
      },
      { property: "og:title", content: "Dự án bất động sản — NhàĐất Hub" },
      { property: "og:description", content: "Thông tin chủ đầu tư, tiến độ và giá bán từng dự án." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [status, setStatus] = useState("all");
  const [provinceId, setProvinceId] = useState("all");
  const list = projects.filter(
    (p) => (status === "all" || p.status === status) && (provinceId === "all" || p.provinceId === provinceId),
  );

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-navy">Dự án bất động sản</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Select value={provinceId} onValueChange={setProvinceId}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Tỉnh/TP" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tỉnh/TP</SelectItem>
            {[...new Set(projects.map((p) => p.provinceId))].map((id) => (
              <SelectItem key={id} value={id}>{getProvince(id)?.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="Đang mở bán">Đang mở bán</SelectItem>
            <SelectItem value="Sắp mở bán">Sắp mở bán</SelectItem>
            <SelectItem value="Đã bàn giao">Đã bàn giao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link
            key={p.id}
            to="/du-an/$slug"
            params={{ slug: p.slug }}
            className="card-hover overflow-hidden rounded-xl border border-border bg-card shadow-card"
          >
            <img src={p.images[0]} alt={p.name} className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-1 p-4">
              <span className="inline-block rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                {p.status}
              </span>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm text-muted-foreground">{p.developer}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {p.address}
              </p>
              <p className="pt-1 font-bold text-primary">{p.priceRange}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
