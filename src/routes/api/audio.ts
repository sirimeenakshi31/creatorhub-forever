import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/audio")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.ELEVENLABS_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY missing" }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...CORS },
            });
          }
          const { text, voiceId } = (await request.json()) as { text?: string; voiceId?: string };
          if (!text || text.length < 1 || text.length > 5000) {
            return new Response(JSON.stringify({ error: "Text must be 1–5000 chars" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS },
            });
          }
          const voice = voiceId || "EXAVITQu4vr4xnSDxMaL";

          const resp = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
            {
              method: "POST",
              headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2",
                voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
              }),
            }
          );

          if (!resp.ok) {
            const t = await resp.text();
            return new Response(JSON.stringify({ error: `ElevenLabs ${resp.status}: ${t}` }), {
              status: 502,
              headers: { "Content-Type": "application/json", ...CORS },
            });
          }

          const audio = await resp.arrayBuffer();
          return new Response(audio, {
            status: 200,
            headers: { "Content-Type": "audio/mpeg", ...CORS },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
      },
    },
  },
});
