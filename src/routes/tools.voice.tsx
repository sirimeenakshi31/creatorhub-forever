import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { useState } from "react";
import { Loader2, Play, Download, Volume2 } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";

const VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Warm & natural" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", desc: "Bright & friendly" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", desc: "Deep narrator" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", desc: "Confident male" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "Soft British" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", desc: "Storyteller" },
];

export const Route = createFileRoute("/tools/voice")({
  head: () => ({
    meta: [
      { title: "AI Voice Generator — Free Text to Speech | CreatorHub" },
      { name: "description", content: "Turn text into realistic AI voiceovers in seconds. Free and unlimited." },
      { property: "og:title", content: "AI Voice Generator — Free TTS | CreatorHub" },
      { property: "og:description", content: "Turn text into realistic voiceovers in seconds." },
      { property: "og:url", content: "https://creatorhubforever.lovable.app/tools/voice" },
      { name: "twitter:title", content: "AI Voice Generator — Free TTS | CreatorHub" },
      { name: "twitter:description", content: "Turn text into realistic voiceovers in seconds." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/tools/voice" }],
  }),
  component: () => <RequireAuth><VoicePage /></RequireAuth>,
});

function VoicePage() {
  const [text, setText] = useState("Hey creators! Welcome to CreatorHub — your free home for AI tools.");
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true); setError(null); setAudioUrl(null);
    try {
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        throw new Error(j.error || `Error ${res.status}`);
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate audio");
    } finally { setLoading(false); }
  };

  return (
    <ToolShell
      eyebrow="AI Voiceover"
      title="Voiceover Generator"
      description="Turn any script into a realistic voiceover. Pick a voice, paste your text, hit generate."
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="glass rounded-2xl p-5">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Your script</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            maxLength={5000}
            className="mt-2 w-full bg-transparent outline-none resize-none text-foreground leading-relaxed"
            placeholder="Paste your script here…"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{text.length} / 5000</span>
            <span className="inline-flex items-center gap-1"><Volume2 className="size-3" /> MP3 · 44.1 kHz</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Voice</label>
          <div className="mt-3 space-y-2">
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVoiceId(v.id)}
                className={`w-full text-left rounded-xl px-3 py-2.5 border transition ${
                  voiceId === v.id ? "border-brand bg-accent/50" : "border-border hover:bg-accent/30"
                }`}
              >
                <div className="text-sm font-medium">{v.name}</div>
                <div className="text-xs text-muted-foreground">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          disabled={loading || !text.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Play className="size-4" /> Generate voiceover</>}
        </button>
        {audioUrl && (
          <a href={audioUrl} download="voiceover.mp3" className="inline-flex items-center gap-2 glass rounded-full px-5 py-3 text-sm hover-lift">
            <Download className="size-4" /> Download MP3
          </a>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {audioUrl && (
        <div className="mt-6 glass rounded-2xl p-5 animate-fade-in">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </ToolShell>
  );
}
