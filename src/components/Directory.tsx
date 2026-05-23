import { ExternalLink } from "lucide-react";

const directory = [
  { name: "ChatGPT", desc: "Conversational AI for ideas, scripts, and more.", tag: "Writing", url: "https://chat.openai.com", initials: "GPT", from: "oklch(0.78 0.16 160)", to: "oklch(0.6 0.18 200)" },
  { name: "Canva", desc: "Design anything — posts, reels, thumbnails.", tag: "Design", url: "https://canva.com", initials: "Ca", from: "oklch(0.72 0.18 230)", to: "oklch(0.78 0.18 280)" },
  { name: "CapCut", desc: "Free video editor loved by creators.", tag: "Video", url: "https://capcut.com", initials: "CC", from: "oklch(0.7 0.2 20)", to: "oklch(0.78 0.18 50)" },
  { name: "ElevenLabs", desc: "Realistic AI voices in any language.", tag: "Audio", url: "https://elevenlabs.io", initials: "11", from: "oklch(0.85 0.05 80)", to: "oklch(0.65 0.15 30)" },
  { name: "Leonardo AI", desc: "Generate stunning visuals with AI.", tag: "Image", url: "https://leonardo.ai", initials: "Le", from: "oklch(0.7 0.2 300)", to: "oklch(0.72 0.18 260)" },
  { name: "Pixabay", desc: "Free images, videos, and music.", tag: "Stock", url: "https://pixabay.com", initials: "Px", from: "oklch(0.78 0.16 150)", to: "oklch(0.72 0.18 200)" },
  { name: "Pexels", desc: "High-quality free stock content.", tag: "Stock", url: "https://pexels.com", initials: "Pe", from: "oklch(0.78 0.14 170)", to: "oklch(0.6 0.12 200)" },
];

export function Directory() {
  return (
    <section id="directory" className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-widest text-brand mb-2">Free AI Tools Directory</div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Best free tools, one click away</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Hand-picked tools every creator should know. All free to start.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {directory.map((d) => (
          <a key={d.name} href={d.url} target="_blank" rel="noreferrer" className="group glass rounded-2xl p-5 hover-lift">
            <div className="flex items-center gap-3">
              <div
                className="size-12 rounded-xl grid place-items-center text-primary-foreground font-semibold shadow-glow"
                style={{ background: `linear-gradient(135deg, ${d.from}, ${d.to})` }}
              >
                {d.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{d.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground glass rounded-full px-2 py-0.5">{d.tag}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{d.desc}</p>
              </div>
              <ExternalLink className="size-4 text-muted-foreground group-hover:text-brand transition" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
