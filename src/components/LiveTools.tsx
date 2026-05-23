import { Link } from "@tanstack/react-router";
import { Mic, UserRoundCog, ArrowRight, Sparkles } from "lucide-react";

const cards = [
  {
    to: "/tools/voice" as const,
    icon: Mic,
    title: "AI Voiceover Generator",
    desc: "Turn any script into a realistic voiceover. 6 voices, instant MP3 download.",
    gradient: "linear-gradient(135deg, oklch(0.72 0.2 320), oklch(0.72 0.18 260))",
  },
  {
    to: "/tools/face-swap" as const,
    icon: UserRoundCog,
    title: "Character / Face Swap",
    desc: "Drop a scene and a face — get a swapped image perfect for thumbnails & reels.",
    gradient: "linear-gradient(135deg, oklch(0.82 0.16 200), oklch(0.7 0.18 280))",
  },
];

export function LiveTools() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-brand mb-3">
          <Sparkles className="size-3" /> New · Live tools
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Try it right now</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Real AI, running free. No signup, no credits, no catch.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group relative glass-strong rounded-3xl p-8 hover-lift overflow-hidden"
          >
            <div aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full blur-3xl opacity-60" style={{ background: c.gradient }} />
            <div className="relative">
              <div className="size-12 grid place-items-center rounded-2xl shadow-glow mb-5" style={{ background: c.gradient }}>
                <c.icon className="size-5 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">{c.title}</h3>
              <p className="text-muted-foreground mt-2">{c.desc}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand">
                Open tool <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
