import { useState } from "react";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";
import type { Tool } from "@/lib/tools";

export function TextToolPage({ tool }: { tool: Tool }) {
  const [prompt, setPrompt] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setOut("");
    try {
      const res = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tool.slug, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setOut(data.content || "");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate";
      toast.error(msg);
      // graceful fallback
      setOut(`(Showing a sample result — the AI is unavailable right now)\n\n• Idea 1 based on: ${prompt}\n• Idea 2: try another angle\n• Idea 3: add a clear CTA`);
    } finally { setLoading(false); }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(out);
    setCopied(true); toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell eyebrow={tool.category} title={tool.name} description={tool.description}>
      <div className="glass rounded-2xl p-5">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Your input</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          maxLength={5000}
          className="mt-2 w-full bg-transparent outline-none resize-none text-foreground leading-relaxed"
          placeholder={tool.placeholder || "Describe what you want…"}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{prompt.length} / 5000</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition disabled:opacity-50"
        >
          {loading ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Sparkles className="size-4" /> Generate</>}
        </button>
      </div>

      {out && (
        <div className="mt-6 glass rounded-2xl p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Result</span>
            <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-border hover:bg-accent/40 transition">
              {copied ? <><Check className="size-3" /> Copied</> : <><Copy className="size-3" /> Copy</>}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{out}</pre>
        </div>
      )}
    </ToolShell>
  );
}
