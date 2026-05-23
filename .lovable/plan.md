# CreatorHub — All-in-One AI Creator Platform

This is a large build (60+ tool pages, 2 API integrations, dashboard, theming). I'll do it in 4 shippable phases so the preview stays working after every step. No payments, no premium gates, no credits — every tool reachable from the homepage.

## Phase 0 — Stabilize (do first)
- Fix the active SSR crash (`Failed to fetch virtual:tanstack-start-client-entry`) so the preview boots.
- Confirm `LOVABLE_API_KEY` is present (used for AI text/image/video tools via the Lovable AI Gateway — no user key needed).
- Confirm `ELEVENLABS_API_KEY` and `REPLICATE_API_TOKEN` are present (already wired for voice + face-swap).

## Phase 1 — Shell, theme, navigation
- Dashboard homepage with: hero, search bar, category sidebar, **Trending tools**, **Recently used** (localStorage), and a full grid linking to every tool below.
- Sidebar categories: Content · Video · Audio · Image & Design · Resources.
- Dark/light mode toggle, glassmorphism + soft-gradient theme, Framer Motion page transitions, toast system (sonner).
- Shared `ToolPage` layout: title, description, input area (textarea / upload / dropzone), Generate button with loading animation, output area with Copy/Download buttons.

## Phase 2 — Tool pages (all wired, no dead routes)
Each tool gets its own route under `/tools/<slug>` with a real working generate flow. Routing strategy:

- **Text tools** (Script, Caption, Hook, Viral Title, Hashtag, YouTube Description, Storytelling Prompt, Blog, Tweet, Pinterest Description, Reel Idea, Scene Prompt, Thumbnail Prompt, Podcast Intro, Sound FX prompt, Subtitle/Caption text, Color Palette, Font Pairing) → single server function calling Lovable AI Gateway (`google/gemini-3-flash-preview`) with a per-tool system prompt. Structured outputs via tool-calling where useful (palettes, hashtags, font pairs).
- **Image tools** (AI Image, Pinterest Pin, IG Carousel slides, Logo, Poster, YT Thumbnail, Profile Picture, Background Remover, Character Swap) → Lovable AI Gateway image models (`google/gemini-2.5-flash-image`). Background Remover + Character Swap + Face Swap use Replicate.
- **Video tools** (AI Video, Faceless Video, Video Enhancer, Auto Shorts, Subtitle/Video Caption burn-in) → Replicate models; long-running jobs polled server-side, with a graceful mock fallback if the API errors so the UI never crashes.
- **Audio tools** (Voice Generator, TTS, Voice Changer, Audio Cleaner, Music Generator, Sound FX, Audio Subtitle) → ElevenLabs for TTS/voices; Speech-to-Text via ElevenLabs STT; mock waveform fallback for any failure.
- **Canva-style Editor** → lightweight in-browser editor (text + image layers on a canvas, export PNG). Not a full Canva clone — a usable single-page editor.
- **Creator Resources** (Stock videos, Free music, Sound FX, Aesthetic images, Trending sounds, Daily viral reel ideas, Inspiration gallery) → curated lists pulling from free public sources (Pexels/Pixabay-style links + a static curated JSON that we can refresh). No login required.

Every tool ships with a **mock fallback** so a failed API call shows a usable result + a toast, never a blank screen or crash.

## Phase 3 — Polish
- Search across all tools (fuzzy match by name/category/tags).
- Recently used + Favorites (localStorage).
- Mobile responsive pass.
- SEO `head()` per route.
- Smoke test every route loads.

## Technical notes
- All API calls go through TanStack Start server functions / server routes — no keys on the client.
- Inputs validated with Zod, secrets normalized (strip stray chars like the bullet that broke face-swap).
- Long-running Replicate jobs use polling with a hard timeout + mock fallback.
- No payment UI, no credit counters, no upgrade modals anywhere.

## Confirm before I start
1. **Scope of Phase 2** — OK to ship all ~60 tools, but expect simpler tools (e.g. Logo Generator) to wrap the image model with a tailored prompt rather than be a full vector editor. Confirm that's acceptable.
2. **Replicate models** — OK to pick sensible defaults (e.g. `black-forest-labs/flux-schnell` for image, `bytedance/seedance` for video, `cjwbw/rembg` for background removal)? I can swap later.
3. **Build order** — start with Phase 0 + Phase 1 (shell + dashboard with every tool linked as stubs that already render a working AI call) in the first pass, then flesh out specialized tools? Or do you want a specific category done first (e.g. Audio fully polished first)?
