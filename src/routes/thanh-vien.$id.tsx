import { createFileRoute, notFound } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { getAgent } from "@/data/agents";
import { getListingsByAgent } from "@/lib/api";
import { formatDateVN, formatPhone } from "@/lib/format";

export const Route = createFileRoute("/thanh-vien/$id")({
  loader: ({ params }) => {
    const agent = getAgent(params.id);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Không tìm thấy thành viên" }, { name: "robots", content: "noindex" }] };
    const { agent } = loaderData;
    return {
      meta: [
        { title: `${agent.name} — Môi giới tại NhàĐất Hub` },
        { name: "description", content: agent.bio },
        { property: "og:title", content: `${agent.name} — NhàĐất Hub` },
        { property: "og:description", content: agent.bio },
      ],
    };
  },
  component: AgentPage,
});

function AgentPage() {
  const { agent } = Route.useLoaderData();
  const all = getListingsByAgent(agent.id);
  const sale = all.filter((l) => l.transactionType === "sale");
  const rent = all.filter((l) => l.transactionType === "rent");

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
        <img src={agent.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-navy">{agent.name}</h1>
          {agent.verified && (
            <span className="mt-1 inline-block rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              Đã xác thực
            </span>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{agent.bio}</p>
          <p className="text-xs text-muted-foreground">
            Tham gia từ {formatDateVN(agent.joinedAt)} · {all.length} tin đang đăng
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <a href={`tel:${agent.phone}`}>
              <Phone className="h-4 w-4" /> {formatPhone(agent.phone)}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`https://zalo.me/${agent.zalo}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Zalo
            </a>
          </Button>
        </div>
      </div>

      {[
        ["Đang bán", sale],
        ["Cho thuê", rent],
      ].map(([title, items]) => {
        const list = items as typeof sale;
        return list.length > 0 ? (
          <section key={title as string} className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-navy">{title as string}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        ) : null;
      })}
    </div>
  );
}
