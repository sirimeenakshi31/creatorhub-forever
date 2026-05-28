import { createFileRoute, useParams } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { ExternalLink } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";

interface Item { title: string; url: string; img?: string; tag?: string }

const DATA: Record<string, { title: string; eyebrow: string; description: string; items: Item[] }> = {
  "stock-videos": {
    title: "Free Stock Videos", eyebrow: "Resources",
    description: "Hand-picked free 4K stock clips from trusted libraries.",
    items: [
      { title: "Pexels Videos", url: "https://www.pexels.com/videos/", tag: "Free" },
      { title: "Pixabay Videos", url: "https://pixabay.com/videos/", tag: "Free" },
      { title: "Coverr", url: "https://coverr.co", tag: "Free" },
      { title: "Mixkit Free Stock Video", url: "https://mixkit.co/free-stock-video/", tag: "Free" },
      { title: "Mazwai", url: "https://mazwai.com", tag: "Free" },
      { title: "Videvo", url: "https://www.videvo.net", tag: "Free + Pro" },
    ],
  },
  "free-music": {
    title: "Free Music Library", eyebrow: "Resources",
    description: "No-copyright tracks safe for reels, TikTok and YouTube.",
    items: [
      { title: "YouTube Audio Library", url: "https://studio.youtube.com/channel/UC/music", tag: "Free" },
      { title: "Pixabay Music", url: "https://pixabay.com/music/", tag: "Free" },
      { title: "Free Music Archive", url: "https://freemusicarchive.org", tag: "Free" },
      { title: "Uppbeat", url: "https://uppbeat.io", tag: "Freemium" },
      { title: "Bensound", url: "https://www.bensound.com", tag: "Free" },
    ],
  },
  "sound-effects": {
    title: "Free Sound Effects", eyebrow: "Resources",
    description: "Whooshes, swipes, pops, transitions — everything you need.",
    items: [
      { title: "Freesound", url: "https://freesound.org", tag: "Free" },
      { title: "Mixkit SFX", url: "https://mixkit.co/free-sound-effects/", tag: "Free" },
      { title: "Pixabay SFX", url: "https://pixabay.com/sound-effects/", tag: "Free" },
      { title: "Zapsplat", url: "https://www.zapsplat.com", tag: "Free" },
    ],
  },
  "aesthetic-images": {
    title: "Aesthetic Images", eyebrow: "Resources",
    description: "Free, beautiful stock photos for any creator project.",
    items: [
      { title: "Unsplash", url: "https://unsplash.com", tag: "Free" },
      { title: "Pexels Photos", url: "https://www.pexels.com/", tag: "Free" },
      { title: "Pixabay Photos", url: "https://pixabay.com/images/search/", tag: "Free" },
      { title: "Picography", url: "https://picography.co", tag: "Free" },
      { title: "Burst by Shopify", url: "https://burst.shopify.com", tag: "Free" },
    ],
  },
  "trending-sounds": {
    title: "Trending Sounds", eyebrow: "Resources",
    description: "What's trending on TikTok and Reels this week.",
    items: [
      { title: "TokBoard — Trending TikTok Sounds", url: "https://tokboard.com", tag: "Weekly" },
      { title: "TokAudit Sounds", url: "https://tokaudit.io/tiktok-trending-sounds", tag: "Daily" },
      { title: "Tokchart", url: "https://tokchart.com", tag: "Weekly" },
      { title: "Instagram Reels Trends", url: "https://creators.instagram.com/grow/trends", tag: "Official" },
    ],
  },
  "viral-reel-ideas": {
    title: "Viral Reel Ideas", eyebrow: "Resources",
    description: "Fresh viral reel templates and angles, updated regularly.",
    items: [
      { title: "Day-in-the-life with on-screen captions", url: "/tools/reel-idea-generator", tag: "Template" },
      { title: "POV transition + trending sound", url: "/tools/reel-idea-generator", tag: "Template" },
      { title: "'Things I wish I knew' carousel-style reel", url: "/tools/reel-idea-generator", tag: "Template" },
      { title: "Behind-the-scenes time-lapse", url: "/tools/reel-idea-generator", tag: "Template" },
      { title: "3 tips in under 30 seconds", url: "/tools/reel-idea-generator", tag: "Template" },
      { title: "Generate more →", url: "/tools/reel-idea-generator", tag: "AI" },
    ],
  },
  "inspiration-gallery": {
    title: "Creator Inspiration", eyebrow: "Resources",
    description: "Moodboards & creator galleries to spark your next idea.",
    items: [
      { title: "Cosmos", url: "https://www.cosmos.so", tag: "Moodboards" },
      { title: "Are.na", url: "https://www.are.na", tag: "Moodboards" },
      { title: "Pinterest — Creator Trends", url: "https://www.pinterest.com/business/trends/", tag: "Trends" },
      { title: "Dribbble — Trending", url: "https://dribbble.com/shots/popular", tag: "Design" },
      { title: "Awwwards", url: "https://www.awwwards.com", tag: "Design" },
    ],
  },
};

export const Route = createFileRoute("/tools/resources/$kind")({
  loader: ({ params }) => {
    const data = DATA[params.kind];
    if (!data) throw new Error("Resource not found");
    return { data };
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData ? [
      { title: `${loaderData.data.title} — CreatorHub` },
      { name: "description", content: loaderData.data.description },
      { property: "og:title", content: `${loaderData.data.title} — CreatorHub` },
      { property: "og:description", content: loaderData.data.description },
      { property: "og:url", content: `https://creatorhubforever.lovable.app/tools/resources/${params.kind}` },
      { name: "twitter:title", content: `${loaderData.data.title} — CreatorHub` },
      { name: "twitter:description", content: loaderData.data.description },
    ] : [],
    links: loaderData ? [
      { rel: "canonical", href: `https://creatorhubforever.lovable.app/tools/resources/${params.kind}` },
    ] : [],
  }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Page() {
  const { data } = Route.useLoaderData();
  return (
    <ToolShell eyebrow={data.eyebrow} title={data.title} description={data.description}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.items.map((it: Item) => (
          <a key={it.url + it.title} href={it.url} target={it.url.startsWith("/") ? "_self" : "_blank"} rel="noreferrer"
             className="glass rounded-2xl p-4 hover-lift transition flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{it.title}</div>
              {it.tag && <div className="text-xs text-muted-foreground mt-0.5">{it.tag}</div>}
            </div>
            <ExternalLink className="size-4 text-muted-foreground shrink-0" />
          </a>
        ))}
      </div>
    </ToolShell>
  );
}

void useParams; // suppress unused import warning
