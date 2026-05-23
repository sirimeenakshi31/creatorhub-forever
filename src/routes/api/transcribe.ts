import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...CORS } });

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const key = process.env.ELEVENLABS_API_KEY;
          if (!key) return json({ error: "ELEVENLABS_API_KEY missing" }, 500);
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) return json({ error: "file is required" }, 400);

          const fd = new FormData();
          fd.append("file", file);
          fd.append("model_id", "scribe_v1");

          const resp = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
            method: "POST",
            headers: { "xi-api-key": key },
            body: fd,
          });
          if (!resp.ok) {
            const t = await resp.text();
            return json({ error: `ElevenLabs ${resp.status}: ${t.slice(0, 200)}` }, 502);
          }
          const data = await resp.json();
          return json({ text: data?.text || "" });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
