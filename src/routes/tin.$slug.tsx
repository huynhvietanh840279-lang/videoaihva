import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bath,
  BedDouble,
  Calendar,
  Compass,
  Eye,
  FileCheck,
  Hash,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { getAgent } from "@/data/agents";
import { getCategory } from "@/data/categories";
import { getDistrict, getProvince, getWard } from "@/data/locations";
import { getListingBySlug, getListingsByAgent, getSimilarListings } from "@/lib/api";
import {
  formatArea,
  formatDateVN,
  formatNumberVN,
  formatPhone,
  formatPhoneMasked,
  formatPriceVN,
  pricePerM2,
} from "@/lib/format";
import { useFavorites } from "@/store/favorites";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tin/$slug")({
  loader: ({ params }) => {
    const listing = getListingBySlug(params.slug);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Không tìm thấy tin đăng" }, { name: "robots", content: "noindex" }],
      };
    }
    const { listing } = loaderData;
    const desc = `${formatPriceVN(listing.price, listing.transactionType)} · ${formatArea(listing.area)} · ${
      getDistrict(listing.districtId)?.name
    }, ${getProvince(listing.provinceId)?.name}`;
    return {
      meta: [
        { title: `${listing.title} — NhàĐất Hub` },
        { name: "description", content: desc },
        { property: "og:title", content: listing.title },
        { property: "og:description", content: desc },
        { property: "og:image", content: listing.images[0] },
        { name: "twitter:image", content: listing.images[0] },
      ],
    };
  },
  component: ListingDetail,
});

function ListingDetail() {
  const { listing } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const favIds = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const addRecent = useFavorites((s) => s.addRecent);
  const isFav = favIds.includes(listing.id);

  const [loanPercent, setLoanPercent] = useState(70);
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(15);

  useEffect(() => {
    addRecent(listing.id);
    setActive(0);
    setRevealed(false);
  }, [listing.id, addRecent]);

  const agent = getAgent(listing.agentId)!;
  const province = getProvince(listing.provinceId);
  const district = getDistrict(listing.districtId);
  const ward = getWard(listing.wardId);
  const category = getCategory(listing.categoryId);
  const similar = getSimilarListings(listing, 4);
  const sameAgent = getListingsByAgent(listing.agentId)
    .filter((l) => l.id !== listing.id)
    .slice(0, 4);

  const loanAmount = ((listing.price ?? 0) * loanPercent) / 100;
  const months = years * 12;
  const r = rate / 100 / 12;
  const monthly =
    loanAmount > 0 && r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -months)) : 0;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết tin đăng");
    } catch {
      toast.error("Không sao chép được liên kết");
    }
  };

  const specs: [string, string | undefined][] = [
    ["Loại hình", category?.name],
    ["Diện tích", formatArea(listing.area)],
    ["Mặt tiền", listing.frontage ? `${listing.frontage} m` : undefined],
    ["Đường vào", listing.roadWidth ? `${listing.roadWidth} m` : undefined],
    ["Hướng nhà", listing.direction],
    ["Hướng ban công", listing.balconyDirection],
    ["Số tầng", listing.floors ? `${listing.floors} tầng` : undefined],
    ["Phòng ngủ", listing.bedrooms ? `${listing.bedrooms} phòng` : undefined],
    ["Toilet", listing.bathrooms ? `${listing.bathrooms} phòng` : undefined],
    ["Pháp lý", listing.legal],
    ["Nội thất", listing.furniture],
  ];

  return (
    <div className="container-page py-6 pb-28 lg:pb-8">
      <nav className="mb-3 flex flex-wrap gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>›</span>
        <Link
          to="/tim-kiem"
          search={{ transactionType: listing.transactionType, categoryId: listing.categoryId }}
          className="hover:text-primary"
        >
          {category?.name}
        </Link>
        <span>›</span>
        <span>{province?.name}</span>
        <span>›</span>
        <span className="text-foreground">{district?.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="overflow-hidden rounded-xl bg-navy">
            <img
              src={listing.images[active]}
              alt={listing.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {listing.images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2",
                  i === active ? "border-primary" : "border-transparent",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <h1 className="mt-4 text-xl font-bold text-navy sm:text-2xl">{listing.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {listing.street}, {ward?.name}, {district?.name},{" "}
            {province?.name}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(toggle(listing.id) ? "Đã lưu tin" : "Đã bỏ lưu tin")}
            >
              <Heart className={cn("h-4 w-4", isFav && "fill-primary text-primary")} /> Lưu tin
            </Button>
            <Button variant="outline" size="sm" onClick={share}>
              <Share2 className="h-4 w-4" /> Chia sẻ
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Đã gửi báo cáo tin")}>
              Báo cáo
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:grid-cols-4">
            <Stat label="Mức giá" value={formatPriceVN(listing.price, listing.transactionType)} highlight />
            <Stat label="Diện tích" value={formatArea(listing.area)} icon={Maximize2} />
            <Stat label="Giá/m²" value={pricePerM2(listing.price, listing.area)} />
            <Stat
              label="Phòng ngủ"
              value={listing.bedrooms ? `${listing.bedrooms} PN` : "—"}
              icon={BedDouble}
            />
          </div>

          <Block title="Đặc điểm bất động sản">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {specs
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border py-2 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </Block>

          <Block title="Thông tin mô tả">
            <div
              className={cn(
                "space-y-3 text-sm leading-relaxed text-foreground",
                !expandedDesc && "line-clamp-6",
              )}
            >
              {listing.description.split("\n\n").map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
              ))}
            </div>
            <button
              onClick={() => setExpandedDesc((v) => !v)}
              className="mt-2 text-sm font-medium text-primary"
            >
              {expandedDesc ? "Thu gọn" : "Xem thêm"}
            </button>
          </Block>

          <Block title="Thông tin tin đăng">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <MetaRow icon={Calendar} label="Ngày đăng" value={formatDateVN(listing.postedAt)} />
              <MetaRow icon={Calendar} label="Ngày hết hạn" value={formatDateVN(listing.expiresAt)} />
              <MetaRow
                icon={FileCheck}
                label="Loại tin"
                value={listing.tier === "normal" ? "Tin thường" : "Tin VIP"}
              />
              <MetaRow icon={Hash} label="Mã tin" value={listing.code} />
              <MetaRow icon={Eye} label="Lượt xem" value={formatNumberVN(listing.views)} />
              <MetaRow icon={Compass} label="Hướng" value={listing.direction ?? "—"} />
            </div>
          </Block>

          {sameAgent.length > 0 && (
            <Block title="Bất động sản cùng người đăng">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sameAgent.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </Block>
          )}

          {similar.length > 0 && (
            <Block title="Bất động sản tương tự">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {similar.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </Block>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <img src={agent.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold">{agent.name}</p>
                <p className="text-xs text-muted-foreground">Đã sẵn sàng tư vấn cho bạn</p>
                {agent.verified && (
                  <span className="mt-1 inline-block rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                    Đã xác thực
                  </span>
                )}
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => setRevealed(true)}>
              <Phone className="h-4 w-4" />
              {revealed ? formatPhone(agent.phone) : `${formatPhoneMasked(agent.phone)} · Hiện số`}
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <a href={`https://zalo.me/${agent.zalo}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Chat qua Zalo
              </a>
            </Button>
            <Link
              to="/thanh-vien/$id"
              params={{ id: agent.id }}
              className="mt-3 block text-center text-sm font-medium text-primary"
            >
              Xem tất cả tin của người đăng
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h2 className="font-semibold">Tính khoản vay</h2>
            <div className="mt-3 space-y-3 text-sm">
              <Field label={`Giá trị vay: ${loanPercent}%`}>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={loanPercent}
                  onChange={(e) => setLoanPercent(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
              </Field>
              <Field label={`Lãi suất: ${rate}%/năm`}>
                <input
                  type="range"
                  min={5}
                  max={15}
                  step={0.5}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
              </Field>
              <Field label={`Thời hạn: ${years} năm`}>
                <input
                  type="range"
                  min={5}
                  max={25}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
              </Field>
              <div className="rounded-lg bg-primary-soft p-3">
                <p className="text-xs text-muted-foreground">Trả hàng tháng (ước tính)</p>
                <p className="text-lg font-bold text-primary">{formatPriceVN(Math.round(monthly), "sale")}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile contact bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-card p-3 lg:hidden">
        <Button asChild className="flex-1">
          <a href={`tel:${agent.phone}`}>
            <Phone className="h-4 w-4" /> Gọi điện
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <a href={`https://zalo.me/${agent.zalo}`} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" /> Zalo
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <a href={`sms:${agent.phone}`}>SMS</a>
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className={cn("font-bold", highlight ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-bold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
