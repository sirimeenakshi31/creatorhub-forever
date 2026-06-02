import { createFileRoute } from "@tanstack/react-router";
import { rateLimit, DEFAULT_TEXT_MODEL } from "@/lib/server-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...CORS } });

const STYLE_HINTS: Record<string, string> = {
  cinematic: "cinematic, anamorphic lens, dramatic lighting, film grain, shallow depth of field, color graded",
  youtube: "vibrant, high contrast, eye-catching thumbnail aesthetic, modern, well-lit",
  reels: "vertical 9:16 framing, trendy, social-media energetic, bold colors",
  shorts: "vertical 9:16 framing, punchy, fast-paced, bold subject centered",
  educational: "clean illustrative style, clear subject, infographic feel, soft lighting, neutral background",
};

export const Route = createFileRoute("/api/video/scenes")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limited = rateLimit(request, "video-scenes", 10, 60_000);
        if (limited) return limited;
        try {
          const { script, style, sceneCount } = (await request.json().catch(() => ({}))) as {
            script?: string;
            style?: string;
            sceneCount?: number;
          };
          if (!script || typeof script !== "string" || script.length < 5 || script.length > 8000) {
            return json({ error: "Script required (5–8000 chars)" }, 400);
          }
          const s = (style && STYLE_HINTS[style]) ? style : "cinematic";
          const n = Math.min(12, Math.max(3, Number(sceneCount) || 6));
          const styleHint = STYLE_HINTS[s];

          const key = process.env.LOVABLE_API_KEY;
          if (!key) return json({ error: "LOVABLE_API_KEY missing on server" }, 503);

          const system = `You are a video director. Split the user's script into exactly ${n} scenes. Return ONLY raw JSON (no markdown fences) shaped: {"scenes":[{"narration":string (one or two sentences spoken in this scene, taken/paraphrased from the script),"caption":string (5-9 word on-screen caption),"imagePrompt":string (a detailed visual prompt; always append: "${styleHint}")}]}. Keep narration faithful to the source script. Ensure the scenes cover the full script in order.`;

          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: DEFAULT_TEXT_MODEL,
              messages: [
                { role: "system", content: system },
                { role: "user", content: script },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (!resp.ok) {
            const t = await resp.text();
            if (resp.status === 429) return json({ error: "Rate limit — please retry shortly." }, 429);
            if (resp.status === 402) return json({ error: "AI credits exhausted." }, 402);
            return json({ error: `AI gateway ${resp.status}: ${t.slice(0, 200)}` }, 502);
          }
          const data = await resp.json();
          const content = data?.choices?.[0]?.message?.content ?? "{}";
          let parsed: { scenes?: Array<{ narration: string; caption: string; imagePrompt: string }> };
          try {
            parsed = JSON.parse(content);
          } catch {
            const m = content.match(/\{[\s\S]*\}/);
            parsed = m ? JSON.parse(m[0]) : { scenes: [] };
          }
          const scenes = Array.isArray(parsed.scenes) ? parsed.scenes.slice(0, n) : [];
          if (scenes.length === 0) return json({ error: "AI returned no scenes" }, 502);
          return json({ scenes, style: s });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
