import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, Flame, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import { TOOLS, CATEGORIES, type Tool, type ToolCategory } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CreatorHub by Siri — 60+ Free AI Tools for Creators" },
      { name: "description", content: "All-in-one AI creator platform: generate scripts, captions, images, voiceovers, videos, thumbnails and more. 60+ free AI tools, no credits, no paywalls." },
      { property: "og:title", content: "CreatorHub by Siri — 60+ Free AI Tools for Creators" },
      { property: "og:description", content: "All-in-one AI creator platform: scripts, captions, images, voiceovers, videos and more. 60+ free AI tools." },
      { property: "og:url", content: "https://creatorhubforever.lovable.app/" },
      { name: "twitter:title", content: "CreatorHub by Siri — 60+ Free AI Tools for Creators" },
      { name: "twitter:description", content: "All-in-one AI creator platform: scripts, captions, images, voiceovers, videos and more." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/" }],
  }),
  component: Dashboard,
});


function getRoute(t: Tool): string {
  // Dedicated routes for non-generic tools
  const dedicated: Record<string, string> = {
    "voice": "/tools/voice",
    "face-swap": "/tools/face-swap",
    "character-swap": "/tools/face-swap",
    "text-to-speech": "/tools/voice",
    "speech-to-text": "/tools/speech-to-text",
    "audio-subtitles": "/tools/speech-to-text",
    "voice-changer": "/tools/speech-to-text",
    "audio-cleaner": "/tools/speech-to-text",
    "music-generator": "/tools/voice",
    "ai-video": "/tools/ai-video",
    "faceless-video": "/tools/ai-video",
    "video-enhancer": "/tools/ai-video",
    "auto-shorts": "/tools/ai-video",
    "canvas-editor": "/tools/canvas-editor",
    "stock-videos": "/tools/resources/stock-videos",
    "free-music": "/tools/resources/free-music",
    "sound-effects": "/tools/resources/sound-effects",
    "aesthetic-images": "/tools/resources/aesthetic-images",
    "trending-sounds": "/tools/resources/trending-sounds",
    "viral-reel-ideas": "/tools/resources/viral-reel-ideas",
    "inspiration-gallery": "/tools/resources/inspiration-gallery",
  };
  return dedicated[t.slug] || `/tools/${t.slug}`;
}

function ToolCard({ t }: { t: Tool }) {
  const Icon = (Icons as any)[t.icon] || Sparkles;
  return (
    <Link to={getRoute(t)} className="group glass rounded-2xl p-4 hover-lift transition relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-glow">
          <Icon className="size-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate flex items-center gap-1.5">
            {t.name}
            {t.trending && <Flame className="size-3 text-brand" />}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</div>
        </div>
      </div>
      <ArrowRight className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
    </Link>
  );
}

function Dashboard() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ToolCategory | "All">("All");

  const filtered = useMemo(() => {
    const lq = q.toLowerCase().trim();
    return TOOLS.filter((t) => {
      const matchCat = cat === "All" || t.category === cat;
      const matchQ = !lq || t.name.toLowerCase().includes(lq) || t.description.toLowerCase().includes(lq) || t.category.toLowerCase().includes(lq);
      return matchCat && matchQ;
    });
  }, [q, cat]);

  const trending = TOOLS.filter((t) => t.trending);
  const byCat = (c: ToolCategory) => filtered.filter((t) => t.category === c);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-[55vh] bg-hero pointer-events-none" />
      <header className="relative">
        <div className="max-w-7xl mx-auto px-4 pt-6 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg inline-flex items-center gap-2">
            <span className="size-7 rounded-lg bg-gradient-brand shadow-glow grid place-items-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </span>
            CreatorHub
          </Link>
          <span className="glass rounded-full px-3 py-1 text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Sparkles className="size-3 text-brand" /> Free Forever
          </span>
        </div>
      </header>

      <section className="relative max-w-5xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="text-xs uppercase tracking-widest text-brand mb-2">All-in-one creator suite</div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Every AI tool a creator needs.
          <span className="block bg-gradient-brand bg-clip-text text-transparent">Free. Forever.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          {TOOLS.length}+ tools for audio, video, images, content and social. No credits. No paywalls. Just create.
        </p>

        <div className="mt-8 mx-auto max-w-2xl glass rounded-full flex items-center px-4 py-2 gap-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search 60+ tools…"
            className="flex-1 bg-transparent outline-none py-2 text-base"
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`text-xs rounded-full px-3 py-1.5 border transition ${cat === c ? "bg-gradient-brand text-primary-foreground border-transparent" : "border-border hover:bg-accent/40"}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <main className="relative max-w-7xl mx-auto px-4 pb-20">
        {!q && cat === "All" && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="size-4 text-brand" />
              <h2 className="text-lg font-semibold">Trending now</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trending.map((t) => <ToolCard key={t.slug} t={t} />)}
            </div>
          </section>
        )}

        {CATEGORIES.map((c) => {
          const items = byCat(c);
          if (items.length === 0) return null;
          return (
            <section key={c} className="mb-10">
              <h2 className="text-lg font-semibold mb-3">{c}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {items.map((t) => <ToolCard key={t.slug} t={t} />)}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No tools match "{q}".</p>
        )}
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        Built with ♥ by Siri · Free forever
      </footer>
    </div>
  );
}
