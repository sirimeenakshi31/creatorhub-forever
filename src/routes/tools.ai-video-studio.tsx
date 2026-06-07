import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Download, Film, FileText, AudioLines, Wand2, Play, Square, User, ImageIcon, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/ai-video-studio")({
  head: () => ({
    meta: [
      { title: "AI Video Studio — Free Script, Audio, Image & Video to Video | CreatorHub" },
      { name: "description", content: "Turn scripts, audio, images, or videos into finished AI videos with smart storyboards, AI scene images, characters, captions, voiceover, and MP4 export. 100% free." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/tools/ai-video-studio" }],
  }),
  component: Page,
});

type Style =
  | "youtube" | "shorts" | "reels" | "educational" | "cinematic"
  | "motivational" | "tech" | "business" | "vlog"
  | "documentary" | "storytelling";
type Mode = "script" | "audio" | "faceless" | "image" | "video";
type Ratio = "auto" | "16:9" | "9:16" | "1:1";
type Avatar = "none" | "cartoon" | "doll" | "anime" | "business" | "teacher" | "influencer";
type Transition = "fade" | "slide" | "zoom" | "kenburns" | "typewriter";
type Fx = "none" | "rain" | "snow" | "fire" | "smoke" | "sparkles" | "confetti" | "magic";
type VoiceProfile = "Female" | "Male" | "Child" | "Elderly" | "Narrator" | "Motivational";
type FacePreservation = "exact" | "similar" | "cartoon" | "anime" | "doll";

const LANGUAGES: Record<string, { label: string; bcp: string }> = {
  auto: { label: "Auto-detect", bcp: "" },
  en:   { label: "English",     bcp: "en" },
  es:   { label: "Spanish",     bcp: "es" },
  fr:   { label: "French",      bcp: "fr" },
  de:   { label: "German",      bcp: "de" },
  it:   { label: "Italian",     bcp: "it" },
  pt:   { label: "Portuguese",  bcp: "pt" },
  nl:   { label: "Dutch",       bcp: "nl" },
  ru:   { label: "Russian",     bcp: "ru" },
  pl:   { label: "Polish",      bcp: "pl" },
  tr:   { label: "Turkish",     bcp: "tr" },
  ar:   { label: "Arabic",      bcp: "ar" },
  hi:   { label: "Hindi",       bcp: "hi" },
  ja:   { label: "Japanese",    bcp: "ja" },
  ko:   { label: "Korean",      bcp: "ko" },
  zh:   { label: "Chinese",     bcp: "zh" },
};

const VOICE_PROFILES: Record<VoiceProfile, { hint: string; rate: number; pitch: number }> = {
  Female:       { hint: "female",   rate: 1.0,  pitch: 1.05 },
  Male:         { hint: "male",     rate: 0.98, pitch: 0.9 },
  Child:        { hint: "female",   rate: 1.15, pitch: 1.5 },
  Elderly:      { hint: "male",     rate: 0.85, pitch: 0.75 },
  Narrator:     { hint: "google",   rate: 0.95, pitch: 0.95 },
  Motivational: { hint: "male",     rate: 1.05, pitch: 1.1 },
};

const FACE_FILTERS: Record<FacePreservation, string> = {
  exact:   "none",
  similar: "blur(0.6px) saturate(1.05)",
  cartoon: "saturate(1.6) contrast(1.25) brightness(1.05)",
  anime:   "saturate(1.8) contrast(1.35) hue-rotate(-5deg)",
  doll:    "saturate(1.3) contrast(1.1) brightness(1.1) blur(0.4px)",
};

/** Heuristic language detection from short text. Returns BCP-47 code or "" if unsure. */
function detectLanguage(text: string): string {
  const t = (text || "").trim();
  if (!t) return "";
  // Script-range checks first
  if (/[\u4e00-\u9fff]/.test(t)) return "zh";
  if (/[\u3040-\u30ff]/.test(t)) return "ja";
  if (/[\uac00-\ud7af]/.test(t)) return "ko";
  if (/[\u0600-\u06ff]/.test(t)) return "ar";
  if (/[\u0900-\u097f]/.test(t)) return "hi";
  if (/[\u0400-\u04ff]/.test(t)) return "ru";
  // Latin-script common-word heuristics
  const l = " " + t.toLowerCase().replace(/[^\p{L}\s]/gu, " ") + " ";
  const score: Record<string, number> = {};
  const HINTS: Record<string, string[]> = {
    en: ["the","and","you","this","with","that","for","are","have","not"],
    es: ["el","la","los","las","que","de","es","y","con","por","una","para"],
    fr: ["le","la","les","des","que","est","et","pour","avec","dans","une","vous"],
    de: ["der","die","das","und","ist","nicht","mit","für","auch","eine","sich"],
    it: ["il","la","che","di","è","un","una","per","con","sono","gli","del"],
    pt: ["o","a","os","as","que","de","é","não","com","para","uma","você"],
    nl: ["de","het","een","en","ik","niet","dat","met","voor","ook"],
    pl: ["nie","się","jest","to","na","że","jak","oraz","tylko"],
    tr: ["ve","bir","bu","için","ile","var","ama","çok","değil"],
  };
  for (const [lang, words] of Object.entries(HINTS)) {
    score[lang] = 0;
    for (const w of words) if (l.includes(" " + w + " ")) score[lang] += 1;
  }
  const best = Object.entries(score).sort((a,b) => b[1]-a[1])[0];
  return best && best[1] >= 2 ? best[0] : "en";
}

type Scene = {
  caption: string;
  narration: string;
  icon: string;
  transition: Transition;
  fx?: Fx;
  fxIntensity?: number;
  // AI-detected metadata (optional)
  characters?: string[];
  location?: string;
  emotion?: string;
  action?: string;
  camera?: string;
  imagePrompt?: string;
  // Loaded background (set client-side after image generation)
  bgImage?: HTMLImageElement | null;
};

const STYLE_DEFS: Record<Style, { label: string; w: number; h: number; palette: [string, string, string]; font: string }> = {
  youtube:      { label: "YouTube",     w: 1280, h: 720,  palette: ["#FF0033", "#1a0008", "#ffffff"], font: "system-ui" },
  shorts:       { label: "Shorts",      w: 720,  h: 1280, palette: ["#FF3B30", "#0b0b0f", "#ffffff"], font: "system-ui" },
  reels:        { label: "Reels",       w: 720,  h: 1280, palette: ["#E1306C", "#1a0a14", "#ffffff"], font: "system-ui" },
  educational:  { label: "Educational", w: 1280, h: 720,  palette: ["#2563EB", "#0a1224", "#ffffff"], font: "Georgia, serif" },
  cinematic:    { label: "Cinematic",   w: 1280, h: 720,  palette: ["#D4A24C", "#0a0908", "#f5e9d6"], font: "Georgia, serif" },
  motivational: { label: "Motivational",w: 720,  h: 1280, palette: ["#F97316", "#100806", "#ffffff"], font: "system-ui" },
  tech:         { label: "Tech",        w: 1280, h: 720,  palette: ["#00E5FF", "#04101a", "#e6fbff"], font: "ui-monospace, Menlo, monospace" },
  business:     { label: "Business",    w: 1280, h: 720,  palette: ["#0EA5E9", "#0b1220", "#f8fafc"], font: "Georgia, serif" },
  vlog:         { label: "Vlog",        w: 1280, h: 720,  palette: ["#A78BFA", "#120a1f", "#ffffff"], font: "system-ui" },
  documentary:  { label: "Documentary", w: 1280, h: 720,  palette: ["#C7A36B", "#0d0c0a", "#f1e6cf"], font: "Georgia, serif" },
  storytelling: { label: "Storytelling",w: 1280, h: 720,  palette: ["#F472B6", "#160a14", "#fff1f7"], font: "Georgia, serif" },
};

const AVATAR_PRESETS: Record<Exclude<Avatar, "none">, { label: string; skin: string; hair: string; outfit: string; accent: string }> = {
  cartoon:    { label: "Cartoon",     skin: "#f4c79b", hair: "#3a2a1f", outfit: "#22c55e", accent: "#fde047" },
  doll:       { label: "3D Doll",     skin: "#ffd8b8", hair: "#a855f7", outfit: "#ec4899", accent: "#22d3ee" },
  anime:      { label: "Anime",       skin: "#fde6cf", hair: "#1e293b", outfit: "#3b82f6", accent: "#ef4444" },
  business:   { label: "Presenter",   skin: "#e3b48a", hair: "#1a1a1a", outfit: "#0f172a", accent: "#0EA5E9" },
  teacher:    { label: "Teacher",     skin: "#f1c3a0", hair: "#6b3a1f", outfit: "#1e40af", accent: "#fbbf24" },
  influencer: { label: "Influencer",  skin: "#f5cba3", hair: "#fbbf24", outfit: "#ec4899", accent: "#a855f7" },
};

const TRANSITIONS: Transition[] = ["fade", "slide", "zoom", "kenburns", "typewriter"];
const ICONS = ["✦", "✸", "❖", "◆", "✺", "✹", "✷", "✶", "▲", "●", "◼", "✱"];

function splitIntoScenes(script: string, target = 6): Scene[] {
  const clean = script.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const n = Math.max(3, Math.min(12, target));
  const perBucket = Math.max(1, Math.ceil(sentences.length / n));
  const buckets: string[] = [];
  for (let i = 0; i < sentences.length; i += perBucket) buckets.push(sentences.slice(i, i + perBucket).join(" "));
  return buckets.slice(0, n).map((narration, i) => {
    const words = narration.split(/\s+/).filter(Boolean);
    const caption = words.slice(0, 7).join(" ") + (words.length > 7 ? "…" : "");
    return {
      narration,
      caption: caption || `Scene ${i + 1}`,
      icon: ICONS[i % ICONS.length],
      transition: TRANSITIONS[i % TRANSITIONS.length],
    };
  });
}

function topicToScenes(topic: string, count: number): Scene[] {
  const t = topic.trim() || "Untitled";
  const beats = [
    `Introducing ${t}.`, `Why ${t} matters today.`, `The first key idea about ${t}.`,
    `A surprising fact about ${t}.`, `How to get started with ${t}.`, `A common mistake people make.`,
    `The real secret behind ${t}.`, `What experts say about ${t}.`, `A quick action you can take now.`,
    `The future of ${t}.`, `Final thoughts on ${t}.`, `Follow for more on ${t}.`,
  ].slice(0, Math.max(3, Math.min(12, count)));
  return beats.map((narration, i) => ({
    narration, caption: narration.replace(/[.!?]$/, ""),
    icon: ICONS[i % ICONS.length],
    transition: TRANSITIONS[i % TRANSITIONS.length],
  }));
}

function pickVoice(voices: SpeechSynthesisVoice[], hint: string, lang = "en") {
  if (!voices.length) return null;
  const langLower = (lang || "en").toLowerCase();
  const localized = voices.filter((v) => v.lang?.toLowerCase().startsWith(langLower));
  const fallback = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = localized.length ? localized : (fallback.length ? fallback : voices);
  const lower = hint.toLowerCase();
  return pool.find((v) => v.name.toLowerCase().includes(lower)) || pool[0];
}

function speak(text: string, voice: SpeechSynthesisVoice | null, rate = 1, pitch = 1, lang = ""): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { resolve(); return; }
    try {
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      if (lang) u.lang = lang;
      u.rate = rate; u.pitch = pitch;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } catch { resolve(); }
  });
}

function estimateDuration(text: string, rate = 1) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2.0, words / (2.6 * rate));
}

function hexA(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function mixColor(a: string, b: string, t: number) {
  const ah = a.replace("#", ""), bh = b.replace("#", "");
  const ar = parseInt(ah.substring(0, 2), 16), ag = parseInt(ah.substring(2, 4), 16), ab = parseInt(ah.substring(4, 6), 16);
  const br = parseInt(bh.substring(0, 2), 16), bgg = parseInt(bh.substring(2, 4), 16), bb = parseInt(bh.substring(4, 6), 16);
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bgg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draw image as a cover-fit background with Ken Burns pan/zoom driven by progress p (0..1). */
function drawBackgroundCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, p: number, camera?: string) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  if (!iw || !ih) return;
  const baseScale = Math.max(w / iw, h / ih);
  // Camera-driven motion
  let zoom = 1.05 + 0.1 * p; // default subtle Ken Burns in
  let panX = 0, panY = 0;
  switch (camera) {
    case "zoom-in":   zoom = 1.02 + 0.18 * p; break;
    case "zoom-out":  zoom = 1.20 - 0.16 * p; break;
    case "pan-left":  zoom = 1.10; panX = (0.5 - p) * w * 0.15; break;
    case "pan-right": zoom = 1.10; panX = (p - 0.5) * w * 0.15; break;
    case "tracking":  zoom = 1.10; panX = Math.sin(p * Math.PI * 2) * w * 0.04; break;
    case "orbit":     zoom = 1.12; panX = Math.sin(p * Math.PI * 2) * w * 0.05; panY = Math.cos(p * Math.PI * 2) * h * 0.03; break;
    case "drone":     zoom = 1.05 + 0.12 * p; panY = (0.5 - p) * h * 0.08; break;
    case "close-up":  zoom = 1.30 + 0.05 * p; break;
    case "wide-shot": zoom = 1.02; break;
    case "static":    zoom = 1.0; break;
  }
  const s = baseScale * zoom;
  const dw = iw * s, dh = ih * s;
  const dx = (w - dw) / 2 + panX;
  const dy = (h - dh) / 2 + panY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// ============== Avatar drawing ==============
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  preset: typeof AVATAR_PRESETS[keyof typeof AVATAR_PRESETS],
  cx: number, cy: number, size: number, mouthOpen: number, t: number,
) {
  const sway = Math.sin(t * 1.2) * size * 0.015;
  const blink = (Math.sin(t * 0.9) > 0.97) ? 0.1 : 1;

  ctx.save();
  ctx.translate(cx + sway, cy);

  ctx.fillStyle = preset.outfit;
  roundRect(ctx, -size * 0.55, size * 0.35, size * 1.1, size * 0.95, size * 0.18);
  ctx.fill();
  ctx.fillStyle = preset.accent;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, size * 0.35);
  ctx.lineTo(0, size * 0.55);
  ctx.lineTo(size * 0.18, size * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = preset.skin;
  ctx.fillRect(-size * 0.12, size * 0.2, size * 0.24, size * 0.2);

  ctx.fillStyle = preset.skin;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.05, size * 0.42, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = preset.hair;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.32, size * 0.46, size * 0.32, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.4, -size * 0.05, size * 0.1, size * 0.32, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.4, -size * 0.05, size * 0.1, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-size * 0.15, -size * 0.05, size * 0.07, size * 0.09 * blink, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.15, -size * 0.05, size * 0.07, size * 0.09 * blink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(-size * 0.15, -size * 0.04, size * 0.035, size * 0.045 * blink, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.15, -size * 0.04, size * 0.035, size * 0.045 * blink, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = preset.hair; ctx.lineWidth = size * 0.025; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.16); ctx.lineTo(-size * 0.08, -size * 0.18);
  ctx.moveTo(size * 0.08, -size * 0.18); ctx.lineTo(size * 0.22, -size * 0.16);
  ctx.stroke();

  ctx.fillStyle = hexA("#ff7a90", 0.35);
  ctx.beginPath();
  ctx.ellipse(-size * 0.22, size * 0.08, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.22, size * 0.08, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  const mw = size * 0.18;
  const mh = Math.max(size * 0.015, mouthOpen * size * 0.13);
  ctx.fillStyle = "#3a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, mw, mh, 0, 0, Math.PI * 2);
  ctx.fill();
  if (mouthOpen > 0.15) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-mw * 0.7, size * 0.12 - mh * 0.4, mw * 1.4, mh * 0.35);
  }

  ctx.restore();
}

function drawFx(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, fx: Fx, accent: string, intensity = 1) {
  if (fx === "none") return;
  const base = fx === "confetti" ? 80 : fx === "sparkles" ? 60 : fx === "fire" || fx === "smoke" ? 50 : 120;
  const count = Math.max(4, Math.round(base * Math.max(0.1, Math.min(3, intensity))));
  for (let i = 0; i < count; i++) {
    const seed = i * 13.37;
    if (fx === "rain") {
      const x = (seed * 97 + t * 200) % w;
      const y = (seed * 53 + t * 900) % h;
      ctx.strokeStyle = "rgba(180,210,255,0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 14); ctx.stroke();
    } else if (fx === "snow") {
      const x = (seed * 71 + Math.sin(t + seed) * 30) % w;
      const y = (seed * 47 + t * 80) % h;
      const r = 1 + (i % 4);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    } else if (fx === "fire") {
      const x = w * 0.5 + Math.sin(seed + t * 2) * w * 0.4;
      const y = h - ((t * 220 + seed * 60) % h);
      const r = 6 + (i % 8);
      const hue = 10 + (i % 30);
      ctx.fillStyle = `hsla(${hue},90%,55%,${0.25 + (i % 4) * 0.1})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    } else if (fx === "smoke") {
      const x = (seed * 89 + Math.sin(t + seed) * 80) % w;
      const y = h - ((t * 60 + seed * 40) % h);
      const r = 20 + (i % 30);
      ctx.fillStyle = `rgba(180,180,180,${0.04 + (i % 5) * 0.02})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    } else if (fx === "sparkles") {
      const x = (Math.sin(t + seed) * 0.5 + 0.5) * w;
      const y = (Math.cos(t * 1.3 + seed) * 0.5 + 0.5) * h;
      const a = 0.4 + Math.sin(t * 4 + seed) * 0.4;
      ctx.fillStyle = hexA(accent, Math.max(0, a));
      ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2); ctx.fill();
    } else if (fx === "confetti") {
      const x = (seed * 61 + Math.sin(t * 2 + seed) * 40) % w;
      const y = ((t * 180 + seed * 90) % (h + 40)) - 20;
      const hue = (i * 47) % 360;
      ctx.fillStyle = `hsl(${hue},80%,60%)`;
      ctx.save(); ctx.translate(x, y); ctx.rotate(seed + t * 4);
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    } else if (fx === "magic") {
      const x = (Math.sin(t * 0.8 + seed) * 0.5 + 0.5) * w;
      const y = (Math.cos(t * 0.6 + seed * 1.7) * 0.5 + 0.5) * h;
      const r = 1 + (i % 5);
      const hue = (t * 60 + i * 20) % 360;
      ctx.fillStyle = `hsla(${hue},90%,70%,0.7)`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
}



function drawParticles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, accent: string) {
  for (let i = 0; i < 18; i++) {
    const seed = i * 7.3;
    const x = ((Math.sin(t * 0.3 + seed) * 0.5 + 0.5) * w);
    const y = ((t * (20 + i * 4) + seed * 100) % h);
    const r = 1.5 + (i % 4);
    ctx.fillStyle = hexA(accent, 0.18 + (i % 3) * 0.05);
    ctx.beginPath();
    ctx.arc(x, h - y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function Page() {
  const [mode, setMode] = useState<Mode>("script");
  const [style, setStyle] = useState<Style>("youtube");
  const [ratio, setRatio] = useState<Ratio>("auto");
  const [avatar, setAvatar] = useState<Avatar>("none");
  const [script, setScript] = useState(
    "In a world where ideas move at the speed of light, creators reshape what's possible. Every voice finds its stage. Every story finds its audience. This is the new era of creation."
  );
  const [topic, setTopic] = useState("AI for creators");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [sceneCount, setSceneCount] = useState(6);
  const [voiceHint, setVoiceHint] = useState<VoiceProfile>("Female");
  const [muteExport, setMuteExport] = useState(false);
  const [useAIImages, setUseAIImages] = useState(true);
  const [karaoke, setKaraoke] = useState(true);
  const [fx, setFx] = useState<Fx>("none");
  const [fxIntensity, setFxIntensity] = useState(1);
  const [language, setLanguage] = useState<string>("auto");
  const [detectedLang, setDetectedLang] = useState<string>("en");
  const [facePres, setFacePres] = useState<FacePreservation>("exact");

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const baseCfg = useMemo(() => STYLE_DEFS[style], [style]);
  const styleCfg = useMemo(() => {
    if (ratio === "auto") return baseCfg;
    if (ratio === "9:16") return { ...baseCfg, w: 720, h: 1280 };
    if (ratio === "1:1") return { ...baseCfg, w: 1080, h: 1080 };
    return { ...baseCfg, w: 1280, h: 720 };
  }, [baseCfg, ratio]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const previewAbortRef = useRef<{ abort: boolean }>({ abort: false });

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => () => {
    previewAbortRef.current.abort = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function reset() {
    setScenes([]); setExportedUrl(null); setProgress(0); setProgressLabel("");
    previewAbortRef.current.abort = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  async function fetchStoryboard(text: string): Promise<Scene[] | null> {
    try {
      const res = await fetch("/api/video/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: text, style, sceneCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Storyboard ${res.status}`);
      const built: Scene[] = (data.scenes as Array<Record<string, unknown>>).map((s, i) => ({
        narration: String(s.narration ?? "").trim(),
        caption: String(s.caption ?? `Scene ${i + 1}`).trim(),
        icon: ICONS[i % ICONS.length],
        transition: TRANSITIONS[i % TRANSITIONS.length],
        characters: Array.isArray(s.characters) ? (s.characters as string[]).slice(0, 6) : [],
        location: typeof s.location === "string" ? s.location : "",
        emotion: typeof s.emotion === "string" ? s.emotion : "",
        action: typeof s.action === "string" ? s.action : "",
        camera: typeof s.camera === "string" ? s.camera : "static",
        imagePrompt: typeof s.imagePrompt === "string" ? s.imagePrompt : "",
      }));
      return built;
    } catch (e) {
      toast.error(`AI storyboard failed — falling back to simple split. ${(e as Error).message}`);
      return null;
    }
  }

  async function fetchSceneImages(built: Scene[]) {
    const aspect: string = styleCfg.h > styleCfg.w ? "1024x1536" : (styleCfg.w === styleCfg.h ? "1024x1024" : "1536x1024");
    let done = 0;
    setProgressLabel(`Generating AI scene images (0/${built.length})…`);
    await Promise.all(built.map(async (sc, i) => {
      if (!sc.imagePrompt) return;
      try {
        const res = await fetch("/api/video/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: sc.imagePrompt, size: aspect }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `Image ${res.status}`);
        const img = await loadImage(data.dataUrl);
        built[i] = { ...built[i], bgImage: img };
      } catch (e) {
        console.warn(`Scene ${i + 1} image failed`, e);
      } finally {
        done++;
        setProgress(20 + Math.round((done / built.length) * 70));
        setProgressLabel(`Generating AI scene images (${done}/${built.length})…`);
        setScenes([...built]);
      }
    }));
  }

  async function generate() {
    reset();
    setBusy(true);
    try {
      setProgressLabel("Building scenes…"); setProgress(10);
      let built: Scene[] = [];

      if (mode === "image") {
        if (!imageFile) throw new Error("Please upload an image first.");
        const url = URL.createObjectURL(imageFile);
        const img = await loadImage(url);
        const seed = script.trim() || topic.trim() || "Your story";
        const baseScenes = splitIntoScenes(seed, sceneCount);
        const list = baseScenes.length ? baseScenes : topicToScenes(seed, sceneCount);
        const cameras = ["zoom-in", "pan-right", "zoom-out", "pan-left", "tracking", "orbit"];
        built = list.map((s, i) => ({ ...s, bgImage: img, camera: cameras[i % cameras.length] }));
      } else if (mode === "video") {
        if (!videoFile) throw new Error("Please upload a video first.");
        const seed = script.trim() || topic.trim() || "Your video";
        const baseScenes = splitIntoScenes(seed, sceneCount);
        built = baseScenes.length ? baseScenes : topicToScenes(seed, sceneCount);
      } else if (mode === "script") {
        if (!script.trim()) throw new Error("Please paste a script first.");
        const ai = useAIImages ? await fetchStoryboard(script) : null;
        built = ai && ai.length ? ai : splitIntoScenes(script, sceneCount);
      } else if (mode === "faceless") {
        if (!topic.trim()) throw new Error("Please enter a topic first.");
        const seed = `Make a ${sceneCount}-scene short video about: ${topic}. Each scene introduces a fresh angle.`;
        const ai = useAIImages ? await fetchStoryboard(seed) : null;
        built = ai && ai.length ? ai : topicToScenes(topic, sceneCount);
      } else {
        // audio
        if (!audioFile) throw new Error("Please upload an audio file.");
        const seed = (script || topic || "Your story").trim();
        const ai = useAIImages && seed ? await fetchStoryboard(seed) : null;
        built = ai && ai.length ? ai : (splitIntoScenes(seed, sceneCount).length ? splitIntoScenes(seed, sceneCount) : topicToScenes(seed, sceneCount));
      }

      setScenes(built);
      setProgress(20);

      // Optionally generate AI scene background images for text-based modes
      if (useAIImages && (mode === "script" || mode === "faceless" || mode === "audio") && built.some(s => s.imagePrompt)) {
        await fetchSceneImages(built);
      }

      setProgress(100);
      setProgressLabel(`Ready — ${built.length} scenes. Press Play to preview.`);
      toast.success("Scenes ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build scenes");
    } finally {
      setBusy(false);
    }
  }

  // ============== Rendering ==============
  function drawSceneFrame(
    ctx: CanvasRenderingContext2D,
    sc: Scene, t: number, dur: number, w: number, h: number, idx: number, total: number,
    mouthOpen: number,
    videoEl?: HTMLVideoElement | null,
  ) {
    const [accent, bg, fg] = styleCfg.palette;
    const p = Math.max(0, Math.min(1, t / Math.max(0.001, dur)));

    // Background: video element > AI image > procedural gradient
    const needsFaceFilter = (mode === "image" || mode === "video") && facePres !== "exact";
    if (videoEl && videoEl.readyState >= 2) {
      const iw = videoEl.videoWidth, ih = videoEl.videoHeight;
      if (iw && ih) {
        const s = Math.max(w / iw, h / ih);
        const dw = iw * s, dh = ih * s;
        if (needsFaceFilter) ctx.filter = FACE_FILTERS[facePres];
        ctx.drawImage(videoEl, (w - dw) / 2, (h - dh) / 2, dw, dh);
        ctx.filter = "none";
      } else {
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      }
    } else if (sc.bgImage) {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      if (needsFaceFilter) ctx.filter = FACE_FILTERS[facePres];
      drawBackgroundCover(ctx, sc.bgImage, w, h, p, sc.camera);
      ctx.filter = "none";
      // Subtle dark gradient overlay for caption legibility
      const og = ctx.createLinearGradient(0, h * 0.5, 0, h);
      og.addColorStop(0, hexA("#000000", 0));
      og.addColorStop(1, hexA("#000000", 0.55));
      ctx.fillStyle = og; ctx.fillRect(0, 0, w, h);
    } else {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, bg);
      g.addColorStop(1, mixColor(bg, accent, 0.35 + Math.sin(t * 0.5) * 0.08));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        const cx = w * (0.2 + 0.3 * i) + Math.sin((p + i) * Math.PI) * 60;
        const cy = h * (0.3 + 0.15 * i) + Math.cos((p + i) * Math.PI) * 40;
        const rr = Math.min(w, h) * (0.25 + 0.05 * i);
        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        rg.addColorStop(0, hexA(accent, 0.28));
        rg.addColorStop(1, hexA(accent, 0));
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      }
      drawParticles(ctx, w, h, t + idx * 1.7, accent);
      ctx.strokeStyle = hexA(fg, 0.05); ctx.lineWidth = 1;
      const gs = 64;
      for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }

    const enter = Math.min(1, p / 0.18);
    const exit = Math.min(1, (1 - p) / 0.18);
    const trans = sc.transition;

    let glyphX = w / 2;
    let glyphY = h * (avatar !== "none" ? 0.32 : 0.42);
    let glyphScale = 1;
    let glyphAlpha = 1;

    if (trans === "fade")          { glyphAlpha = enter * exit; }
    else if (trans === "slide")    { glyphX = w / 2 + (1 - enter) * w * 0.4 - (1 - exit) * w * 0.4; glyphAlpha = enter * exit; }
    else if (trans === "zoom")     { glyphScale = 0.6 + enter * 0.4 + (1 - exit) * 0.2; glyphAlpha = enter * exit; }
    else if (trans === "kenburns") { glyphScale = 1 + 0.15 * p; glyphX = w / 2 + Math.sin(p * Math.PI) * w * 0.04; glyphAlpha = enter * exit; }
    else if (trans === "typewriter") { glyphScale = 1; glyphAlpha = enter * exit; }

    if (avatar !== "none") {
      const preset = AVATAR_PRESETS[avatar];
      const size = Math.min(w, h) * 0.32;
      drawAvatar(ctx, preset, w / 2, h * 0.48, size, mouthOpen, t);
    } else if (!sc.bgImage && !videoEl) {
      ctx.save();
      ctx.globalAlpha = glyphAlpha;
      ctx.translate(glyphX, glyphY);
      ctx.scale(glyphScale, glyphScale);
      ctx.fillStyle = hexA(accent, 0.85);
      ctx.font = `${Math.round(Math.min(w, h) * 0.32)}px ${styleCfg.font}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(sc.icon, 0, 0);
      ctx.restore();
    }

    // Scene index pill + style label
    ctx.globalAlpha = 1;
    ctx.fillStyle = hexA(fg, 0.85);
    ctx.font = `600 ${Math.round(h * 0.025)}px ${styleCfg.font}`;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, h * 0.04, h * 0.04);
    ctx.textAlign = "right";
    ctx.fillText(STYLE_DEFS[style].label.toUpperCase(), w - h * 0.04, h * 0.04);

    // Optional location/emotion badge (top-left, second row)
    if (sc.location || sc.emotion) {
      const badge = [sc.location, sc.emotion].filter(Boolean).join(" • ");
      ctx.fillStyle = hexA(accent, 0.9);
      ctx.font = `500 ${Math.round(h * 0.022)}px ${styleCfg.font}`;
      ctx.textAlign = "left";
      ctx.fillText(badge.toUpperCase(), h * 0.04, h * 0.04 + Math.round(h * 0.035));
    }

    drawFx(ctx, w, h, t, sc.fx ?? fx, accent, sc.fxIntensity ?? fxIntensity);

    // ============ Caption ============
    const fontSize = Math.round(h * 0.055);
    ctx.font = `700 ${fontSize}px ${styleCfg.font}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    let captionText = sc.caption;
    if (trans === "typewriter") {
      const chars = Math.floor(captionText.length * Math.min(1, p / 0.7));
      captionText = captionText.slice(0, chars);
    }

    const padding = fontSize * 0.6;
    const lines = wrapText(ctx, captionText || " ", w - h * 0.16);
    const lineH = fontSize * 1.15;
    const boxH = lineH * lines.length + padding * 1.2;
    const measured = Math.max(...lines.map(l => ctx.measureText(l).width), 1);
    const boxW = Math.min(w - h * 0.1, measured + padding * 2);

    const boxX = (w - boxW) / 2;
    let boxY = h - boxH - h * 0.08;
    const captionAlpha = enter * exit;
    if (trans === "slide") boxY += (1 - enter) * h * 0.1;

    ctx.globalAlpha = 1;
    ctx.fillStyle = hexA("#000000", 0.55 * captionAlpha);
    roundRect(ctx, boxX, boxY, boxW, boxH, Math.min(24, boxH / 2));
    ctx.fill();

    // Karaoke: highlight current word
    if (karaoke && lines.length === 1) {
      const words = lines[0].split(/\s+/);
      const wordIdx = Math.min(words.length - 1, Math.floor(p * words.length));
      let xCursor = w / 2 - ctx.measureText(lines[0]).width / 2;
      const y = boxY + boxH / 2;
      ctx.textAlign = "left";
      words.forEach((wd, wi) => {
        const wWidth = ctx.measureText(wd + " ").width;
        ctx.fillStyle = wi === wordIdx ? hexA(accent, captionAlpha) : hexA(fg, captionAlpha * 0.9);
        ctx.fillText(wd, xCursor, y);
        xCursor += wWidth;
      });
      ctx.textAlign = "center";
    } else {
      ctx.fillStyle = hexA(fg, captionAlpha);
      lines.forEach((ln, i) => {
        ctx.fillText(ln, w / 2, boxY + padding * 0.6 + lineH * (i + 0.5));
      });
    }

    // Bottom progress bar
    const overall = (idx + p) / Math.max(1, total);
    ctx.fillStyle = hexA(fg, 0.15);
    ctx.fillRect(0, h - 6, w, 6);
    ctx.fillStyle = accent;
    ctx.fillRect(0, h - 6, w * overall, 6);

    ctx.globalAlpha = 1;
  }

  function lipSync(t: number, speaking: boolean) {
    if (!speaking) return 0;
    return Math.max(0, Math.sin(t * 9) * 0.5 + 0.5) * (0.4 + Math.sin(t * 3) * 0.3);
  }

  async function setupVideoEl(file: File): Promise<HTMLVideoElement> {
    const v = document.createElement("video");
    v.src = URL.createObjectURL(file);
    v.crossOrigin = "anonymous";
    v.muted = muteExport;
    v.playsInline = true;
    await new Promise<void>((res) => {
      v.addEventListener("loadedmetadata", () => res(), { once: true });
      v.addEventListener("error", () => res(), { once: true });
    });
    videoElRef.current = v;
    return v;
  }

  async function playPreview() {
    if (scenes.length === 0) { toast.error("Generate scenes first."); return; }
    previewAbortRef.current.abort = true;
    const myToken = { abort: false };
    previewAbortRef.current = myToken;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = styleCfg.w; canvas.height = styleCfg.h;

    const vp = VOICE_PROFILES[voiceHint];
    const voice = pickVoice(voices, vp.hint);

    if (mode === "video" && videoFile) {
      const v = await setupVideoEl(videoFile);
      v.muted = false;
      v.play().catch(() => {});
      const total = v.duration && isFinite(v.duration) ? v.duration : scenes.length * 4;
      const per = total / scenes.length;
      const start = performance.now();
      const loop = () => {
        if (myToken.abort) { v.pause(); return; }
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed >= total) { v.pause(); return; }
        const idx = Math.min(scenes.length - 1, Math.floor(elapsed / per));
        drawSceneFrame(ctx, scenes[idx], elapsed - idx * per, per, canvas.width, canvas.height, idx, scenes.length, 0, v);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      return;
    }

    if (mode === "audio" && audioFile) {
      const audio = new Audio(URL.createObjectURL(audioFile));
      audio.play().catch(() => {});
      const start = performance.now();
      const ready = await new Promise<number>((res) => {
        audio.addEventListener("loadedmetadata", () => res(audio.duration || scenes.length * 4), { once: true });
        audio.addEventListener("error", () => res(scenes.length * 4), { once: true });
      });
      const total = ready;
      const per = total / scenes.length;
      const loop = () => {
        if (myToken.abort) { audio.pause(); return; }
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed >= total) { audio.pause(); return; }
        const idx = Math.min(scenes.length - 1, Math.floor(elapsed / per));
        drawSceneFrame(ctx, scenes[idx], elapsed - idx * per, per, canvas.width, canvas.height, idx, scenes.length, lipSync(elapsed, true));
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      return;
    }

    for (let i = 0; i < scenes.length; i++) {
      if (myToken.abort) return;
      const sc = scenes[i];
      const dur = estimateDuration(sc.narration);
      const start = performance.now();
      const speakP = speak(sc.narration, voice, vp.rate, vp.pitch);
      await new Promise<void>((resolve) => {
        const tick = () => {
          if (myToken.abort) { resolve(); return; }
          const t = (performance.now() - start) / 1000;
          drawSceneFrame(ctx, sc, t, dur, canvas.width, canvas.height, i, scenes.length, lipSync(t, true));
          if (t >= dur) { resolve(); return; }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await Promise.race([speakP, new Promise((r) => setTimeout(r, 1000))]);
    }
  }

  function stopPreview() {
    previewAbortRef.current.abort = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (videoElRef.current) { try { videoElRef.current.pause(); } catch { /* noop */ } }
  }

  async function exportVideo() {
    if (scenes.length === 0) { toast.error("Generate scenes first."); return; }
    previewAbortRef.current.abort = true;
    setExporting(true);
    setExportedUrl(null);
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = styleCfg.w; canvas.height = styleCfg.h;

      const videoStream = canvas.captureStream(30);
      let combinedStream: MediaStream = videoStream;
      let audioEl: HTMLAudioElement | null = null;
      let videoSrcEl: HTMLVideoElement | null = null;
      let audioCtx: AudioContext | null = null;

      if (mode === "audio" && audioFile && !muteExport) {
        audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();
        audioEl = new Audio(URL.createObjectURL(audioFile));
        audioEl.crossOrigin = "anonymous";
        const src = audioCtx.createMediaElementSource(audioEl);
        src.connect(dest);
        combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ]);
      }

      if (mode === "video" && videoFile) {
        videoSrcEl = await setupVideoEl(videoFile);
        if (!muteExport) {
          try {
            audioCtx = new AudioContext();
            const dest = audioCtx.createMediaStreamDestination();
            const src = audioCtx.createMediaElementSource(videoSrcEl);
            src.connect(dest);
            src.connect(audioCtx.destination);
            combinedStream = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...dest.stream.getAudioTracks(),
            ]);
          } catch {
            // ignore — keep silent video
          }
        }
      }

      const candidates = [
        "video/mp4;codecs=h264,aac", "video/mp4",
        "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm",
      ];
      const mime = candidates.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || "";
      const rec = mime
        ? new MediaRecorder(combinedStream, { mimeType: mime, videoBitsPerSecond: 4_000_000 })
        : new MediaRecorder(combinedStream, { videoBitsPerSecond: 4_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<Blob>((res) => {
        rec.onstop = () => res(new Blob(chunks, { type: rec.mimeType || "video/webm" }));
      });

      rec.start(250);

      let total = 0;
      const durations: number[] = [];
      if (mode === "audio" && audioFile) {
        const a = audioEl || new Audio(URL.createObjectURL(audioFile));
        await new Promise<void>((res) => {
          a.addEventListener("loadedmetadata", () => res(), { once: true });
          a.addEventListener("error", () => res(), { once: true });
        });
        total = a.duration && isFinite(a.duration) ? a.duration : scenes.length * 4;
        const per = total / scenes.length;
        for (let i = 0; i < scenes.length; i++) durations.push(per);
        if (audioEl && !muteExport) audioEl.play().catch(() => {});
      } else if (mode === "video" && videoSrcEl) {
        total = videoSrcEl.duration && isFinite(videoSrcEl.duration) ? videoSrcEl.duration : scenes.length * 4;
        const per = total / scenes.length;
        for (let i = 0; i < scenes.length; i++) durations.push(per);
        videoSrcEl.currentTime = 0;
        videoSrcEl.play().catch(() => {});
      } else {
        for (const s of scenes) durations.push(estimateDuration(s.narration));
        total = durations.reduce((a, b) => a + b, 0);
      }

      const startAll = performance.now();
      const offsets: number[] = []; let acc = 0;
      for (const d of durations) { offsets.push(acc); acc += d; }
      setProgressLabel("Rendering…");
      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = (performance.now() - startAll) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / total) * 100)));
          if (elapsed >= total) { resolve(); return; }
          let idx = 0;
          for (let i = 0; i < offsets.length; i++) if (elapsed >= offsets[i]) idx = i;
          const localT = elapsed - offsets[idx];
          drawSceneFrame(ctx, scenes[idx], localT, durations[idx], canvas.width, canvas.height, idx, scenes.length, lipSync(elapsed, true), videoSrcEl);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      rec.stop();
      const blob = await done;
      if (audioCtx) audioCtx.close().catch(() => {});
      if (videoSrcEl) { try { videoSrcEl.pause(); } catch { /* noop */ } }
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      setProgress(100);
      setProgressLabel("Render complete.");
      toast.success("Video ready — download below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const isVertical = styleCfg.h > styleCfg.w;

  return (
    <ToolShell
      eyebrow="Video Studio"
      title="AI Video Studio"
      description="Turn a script, audio, image, video, or topic into a finished video — with AI storyboards, generated scene images, characters, karaoke captions, and MP4 export. 100% free."
    >
      {/* Mode tabs */}
      <div className="glass rounded-2xl p-2 inline-flex flex-wrap gap-1 mb-5">
        {([
          { id: "script", label: "Script → Video", icon: FileText },
          { id: "audio", label: "Audio → Video", icon: AudioLines },
          { id: "image", label: "Image → Video", icon: ImageIcon },
          { id: "video", label: "Video → Video", icon: VideoIcon },
          { id: "faceless", label: "Topic", icon: Wand2 },
        ] as { id: Mode; label: string; icon: typeof FileText }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              mode === id ? "bg-gradient-brand text-primary-foreground shadow-glow" : "hover:bg-accent/40"
            }`}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-5 space-y-4">
          {mode === "script" && (
            <label className="block">
              <div className="text-sm mb-2">Your script, story, or article</div>
              <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={10}
                className="w-full rounded-xl bg-background/40 border border-border p-3 text-sm" />
            </label>
          )}
          {mode === "faceless" && (
            <label className="block">
              <div className="text-sm mb-2">Topic</div>
              <input value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AI for creators"
                className="w-full rounded-xl bg-background/40 border border-border p-3 text-sm" />
              <p className="text-xs text-muted-foreground mt-2">We'll build {sceneCount} scenes automatically.</p>
            </label>
          )}
          {mode === "audio" && (
            <label className="block">
              <div className="text-sm mb-2">Audio file (MP3 / WAV)</div>
              <input type="file" accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm" />
              <p className="text-xs text-muted-foreground mt-2">Your audio will be embedded in the exported video.</p>
              <div className="mt-3 text-sm mb-1">Caption seed (optional)</div>
              <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4}
                placeholder="Paste a rough script or talking points for on-screen captions."
                className="w-full rounded-xl bg-background/40 border border-border p-3 text-sm" />
            </label>
          )}
          {mode === "image" && (
            <label className="block">
              <div className="text-sm mb-2">Image (JPG / PNG)</div>
              <input type="file" accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm" />
              <p className="text-xs text-muted-foreground mt-2">Animated with Ken Burns / pan / zoom across {sceneCount} scenes.</p>
              <div className="mt-3 text-sm mb-1">Caption seed (optional)</div>
              <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4}
                placeholder="Optional script — adds captions and voiceover over the animated image."
                className="w-full rounded-xl bg-background/40 border border-border p-3 text-sm" />
            </label>
          )}
          {mode === "video" && (
            <label className="block">
              <div className="text-sm mb-2">Video file (MP4 / WebM)</div>
              <input type="file" accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm" />
              <p className="text-xs text-muted-foreground mt-2">Plays your video with overlaid captions, scene markers, and style frame.</p>
              <div className="mt-3 text-sm mb-1">Caption seed (optional)</div>
              <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4}
                placeholder="Optional script — overlays as captions across the video."
                className="w-full rounded-xl bg-background/40 border border-border p-3 text-sm" />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Style</div>
              <select value={style} onChange={(e) => setStyle(e.target.value as Style)}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm">
                {Object.entries(STYLE_DEFS).map(([id, s]) => (
                  <option key={id} value={id}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Aspect ratio</div>
              <select value={ratio} onChange={(e) => setRatio(e.target.value as Ratio)}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm">
                <option value="auto">Auto (from style)</option>
                <option value="16:9">Horizontal 16:9</option>
                <option value="9:16">Vertical 9:16</option>
                <option value="1:1">Square 1:1</option>
              </select>
            </label>
            <label className="block col-span-2">
              <div className="text-xs text-muted-foreground mb-1 inline-flex items-center gap-1.5"><User className="size-3" /> AI Character</div>
              <select value={avatar} onChange={(e) => setAvatar(e.target.value as Avatar)}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm">
                <option value="none">None (clean visuals)</option>
                {Object.entries(AVATAR_PRESETS).map(([id, p]) => (
                  <option key={id} value={id}>{p.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Animated presenter with lip-sync, blink, and gestures.</p>
            </label>
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Scenes</div>
              <input type="number" min={3} max={12} value={sceneCount}
                onChange={(e) => setSceneCount(Math.min(12, Math.max(3, Number(e.target.value) || 6)))}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm" />
            </label>
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Voice (preview)</div>
              <select value={voiceHint} onChange={(e) => setVoiceHint(e.target.value as VoiceProfile)}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm">
                {Object.keys(VOICE_PROFILES).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <label className="block col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Special FX overlay</div>
              <select value={fx} onChange={(e) => setFx(e.target.value as Fx)}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm">
                <option value="none">None</option>
                <option value="rain">Rain</option>
                <option value="snow">Snow</option>
                <option value="fire">Fire</option>
                <option value="smoke">Smoke</option>
                <option value="sparkles">Sparkles</option>
                <option value="confetti">Confetti</option>
                <option value="magic">Magic particles</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm col-span-2">
              <input type="checkbox" checked={useAIImages} onChange={(e) => setUseAIImages(e.target.checked)} />
              <span>AI storyboard + generated scene images <span className="text-muted-foreground">(text modes — uses free AI credits)</span></span>
            </label>
            <label className="flex items-center gap-2 text-sm col-span-2">
              <input type="checkbox" checked={karaoke} onChange={(e) => setKaraoke(e.target.checked)} />
              Karaoke captions (highlight current word)
            </label>

            {(mode === "audio" || mode === "video") && (
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input type="checkbox" checked={muteExport} onChange={(e) => setMuteExport(e.target.checked)} />
                Mute source audio in export
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={generate} disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-50">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {busy ? "Working…" : "Generate scenes"}
            </button>
            <button onClick={playPreview} disabled={scenes.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-accent/40 disabled:opacity-50">
              <Play className="size-4" /> Preview
            </button>
            <button onClick={stopPreview}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm hover:bg-accent/40">
              <Square className="size-4" /> Stop
            </button>
            <button onClick={exportVideo} disabled={exporting || scenes.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-accent/40 disabled:opacity-50">
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <Film className="size-4" />}
              {exporting ? "Rendering…" : "Export MP4"}
            </button>
          </div>

          {(busy || exporting || progress > 0) && (
            <div>
              <div className="h-2 rounded-full bg-accent/30 overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">{progressLabel || `${progress}%`}</div>
            </div>
          )}

          {exportedUrl && (
            <a href={exportedUrl} download={`creatorhub-video.${exportedUrl.includes("mp4") ? "mp4" : "webm"}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-primary-foreground text-sm font-medium shadow-glow">
              <Download className="size-4" /> Download video
            </a>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass rounded-2xl p-4">
            <div className={`mx-auto bg-black rounded-xl overflow-hidden ${isVertical ? "max-w-[320px]" : "w-full"}`}
              style={{ aspectRatio: `${styleCfg.w} / ${styleCfg.h}` }}>
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Preview uses your browser's built-in voice. Exports include video + uploaded audio/video source.
            </p>
          </div>

          {scenes.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <div className="text-sm font-medium mb-3">Storyboard ({scenes.length} scenes)</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {scenes.map((s, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 text-xs overflow-hidden">
                    {s.bgImage && (
                      <img src={s.bgImage.src} alt="" className="w-full h-20 object-cover rounded-md mb-2" />
                    )}
                    <div className="text-muted-foreground mb-1 flex justify-between">
                      <span>Scene {i + 1}</span>
                      <span className="uppercase tracking-wider">{s.camera || s.transition}</span>
                    </div>
                    <div className="font-medium mb-1 line-clamp-2">{s.caption}</div>
                    {(s.characters?.length || s.location || s.emotion) && (
                      <div className="text-[10px] text-muted-foreground mb-1 line-clamp-2">
                        {[s.characters?.join(", "), s.location, s.emotion].filter(Boolean).join(" • ")}
                      </div>
                    )}
                    <div className="text-muted-foreground line-clamp-3">{s.narration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
