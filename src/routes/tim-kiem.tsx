import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, List, X, SearchX } from "lucide-react";

import { SearchCard } from "@/components/SearchCard";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  areaRanges,
  getCategory,
  legalOptions,
  priceRangesRent,
  priceRangesSale,
} from "@/data/categories";
import { districtsOf, getDistrict, getProvince } from "@/data/locations";
import { countByDistrict, filterListings } from "@/lib/api";
import { formatNumberVN } from "@/lib/format";
import { validateListingSearch, type ListingSearchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tim-kiem")({
  validateSearch: validateListingSearch,
  head: () => ({
    meta: [
      { title: "Tìm kiếm nhà đất — NhàĐất Hub" },
      {
        name: "description",
        content:
          "Lọc tin nhà đất bán và cho thuê theo khu vực, mức giá, diện tích, số phòng ngủ và pháp lý.",
      },
      { property: "og:title", content: "Tìm kiếm nhà đất — NhàĐất Hub" },
      {
        property: "og:description",
        content: "Bộ lọc chi tiết giúp bạn tìm đúng bất động sản cần mua hoặc thuê.",
      },
    ],
  }),
  component: SearchPage,
});

const PER_PAGE = 20;

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/tim-kiem" });

  const setSearch = (patch: Partial<ListingSearchParams>) =>
    navigate({ search: (prev) => ({ ...prev, page: 1, ...patch }) });

  const prices = search.transactionType === "rent" ? priceRangesRent : priceRangesSale;
  const priceObj = prices.find((p) => p.id === search.priceRange);
  const areaObj = areaRanges.find((a) => a.id === search.areaRange);

  const results = useMemo(
    () =>
      filterListings({
        transactionType: search.transactionType,
        keyword: search.keyword,
        categoryId: search.categoryId,
        provinceId: search.provinceId,
        districtId: search.districtId,
        wardId: search.wardId,
        bedrooms: search.bedrooms,
        direction: search.direction,
        legal: search.legal,
        ownerOnly: search.ownerOnly,
        minPrice: priceObj?.min,
        maxPrice: priceObj?.max,
        minArea: areaObj?.min,
        maxArea: areaObj?.max,
        sort: search.sort,
      }),
    [search, priceObj, areaObj],
  );

  const page = search.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const pageItems = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const province = search.provinceId ? getProvince(search.provinceId) : undefined;
  const category = search.categoryId ? getCategory(search.categoryId) : undefined;
  const heading = `${search.transactionType === "rent" ? "Cho thuê" : "Mua bán"} ${
    category?.name.toLowerCase() ?? "nhà đất"
  }${province ? ` tại ${province.name}` : " trên toàn quốc"}`;

  const chips: { label: string; clear: Partial<ListingSearchParams> }[] = [];
  if (search.keyword) chips.push({ label: `Từ khoá: ${search.keyword}`, clear: { keyword: undefined } });
  if (category) chips.push({ label: category.name, clear: { categoryId: undefined } });
  if (province) chips.push({ label: province.name, clear: { provinceId: undefined, districtId: undefined } });
  if (search.districtId)
    chips.push({ label: getDistrict(search.districtId)?.name ?? "", clear: { districtId: undefined } });
  if (priceObj && priceObj.id !== "all")
    chips.push({ label: priceObj.label, clear: { priceRange: undefined } });
  if (areaObj && areaObj.id !== "all")
    chips.push({ label: areaObj.label, clear: { areaRange: undefined } });
  if (search.bedrooms) chips.push({ label: `${search.bedrooms}+ phòng ngủ`, clear: { bedrooms: undefined } });
  if (search.legal) chips.push({ label: search.legal, clear: { legal: undefined } });
  if (search.ownerOnly) chips.push({ label: "Chỉ tin chính chủ", clear: { ownerOnly: undefined } });

  const districtList = search.provinceId ? districtsOf(search.provinceId).slice(0, 12) : [];

  return (
    <div className="container-page py-6">
      <nav className="mb-3 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Trang chủ
        </Link>
        <span className="mx-1">›</span>
        <span className="text-foreground">{heading}</span>
      </nav>

      <h1 className="text-2xl font-bold text-navy">{heading}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Hiện có <strong className="text-foreground">{formatNumberVN(results.length)}</strong> bất động sản
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[320px_1fr_240px]">
        {/* Filters */}
        <aside className="space-y-4">
          <SearchCard initial={search} />
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold">Lọc thêm</h2>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!search.ownerOnly}
                onCheckedChange={(v) => setSearch({ ownerOnly: v ? true : undefined })}
              />
              Chỉ tin chính chủ
            </label>
            <Select
              value={search.legal ?? "all"}
              onValueChange={(v) => setSearch({ legal: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pháp lý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả pháp lý</SelectItem>
                {legalOptions.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Results */}
        <div>
          {chips.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setSearch(c.clear)}
                  className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
                >
                  {c.label} <X className="h-3 w-3" />
                </button>
              ))}
              <Link
                to="/tim-kiem"
                search={{ transactionType: search.transactionType }}
                className="text-xs font-medium text-muted-foreground underline"
              >
                Xóa tất cả
              </Link>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card">
            <Select value={search.sort ?? "newest"} onValueChange={(v) => setSearch({ sort: v as never })}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price_asc">Giá thấp → cao</SelectItem>
                <SelectItem value="price_desc">Giá cao → thấp</SelectItem>
                <SelectItem value="area_desc">Diện tích lớn nhất</SelectItem>
                <SelectItem value="ppm2_asc">Giá/m² thấp nhất</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-1">
              {(
                [
                  ["grid", LayoutGrid],
                  ["list", List],
                ] as const
              ).map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => navigate({ search: (p) => ({ ...p, view: v }) })}
                  aria-label={v === "grid" ? "Dạng lưới" : "Dạng danh sách"}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg border border-border",
                    search.view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {pageItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-semibold">Không tìm thấy bất động sản phù hợp</p>
              <p className="text-sm text-muted-foreground">Thử mở rộng khu vực hoặc mức giá.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/tim-kiem" search={{ transactionType: search.transactionType }}>
                  Xóa bộ lọc
                </Link>
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                search.view === "list"
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
              )}
            >
              {pageItems.map((l) => (
                <ListingCard key={l.id} listing={l} variant={search.view === "list" ? "list" : "grid"} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => navigate({ search: (p) => ({ ...p, page: i + 1 }) })}
                  className={cn(
                    "h-9 min-w-9 rounded-lg border border-border px-3 text-sm font-medium",
                    page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right rail */}
        <aside className="hidden space-y-4 lg:block">
          {districtList.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h2 className="mb-2 text-sm font-semibold">Xem theo khu vực</h2>
              <ul className="space-y-1.5 text-sm">
                {districtList.map((d) => (
                  <li key={d.id}>
                    <Link
                      to="/tim-kiem"
                      search={{ ...search, districtId: d.id, page: 1 }}
                      className="flex justify-between hover:text-primary"
                    >
                      <span className="truncate">{d.name}</span>
                      <span className="text-muted-foreground">{countByDistrict(d.id)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-xl bg-navy p-5 text-navy-foreground">
            <p className="font-semibold">Đăng tin bán nhà của bạn</p>
            <p className="mt-1 text-sm opacity-80">Miễn phí, duyệt trong 15 phút.</p>
            <Button asChild className="mt-3 w-full">
              <Link to="/dang-tin">Đăng tin ngay</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { ListingCardSkeleton };
