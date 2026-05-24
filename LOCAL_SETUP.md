# Local Setup

This guide gets CreatorHub running on your desktop with no Lovable access required.

## 1. Prerequisites

- **Node.js 20+** (or Bun 1.1+ — the repo includes a `bun.lock`)
- **Git**
- Any modern browser

Check versions:

```bash
node -v
npm -v
```

## 2. Install

```bash
git clone <your-repo-url> creatorhub
cd creatorhub
npm install         # or: bun install
```

## 3. Environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in any keys you want to enable. **All keys are optional** —
endpoints return mock data when their key is missing, so the UI never breaks.

See [`API_KEYS_SETUP.md`](./API_KEYS_SETUP.md) for where to obtain each key.

## 4. Run the dev server

```bash
npm run dev
```

Open <http://localhost:5173>. Vite hot-reloads on every save.

## 5. Production build (optional)

```bash
npm run build       # builds the Cloudflare Worker bundle
npm run preview     # serves the production build locally
```

## Project layout (high level)

```
src/
  routes/           file-based pages + /api/* endpoints
  components/       UI (incl. shadcn primitives)
  components/tools/ per-tool page templates
  lib/              tools registry, server utils, helpers
  styles.css        Tailwind v4 design tokens
```

Full map: [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md).

## Common issues

**Port 5173 already in use** — `npm run dev -- --port 5174`

**Type or import errors after editing routes** — TanStack Router regenerates
`src/routeTree.gen.ts` automatically while `npm run dev` is running. Restart
the dev server if it gets out of sync.

**API endpoint returns 500 locally** — check the terminal log. Most likely a
missing env var; the endpoint will surface a clear `{"error": "..."}` message.

**Tailwind classes not applying** — Tailwind v4 reads tokens from
`src/styles.css`. Make sure your component imports come through `src/styles.css`
(loaded by `__root.tsx`).
