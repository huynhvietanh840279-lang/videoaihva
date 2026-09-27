import { Link } from "@tanstack/react-router";
import { Heart, MapPin, BedDouble, Bath, Layers, Maximize2, Images } from "lucide-react";
import { toast } from "sonner";

import type { Listing } from "@/data/listings";
import { tierLabel } from "@/data/listings";
import { getAgent } from "@/data/agents";
import { getDistrict, getProvince } from "@/data/locations";
import { formatArea, formatPriceVN, pricePerM2, timeAgoVN } from "@/lib/format";
import { useFavorites } from "@/store/favorites";
import { cn } from "@/lib/utils";

interface Props {
  listing: Listing;
  variant?: "grid" | "list";
  onHover?: (id: string | null) => void;
}

export function ListingCard({ listing, variant = "grid", onHover }: Props) {
  const favIds = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const isFav = favIds.includes(listing.id);
  const agent = getAgent(listing.agentId);
  const district = getDistrict(listing.districtId);
  const province = getProvince(listing.provinceId);
  const badge = tierLabel[listing.tier];
  const isNew = Date.now() - new Date(listing.postedAt).getTime() < 2 * 86400000;

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(listing.id);
    toast.success(added ? "Đã lưu tin" : "Đã bỏ lưu tin");
  };

  const media = (
    <div className={cn("relative overflow-hidden bg-muted", variant === "grid" ? "aspect-[4/3]" : "h-full min-h-44")}>
      <img
        src={listing.images[0]}
        alt={listing.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      />
      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
        {badge && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              listing.tier === "normal"
                ? "bg-muted text-muted-foreground"
                : listing.tier === "vip_silver"
                  ? "bg-navy text-navy-foreground"
                  : "bg-gold text-gold-foreground",
            )}
          >
            {badge}
          </span>
        )}
        {isNew && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            Mới
          </span>
        )}
        {listing.isOwner && (
          <span className="rounded-full bg-success px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
            Chính chủ
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleFav}
        aria-label={isFav ? "Bỏ lưu tin" : "Lưu tin"}
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:text-primary"
      >
        <Heart className={cn("h-4 w-4", isFav && "fill-primary text-primary")} />
      </button>
      <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-navy/70 px-1.5 py-0.5 text-[11px] text-navy-foreground">
        <Images className="h-3 w-3" /> {listing.images.length}
      </span>
    </div>
  );

  const body = (
    <div className={cn("flex flex-1 flex-col gap-2", variant === "grid" ? "p-3" : "p-4")}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-base font-bold text-primary">
          {formatPriceVN(listing.price, listing.transactionType)}
        </span>
        <span className="text-sm text-muted-foreground">· {formatArea(listing.area)}</span>
        {listing.price != null && (
          <span className="text-xs text-muted-foreground">· {pricePerM2(listing.price, listing.area)}</span>
        )}
      </div>

      {(listing.bedrooms || listing.bathrooms || listing.floors) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {listing.bedrooms} PN
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {listing.bathrooms} WC
            </span>
          )}
          {listing.floors != null && (
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> {listing.floors} tầng
            </span>
          )}
          {variant === "list" && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" /> {formatArea(listing.area)}
            </span>
          )}
        </div>
      )}

      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{listing.title}</h3>

      {variant === "list" && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {listing.description.replace(/\*\*/g, "").slice(0, 180)}…
        </p>
      )}

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        {district?.name}, {province?.name}
      </p>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
        <img src={agent?.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
        <span className="truncate font-medium text-foreground">{agent?.name}</span>
        <span className="ml-auto shrink-0">{timeAgoVN(listing.postedAt)}</span>
      </div>
    </div>
  );

  return (
    <Link
      to="/tin/$slug"
      params={{ slug: listing.slug }}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "card-hover group flex overflow-hidden rounded-xl border border-border bg-card shadow-card",
        variant === "grid" ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      <div className={cn(variant === "list" && "sm:w-64 sm:shrink-0")}>{media}</div>
      {body}
    </Link>
  );
}

export function ListingCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  return (
    <div
      className={cn(
        "animate-pulse overflow-hidden rounded-xl border border-border bg-card",
        variant === "grid" ? "" : "flex",
      )}
    >
      <div className={cn("bg-muted", variant === "grid" ? "aspect-[4/3]" : "h-44 w-64 shrink-0")} />
      <div className="space-y-2 p-3">
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}
