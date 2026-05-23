import { useState } from "react";
import { Loader2, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";
import type { Tool } from "@/lib/tools";

interface Palette { name: string; colors: string[]; }

export function PaletteToolPage({ tool }: { tool: Tool }) {
  const [prompt, setPrompt] = useState("");
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setPalettes([]);
    try {
      const sys = `You design beautiful color palettes. Return ONLY raw JSON (no markdown fences) shaped: {"palettes":[{"name":string,"colors":[6 hex strings starting with #]}]}. Generate 3 palettes matching the mood.`;
      const res = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: sys, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      const cleaned = (data.content || "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setPalettes(parsed.palettes || []);
    } catch (e) {
      toast.error("Showing sample palettes");
      setPalettes([
        { name: "Sunset Calm", colors: ["#FFF7ED", "#FED7AA", "#FB923C", "#C2410C", "#7C2D12", "#1C1917"] },
        { name: "Ocean Mist", colors: ["#F0F9FF", "#7DD3FC", "#0284C7", "#075985", "#0C4A6E", "#082F49"] },
        { name: "Forest Sage", colors: ["#F0FDF4", "#86EFAC", "#22C55E", "#15803D", "#14532D", "#052E16"] },
      ]);
    } finally { setLoading(false); }
  };

  return (
    <ToolShell eyebrow={tool.category} title={tool.name} description={tool.description}>
      <div className="glass rounded-2xl p-5">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tool.placeholder}
          className="w-full bg-transparent outline-none text-lg"
        />
      </div>
      <div className="mt-4">
        <button onClick={generate} disabled={loading || !prompt.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-primary-foreground font-medium shadow-glow disabled:opacity-50">
          {loading ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Sparkles className="size-4" /> Generate palettes</>}
        </button>
      </div>
      {palettes.length > 0 && (
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {palettes.map((p, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-6 h-32">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => { navigator.clipboard.writeText(c); toast.success(`Copied ${c}`); }}
                    style={{ background: c }} className="hover:scale-105 transition" title={c} />
                ))}
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{p.name}</span>
                <button onClick={() => { navigator.clipboard.writeText(p.colors.join(", ")); toast.success("Palette copied"); }}
                  className="text-xs text-muted-foreground inline-flex items-center gap-1"><Copy className="size-3" /> Copy</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}
