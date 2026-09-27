export function formatNumberVN(n: number, maxFraction = 2): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: maxFraction }).format(n);
}

/** 3.24e9 -> "3,24 tỷ"; 850e6 -> "850 triệu"; rent adds "/tháng"; null -> "Thỏa thuận" */
export function formatPriceVN(
  price: number | null | undefined,
  transactionType: "sale" | "rent" = "sale",
): string {
  if (price == null) return "Thỏa thuận";
  const suffix = transactionType === "rent" ? "/tháng" : "";
  if (price >= 1_000_000_000) return `${formatNumberVN(price / 1_000_000_000)} tỷ${suffix}`;
  if (price >= 1_000_000) return `${formatNumberVN(price / 1_000_000, 1)} triệu${suffix}`;
  if (price >= 1_000) return `${formatNumberVN(price / 1_000)} nghìn${suffix}`;
  return `${formatNumberVN(price)} đ${suffix}`;
}

export function pricePerM2(price: number | null | undefined, area: number): string {
  if (price == null || !area) return "Thỏa thuận";
  const v = price / area;
  if (v >= 1_000_000_000) return `${formatNumberVN(v / 1_000_000_000)} tỷ/m²`;
  if (v >= 1_000_000) return `${formatNumberVN(v / 1_000_000, 1)} triệu/m²`;
  return `${formatNumberVN(Math.round(v / 1000))} nghìn/m²`;
}

export function formatArea(area: number): string {
  return `${formatNumberVN(area)} m²`;
}

export function timeAgoVN(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

export function formatDateVN(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatPhoneMasked(phone: string): string {
  const clean = phone.replace(/\s/g, "");
  return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ***`;
}

export function formatPhone(phone: string): string {
  const c = phone.replace(/\s/g, "");
  return `${c.slice(0, 4)} ${c.slice(4, 7)} ${c.slice(7)}`;
}
