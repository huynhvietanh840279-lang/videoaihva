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
