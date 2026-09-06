import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX app module ported from the uploaded production file
import PodChat from "@/components/podchat/PodChat.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PodChat — Live Podcasts, Comedy & Creator Earnings" },
      {
        name: "description",
        content:
          "PodChat is a global podcast and live-conversation platform where creators host shows, go live, translate episodes and earn from every audience.",
      },
      { property: "og:title", content: "PodChat — Where Every Voice Is a Show" },
      {
        property: "og:description",
        content:
          "Live shows, comedy, interviews, creator revenue and multilingual simulcast — all in one professional studio platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <PodChat />;
}
