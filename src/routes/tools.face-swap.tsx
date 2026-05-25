import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { useState } from "react";
import { Loader2, Upload, Download, Sparkles, ImagePlus } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/face-swap")({
  head: () => ({
    meta: [
      { title: "AI Character / Face Swap — CreatorHub" },
      { name: "description", content: "Swap faces between two photos in seconds. Free AI tool for creators." },
    ],
  }),
  component: () => <RequireAuth><SwapPage /></RequireAuth>,
});

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function Dropzone({ label, dataUrl, onFile }: { label: string; dataUrl: string | null; onFile: (f: File) => void }) {
  return (
    <label className="group relative aspect-square glass rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover-lift">
      {dataUrl ? (
        <img src={dataUrl} alt={label} className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="text-center px-4">
          <div className="size-12 mx-auto mb-3 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
            <ImagePlus className="size-5 text-primary-foreground" />
          </div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-muted-foreground mt-1">PNG or JPG · click to upload</div>
        </div>
      )}
      {dataUrl && (
        <div className="absolute bottom-2 left-2 text-xs glass rounded-full px-3 py-1">{label}</div>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </label>
  );
}

function SwapPage() {
  const [target, setTarget] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    if (!target || !source) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/face-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetImage: target, sourceFace: source }),
      });
      const j = await res.json();
      if (!res.ok || !j.output) throw new Error(j.error || `Error ${res.status}`);
      setResult(j.output);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Face swap failed");
    } finally { setLoading(false); }
  };

  return (
    <ToolShell
      eyebrow="Character Swap"
      title="AI Face Swap"
      description="Upload a scene and a face. We'll swap the face into the scene — perfect for thumbnails, memes, and reels."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Scene photo</div>
          <Dropzone label="Target scene" dataUrl={target} onFile={async (f) => setTarget(await readAsDataUrl(f))} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Face to use</div>
          <Dropzone label="Source face" dataUrl={source} onFile={async (f) => setSource(await readAsDataUrl(f))} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={!target || !source || loading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 className="size-4 animate-spin" /> Swapping…</> : <><Sparkles className="size-4" /> Swap faces</>}
        </button>
        {result && (
          <a href={result} target="_blank" rel="noreferrer" download className="inline-flex items-center gap-2 glass rounded-full px-5 py-3 text-sm hover-lift">
            <Download className="size-4" /> Download result
          </a>
        )}
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Upload className="size-3" /> Images are processed and not stored.
        </span>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-6 glass rounded-2xl p-3 animate-fade-in">
          <img src={result} alt="Face swap result" className="w-full rounded-xl" />
        </div>
      )}
    </ToolShell>
  );
}
