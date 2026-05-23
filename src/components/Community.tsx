import { Users, Sparkles, ArrowRight } from "lucide-react";

export function Community() {
  return (
    <section id="community" className="max-w-6xl mx-auto px-4 py-20">
      <div className="relative glass-strong rounded-3xl p-10 md:p-16 overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-20 size-72 rounded-full bg-brand/30 blur-3xl animate-blob" />
        <div aria-hidden className="absolute -bottom-20 -left-20 size-72 rounded-full bg-brand-2/30 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground">
              <Users className="size-3.5 text-brand" /> Creator Community
            </div>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
              Join 50,000+ creators <span className="text-gradient">growing together</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Trade ideas, swap templates, share wins. A friendly space for beginners and faceless creators.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-primary-foreground font-medium shadow-glow hover:scale-[1.03] transition">
                <Sparkles className="size-4" /> Join the community <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl shadow-card animate-float"
                style={{
                  background: `linear-gradient(135deg, oklch(0.72 0.2 ${280 + i * 12}), oklch(0.78 0.16 ${200 + i * 10}))`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
