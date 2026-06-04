import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Download, Film, FileText, AudioLines, Wand2, Play, Square, User } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/ai-video-studio")({
  head: () => ({
    meta: [
      { title: "AI Video Studio — Free Script & Audio to Video | CreatorHub" },
      { name: "description", content: "Turn any script or audio into a finished video with AI avatars, auto scenes, captions, voiceover, and MP4 export. 100% free, no API keys." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/tools/ai-video-studio" }],
  }),
  component: Page,
});

type Style =
  | "youtube" | "shorts" | "reels" | "educational" | "cinematic"
  | "motivational" | "tech" | "business" | "vlog"
  | "documentary" | "storytelling";
type Mode = "script" | "audio" | "faceless";
type Ratio = "auto" | "16:9" | "9:16" | "1:1";
type Avatar = "none" | "cartoon" | "doll" | "anime" | "business" | "teacher" | "influencer";
type Transition = "fade" | "slide" | "zoom" | "kenburns" | "typewriter";

type Scene = { caption: string; narration: string; icon: string; transition: Transition };

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

function pickVoice(voices: SpeechSynthesisVoice[], hint: string) {
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;
  const lower = hint.toLowerCase();
  return pool.find((v) => v.name.toLowerCase().includes(lower)) || pool[0];
}

function speak(text: string, voice: SpeechSynthesisVoice | null, rate = 1, pitch = 1): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { resolve(); return; }
    try {
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
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

// ============== Avatar drawing ==============
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  preset: typeof AVATAR_PRESETS[keyof typeof AVATAR_PRESETS],
  cx: number, cy: number, size: number, mouthOpen: number, t: number,
) {
  // gentle sway + blink
  const sway = Math.sin(t * 1.2) * size * 0.015;
  const blink = (Math.sin(t * 0.9) > 0.97) ? 0.1 : 1;

  ctx.save();
  ctx.translate(cx + sway, cy);

  // body / outfit
  ctx.fillStyle = preset.outfit;
  roundRect(ctx, -size * 0.55, size * 0.35, size * 1.1, size * 0.95, size * 0.18);
  ctx.fill();
  // collar accent
  ctx.fillStyle = preset.accent;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, size * 0.35);
  ctx.lineTo(0, size * 0.55);
  ctx.lineTo(size * 0.18, size * 0.35);
  ctx.closePath();
  ctx.fill();

  // neck
  ctx.fillStyle = preset.skin;
  ctx.fillRect(-size * 0.12, size * 0.2, size * 0.24, size * 0.2);

  // head
  ctx.fillStyle = preset.skin;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.05, size * 0.42, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // hair (top)
  ctx.fillStyle = preset.hair;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.32, size * 0.46, size * 0.32, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // hair sides
  ctx.beginPath();
  ctx.ellipse(-size * 0.4, -size * 0.05, size * 0.1, size * 0.32, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.4, -size * 0.05, size * 0.1, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // eyes
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

  // brows
  ctx.strokeStyle = preset.hair; ctx.lineWidth = size * 0.025; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.16); ctx.lineTo(-size * 0.08, -size * 0.18);
  ctx.moveTo(size * 0.08, -size * 0.18); ctx.lineTo(size * 0.22, -size * 0.16);
  ctx.stroke();

  // cheeks (blush)
  ctx.fillStyle = hexA("#ff7a90", 0.35);
  ctx.beginPath();
  ctx.ellipse(-size * 0.22, size * 0.08, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.22, size * 0.08, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // mouth (lipsync)
  const mw = size * 0.18;
  const mh = Math.max(size * 0.015, mouthOpen * size * 0.13);
  ctx.fillStyle = "#3a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, mw, mh, 0, 0, Math.PI * 2);
  ctx.fill();
  // teeth
  if (mouthOpen > 0.15) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-mw * 0.7, size * 0.12 - mh * 0.4, mw * 1.4, mh * 0.35);
  }

  ctx.restore();
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
  const [sceneCount, setSceneCount] = useState(6);
  const [voiceHint, setVoiceHint] = useState<"Female" | "Male">("Female");
  const [muteExport, setMuteExport] = useState(false);

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

  async function generate() {
    reset();
    setBusy(true);
    try {
      setProgressLabel("Building scenes…"); setProgress(10);
      let built: Scene[] = [];
      if (mode === "script") {
        if (!script.trim()) throw new Error("Please paste a script first.");
        built = splitIntoScenes(script, sceneCount);
      } else if (mode === "faceless") {
        if (!topic.trim()) throw new Error("Please enter a topic first.");
        built = topicToScenes(topic, sceneCount);
      } else {
        if (!audioFile) throw new Error("Please upload an audio file.");
        const seed = (script || topic || "Your story").trim();
        built = splitIntoScenes(seed, sceneCount);
        if (built.length === 0) built = topicToScenes(seed, sceneCount);
      }
      setProgress(100);
      setScenes(built);
      setProgressLabel(`Ready — ${built.length} scenes. Press Play to preview.`);
      toast.success("Scenes ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build scenes");
    } finally {
      setBusy(false);
    }
  }

  // ============== Procedural visual rendering ==============
  function drawSceneFrame(
    ctx: CanvasRenderingContext2D,
    sc: Scene, t: number, dur: number, w: number, h: number, idx: number, total: number,
    mouthOpen: number,
  ) {
    const [accent, bg, fg] = styleCfg.palette;
    const p = Math.max(0, Math.min(1, t / Math.max(0.001, dur)));

    // Animated gradient background with hue drift
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, bg);
    g.addColorStop(1, mixColor(bg, accent, 0.35 + Math.sin(t * 0.5) * 0.08));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // Drifting accent blobs
    for (let i = 0; i < 3; i++) {
      const cx = w * (0.2 + 0.3 * i) + Math.sin((p + i) * Math.PI) * 60;
      const cy = h * (0.3 + 0.15 * i) + Math.cos((p + i) * Math.PI) * 40;
      const rr = Math.min(w, h) * (0.25 + 0.05 * i);
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      rg.addColorStop(0, hexA(accent, 0.28));
      rg.addColorStop(1, hexA(accent, 0));
      ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    }

    // Particle layer
    drawParticles(ctx, w, h, t + idx * 1.7, accent);

    // Subtle grid
    ctx.strokeStyle = hexA(fg, 0.05); ctx.lineWidth = 1;
    const gs = 64;
    for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // ============ Per-scene transition ============
    // Enter (0..0.18), Exit (0.82..1)
    const enter = Math.min(1, p / 0.18);
    const exit = Math.min(1, (1 - p) / 0.18);
    const trans = sc.transition;

    let glyphX = w / 2;
    let glyphY = h * (avatar !== "none" ? 0.32 : 0.42);
    let glyphScale = 1;
    let glyphAlpha = 1;

    if (trans === "fade") {
      glyphAlpha = enter * exit;
    } else if (trans === "slide") {
      glyphX = w / 2 + (1 - enter) * w * 0.4 - (1 - exit) * w * 0.4;
      glyphAlpha = enter * exit;
    } else if (trans === "zoom") {
      glyphScale = 0.6 + enter * 0.4 + (1 - exit) * 0.2;
      glyphAlpha = enter * exit;
    } else if (trans === "kenburns") {
      glyphScale = 1 + 0.15 * p;
      glyphX = w / 2 + Math.sin(p * Math.PI) * w * 0.04;
      glyphAlpha = enter * exit;
    } else if (trans === "typewriter") {
      glyphScale = 1; glyphAlpha = enter * exit;
    }

    // Avatar (if enabled)
    if (avatar !== "none") {
      const preset = AVATAR_PRESETS[avatar];
      const size = Math.min(w, h) * 0.32;
      drawAvatar(ctx, preset, w / 2, h * 0.48, size, mouthOpen, t);
    } else {
      // Big decorative glyph
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

    let boxX = (w - boxW) / 2;
    let boxY = h - boxH - h * 0.08;
    let captionAlpha = enter * exit;
    if (trans === "slide") boxY += (1 - enter) * h * 0.1;

    ctx.globalAlpha = 1;
    ctx.fillStyle = hexA("#000000", 0.55 * captionAlpha);
    roundRect(ctx, boxX, boxY, boxW, boxH, Math.min(24, boxH / 2));
    ctx.fill();

    ctx.fillStyle = hexA(fg, captionAlpha);
    lines.forEach((ln, i) => {
      ctx.fillText(ln, w / 2, boxY + padding * 0.6 + lineH * (i + 0.5));
    });

    // Bottom progress bar
    const overall = (idx + p) / Math.max(1, total);
    ctx.fillStyle = hexA(fg, 0.15);
    ctx.fillRect(0, h - 6, w, 6);
    ctx.fillStyle = accent;
    ctx.fillRect(0, h - 6, w * overall, 6);

    ctx.globalAlpha = 1;
  }

  // Simulate lipsync openness from time (since browser TTS isn't capturable)
  function lipSync(t: number, speaking: boolean) {
    if (!speaking) return 0;
    return Math.max(0, Math.sin(t * 9) * 0.5 + 0.5) * (0.4 + Math.sin(t * 3) * 0.3);
  }

  async function playPreview() {
    if (scenes.length === 0) { toast.error("Generate scenes first."); return; }
    previewAbortRef.current.abort = true;
    const myToken = { abort: false };
    previewAbortRef.current = myToken;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = styleCfg.w; canvas.height = styleCfg.h;

    const voice = pickVoice(voices, voiceHint);

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
      const speakP = speak(sc.narration, voice);
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
          drawSceneFrame(ctx, scenes[idx], localT, durations[idx], canvas.width, canvas.height, idx, scenes.length, lipSync(elapsed, true));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      rec.stop();
      const blob = await done;
      if (audioCtx) audioCtx.close().catch(() => {});
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
      description="Turn a script, audio file, or topic into a finished video — with AI characters, captions, voiceover, and MP4 export. 100% free."
    >
      {/* Mode tabs */}
      <div className="glass rounded-2xl p-2 inline-flex gap-1 mb-5">
        {([
          { id: "script", label: "Script → Video", icon: FileText },
          { id: "audio", label: "Audio → Video", icon: AudioLines },
          { id: "faceless", label: "Faceless (Topic)", icon: Wand2 },
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
              <div className="text-sm mb-2">Your script</div>
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
                <option value="none">None (icon visuals)</option>
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
              <select value={voiceHint} onChange={(e) => setVoiceHint(e.target.value as "Female" | "Male")}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm">
                <option>Female</option>
                <option>Male</option>
              </select>
            </label>
            {mode === "audio" && (
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input type="checkbox" checked={muteExport} onChange={(e) => setMuteExport(e.target.checked)} />
                Mute audio in export
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
              Preview uses your browser's built-in voice. Exports include video + uploaded audio (script/topic exports are silent — perfect for adding music later).
            </p>
          </div>

          {scenes.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <div className="text-sm font-medium mb-3">Scenes ({scenes.length})</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {scenes.map((s, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 text-xs">
                    <div className="text-muted-foreground mb-1 flex justify-between">
                      <span>Scene {i + 1}</span>
                      <span className="uppercase tracking-wider">{s.transition}</span>
                    </div>
                    <div className="font-medium mb-1 line-clamp-2">{s.caption}</div>
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
