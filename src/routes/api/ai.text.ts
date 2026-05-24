import { createFileRoute } from "@tanstack/react-router";
import { rateLimit, systemForSlug, DEFAULT_TEXT_MODEL } from "@/lib/server-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });

export const Route = createFileRoute("/api/ai/text")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limited = rateLimit(request, "ai-text", 20, 60_000);
        if (limited) return limited;
        try {
          const { slug, prompt } = (await request.json().catch(() => ({}))) as { slug?: string; prompt?: string };
          if (!prompt || typeof prompt !== "string" || prompt.length < 1 || prompt.length > 5000) {
            return json({ error: "Prompt required (1–5000 chars)" }, 400);
          }
          if (slug !== undefined && (typeof slug !== "string" || slug.length > 64 || !/^[a-z0-9-]+$/.test(slug))) {
            return json({ error: "Invalid slug" }, 400);
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return json({
              content: `✨ Sample output for "${prompt.slice(0, 80)}"\n\nSet LOVABLE_API_KEY in your .env to enable real AI generation. This placeholder lets you keep building the UI offline.`,
              mock: true,
            });
          }
          const system = systemForSlug(slug);
          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: DEFAULT_TEXT_MODEL,
              messages: [
                ...(system ? [{ role: "system", content: system }] : []),
                { role: "user", content: prompt },
              ],
            }),
          });
          if (!resp.ok) {
            const t = await resp.text();
            if (resp.status === 429) return json({ error: "Rate limit hit — please try again in a moment." }, 429);
            if (resp.status === 402) return json({ error: "AI credits exhausted in this workspace." }, 402);
            return json({ error: `AI gateway error ${resp.status}: ${t.slice(0, 200)}` }, 502);
          }
          const data = await resp.json();
          const content = data?.choices?.[0]?.message?.content ?? "";
          return json({ content });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
