import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Download, Film, FileText, AudioLines, Wand2, Play } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/ai-video-studio")({
  head: () => ({
    meta: [
      { title: "AI Video Studio — Script & Audio to Video | CreatorHub" },
      { name: "description", content: "Turn any script or audio file into a finished video with AI scenes, voiceover, captions, transitions, and MP4 export." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/tools/ai-video-studio" }],
  }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

type Style = "cinematic" | "youtube" | "reels" | "shorts" | "educational";
type Mode = "script" | "audio";
type Quality = "slideshow" | "replicate";

type Scene = {
  narration: string;
  caption: string;
  imagePrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
};

const STYLES: { id: Style; label: string; aspect: "16:9" | "9:16"; w: number; h: number }[] = [
  { id: "cinematic", label: "Cinematic", aspect: "16:9", w: 1280, h: 720 },
  { id: "youtube", label: "YouTube", aspect: "16:9", w: 1280, h: 720 },
  { id: "educational", label: "Educational", aspect: "16:9", w: 1280, h: 720 },
  { id: "reels", label: "Reels", aspect: "9:16", w: 720, h: 1280 },
  { id: "shorts", label: "Shorts", aspect: "9:16", w: 720, h: 1280 },
];

const VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah (warm female)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", label: "George (calm male)" },
  { id: "nPczCjzI2devNBz1zQrb", label: "Brian (deep male)" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", label: "Alice (bright female)" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam (young male)" },
];

async function audioBlobDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const a = new Audio();
    a.src = url;
    a.addEventListener("loadedmetadata", () => {
      const d = isFinite(a.duration) && a.duration > 0 ? a.duration : 3;
      URL.revokeObjectURL(url);
      resolve(d);
    });
    a.addEventListener("error", () => { URL.revokeObjectURL(url); resolve(3); });
  });
}

function Page() {
  const [mode, setMode] = useState<Mode>("script");
  const [style, setStyle] = useState<Style>("cinematic");
  const [quality, setQuality] = useState<Quality>("slideshow");
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [script, setScript] = useState("In a world where ideas move at the speed of light, creators reshape what's possible. Every voice finds its stage. Every story finds its audience. This is the new era of creation.");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sceneCount, setSceneCount] = useState(6);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(null); // for audio mode
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const styleCfg = useMemo(() => STYLES.find((s) => s.id === style)!, [style]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const reset = () => {
    setScenes([]);
    setMasterAudioUrl(null);
    setExportedUrl(null);
    setProgress(0);
    setProgressLabel("");
  };

  // === Pipeline: script → scenes ===
  async function runScriptPipeline() {
    reset();
    setBusy(true);
    try {
      setProgressLabel("Splitting script into scenes…"); setProgress(5);
      const sRes = await fetch("/api/video/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, style, sceneCount }),
      });
      const sData = await sRes.json();
      if (!sRes.ok) throw new Error(sData?.error || "Scene split failed");
      const baseScenes: Scene[] = sData.scenes;
      setScenes(baseScenes);

      const total = baseScenes.length;
      const updated: Scene[] = [...baseScenes];

      for (let i = 0; i < total; i++) {
        const scene = updated[i];
        // Visual
        setProgressLabel(`Scene ${i + 1}/${total}: generating visual…`);
        setProgress(10 + (i / total) * 70);
        if (quality === "replicate") {
          const vr = await fetch("/api/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: scene.imagePrompt }),
          });
          const vd = await vr.json();
          if (!vr.ok) throw new Error(vd?.error || "Replicate failed");
          scene.videoUrl = vd.url;
        } else {
          const ir = await fetch("/api/ai/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: scene.imagePrompt }),
          });
          const id = await ir.json();
          if (!ir.ok) throw new Error(id?.error || "Image failed");
          scene.imageUrl = id.url;
        }

        // Voiceover (per scene)
        setProgressLabel(`Scene ${i + 1}/${total}: generating voiceover…`);
        const ar = await fetch("/api/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: scene.narration, voiceId }),
        });
        if (!ar.ok) {
          const ad = await ar.json().catch(() => ({}));
          throw new Error(ad?.error || "TTS failed");
        }
        const blob = await ar.blob();
        scene.audioUrl = URL.createObjectURL(blob);
        scene.audioDuration = await audioBlobDuration(blob);

        updated[i] = { ...scene };
        setScenes([...updated]);
      }

      setProgress(100);
      setProgressLabel("Done — preview below.");
      toast.success("Video assembled. Press Play to preview.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  // === Pipeline: audio → scenes ===
  async function runAudioPipeline() {
    if (!audioFile) { toast.error("Please upload an audio file first."); return; }
    reset();
    setBusy(true);
    try {
      // Master audio URL
      const masterUrl = URL.createObjectURL(audioFile);
      setMasterAudioUrl(masterUrl);

      setProgressLabel("Transcribing audio…"); setProgress(8);
      const fd = new FormData();
      fd.append("file", audioFile);
      const tr = await fetch("/api/transcribe", { method: "POST", body: fd });
      const td = await tr.json();
      if (!tr.ok) throw new Error(td?.error || "Transcription failed");
      const transcript: string = td.text || "";
      if (!transcript.trim()) throw new Error("Empty transcription");

      setProgressLabel("Splitting transcript into scenes…"); setProgress(20);
      const sRes = await fetch("/api/video/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: transcript, style, sceneCount }),
      });
      const sData = await sRes.json();
      if (!sRes.ok) throw new Error(sData?.error || "Scene split failed");
      const baseScenes: Scene[] = sData.scenes;
      setScenes(baseScenes);

      const total = baseScenes.length;
      const updated: Scene[] = [...baseScenes];
      for (let i = 0; i < total; i++) {
        const scene = updated[i];
        setProgressLabel(`Scene ${i + 1}/${total}: generating visual…`);
        setProgress(25 + (i / total) * 70);
        if (quality === "replicate") {
          const vr = await fetch("/api/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: scene.imagePrompt }),
          });
          const vd = await vr.json();
          if (!vr.ok) throw new Error(vd?.error || "Replicate failed");
          scene.videoUrl = vd.url;
        } else {
          const ir = await fetch("/api/ai/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: scene.imagePrompt }),
          });
          const id = await ir.json();
          if (!ir.ok) throw new Error(id?.error || "Image failed");
          scene.imageUrl = id.url;
        }
        updated[i] = { ...scene };
        setScenes([...updated]);
      }
      setProgress(100);
      setProgressLabel("Done — preview below.");
      toast.success("Video assembled. Press Play to preview.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  // === Preview/Export via canvas+MediaRecorder ===
  // Loaded image cache
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  async function loadImage(url: string): Promise<HTMLImageElement> {
    if (imgCacheRef.current.has(url)) return imgCacheRef.current.get(url)!;
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => { imgCacheRef.current.set(url, im); resolve(im); };
      im.onerror = reject;
      im.src = url;
    });
  }

  function drawFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, caption: string, t: number, dur: number, w: number, h: number) {
    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    if (img) {
      // Ken Burns: scale 1 -> 1.08 over scene
      const p = Math.min(1, Math.max(0, t / Math.max(0.001, dur)));
      const scale = 1.04 + 0.06 * p;
      const iw = img.width, ih = img.height;
      const ratio = Math.max(w / iw, h / ih) * scale;
      const dw = iw * ratio, dh = ih * ratio;
      const dx = (w - dw) / 2 + (Math.sin(p * Math.PI) - 0.5) * 20;
      const dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      // fade-in/out
      const fade = Math.min(1, p / 0.15) * Math.min(1, (1 - p) / 0.15);
      if (fade < 1) {
        ctx.fillStyle = `rgba(0,0,0,${1 - fade})`;
        ctx.fillRect(0, 0, w, h);
      }
    }
    // Caption pill
    if (caption) {
      const fontSize = Math.round(h * 0.045);
      ctx.font = `600 ${fontSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const padding = fontSize * 0.7;
      const textWidth = ctx.measureText(caption).width;
      const boxW = Math.min(w - 80, textWidth + padding * 2);
      const boxH = fontSize + padding;
      const boxX = (w - boxW) / 2;
      const boxY = h - boxH - h * 0.07;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      const r = boxH / 2;
      ctx.beginPath();
      ctx.moveTo(boxX + r, boxY);
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, r);
      ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, r);
      ctx.arcTo(boxX, boxY + boxH, boxX, boxY, r);
      ctx.arcTo(boxX, boxY, boxX + boxW, boxY, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(caption, w / 2, boxY + boxH / 2 + 1);
    }
  }

  // Live preview (not recording)
  const previewAbortRef = useRef<{ abort: boolean }>({ abort: false });
  async function playPreview() {
    if (scenes.length === 0) return;
    previewAbortRef.current.abort = true;
    const myToken = { abort: false };
    previewAbortRef.current = myToken;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = styleCfg.w;
    canvas.height = styleCfg.h;

    // Pre-load images
    for (const s of scenes) { if (s.imageUrl) { try { await loadImage(s.imageUrl); } catch { /* ignore */ } } }

    if (mode === "audio" && masterAudioUrl) {
      // Single master audio playback while looping through scenes by total duration
      const audio = new Audio(masterAudioUrl);
      await audio.play().catch(() => {});
      const total = audio.duration || scenes.length * 4;
      const per = total / scenes.length;
      const start = performance.now();
      const tick = () => {
        if (myToken.abort) { audio.pause(); return; }
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed >= total) { audio.pause(); return; }
        const idx = Math.min(scenes.length - 1, Math.floor(elapsed / per));
        const localT = elapsed - idx * per;
        const sc = scenes[idx];
        const img = sc.imageUrl ? imgCacheRef.current.get(sc.imageUrl) || null : null;
        drawFrame(ctx, img, sc.caption, localT, per, canvas.width, canvas.height);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      // Script mode: per-scene audio
      for (let i = 0; i < scenes.length; i++) {
        if (myToken.abort) return;
        const sc = scenes[i];
        const dur = sc.audioDuration || 3;
        const img = sc.imageUrl ? imgCacheRef.current.get(sc.imageUrl) || null : null;
        const audio = sc.audioUrl ? new Audio(sc.audioUrl) : null;
        if (audio) await audio.play().catch(() => {});
        const start = performance.now();
        await new Promise<void>((resolve) => {
          const tick = () => {
            if (myToken.abort) { audio?.pause(); resolve(); return; }
            const t = (performance.now() - start) / 1000;
            drawFrame(ctx, img, sc.caption, t, dur, canvas.width, canvas.height);
            if (t >= dur) { resolve(); return; }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }
    }
  }

  // Export to MP4/WebM via canvas + MediaRecorder
  async function exportVideo() {
    if (scenes.length === 0) return;
    previewAbortRef.current.abort = true;
    setExporting(true);
    setExportedUrl(null);
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = styleCfg.w;
      canvas.height = styleCfg.h;

      // Pre-load all images
      for (const s of scenes) { if (s.imageUrl) { try { await loadImage(s.imageUrl); } catch { /* ignore */ } } }

      // Build combined audio via WebAudio offline? Easier: feed MediaStream from <audio> via captureStream and merge.
      const videoStream = canvas.captureStream(30);
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();

      type Seg = { src: string; dur: number; startAt: number };
      const segs: Seg[] = [];
      let cursor = 0;
      if (mode === "audio" && masterAudioUrl) {
        // Single master track
        const a = new Audio(masterAudioUrl);
        await new Promise<void>((res) => { a.addEventListener("loadedmetadata", () => res(), { once: true }); });
        const total = a.duration || scenes.length * 4;
        segs.push({ src: masterAudioUrl, dur: total, startAt: 0 });
        cursor = total;
      } else {
        for (const s of scenes) {
          if (!s.audioUrl) continue;
          const d = s.audioDuration || 3;
          segs.push({ src: s.audioUrl, dur: d, startAt: cursor });
          cursor += d;
        }
      }
      const totalDuration = cursor;

      // Wire audio elements into destination
      const audioEls: HTMLAudioElement[] = segs.map((seg) => {
        const a = new Audio(seg.src);
        a.crossOrigin = "anonymous";
        const src = audioCtx.createMediaElementSource(a);
        src.connect(dest);
        return a;
      });

      const mixed = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      // Pick best supported mime
      const candidates = [
        "video/mp4;codecs=h264,aac",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      const mime = candidates.find((m) => (window.MediaRecorder?.isTypeSupported?.(m))) || "";
      const rec = mime ? new MediaRecorder(mixed, { mimeType: mime, videoBitsPerSecond: 4_000_000 })
                       : new MediaRecorder(mixed, { videoBitsPerSecond: 4_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: rec.mimeType || "video/webm" })); });

      rec.start(250);

      // Render loop
      const start = performance.now();
      // Schedule audio playbacks
      audioEls.forEach((a, i) => {
        setTimeout(() => { a.play().catch(() => {}); }, segs[i].startAt * 1000);
      });

      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = (performance.now() - start) / 1000;
          if (elapsed >= totalDuration) { resolve(); return; }
          if (mode === "audio" && masterAudioUrl) {
            const per = totalDuration / scenes.length;
            const idx = Math.min(scenes.length - 1, Math.floor(elapsed / per));
            const localT = elapsed - idx * per;
            const sc = scenes[idx];
            const img = sc.imageUrl ? imgCacheRef.current.get(sc.imageUrl) || null : null;
            drawFrame(ctx, img, sc.caption, localT, per, canvas.width, canvas.height);
          } else {
            // find current scene
            let acc = 0;
            let idx = 0;
            for (let i = 0; i < scenes.length; i++) {
              const d = scenes[i].audioDuration || 3;
              if (elapsed < acc + d) { idx = i; break; }
              acc += d;
              idx = i;
            }
            const sc = scenes[idx];
            const dur = sc.audioDuration || 3;
            const localT = elapsed - acc;
            const img = sc.imageUrl ? imgCacheRef.current.get(sc.imageUrl) || null : null;
            drawFrame(ctx, img, sc.caption, localT, dur, canvas.width, canvas.height);
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      rec.stop();
      audioEls.forEach((a) => a.pause());
      const blob = await done;
      try { await audioCtx.close(); } catch { /* ignore */ }
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      toast.success("Video exported. Click Download below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => () => { previewAbortRef.current.abort = true; }, []);

  const canGenerate = mode === "script" ? script.trim().length > 5 : !!audioFile;
  const exportExt = exportedUrl?.includes("mp4") ? "mp4" : "webm"; // best-effort
  const generate = mode === "script" ? runScriptPipeline : runAudioPipeline;

  return (
    <ToolShell
      eyebrow="Video Studio"
      title="AI Video Generator"
      description="Turn a script or audio file into a finished video with AI scenes, voiceover, captions, and one-click export."
    >
      <div className="grid lg:grid-cols-[1fr_380px] gap-5">
        {/* PREVIEW */}
        <div className="glass rounded-2xl p-3 flex flex-col gap-3">
          <div className={`relative bg-black rounded-xl overflow-hidden mx-auto w-full ${styleCfg.aspect === "9:16" ? "max-w-[360px] aspect-[9/16]" : "aspect-video"}`}>
            <canvas ref={canvasRef} className="w-full h-full block" />
            {scenes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Film className="size-8" />
                <span className="text-sm">Your video preview will appear here</span>
              </div>
            )}
          </div>

          {busy && (
            <div className="px-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{progressLabel}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-accent/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={playPreview}
              disabled={scenes.length === 0 || busy}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm disabled:opacity-50 hover-lift"
            >
              <Play className="size-4" /> Play preview
            </button>
            <button
              onClick={exportVideo}
              disabled={scenes.length === 0 || busy || exporting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm text-primary-foreground shadow-glow disabled:opacity-50"
            >
              {exporting ? <><Loader2 className="size-4 animate-spin" /> Exporting…</> : <><Wand2 className="size-4" /> Export video</>}
            </button>
            {exportedUrl && (
              <a
                href={exportedUrl}
                download={`creatorhub-video.${exportExt}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent/40"
              >
                <Download className="size-4" /> Download .{exportExt}
              </a>
            )}
          </div>

          {scenes.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
              {scenes.map((s, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border bg-black/40 aspect-video relative">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.caption} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">…</div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1.5 py-1 truncate">{i + 1}. {s.caption}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-4">
          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-accent/40">
            <button onClick={() => setMode("script")} className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm ${mode === "script" ? "bg-background shadow" : "text-muted-foreground"}`}>
              <FileText className="size-4" /> Script
            </button>
            <button onClick={() => setMode("audio")} className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm ${mode === "audio" ? "bg-background shadow" : "text-muted-foreground"}`}>
              <AudioLines className="size-4" /> Audio
            </button>
          </div>

          {mode === "script" ? (
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Script</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={8}
                maxLength={8000}
                className="mt-2 w-full bg-transparent outline-none resize-none leading-relaxed border border-border rounded-xl p-3"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Audio file (MP3 / WAV, max 25MB)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="mt-2 w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-gradient-brand file:px-4 file:py-2 file:text-primary-foreground file:cursor-pointer"
              />
              {audioFile && <div className="mt-2 text-xs text-muted-foreground">{audioFile.name} · {(audioFile.size / 1024 / 1024).toFixed(2)} MB</div>}
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Style</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`rounded-xl border px-3 py-2 text-sm text-left ${style === s.id ? "border-brand bg-accent/40" : "border-border hover:bg-accent/30"}`}>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.aspect}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Visual quality</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => setQuality("slideshow")}
                className={`rounded-xl border px-3 py-2 text-sm text-left ${quality === "slideshow" ? "border-brand bg-accent/40" : "border-border hover:bg-accent/30"}`}>
                <div className="font-medium">Slideshow</div>
                <div className="text-[11px] text-muted-foreground">AI images + motion. Fast.</div>
              </button>
              <button onClick={() => setQuality("replicate")}
                className={`rounded-xl border px-3 py-2 text-sm text-left ${quality === "replicate" ? "border-brand bg-accent/40" : "border-border hover:bg-accent/30"}`}>
                <div className="font-medium">AI video clips</div>
                <div className="text-[11px] text-muted-foreground">Replicate per scene. Slow.</div>
              </button>
            </div>
          </div>

          {mode === "script" && (
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Voice</label>
              <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}
                className="mt-2 w-full bg-transparent border border-border rounded-xl px-3 py-2 text-sm">
                {VOICES.map((v) => <option key={v.id} value={v.id} className="bg-background">{v.label}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Scenes: {sceneCount}</label>
            <input type="range" min={3} max={10} value={sceneCount} onChange={(e) => setSceneCount(Number(e.target.value))} className="w-full mt-2" />
          </div>

          <button
            onClick={generate}
            disabled={busy || !canGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-primary-foreground font-medium shadow-glow disabled:opacity-50"
          >
            {busy ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Sparkles className="size-4" /> Generate Video</>}
          </button>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Export uses your browser's MediaRecorder. Chromium browsers (Chrome, Edge, Brave) save MP4 natively; Firefox falls back to WebM. Keep the tab visible during export.
          </p>
        </div>
      </div>
    </ToolShell>
  );
}
