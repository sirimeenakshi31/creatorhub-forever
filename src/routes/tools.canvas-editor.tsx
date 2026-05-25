import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { useRef, useState, useEffect } from "react";
import { Type, Image as ImageIcon, Download, Trash2, Square, Plus, Palette } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";

export const Route = createFileRoute("/tools/canvas-editor")({
  head: () => ({ meta: [{ title: "Canvas Editor — CreatorHub" }, { name: "description", content: "Quick drag-and-drop image editor for creators." }] }),
  component: () => <RequireAuth><Editor /></RequireAuth>,
});

type Layer =
  | { id: string; type: "text"; x: number; y: number; text: string; size: number; color: string }
  | { id: string; type: "image"; x: number; y: number; w: number; h: number; src: string }
  | { id: string; type: "rect"; x: number; y: number; w: number; h: number; color: string };

function Editor() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "t1", type: "text", x: 80, y: 200, text: "Your headline", size: 56, color: "#ffffff" },
    { id: "r1", type: "rect", x: 0, y: 0, w: 800, h: 600, color: "#7c3aed" },
  ]);
  const [bg, setBg] = useState("#0f172a");
  const [selected, setSelected] = useState<string | null>("t1");
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);

  // sort: bg rect first
  const sorted = [...layers].sort((a, b) => (a.type === "rect" && b.type !== "rect" ? -1 : 0));

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
    sorted.forEach((l) => {
      if (l.type === "rect") {
        ctx.fillStyle = l.color; ctx.fillRect(l.x, l.y, l.w, l.h);
      } else if (l.type === "text") {
        ctx.fillStyle = l.color; ctx.font = `bold ${l.size}px Inter, system-ui, sans-serif`;
        ctx.textBaseline = "top"; ctx.fillText(l.text, l.x, l.y);
      } else if (l.type === "image") {
        const img = new window.Image(); img.crossOrigin = "anonymous"; img.src = l.src;
        img.onload = () => ctx.drawImage(img, l.x, l.y, l.w, l.h);
      }
    });
  }, [layers, bg, sorted]);

  const addText = () => {
    const id = crypto.randomUUID();
    setLayers((p) => [...p, { id, type: "text", x: 100, y: 100, text: "New text", size: 36, color: "#ffffff" }]);
    setSelected(id);
  };
  const addRect = () => {
    const id = crypto.randomUUID();
    setLayers((p) => [...p, { id, type: "rect", x: 200, y: 200, w: 200, h: 120, color: "#f43f5e" }]);
    setSelected(id);
  };
  const addImage = (src: string) => {
    const id = crypto.randomUUID();
    setLayers((p) => [...p, { id, type: "image", x: 100, y: 100, w: 300, h: 200, src }]);
    setSelected(id);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (800 / rect.width);
    const y = (e.clientY - rect.top) * (600 / rect.height);
    // pick topmost layer (excluding bg)
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (l.type === "rect" && l.w === 800 && l.h === 600) continue;
      if (l.type === "text") {
        if (x > l.x && x < l.x + l.size * l.text.length * 0.6 && y > l.y && y < l.y + l.size) {
          setSelected(l.id); setDrag({ id: l.id, dx: x - l.x, dy: y - l.y }); return;
        }
      } else if ("w" in l) {
        if (x > l.x && x < l.x + l.w && y > l.y && y < l.y + l.h) {
          setSelected(l.id); setDrag({ id: l.id, dx: x - l.x, dy: y - l.y }); return;
        }
      }
    }
    setSelected(null);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const rect = ref.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (800 / rect.width);
    const y = (e.clientY - rect.top) * (600 / rect.height);
    setLayers((p) => p.map((l) => l.id === drag.id ? { ...l, x: x - drag.dx, y: y - drag.dy } : l));
  };
  const onPointerUp = () => setDrag(null);

  const sel = layers.find((l) => l.id === selected);

  const download = () => {
    const c = ref.current!;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png"); a.download = "creatorhub-design.png"; a.click();
    toast.success("Exported");
  };

  const removeSel = () => {
    if (!selected) return;
    setLayers((p) => p.filter((l) => l.id !== selected)); setSelected(null);
  };

  return (
    <ToolShell eyebrow="Image" title="Canvas Editor" description="A quick canvas to compose posts, posters and thumbnails.">
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="glass rounded-2xl p-3">
          <canvas
            ref={ref}
            width={800} height={600}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
            className="w-full rounded-xl bg-black/40 cursor-move touch-none"
          />
        </div>
        <aside className="glass rounded-2xl p-4 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Add</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={addText} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent/40"><Type className="size-3" /> Text</button>
              <button onClick={addRect} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent/40"><Square className="size-3" /> Shape</button>
              <label className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent/40 cursor-pointer">
                <ImageIcon className="size-3" /> Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const r = new FileReader();
                  r.onload = () => addImage(r.result as string); r.readAsDataURL(f);
                }} />
              </label>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 inline-flex items-center gap-1"><Palette className="size-3" /> Background</div>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-9 rounded bg-transparent" />
          </div>

          {sel && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Selected layer</div>
              {sel.type === "text" && (
                <>
                  <input value={sel.text} onChange={(e) => setLayers((p) => p.map((l) => l.id === sel.id ? { ...l, text: e.target.value } as Layer : l))}
                    className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm" />
                  <label className="text-xs">Size {sel.size}px</label>
                  <input type="range" min={16} max={140} value={sel.size}
                    onChange={(e) => setLayers((p) => p.map((l) => l.id === sel.id ? { ...l, size: +e.target.value } as Layer : l))}
                    className="w-full" />
                  <input type="color" value={sel.color}
                    onChange={(e) => setLayers((p) => p.map((l) => l.id === sel.id ? { ...l, color: e.target.value } as Layer : l))}
                    className="w-full h-8 rounded bg-transparent" />
                </>
              )}
              {sel.type === "rect" && (
                <input type="color" value={sel.color}
                  onChange={(e) => setLayers((p) => p.map((l) => l.id === sel.id ? { ...l, color: e.target.value } as Layer : l))}
                  className="w-full h-9 rounded bg-transparent" />
              )}
              <button onClick={removeSel} className="inline-flex items-center gap-1 text-xs text-destructive"><Trash2 className="size-3" /> Delete layer</button>
            </div>
          )}

          <button onClick={download} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-primary-foreground font-medium shadow-glow">
            <Download className="size-4" /> Export PNG
          </button>
        </aside>
      </div>
    </ToolShell>
  );
}

// silence unused
void Plus;
