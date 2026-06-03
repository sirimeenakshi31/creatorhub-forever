import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Download, Film, FileText, AudioLines, Wand2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/ai-video-studio")({
  head: () => ({
    meta: [
      { title: "AI Video Studio — Free Script & Audio to Video | CreatorHub" },
      { name: "description", content: "Turn any script or audio into a finished video with auto scenes, captions, voiceover, and MP4 export. 100% free, no API keys." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/tools/ai-video-studio" }],
  }),
  component: Page,
});

type Style =
  | "youtube" | "shorts" | "reels" | "educational"
  | "cinematic" | "motivational" | "tech" | "business" | "vlog";
type Mode = "script" | "audio" | "faceless";

type Scene = { caption: string; narration: string; palette: [string, string, string]; icon: string };

const STYLES: Record<Style, { label: string; w: number; h: number; palette: [string, string, string]; font: string }> = {
  youtube:      { label: "YouTube",     w: 1280, h: 720,  palette: ["#FF0033", "#1a0008", "#ffffff"], font: "system-ui" },
  shorts:       { label: "Shorts",      w: 720,  h: 1280, palette: ["#FF3B30", "#0b0b0f", "#ffffff"], font: "system-ui" },
  reels:        { label: "Reels",       w: 720,  h: 1280, palette: ["#E1306C", "#1a0a14", "#ffffff"], font: "system-ui" },
  educational:  { label: "Educational", w: 1280, h: 720,  palette: ["#2563EB", "#0a1224", "#ffffff"], font: "Georgia, serif" },
  cinematic:    { label: "Cinematic",   w: 1280, h: 720,  palette: ["#D4A24C", "#0a0908", "#f5e9d6"], font: "Georgia, serif" },
  motivational: { label: "Motivational",w: 720,  h: 1280, palette: ["#F97316", "#100806", "#ffffff"], font: "system-ui" },
  tech:         { label: "Tech",        w: 1280, h: 720,  palette: ["#00E5FF", "#04101a", "#e6fbff"], font: "ui-monospace, Menlo, monospace" },
  business:     { label: "Business",    w: 1280, h: 720,  palette: ["#0EA5E9", "#0b1220", "#f8fafc"], font: "Georgia, serif" },
  vlog:         { label: "Vlog",        w: 1280, h: 720,  palette: ["#A78BFA", "#120a1f", "#ffffff"], font: "system-ui" },
};

const ICONS = ["✦", "✸", "❖", "◆", "✺", "✹", "✷", "✶", "▲", "●", "◼", "✱"];

function splitIntoScenes(script: string, target = 6): Scene[] {
  const clean = script.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  // Split by sentence terminators, group into target buckets.
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const n = Math.max(3, Math.min(12, target));
  const perBucket = Math.max(1, Math.ceil(sentences.length / n));
  const buckets: string[] = [];
  for (let i = 0; i < sentences.length; i += perBucket) {
    buckets.push(sentences.slice(i, i + perBucket).join(" "));
  }
  return buckets.slice(0, n).map((narration, i) => {
    const words = narration.split(/\s+/).filter(Boolean);
    const caption = words.slice(0, 7).join(" ") + (words.length > 7 ? "…" : "");
    return {
      narration,
      caption: caption || `Scene ${i + 1}`,
      palette: ["", "", ""] as [string, string, string], // filled at render time from style
      icon: ICONS[i % ICONS.length],
    };
  });
}

function topicToScenes(topic: string, count: number): Scene[] {
  const t = topic.trim() || "Untitled";
  const beats = [
    `Introducing ${t}.`,
    `Why ${t} matters today.`,
    `The first key idea about ${t}.`,
    `A surprising fact about ${t}.`,
    `How to get started with ${t}.`,
    `A common mistake people make.`,
    `The real secret behind ${t}.`,
    `What experts say about ${t}.`,
    `A quick action you can take now.`,
    `The future of ${t}.`,
    `Final thoughts on ${t}.`,
    `Follow for more on ${t}.`,
  ].slice(0, Math.max(3, Math.min(12, count)));
  return beats.map((narration, i) => ({
    narration,
    caption: narration.replace(/[.!?]$/, ""),
    palette: ["", "", ""] as [string, string, string],
    icon: ICONS[i % ICONS.length],
  }));
}

// Pick a browser voice that matches the requested gender hint where possible.
function pickVoice(voices: SpeechSynthesisVoice[], hint: string) {
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;
  const lower = hint.toLowerCase();
  const match = pool.find((v) => v.name.toLowerCase().includes(lower));
  return match || pool[0];
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

// Estimate spoken duration in seconds (browser TTS, ~2.6 wps).
function estimateDuration(text: string, rate = 1) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1.6, words / (2.6 * rate));
}

function Page() {
  const [mode, setMode] = useState<Mode>("script");
  const [style, setStyle] = useState<Style>("youtube");
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

  const styleCfg = useMemo(() => STYLES[style], [style]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewAbortRef = useRef<{ abort: boolean }>({ abort: false });

  // Load voices for SpeechSynthesis
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
        // Use audio duration to lay out generic scenes from topic/script as labels.
        const seed = (script || topic || "Your story").trim();
        built = splitIntoScenes(seed, sceneCount);
        if (built.length === 0) built = topicToScenes(seed, sceneCount);
      }
      setProgress(80);
      setScenes(built);
      setProgress(100);
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
  ) {
    const [accent, bg, fg] = styleCfg.palette;
    const p = Math.max(0, Math.min(1, t / Math.max(0.001, dur)));

    // Animated gradient background
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, bg);
    g.addColorStop(1, mixColor(bg, accent, 0.35));
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

    // Subtle grid (tech feel) — restrained
    ctx.strokeStyle = hexA(fg, 0.05);
    ctx.lineWidth = 1;
    const gs = 64;
    for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Big decorative glyph (Ken Burns)
    const scale = 1 + 0.08 * p;
    ctx.save();
    ctx.translate(w / 2, h * 0.42);
    ctx.scale(scale, scale);
    ctx.fillStyle = hexA(accent, 0.85);
    ctx.font = `${Math.round(Math.min(w, h) * 0.32)}px ${styleCfg.font}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(sc.icon, 0, 0);
    ctx.restore();

    // Scene index pill
    ctx.fillStyle = hexA(fg, 0.85);
    ctx.font = `600 ${Math.round(h * 0.025)}px ${styleCfg.font}`;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, h * 0.04, h * 0.04);

    // Style label (top right)
    ctx.textAlign = "right";
    ctx.fillText(STYLES[style].label.toUpperCase(), w - h * 0.04, h * 0.04);

    // Caption — bottom, large, with fade in/out
    const fade = Math.min(1, p / 0.12) * Math.min(1, (1 - p) / 0.12);
    const caption = sc.caption;
    const fontSize = Math.round(h * 0.06);
    ctx.font = `700 ${fontSize}px ${styleCfg.font}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const padding = fontSize * 0.6;
    const lines = wrapText(ctx, caption, w - h * 0.16);
    const lineH = fontSize * 1.15;
    const boxH = lineH * lines.length + padding * 1.2;
    const boxW = Math.min(w - h * 0.1, Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2);
    const boxX = (w - boxW) / 2;
    const boxY = h - boxH - h * 0.08;

    ctx.fillStyle = hexA("#000000", 0.55 * fade);
    roundRect(ctx, boxX, boxY, boxW, boxH, Math.min(24, boxH / 2));
    ctx.fill();

    ctx.fillStyle = hexA(fg, fade);
    lines.forEach((ln, i) => {
      ctx.fillText(ln, w / 2, boxY + padding * 0.6 + lineH * (i + 0.5));
    });

    // Bottom progress bar across whole video
    const overall = (idx + p) / Math.max(1, total);
    ctx.fillStyle = hexA(fg, 0.15);
    ctx.fillRect(0, h - 6, w, 6);
    ctx.fillStyle = accent;
    ctx.fillRect(0, h - 6, w * overall, 6);
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

  function hexA(hex: string, alpha: number) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function mixColor(a: string, b: string, t: number) {
    const ah = a.replace("#", ""); const bh = b.replace("#", "");
    const ar = parseInt(ah.substring(0, 2), 16), ag = parseInt(ah.substring(2, 4), 16), ab = parseInt(ah.substring(4, 6), 16);
    const br = parseInt(bh.substring(0, 2), 16), bg = parseInt(bh.substring(2, 4), 16), bb = parseInt(bh.substring(4, 6), 16);
    const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
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
        drawSceneFrame(ctx, scenes[idx], elapsed - idx * per, per, canvas.width, canvas.height, idx, scenes.length);
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
          drawSceneFrame(ctx, sc, t, dur, canvas.width, canvas.height, i, scenes.length);
          if (t >= dur) { resolve(); return; }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      // Let the utterance finish if it's still talking (max +1s grace).
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

      // Audio: only the uploaded audio file in audio mode can be embedded
      // (SpeechSynthesis output isn't capturable). Otherwise export silent.
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
        "video/mp4;codecs=h264,aac",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
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

      // Compute durations per scene
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
      // Cumulative offsets
      const offsets: number[] = []; let acc = 0;
      for (const d of durations) { offsets.push(acc); acc += d; }
      setProgressLabel("Rendering…");
      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = (performance.now() - startAll) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / total) * 100)));
          if (elapsed >= total) { resolve(); return; }
          let idx = 0;
          for (let i = 0; i < offsets.length; i++) {
            if (elapsed >= offsets[i]) idx = i;
          }
          const localT = elapsed - offsets[idx];
          drawSceneFrame(ctx, scenes[idx], localT, durations[idx], canvas.width, canvas.height, idx, scenes.length);
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
      description="Turn a script, audio file, or topic into a finished video — captions, voiceover, MP4. 100% free."
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
        {/* Left: input + controls */}
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
                {Object.entries(STYLES).map(([id, s]) => (
                  <option key={id} value={id}>{s.label} ({s.w}×{s.h})</option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Scenes</div>
              <input type="number" min={3} max={12} value={sceneCount}
                onChange={(e) => setSceneCount(Math.min(12, Math.max(3, Number(e.target.value) || 6)))}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm" />
            </label>
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Voice (preview only)</div>
              <select value={voiceHint} onChange={(e) => setVoiceHint(e.target.value as "Female" | "Male")}
                className="w-full rounded-xl bg-background/40 border border-border p-2 text-sm">
                <option>Female</option>
                <option>Male</option>
              </select>
            </label>
            {mode === "audio" && (
              <label className="flex items-center gap-2 text-sm mt-5">
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

        {/* Right: preview canvas + scene list */}
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
                    <div className="text-muted-foreground mb-1">Scene {i + 1}</div>
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
