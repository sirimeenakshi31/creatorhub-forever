import { ArrowRight, Sparkles, Infinity as InfinityIcon } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero pointer-events-none" />
      <div aria-hidden className="absolute -top-32 -left-32 size-96 rounded-full bg-brand/30 blur-3xl animate-blob" />
      <div aria-hidden className="absolute top-20 -right-40 size-[28rem] rounded-full bg-brand-2/30 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      <div aria-hidden className="absolute bottom-0 left-1/3 size-80 rounded-full bg-brand-3/20 blur-3xl animate-blob" style={{ animationDelay: "-12s" }} />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground animate-fade-up">
          <InfinityIcon className="size-3.5 text-brand" />
          <span className="text-foreground font-medium">Free Forever</span>
          <span className="opacity-60">· No sign-up walls · No credits</span>
        </div>

        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] animate-fade-up" style={{ animationDelay: "0.05s" }}>
          Everything creators need.
          <br />
          <span className="text-gradient">Free forever.</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "0.15s" }}>
          AI tools, creator resources, templates, and inspiration — all in one place.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <a href="#tools" className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-primary-foreground font-medium shadow-glow animate-glow hover:scale-[1.03] transition">
            <Sparkles className="size-4" />
            Start Creating
            <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
          </a>
          <a href="#directory" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3.5 text-sm font-medium hover-lift">
            Explore AI tools
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.35s" }}>
          {[
            ["30+", "Free AI tools"],
            ["1000+", "Templates"],
            ["50k+", "Creators"],
            ["∞", "Always free"],
          ].map(([n, l]) => (
            <div key={l} className="glass rounded-2xl px-4 py-5">
              <div className="text-2xl font-semibold text-gradient">{n}</div>
              <div className="text-xs text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
