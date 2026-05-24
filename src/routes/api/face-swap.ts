import { createFileRoute } from "@tanstack/react-router";
import { rateLimit } from "@/lib/server-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// cdingram/face-swap — reliable, fast face-swap model on Replicate
const MODEL_OWNER = "cdingram";
const MODEL_NAME = "face-swap";
const REPLICATE_TOKEN_PATTERN = /^r8_[A-Za-z0-9_-]+$/;

export const Route = createFileRoute("/api/face-swap")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const limited = rateLimit(request, "face-swap", 3, 60_000);
        if (limited) return limited;
        try {
          const { targetImage, sourceFace } = (await request.json().catch(() => ({}))) as {
            targetImage?: string;
            sourceFace?: string;
          };
          if (!targetImage || !sourceFace) {
            return json({ error: "targetImage and sourceFace are required (data URLs or http URLs)" }, 400);
          }
          const token = normalizeSecret(process.env.REPLICATE_API_TOKEN);
          if (!token || !REPLICATE_TOKEN_PATTERN.test(token)) {
            return json({ output: targetImage, mock: true, notice: "Set REPLICATE_API_TOKEN to enable real face-swap — returning your target image." });
          }

          // Kick off the prediction with Prefer: wait for quick sync return
          const startResp = await fetch(
            `https://api.replicate.com/v1/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Prefer: "wait=60",
              },
              body: JSON.stringify({
                input: {
                  input_image: targetImage,
                  swap_image: sourceFace,
                },
              }),
            }
          );

          const startData = (await startResp.json()) as {
            id?: string;
            status?: string;
            output?: string | string[];
            error?: string;
            urls?: { get?: string };
          };

          if (!startResp.ok) {
            return json({ error: `Replicate ${startResp.status}: ${startData.error || JSON.stringify(startData)}` }, 502);
          }

          // Poll if still processing
          let final = startData;
          const getUrl = startData.urls?.get;
          let attempts = 0;
          while (final.status && ["starting", "processing"].includes(final.status) && getUrl && attempts < 30) {
            await new Promise((r) => setTimeout(r, 2000));
            const poll = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
            final = (await poll.json()) as typeof final;
            attempts++;
          }

          if (final.status !== "succeeded") {
            return json({ error: final.error || `Prediction ${final.status || "failed"}` }, 502);
          }

          const output = Array.isArray(final.output) ? final.output[0] : final.output;
          return json({ output });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          return json({ error: msg }, 500);
        }
      },
    },
  },
});

function normalizeSecret(value: string | undefined): string {
  return (value ?? "").trim().replace(/^Bearer\s+/i, "").replace(/^['"]|['"]$/g, "");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
