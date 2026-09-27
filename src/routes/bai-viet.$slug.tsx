import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { articles } from "@/data/news";
import { formatDateVN, formatNumberVN } from "@/lib/format";

export const Route = createFileRoute("/bai-viet/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Không tìm thấy bài viết" }, { name: "robots", content: "noindex" }] };
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} — NhàĐất Hub` },
        { name: "description", content: article.excerpt },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt },
        { property: "og:image", content: article.cover },
        { name: "twitter:image", content: article.cover },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = articles.filter((a) => a.categorySlug === article.categorySlug && a.id !== article.id).slice(0, 4);
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_300px]">
      <article>
        <span className="text-xs font-semibold text-primary">{article.category}</span>
        <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">{article.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {article.author} · {formatDateVN(article.publishedAt)} · {formatNumberVN(article.views)} lượt xem
        </p>
        <img src={article.cover} alt="" className="mt-4 aspect-[16/9] w-full rounded-xl object-cover" />
        <div className="mt-5 space-y-4 text-sm leading-relaxed">
          {article.content.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {related.length > 0 && (
          <>
            <h2 className="mt-8 mb-3 text-lg font-bold text-navy">Bài viết liên quan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((a) => (
                <Link
                  key={a.id}
                  to="/bai-viet/$slug"
                  params={{ slug: a.slug }}
                  className="card-hover overflow-hidden rounded-xl border border-border bg-card"
                >
                  <img src={a.cover} alt="" className="aspect-[16/9] w-full object-cover" />
                  <p className="line-clamp-2 p-3 text-sm font-semibold">{a.title}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </article>

      <aside className="h-fit rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="mb-2 font-semibold">Đọc nhiều nhất</h2>
        <ul className="space-y-2 text-sm">
          {mostRead.map((a) => (
            <li key={a.id}>
              <Link to="/bai-viet/$slug" params={{ slug: a.slug }} className="hover:text-primary">
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
