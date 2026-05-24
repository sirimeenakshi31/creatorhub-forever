import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";
import type { Tool } from "@/lib/tools";

interface Pair { name: string; heading: string; body: string; reason: string; }

export function FontsToolPage({ tool }: { tool: Tool }) {
  const [prompt, setPrompt] = useState("");
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setPairs([]);
    try {
      const res = await fetch("/api/ai/text", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tool.slug, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      const cleaned = (data.content || "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setPairs(parsed.pairs || []);
    } catch {
      toast.error("Showing sample pairings");
      setPairs([
        { name: "Editorial Calm", heading: "Playfair Display", body: "Inter", reason: "Serif elegance + clean sans for readability." },
        { name: "Modern Tech", heading: "Space Grotesk", body: "DM Sans", reason: "Geometric headline + neutral body." },
        { name: "Friendly Brand", heading: "Outfit", body: "Figtree", reason: "Soft personality with a clean body voice." },
        { name: "Luxury Mood", heading: "Cormorant Garamond", body: "Karla", reason: "Classic luxury with a modern sans." },
      ]);
    } finally { setLoading(false); }
  };

  return (
    <ToolShell eyebrow={tool.category} title={tool.name} description={tool.description}>
      <div className="glass rounded-2xl p-5">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={tool.placeholder}
          className="w-full bg-transparent outline-none text-lg" />
      </div>
      <div className="mt-4">
        <button onClick={generate} disabled={loading || !prompt.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-primary-foreground font-medium shadow-glow disabled:opacity-50">
          {loading ? <><Loader2 className="size-4 animate-spin" /> Pairing…</> : <><Sparkles className="size-4" /> Suggest pairings</>}
        </button>
      </div>
      {pairs.length > 0 && (
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {pairs.map((p, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(p.heading)}:wght@600&family=${encodeURIComponent(p.body)}:wght@400&display=swap`} />
              <div className="text-xs text-brand uppercase tracking-widest">{p.name}</div>
              <div style={{ fontFamily: `'${p.heading}', serif` }} className="text-3xl mt-2">The quick brown fox</div>
              <p style={{ fontFamily: `'${p.body}', sans-serif` }} className="mt-2 text-muted-foreground">
                {p.reason} — body text in {p.body}, headings in {p.heading}.
              </p>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}
