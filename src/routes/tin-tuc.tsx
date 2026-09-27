import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { articles, newsCategories } from "@/data/news";
import { formatDateVN } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tin-tuc")({
  head: () => ({
    meta: [
      { title: "Tin tức bất động sản — NhàĐất Hub" },
      {
        name: "description",
        content: "Tin tức thị trường, thông tin quy hoạch và kinh nghiệm mua bán, cho thuê nhà đất.",
      },
      { property: "og:title", content: "Tin tức bất động sản — NhàĐất Hub" },
      { property: "og:description", content: "Cập nhật thị trường và kinh nghiệm giao dịch nhà đất." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [cat, setCat] = useState("all");
  const list = articles.filter((a) => cat === "all" || a.categorySlug === cat);
  const [featured, ...rest] = list;

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-navy">Tin tức bất động sản</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {[{ slug: "all", name: "Tất cả" }, ...newsCategories].map((c) => (
          <button
            key={c.slug}
            onClick={() => setCat(c.slug)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              cat === c.slug
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {featured && (
        <Link
          to="/bai-viet/$slug"
          params={{ slug: featured.slug }}
          className="card-hover mt-6 grid gap-4 overflow-hidden rounded-xl border border-border bg-card shadow-card md:grid-cols-2"
        >
          <img src={featured.cover} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="p-4">
            <span className="text-xs font-semibold text-primary">{featured.category}</span>
            <h2 className="mt-1 text-lg font-bold">{featured.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{featured.excerpt}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {featured.author} · {formatDateVN(featured.publishedAt)}
            </p>
          </div>
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <Link
            key={a.id}
            to="/bai-viet/$slug"
            params={{ slug: a.slug }}
            className="card-hover overflow-hidden rounded-xl border border-border bg-card shadow-card"
          >
            <img src={a.cover} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-4">
              <span className="text-xs font-semibold text-primary">{a.category}</span>
              <h3 className="mt-1 line-clamp-2 font-semibold">{a.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{formatDateVN(a.publishedAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
