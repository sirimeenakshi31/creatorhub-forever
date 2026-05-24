# API Keys Setup

Every key below is **optional**. Without a key, the matching endpoint returns
a friendly mock response so the UI keeps working — you only need keys for
real generations.

Add keys to `.env` at the project root (`cp .env.example .env` first).

## Lovable AI Gateway — `LOVABLE_API_KEY`

Powers text generation (`/api/ai/text`) and image generation (`/api/ai/image`).

1. Sign in at <https://lovable.dev>.
2. Open any project → enable **Lovable Cloud**.
3. Copy the auto-provisioned `LOVABLE_API_KEY` from project secrets.
4. Paste into `.env`:

   ```
   LOVABLE_API_KEY=lvbl_...
   ```

Single key, billed against your Lovable workspace.

## ElevenLabs — `ELEVENLABS_API_KEY`

Powers text-to-speech (`/api/audio`) and speech-to-text (`/api/transcribe`).

1. Go to <https://elevenlabs.io/app/settings/api-keys>.
2. Create an API key.
3. Paste into `.env`:

   ```
   ELEVENLABS_API_KEY=sk_...
   ```

Free tier includes monthly characters; STT is billed separately.

## Replicate — `REPLICATE_API_TOKEN`

Powers face swap (`/api/face-swap`), AI video (`/api/video`), background remover,
and any other model run through `/api/replicate/run`.

1. Go to <https://replicate.com/account/api-tokens>.
2. Create a token.
3. Paste into `.env`:

   ```
   REPLICATE_API_TOKEN=r8_...
   ```

Pay-per-second compute. Heavy endpoints (`video`, `face-swap`) are rate-limited
server-side to 3 requests/min.

## OpenAI — `OPENAI_API_KEY` (optional)

Not used by any shipped endpoint, but wired in `.env.example` if you want to
add OpenAI-backed tools.

## Verifying a key works

```bash
# Text generation smoke test (requires LOVABLE_API_KEY)
curl -X POST http://localhost:5173/api/ai/text \
  -H "Content-Type: application/json" \
  -d '{"slug":"ai-script","prompt":"a 15s product teaser for sneakers"}'
```

A 200 with JSON `{ "text": "..." }` means the key works. A 500 with
`{"error":"LOVABLE_API_KEY missing"}` means it's not loaded — check `.env` and
restart `npm run dev`.

## Security

- `.env` is gitignored by default. Never commit real keys.
- All endpoints validate input length and enforce per-IP rate limits.
- Allowed ElevenLabs voice IDs are server-side allowlisted; you cannot inject
  arbitrary URLs.
