import { createFileRoute, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProject } from "@/data/projects";

export const Route = createFileRoute("/du-an/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Không tìm thấy dự án" }, { name: "robots", content: "noindex" }] };
    const { project } = loaderData;
    return {
      meta: [
        { title: `${project.name} — ${project.developer}` },
        { name: "description", content: project.description },
        { property: "og:title", content: project.name },
        { property: "og:description", content: project.description },
        { property: "og:image", content: project.images[0] },
        { name: "twitter:image", content: project.images[0] },
      ],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const rows: [string, string][] = [
    ["Chủ đầu tư", project.developer],
    ["Quy mô", project.scale],
    ["Số căn", `${project.units} căn`],
    ["Tiến độ", project.progress],
    ["Pháp lý", project.legal],
    ["Giá bán", project.priceRange],
  ];

  return (
    <div className="container-page py-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <img src={project.images[0]} alt={project.name} className="aspect-[16/9] w-full rounded-xl object-cover sm:col-span-3" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-navy">{project.name}</h1>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" /> {project.address}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm leading-relaxed">{project.description}</p>
          <h2 className="mt-6 mb-2 text-lg font-bold text-navy">Tổng quan</h2>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-2 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-6 mb-2 text-lg font-bold text-navy">Tiện ích</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {project.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" /> {a}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-4 shadow-card lg:sticky lg:top-20">
          <h2 className="font-semibold">Nhận báo giá</h2>
          <form
            className="mt-3 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Đã gửi yêu cầu, chúng tôi sẽ liên hệ sớm!");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <Input name="name" placeholder="Họ tên" required />
            <Input name="phone" placeholder="Số điện thoại" required />
            <Input name="email" type="email" placeholder="Email" />
            <Button type="submit" className="w-full">Gửi yêu cầu</Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
