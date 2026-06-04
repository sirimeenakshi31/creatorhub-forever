import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/ai-video")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/ai-video-studio" });
  },
  head: () => ({
    meta: [
      { title: "AI Video Studio — Free | CreatorHub" },
      { name: "description", content: "Create free MP4 videos from scripts, audio, or images. Browser voiceover, auto captions, no API keys." },
      { property: "og:title", content: "AI Video Studio — Free | CreatorHub" },
      { property: "og:description", content: "Create free MP4 videos from scripts, audio, or images." },
      { property: "og:url", content: "https://creatorhubforever.lovable.app/tools/ai-video-studio" },
      { name: "twitter:title", content: "AI Video Studio — Free | CreatorHub" },
      { name: "twitter:description", content: "Create free MP4 videos from scripts, audio, or images." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/tools/ai-video-studio" }],
  }),
  component: () => null,
});
