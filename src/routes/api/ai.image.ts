import { createFileRoute } from "@tanstack/react-router";
import { rateLimit, DEFAULT_IMAGE_MODEL } from "@/lib/server-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });

export const Route = createFileRoute("/api/ai/image")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limited = rateLimit(request, "ai-image", 10, 60_000);
        if (limited) return limited;
        try {
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);
          const { prompt } = (await request.json()) as { prompt?: string };
          if (!prompt || typeof prompt !== "string" || prompt.length < 1 || prompt.length > 2000) {
            return json({ error: "Prompt required (1–2000 chars)" }, 400);
          }
          // Model is fixed server-side; never trust client-supplied identifiers.
          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: DEFAULT_IMAGE_MODEL,
              messages: [{ role: "user", content: prompt }],
              modalities: ["image", "text"],
            }),
          });
          if (!resp.ok) {
            const t = await resp.text();
            if (resp.status === 429) return json({ error: "Rate limit hit — please try again in a moment." }, 429);
            if (resp.status === 402) return json({ error: "AI credits exhausted in this workspace." }, 402);
            return json({ error: `Image gateway error ${resp.status}: ${t.slice(0, 200)}` }, 502);
          }
          const data = await resp.json();
          const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (!url) return json({ error: "No image returned" }, 502);
          return json({ url });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
