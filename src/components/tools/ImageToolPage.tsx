import { useState } from "react";
import { Loader2, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";
import type { Tool } from "@/lib/tools";

export function ImageToolPage({ tool }: { tool: Tool }) {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setUrl(null);
    try {
      const full = (tool.imagePromptPrefix || "") + prompt;
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: full }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setUrl(data.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
      // fallback placeholder
      setUrl(`https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`);
    } finally { setLoading(false); }
  };

  const aspectClass =
    tool.aspect === "9:16" ? "aspect-[9/16]" :
    tool.aspect === "16:9" ? "aspect-video" :
    tool.aspect === "4:5" ? "aspect-[4/5]" :
    tool.aspect === "2:3" ? "aspect-[2/3]" :
    "aspect-square";

  return (
    <ToolShell eyebrow={tool.category} title={tool.name} description={tool.description}>
      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div className={`glass rounded-2xl p-2 flex items-center justify-center ${aspectClass}`}>
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-brand" />
              <span className="text-sm">Painting your image…</span>
            </div>
          ) : url ? (
            <img src={url} alt={prompt} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="text-muted-foreground text-sm">Your image will appear here</div>
          )}
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            maxLength={1500}
            className="mt-2 flex-1 bg-transparent outline-none resize-none text-foreground leading-relaxed"
            placeholder={tool.placeholder || "Describe your image…"}
          />
          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Sparkles className="size-4" /> Generate</>}
            </button>
            {url && (
              <a href={url} download={`${tool.slug}.png`} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm hover:bg-accent/40">
                <Download className="size-4" /> Download
              </a>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
