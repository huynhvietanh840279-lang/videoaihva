import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Eye, MapPin, Plus, Users } from "lucide-react";

import { SearchCard } from "@/components/SearchCard";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { quickCategories } from "@/data/categories";
import { featuredCities } from "@/data/locations";
import { projects } from "@/data/projects";
import { articles, newsCategories } from "@/data/news";
import {
  countByProvince,
  getFeaturedListings,
  getLatestListings,
  getListingsByIds,
} from "@/lib/api";
import { formatNumberVN, timeAgoVN } from "@/lib/format";
import { useFavorites } from "@/store/favorites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NhàĐất Hub — Mua bán, cho thuê nhà đất trên toàn quốc" },
      {
        name: "description",
        content:
          "Tìm mua, bán và cho thuê nhà đất, căn hộ, đất nền tại 63 tỉnh thành. Tin đăng chính chủ, hình ảnh thật, liên hệ nhanh qua điện thoại và Zalo.",
      },
      { property: "og:title", content: "NhàĐất Hub — Sàn bất động sản Việt Nam" },
      {
        property: "og:description",
        content: "Hàng nghìn tin nhà đất bán và cho thuê được cập nhật mỗi ngày.",
      },
    ],
  }),
  component: HomePage,
});

const heroSlides = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80",
];

function HomePage() {
  const [slide, setSlide] = useState(0);
  const recentIds = useFavorites((s) => s.recent);
  const [recent, setRecent] = useState<ReturnType<typeof getListingsByIds>>([]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setRecent(getListingsByIds(recentIds));
  }, [recentIds]);

  const featured = useQuery({ queryKey: ["featured"], queryFn: () => getFeaturedListings(8) });
  const latest = useQuery({ queryKey: ["latest"], queryFn: () => getLatestListings(8) });

  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[420px] overflow-hidden sm:h-[460px]">
          {heroSlides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-navy/60" />
          <div className="container-page relative flex h-full flex-col justify-center">
            <h1 className="max-w-2xl text-3xl font-bold text-navy-foreground sm:text-4xl">
              Tìm ngôi nhà phù hợp với bạn
            </h1>
            <p className="mt-2 max-w-xl text-navy-foreground/80">
              Hơn 120.000 tin đăng nhà đất bán và cho thuê trên khắp 63 tỉnh thành.
            </p>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {heroSlides.map((s, i) => (
                <button
                  key={s}
                  aria-label={`Ảnh ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === slide ? "w-6 bg-primary" : "w-2 bg-navy-foreground/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="container-page -mt-24 relative z-10">
          <SearchCard />
        </div>
      </section>

      {/* Quick categories */}
      <section className="container-page mt-8">
        <div className="flex flex-wrap gap-2">
          {quickCategories.map((c) => (
            <Link
              key={c.id}
              to="/tim-kiem"
              search={{
                transactionType: c.id.startsWith("thue") ? "rent" : "sale",
                categoryId: c.id,
              }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <Section title="Bất động sản nổi bật">
        <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
          {featured.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-64 shrink-0">
                  <ListingCardSkeleton />
                </div>
              ))
            : featured.data?.map((l) => (
                <div key={l.id} className="w-64 shrink-0 snap-start sm:w-72">
                  <ListingCard listing={l} />
                </div>
              ))}
        </div>
      </Section>

      {/* Latest */}
      <Section
        title="Bất động sản mới nhất"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/tim-kiem" search={{ transactionType: "sale" }}>
              Xem thêm <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latest.isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : latest.data?.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </Section>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <Section title="Tin bạn đã xem">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.slice(0, 4).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </Section>
      )}

      {/* By location */}
      <Section title="Bất động sản theo địa điểm">
        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
          {featuredCities.map((c, i) => (
            <Link
              key={c.provinceId}
              to="/tim-kiem"
              search={{ transactionType: "sale", provinceId: c.provinceId }}
              className={`group relative overflow-hidden rounded-xl ${
                i === 0 ? "md:col-span-2 md:row-span-2 min-h-56" : "min-h-40"
              }`}
            >
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 to-transparent" />
              <div className="absolute bottom-3 left-4 text-navy-foreground">
                <p className="text-lg font-semibold">{c.name}</p>
                <p className="text-sm opacity-80">{countByProvince(c.provinceId)} tin đăng</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Projects */}
      <Section
        title="Dự án nổi bật"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/du-an">Xem tất cả</Link>
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.slice(0, 4).map((p) => (
            <Link
              key={p.id}
              to="/du-an/$slug"
              params={{ slug: p.slug }}
              className="card-hover overflow-hidden rounded-xl border border-border bg-card shadow-card"
            >
              <img src={p.images[0]} alt={p.name} className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-1 p-3">
                <span className="inline-block rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {p.status}
                </span>
                <h3 className="line-clamp-1 font-semibold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.developer}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {p.address}
                </p>
                <p className="pt-1 font-bold text-primary">{p.priceRange}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* News */}
      <Section title="Tin tức & Cẩm nang bất động sản">
        <div className="grid gap-6 lg:grid-cols-2">
          {(["news", "guide"] as const).map((group) => {
            const cats = newsCategories.filter((c) => c.group === group);
            const items = articles.filter((a) => cats.some((c) => c.slug === a.categorySlug));
            const [featuredArticle, ...rest] = items;
            return (
              <div key={group} className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h3 className="mb-3 font-semibold text-navy">
                  {group === "news" ? "Tin tức bất động sản" : "Cẩm nang bất động sản"}
                </h3>
                {featuredArticle && (
                  <Link
                    to="/bai-viet/$slug"
                    params={{ slug: featuredArticle.slug }}
                    className="group block"
                  >
                    <img
                      src={featuredArticle.cover}
                      alt=""
                      className="aspect-[16/9] w-full rounded-lg object-cover"
                    />
                    <p className="mt-2 font-semibold group-hover:text-primary">
                      {featuredArticle.title}
                    </p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {featuredArticle.excerpt}
                    </p>
                  </Link>
                )}
                <ul className="mt-3 space-y-2 border-t border-border pt-3">
                  {rest.slice(0, 5).map((a) => (
                    <li key={a.id}>
                      <Link
                        to="/bai-viet/$slug"
                        params={{ slug: a.slug }}
                        className="flex items-start justify-between gap-3 text-sm hover:text-primary"
                      >
                        <span className="line-clamp-1">{a.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {timeAgoVN(a.publishedAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Stats */}
      <section className="container-page mt-12">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:grid-cols-4">
          {[
            { icon: Building2, value: "120.000+", label: "tin đăng" },
            { icon: Users, value: "35.000+", label: "môi giới" },
            { icon: MapPin, value: "63", label: "tỉnh thành" },
            { icon: Eye, value: `${formatNumberVN(2)} triệu`, label: "lượt xem/tháng" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold text-navy">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-8">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-navy px-6 py-10 text-center text-navy-foreground sm:flex-row sm:text-left">
          <div className="flex-1">
            <h2 className="text-xl font-bold">Bạn có bất động sản cần bán hoặc cho thuê?</h2>
            <p className="mt-1 opacity-80">
              Đăng tin miễn phí, tiếp cận hàng triệu người mua mỗi tháng.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/dang-tin">
              <Plus className="h-4 w-4" /> Đăng tin ngay
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="container-page mt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-navy">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
