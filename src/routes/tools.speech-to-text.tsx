import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { useState } from "react";
import { Loader2, Upload, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/speech-to-text")({
  head: () => ({
    meta: [
      { title: "Speech to Text — Free AI Transcription | CreatorHub" },
      { name: "description", content: "Transcribe any audio file to text instantly. Free AI transcription for creators." },
      { property: "og:title", content: "Speech to Text — Free AI Transcription | CreatorHub" },
      { property: "og:description", content: "Transcribe any audio file to text instantly." },
      { property: "og:url", content: "https://creatorhubforever.lovable.app/tools/speech-to-text" },
      { name: "twitter:title", content: "Speech to Text — Free AI Transcription | CreatorHub" },
      { name: "twitter:description", content: "Transcribe any audio file to text instantly." },
    ],
    links: [{ rel: "canonical", href: "https://creatorhubforever.lovable.app/tools/speech-to-text" }],
  }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!file) return;
    setLoading(true); setText("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setText(data.text || "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transcription failed");
      setText("(Sample transcript — the transcription service is unavailable right now. Try again in a moment.)");
    } finally { setLoading(false); }
  };

  return (
    <ToolShell eyebrow="Audio" title="Speech to Text" description="Drop in any audio file. Get clean text in seconds.">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5 min-h-[260px] flex flex-col items-center justify-center">
          {file ? (
            <>
              <audio src={URL.createObjectURL(file)} controls className="w-full" />
              <button onClick={() => setFile(null)} className="mt-3 text-xs text-muted-foreground">Clear</button>
            </>
          ) : (
            <>
              <Upload className="size-8 text-brand mb-3" />
              <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-accent/40">
                Choose audio file
                <input type="file" accept="audio/*,video/*" className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              <p className="text-xs text-muted-foreground mt-2">MP3, WAV, M4A, MP4 — up to 25MB</p>
            </>
          )}
        </div>
        <div className="glass rounded-2xl p-5 min-h-[260px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-brand" />
              <span className="text-sm">Transcribing…</span>
            </div>
          ) : text ? (
            <div>
              <div className="flex justify-end mb-2">
                <button onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied"); }}
                  className="text-xs inline-flex items-center gap-1 border border-border rounded-full px-3 py-1.5 hover:bg-accent/40">
                  <Copy className="size-3" /> Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{text}</pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Transcript will appear here</p>
          )}
        </div>
      </div>
      <div className="mt-5">
        <button onClick={run} disabled={loading || !file}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-primary-foreground font-medium shadow-glow disabled:opacity-50">
          {loading ? <><Loader2 className="size-4 animate-spin" /> Transcribing…</> : <><Sparkles className="size-4" /> Transcribe</>}
        </button>
      </div>
    </ToolShell>
  );
}
