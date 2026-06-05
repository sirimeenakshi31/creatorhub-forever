import { createFileRoute } from "@tanstack/react-router";
import { rateLimit } from "@/lib/server-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...CORS } });

/**
 * Generate a single still image for a video scene via Lovable AI Gateway.
 * Non-streaming — returns a base64 data URL the client can use as a canvas background.
 * Uses the small/cheap OpenAI image model with quality=low to keep free-tier usage minimal.
 */
export const Route = createFileRoute("/api/video/image")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limited = rateLimit(request, "video-image", 30, 60_000);
        if (limited) return limited;
        try {
          const { prompt, size } = (await request.json().catch(() => ({}))) as {
            prompt?: string;
            size?: string;
          };
          if (!prompt || typeof prompt !== "string" || prompt.length < 3 || prompt.length > 2000) {
            return json({ error: "Prompt required (3–2000 chars)" }, 400);
          }
          const allowedSizes = new Set(["1024x1024", "1024x1536", "1536x1024"]);
          const imgSize = typeof size === "string" && allowedSizes.has(size) ? size : "1024x1024";

          const key = process.env.LOVABLE_API_KEY;
          if (!key) return json({ error: "LOVABLE_API_KEY missing on server" }, 503);

          const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "openai/gpt-image-1-mini",
              prompt,
              size: imgSize,
              quality: "low",
              n: 1,
            }),
          });
          if (!resp.ok) {
            const t = await resp.text();
            if (resp.status === 429) return json({ error: "Image rate limit — retry shortly." }, 429);
            if (resp.status === 402) return json({ error: "AI credits exhausted." }, 402);
            return json({ error: `Image gateway ${resp.status}: ${t.slice(0, 200)}` }, 502);
          }
          const data = await resp.json();
          const b64 = data?.data?.[0]?.b64_json;
          if (!b64) return json({ error: "No image returned" }, 502);
          return json({ dataUrl: `data:image/png;base64,${b64}` });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
