import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles, Download, Film } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/ai-video")({
  head: () => ({ meta: [{ title: "AI Video Generator — CreatorHub" }, { name: "description", content: "Generate short cinematic AI videos from a text prompt." }] }),
  component: Page,
});

function Page() {
  const [prompt, setPrompt] = useState("Aerial shot of misty mountains at sunrise, cinematic, slow camera push-in");
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setUrl(null);
    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setUrl(data.url);
      if (data.mock && data.notice) toast.message(data.notice);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Video generation failed");
      setUrl("https://cdn.pixabay.com/video/2024/02/27/202289-916715234_tiny.mp4");
    } finally { setLoading(false); }
  };

  return (
    <ToolShell eyebrow="Video" title="AI Video Generator" description="Generate short cinematic clips from text. 5–10 second outputs.">
      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div className="glass rounded-2xl p-2 aspect-video flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-brand" />
              <span className="text-sm">Rendering your video… (can take up to a minute)</span>
            </div>
          ) : url ? (
            <video src={url} controls className="w-full h-full rounded-xl object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Film className="size-8" />
              <span className="text-sm">Your video will appear here</span>
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-5 flex flex-col">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={8} maxLength={1500}
            className="mt-2 flex-1 bg-transparent outline-none resize-none leading-relaxed" />
          <div className="mt-3 flex flex-col gap-2">
            <button onClick={generate} disabled={loading || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-primary-foreground font-medium shadow-glow disabled:opacity-50">
              {loading ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Sparkles className="size-4" /> Generate</>}
            </button>
            {url && (
              <a href={url} download="creatorhub-video.mp4" className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm hover:bg-accent/40">
                <Download className="size-4" /> Download
              </a>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
