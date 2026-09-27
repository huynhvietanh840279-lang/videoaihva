export interface ListingSearchParams {
  transactionType?: "sale" | "rent";
  keyword?: string;
  categoryId?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  priceRange?: string;
  areaRange?: string;
  bedrooms?: number;
  direction?: string;
  legal?: string;
  ownerOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc" | "ppm2_asc";
  view?: "grid" | "list";
  page?: number;
}

export function validateListingSearch(search: Record<string, unknown>): ListingSearchParams {
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && v !== undefined && v !== "" ? n : undefined;
  };
  return {
    transactionType: search["transactionType"] === "rent" ? "rent" : "sale",
    keyword: str(search["keyword"]),
    categoryId: str(search["categoryId"]),
    provinceId: str(search["provinceId"]),
    districtId: str(search["districtId"]),
    wardId: str(search["wardId"]),
    priceRange: str(search["priceRange"]),
    areaRange: str(search["areaRange"]),
    bedrooms: num(search["bedrooms"]),
    direction: str(search["direction"]),
    legal: str(search["legal"]),
    ownerOnly: search["ownerOnly"] === true || search["ownerOnly"] === "true" ? true : undefined,
    sort: (str(search["sort"]) as ListingSearchParams["sort"]) ?? "newest",
    view: search["view"] === "list" ? "list" : "grid",
    page: num(search["page"]) ?? 1,
  };
}
