# CreatorHub by Siri

An all-in-one AI creator platform — 60+ tools for content, image, audio, video,
and social workflows. Built with **TanStack Start**, **React 19**, **Vite 7**,
and **Tailwind CSS v4**.

> Every tool is reachable from the homepage. Missing API keys never crash the
> app — endpoints return graceful mock output so you can keep building.

## Quick start

```bash
# 1. Install dependencies (npm, pnpm, bun, or yarn all work)
npm install

# 2. Copy environment template (all keys optional)
cp .env.example .env

# 3. Start the dev server
npm run dev
```

Then open <http://localhost:5173>.

## Scripts

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Vite dev server with HMR                  |
| `npm run build`    | Production build (Cloudflare Worker)      |
| `npm run preview`  | Preview the production build locally      |
| `npm run lint`     | ESLint over the project                   |
| `npm run format`   | Prettier write                            |

## Documentation

- [`LOCAL_SETUP.md`](./LOCAL_SETUP.md) — full local dev walkthrough
- [`API_KEYS_SETUP.md`](./API_KEYS_SETUP.md) — where to get each API key
- [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) — folder map and conventions

## Tech stack

- TanStack Start v1 (file-based routing + server functions)
- React 19, TypeScript (strict)
- Vite 7, Tailwind CSS v4
- shadcn/ui (Radix) + lucide-react
- Lovable AI Gateway, ElevenLabs, Replicate (optional integrations)
