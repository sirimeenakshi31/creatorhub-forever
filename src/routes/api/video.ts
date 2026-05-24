import { createFileRoute } from "@tanstack/react-router";
import { rateLimit } from "@/lib/server-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...CORS } });

export const Route = createFileRoute("/api/video")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limited = rateLimit(request, "video", 3, 60_000);
        if (limited) return limited;
        try {
          const tokenRaw = process.env.REPLICATE_API_TOKEN;
          const token = tokenRaw?.trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "");
          if (!token || !/^r8_[A-Za-z0-9_-]+$/.test(token)) {
            return json({ error: "REPLICATE_API_TOKEN missing or invalid" }, 500);
          }
          const { prompt } = (await request.json()) as { prompt?: string };
          if (!prompt || typeof prompt !== "string" || prompt.length < 1 || prompt.length > 1500) {
            return json({ error: "Prompt required (1–1500 chars)" }, 400);
          }

          // Use luma/ray-flash-2-540p — fast 5s text-to-video
          const create = await fetch("https://api.replicate.com/v1/models/luma/ray-flash-2-540p/predictions", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "wait" },
            body: JSON.stringify({ input: { prompt, duration: 5, aspect_ratio: "16:9" } }),
          });
          const created = await create.json();
          if (!create.ok) return json({ error: `Replicate ${create.status}: ${created?.detail || JSON.stringify(created).slice(0, 200)}` }, 502);

          let pred = created;
          for (let i = 0; i < 60 && !["succeeded", "failed", "canceled"].includes(pred.status); i++) {
            await new Promise((r) => setTimeout(r, 2500));
            const poll = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            pred = await poll.json();
          }
          if (pred.status !== "succeeded") return json({ error: `Replicate ${pred.status}: ${pred.error || "timed out"}` }, 502);
          const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
          return json({ url: out });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
