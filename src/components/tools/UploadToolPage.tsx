import { useState, useCallback } from "react";
import { Loader2, Upload, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";
import type { Tool } from "@/lib/tools";

/**
 * Generic uploader-style tool used by Background Remover, Video Enhancer, etc.
 * Posts the file to /api/replicate/run with a model slug. Falls back to showing
 * the original file if the API is unavailable so the UI never crashes.
 */
export function UploadToolPage({ tool, model, accept = "image/*", outputKind = "image" }: {
  tool: Tool;
  model: string;
  accept?: string;
  outputKind?: "image" | "video" | "audio";
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const onFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOutput(null);
  }, []);

  const run = async () => {
    if (!file) return;
    setLoading(true); setOutput(null);
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const res = await fetch("/api/replicate/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, image: b64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setOutput(data.url);
      toast.success("Done!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed — showing original");
      setOutput(preview);
    } finally { setLoading(false); }
  };

  return (
    <ToolShell eyebrow={tool.category} title={tool.name} description={tool.description}>
      <div className="grid md:grid-cols-2 gap-5">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0] ?? null); }}
          className={`glass rounded-2xl p-5 min-h-[260px] flex flex-col items-center justify-center text-center transition ${drag ? "border-brand" : ""}`}
        >
          {preview ? (
            outputKind === "video"
              ? <video src={preview} controls className="w-full rounded-xl" />
              : outputKind === "audio"
                ? <audio src={preview} controls className="w-full" />
                : <img src={preview} alt="input" className="max-h-72 rounded-xl object-contain" />
          ) : (
            <>
              <Upload className="size-8 text-brand mb-3" />
              <p className="text-sm">Drag & drop a file here</p>
              <label className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-accent/40">
                Choose file
                <input type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
              </label>
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-5 min-h-[260px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-brand" />
              <span className="text-sm">Processing…</span>
            </div>
          ) : output ? (
            outputKind === "video"
              ? <video src={output} controls className="w-full rounded-xl" />
              : outputKind === "audio"
                ? <audio src={output} controls className="w-full" />
                : <img src={output} alt="result" className="max-h-72 rounded-xl object-contain" />
          ) : (
            <p className="text-sm text-muted-foreground">Result will appear here</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={run} disabled={loading || !file}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-primary-foreground font-medium shadow-glow disabled:opacity-50">
          {loading ? <><Loader2 className="size-4 animate-spin" /> Working…</> : <><Sparkles className="size-4" /> Run</>}
        </button>
        {output && (
          <a href={output} download className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm hover:bg-accent/40">
            <Download className="size-4" /> Download
          </a>
        )}
        {file && <button onClick={() => { setFile(null); setPreview(null); setOutput(null); }} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>}
      </div>
    </ToolShell>
  );
}
