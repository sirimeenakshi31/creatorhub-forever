const quotes = [
  { name: "Ananya R.", role: "Faceless YouTuber", text: "The script + hook generators saved me hours every week. Wild that it's free.", gradient: "linear-gradient(135deg, oklch(0.72 0.2 320), oklch(0.72 0.18 260))" },
  { name: "Rohan M.", role: "Instagram Creator, Mumbai", text: "Trending sounds + reel ideas in one place. My posting consistency 10x'd.", gradient: "linear-gradient(135deg, oklch(0.78 0.16 200), oklch(0.7 0.18 260))" },
  { name: "Sneha K.", role: "Pinterest Creator", text: "Pin templates and palette tool are gorgeous. Feels like Canva pro for free.", gradient: "linear-gradient(135deg, oklch(0.78 0.18 340), oklch(0.72 0.2 300))" },
  { name: "Aarav S.", role: "Student & Beginner", text: "I had zero clue where to start. CreatorHub literally walks you through it.", gradient: "linear-gradient(135deg, oklch(0.82 0.16 200), oklch(0.7 0.18 230))" },
];

export function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-widest text-brand mb-2">Loved by creators</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Built with creators, for creators</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotes.map((q) => (
          <div key={q.name} className="glass rounded-2xl p-6 hover-lift">
            <p className="text-foreground/90 leading-relaxed">"{q.text}"</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="size-10 rounded-full shadow-glow" style={{ background: q.gradient }} />
              <div>
                <div className="text-sm font-medium">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
