const items = [
  { q: "Is CreatorHub really free?", a: "Yes — every tool, template, and resource is free forever. No paywalls, no credits, no upgrade screens." },
  { q: "Do I need to sign up?", a: "Nope. Jump straight in and start creating. Sign-up is optional and only used to save your work." },
  { q: "Who is this for?", a: "Instagram creators, faceless YouTubers, Pinterest pinners, students, and any beginner growing online — especially small creators in India." },
  { q: "Can I use the assets commercially?", a: "Yes. Music, videos, and images are copyright-free for personal and commercial use." },
  { q: "How often are new tools added?", a: "We ship new tools and trending sound lists weekly. Follow our community to stay updated." },
];

export function FAQ() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-10">
        <div className="text-xs uppercase tracking-widest text-brand mb-2">FAQ</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Quick answers</h2>
      </div>
      <div className="space-y-3">
        {items.map((i) => (
          <details key={i.q} className="group glass rounded-2xl px-5 py-4 hover-lift">
            <summary className="cursor-pointer list-none flex items-center justify-between font-medium">
              {i.q}
              <span className="size-6 grid place-items-center rounded-full bg-accent group-open:rotate-45 transition">+</span>
            </summary>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{i.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
