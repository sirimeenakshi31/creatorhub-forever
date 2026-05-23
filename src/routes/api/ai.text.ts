import { createFileRoute } from "@tanstack/react-router";

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
        try {
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);
          const { system, prompt, model } = (await request.json()) as {
            system?: string; prompt?: string; model?: string;
          };
          if (!prompt || typeof prompt !== "string" || prompt.length > 5000) {
            return json({ error: "Prompt required (≤5000 chars)" }, 400);
          }
          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model || "google/gemini-3-flash-preview",
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
