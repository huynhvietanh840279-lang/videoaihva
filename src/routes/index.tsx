import { createFileRoute } from "@tanstack/react-router";

import { Effects, Faq, Hero, Pricing, SiteFooter, TopBar } from "@/components/studio/Sections";
import { Studio, useServer } from "@/components/studio/Studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HVA Video Studio — AI edit video nói chuyện hiệu ứng cao cấp" },
      {
        name: "description",
        content:
          "Thả video nói chuyện vào, nhận bản edit cao cấp: cắt khoảng lặng, zoom cảm xúc, hoạt hoạ minh hoạ, caption động, từ khoá 2 màu, crop bám mặt, so sánh trước/sau.",
      },
      { property: "og:title", content: "HVA Video Studio — AI edit video nói chuyện hiệu ứng cao cấp" },
      { property: "og:description", content: "Biến video nói chuyện thành bản edit cao cấp với caption động và hiệu ứng AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const server = useServer();
  return (
    <>
      <TopBar state={server.state} queue={server.health.queue} />
      <main>
        <Hero />
        <Studio server={server} />
        <Effects />
        <Pricing />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
