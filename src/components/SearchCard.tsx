import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  areaRanges,
  directions,
  priceRangesRent,
  priceRangesSale,
  rentCategories,
  saleCategories,
} from "@/data/categories";
import { districtsOf, provinces, wardsOf } from "@/data/locations";
import { cn } from "@/lib/utils";
import type { ListingSearchParams } from "@/lib/search-params";

const ANY = "all";

export function SearchCard({ initial }: { initial?: ListingSearchParams }) {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState<"sale" | "rent">(
    initial?.transactionType ?? "sale",
  );
  const [keyword, setKeyword] = useState(initial?.keyword ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? ANY);
  const [provinceId, setProvinceId] = useState(initial?.provinceId ?? ANY);
  const [districtId, setDistrictId] = useState(initial?.districtId ?? ANY);
  const [wardId, setWardId] = useState(initial?.wardId ?? ANY);
  const [priceRange, setPriceRange] = useState(initial?.priceRange ?? ANY);
  const [areaRange, setAreaRange] = useState(initial?.areaRange ?? ANY);
  const [bedrooms, setBedrooms] = useState(initial?.bedrooms ? String(initial.bedrooms) : ANY);
  const [direction, setDirection] = useState(initial?.direction ?? ANY);
  const [expanded, setExpanded] = useState(false);

  const categories = transactionType === "sale" ? saleCategories : rentCategories;
  const prices = transactionType === "sale" ? priceRangesSale : priceRangesRent;

  const clean = (v: string) => (v === ANY ? undefined : v);

  const submit = () => {
    navigate({
      to: "/tim-kiem",
      search: {
        transactionType,
        keyword: keyword.trim() || undefined,
        categoryId: clean(categoryId),
        provinceId: clean(provinceId),
        districtId: clean(districtId),
        wardId: clean(wardId),
        priceRange: clean(priceRange),
        areaRange: clean(areaRange),
        bedrooms: bedrooms === ANY ? undefined : Number(bedrooms),
        direction: clean(direction),
        page: 1,
      },
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex gap-1 rounded-lg bg-muted p-1">
        {(
          [
            ["sale", "Nhà đất bán"],
            ["rent", "Nhà đất cho thuê"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTransactionType(value);
              setCategoryId(ANY);
              setPriceRange(ANY);
            }}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              transactionType === value
                ? "bg-card text-primary shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Nhập từ khoá: tên đường, quận, mã tin..."
          className="h-11"
        />
        <Button onClick={submit} className="h-11 px-5">
          <Search className="h-4 w-4" /> <span className="hidden sm:inline">Tìm kiếm</span>
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-5">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder="Loại BĐS" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Loại BĐS</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={provinceId}
          onValueChange={(v) => {
            setProvinceId(v);
            setDistrictId(ANY);
            setWardId(ANY);
          }}
        >
          <SelectTrigger><SelectValue placeholder="Tỉnh/TP" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ANY}>Tỉnh/TP</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={districtId}
          onValueChange={(v) => {
            setDistrictId(v);
            setWardId(ANY);
          }}
          disabled={provinceId === ANY}
        >
          <SelectTrigger><SelectValue placeholder="Quận/Huyện" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ANY}>Quận/Huyện</SelectItem>
            {districtsOf(provinceId).map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger><SelectValue placeholder="Mức giá" /></SelectTrigger>
          <SelectContent>
            {prices.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={areaRange} onValueChange={setAreaRange}>
          <SelectTrigger><SelectValue placeholder="Diện tích" /></SelectTrigger>
          <SelectContent>
            {areaRanges.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {expanded && (
        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Select value={wardId} onValueChange={setWardId} disabled={districtId === ANY}>
            <SelectTrigger><SelectValue placeholder="Phường/Xã" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ANY}>Phường/Xã</SelectItem>
              {wardsOf(districtId).map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger><SelectValue placeholder="Số phòng ngủ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Số phòng ngủ</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}+ phòng ngủ</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger><SelectValue placeholder="Hướng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Hướng nhà</SelectItem>
              {directions.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {expanded ? "Thu gọn" : "Mở rộng"}
      </button>
    </div>
  );
}
