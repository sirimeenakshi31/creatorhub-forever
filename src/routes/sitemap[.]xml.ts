import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { TOOLS } from "@/lib/tools";

const BASE_URL = "https://creatorhubforever.lovable.app";

const DEDICATED: Record<string, string> = {
  "voice": "/tools/voice",
  "text-to-speech": "/tools/voice",
  "music-generator": "/tools/voice",
  "face-swap": "/tools/face-swap",
  "character-swap": "/tools/face-swap",
  "speech-to-text": "/tools/speech-to-text",
  "audio-subtitles": "/tools/speech-to-text",
  "voice-changer": "/tools/speech-to-text",
  "audio-cleaner": "/tools/speech-to-text",
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

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = new Set<string>(["/"]);
        for (const t of TOOLS) {
          paths.add(DEDICATED[t.slug] || `/tools/${t.slug}`);
        }
        const urls = Array.from(paths).map(
          (p) =>
            `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <changefreq>${p === "/" ? "weekly" : "monthly"}</changefreq>\n    <priority>${p === "/" ? "1.0" : "0.7"}</priority>\n  </url>`,
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
