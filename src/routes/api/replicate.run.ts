import { createFileRoute } from "@tanstack/react-router";
import { rateLimit } from "@/lib/server-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });

const MODELS: Record<string, { version: string; inputKey: string; extra?: Record<string, unknown> }> = {
  "background-remover": { version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003", inputKey: "image" }, // 851-labs/background-remover
  "video-enhancer": { version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", inputKey: "image" }, // upscaler
};

export const Route = createFileRoute("/api/replicate/run")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limited = rateLimit(request, "replicate-run", 5, 60_000);
        if (limited) return limited;
        try {
      POST: async ({ request }) => {
        const limited = rateLimit(request, "replicate-run", 5, 60_000);
        if (limited) return limited;
        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > 10 * 1024 * 1024) {
          return json({ error: "Payload too large (max 10MB)" }, 413);
        }
        try {
          const body = (await request.json().catch(() => ({}))) as { model?: string; image?: string };
          if (!body.model || !MODELS[body.model]) return json({ error: "Unknown model" }, 400);
          if (!body.image) return json({ error: "Image required" }, 400);
          const tokenRaw = process.env.REPLICATE_API_TOKEN;
          const token = tokenRaw?.trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "");

          if (!token || !/^r8_[A-Za-z0-9_-]+$/.test(token)) {
            return json({ url: body.image, mock: true, notice: "Set REPLICATE_API_TOKEN to enable real processing — returning the original image." });
          }
          const m = MODELS[body.model];

          const create = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ version: m.version, input: { [m.inputKey]: body.image, ...(m.extra || {}) } }),
          });
          const created = await create.json();
          if (!create.ok) return json({ error: `Replicate ${create.status}: ${created?.detail || JSON.stringify(created).slice(0, 200)}` }, 502);

          // poll
          let pred = created;
          for (let i = 0; i < 60 && !["succeeded", "failed", "canceled"].includes(pred.status); i++) {
            await new Promise((r) => setTimeout(r, 2000));
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
