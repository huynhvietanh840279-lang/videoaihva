import { listings, tierRank, type Listing } from "@/data/listings";
import { agents } from "@/data/agents";
import { articles } from "@/data/news";
import { projects } from "@/data/projects";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export interface SearchFilters {
  transactionType?: "sale" | "rent" | undefined;
  keyword?: string | undefined;
  categoryId?: string | undefined;
  provinceId?: string | undefined;
  districtId?: string | undefined;
  wardId?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minArea?: number | undefined;
  maxArea?: number | undefined;
  bedrooms?: number | undefined;
  direction?: string | undefined;
  legal?: string | undefined;
  ownerOnly?: boolean | undefined;
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc" | "ppm2_asc" | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filterListings(f: SearchFilters): Listing[] {
  let out = listings.filter((l) => l.status === "active");
  if (f.transactionType) out = out.filter((l) => l.transactionType === f.transactionType);
  if (f.categoryId) out = out.filter((l) => l.categoryId === f.categoryId);
  if (f.provinceId) out = out.filter((l) => l.provinceId === f.provinceId);
  if (f.districtId) out = out.filter((l) => l.districtId === f.districtId);
  if (f.wardId) out = out.filter((l) => l.wardId === f.wardId);
  if (f.bedrooms) out = out.filter((l) => (l.bedrooms ?? 0) >= f.bedrooms!);
  if (f.direction) out = out.filter((l) => l.direction === f.direction);
  if (f.legal) out = out.filter((l) => l.legal === f.legal);
  if (f.ownerOnly) out = out.filter((l) => l.isOwner);
  if (f.minPrice != null) out = out.filter((l) => l.price != null && l.price >= f.minPrice!);
  if (f.maxPrice != null && Number.isFinite(f.maxPrice))
    out = out.filter((l) => l.price != null && l.price <= f.maxPrice!);
  if (f.minArea != null) out = out.filter((l) => l.area >= f.minArea!);
  if (f.maxArea != null && Number.isFinite(f.maxArea)) out = out.filter((l) => l.area <= f.maxArea!);
  if (f.keyword?.trim()) {
    const k = normalize(f.keyword.trim());
    out = out.filter((l) => normalize(`${l.title} ${l.street} ${l.code}`).includes(k));
  }

  const sort = f.sort ?? "newest";
  out = [...out].sort((a, b) => {
    if (sort === "price_asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
    if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    if (sort === "area_desc") return b.area - a.area;
    if (sort === "ppm2_asc")
      return (a.price ?? Infinity) / a.area - (b.price ?? Infinity) / b.area;
    const t = tierRank[b.tier] - tierRank[a.tier];
    if (t !== 0) return t;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
  return out;
}

export async function searchListings(f: SearchFilters) {
  await delay();
  const all = filterListings(f);
  const perPage = f.perPage ?? 20;
  const page = f.page ?? 1;
  return {
    items: all.slice((page - 1) * perPage, page * perPage),
    total: all.length,
    page,
    perPage,
  };
}

export async function getFeaturedListings(limit = 8) {
  await delay(250);
  return filterListings({}).filter((l) => l.tier !== "normal").slice(0, limit);
}

export async function getLatestListings(limit = 8) {
  await delay(250);
  return [...listings]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, limit);
}

export function getListingBySlug(slug: string) {
  return listings.find((l) => l.slug === slug);
}

export function getListingsByIds(ids: string[]) {
  return ids.map((id) => listings.find((l) => l.id === id)).filter(Boolean) as Listing[];
}

export function getSimilarListings(listing: Listing, limit = 4) {
  return listings
    .filter(
      (l) =>
        l.id !== listing.id &&
        l.categoryId === listing.categoryId &&
        l.provinceId === listing.provinceId,
    )
    .concat(listings.filter((l) => l.id !== listing.id && l.categoryId === listing.categoryId))
    .filter((l, i, arr) => arr.findIndex((x) => x.id === l.id) === i)
    .slice(0, limit);
}

export function getListingsByAgent(agentId: string) {
  return listings.filter((l) => l.agentId === agentId);
}

export function countByProvince(provinceId: string) {
  return listings.filter((l) => l.provinceId === provinceId).length;
}

export function countByDistrict(districtId: string) {
  return listings.filter((l) => l.districtId === districtId).length;
}

export { agents, articles, projects };
