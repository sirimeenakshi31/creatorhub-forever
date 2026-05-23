import type { LucideIcon } from "lucide-react";
import {
  Wand2, MessageSquare, Hash, Anchor, TrendingUp, Youtube, BookOpen,
  Film, Subtitles, Ghost, Image as ImageIcon, Clapperboard,
  LayoutTemplate, Images, Brush, Palette, Type,
  Music, Video, Camera, Volume2, Flame,
} from "lucide-react";

type Tool = { icon: LucideIcon; title: string; desc: string };

const aiTools: Tool[] = [
  { icon: Wand2, title: "AI Script Generator", desc: "Write reel & video scripts in seconds." },
  { icon: MessageSquare, title: "Caption Generator", desc: "Catchy captions tuned to your vibe." },
  { icon: Hash, title: "Hashtag Generator", desc: "Trending, niche-relevant hashtags." },
  { icon: Anchor, title: "Hook Generator", desc: "Scroll-stopping opening lines." },
  { icon: TrendingUp, title: "Viral Title Generator", desc: "Titles built to get clicks." },
  { icon: Youtube, title: "YouTube Description Writer", desc: "SEO-friendly descriptions." },
  { icon: BookOpen, title: "Storytelling Prompts", desc: "Narrative frames that hook." },
];

const videoTools: Tool[] = [
  { icon: Film, title: "Reel Idea Generator", desc: "Fresh reel concepts daily." },
  { icon: Subtitles, title: "Subtitle Generator", desc: "Auto subtitles for any clip." },
  { icon: Ghost, title: "Faceless Video Prompts", desc: "Scripts for faceless creators." },
  { icon: ImageIcon, title: "Thumbnail Prompts", desc: "Click-worthy thumbnail ideas." },
  { icon: Clapperboard, title: "Scene Prompt Creator", desc: "Cinematic AI scene prompts." },
];

const designTools: Tool[] = [
  { icon: Images, title: "Pinterest Pin Templates", desc: "On-trend pin layouts." },
  { icon: LayoutTemplate, title: "Instagram Carousels", desc: "Swipeable carousel templates." },
  { icon: Brush, title: "Canva-style Editor", desc: "Edit visuals right in browser." },
  { icon: Palette, title: "Color Palette Generator", desc: "Aesthetic palettes on tap." },
  { icon: Type, title: "Font Pairing Tool", desc: "Tasteful font combos." },
];

const resources: Tool[] = [
  { icon: Music, title: "Copyright-free Music", desc: "Tracks safe for any platform." },
  { icon: Video, title: "Free Stock Videos", desc: "B-roll & cinematic clips." },
  { icon: Camera, title: "Aesthetic Images", desc: "Curated free image library." },
  { icon: Volume2, title: "Trending Sounds", desc: "Today's viral audio list." },
  { icon: Flame, title: "Viral Reel Ideas", desc: "Daily ideas to remix." },
];

function Card({ icon: Icon, title, desc }: Tool) {
  return (
    <div className="group glass rounded-2xl p-5 hover-lift cursor-pointer">
      <div className="size-10 grid place-items-center rounded-xl bg-gradient-brand shadow-glow mb-4 group-hover:scale-110 transition">
        <Icon className="size-5 text-primary-foreground" />
      </div>
      <h3 className="font-medium tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      <div className="mt-4 text-xs font-medium text-brand opacity-0 group-hover:opacity-100 transition">Open tool →</div>
    </div>
  );
}

function Section({ id, eyebrow, title, items }: { id: string; eyebrow: string; title: string; items: Tool[] }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-brand mb-2">{eyebrow}</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
        </div>
        <span className="hidden md:inline-flex glass rounded-full px-3 py-1 text-xs text-muted-foreground">100% Free</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => <Card key={t.title} {...t} />)}
      </div>
    </section>
  );
}

export function ToolSections() {
  return (
    <>
      <Section id="tools" eyebrow="AI Content Tools" title="Write smarter, post faster" items={aiTools} />
      <Section id="video" eyebrow="Video Creator Tools" title="From idea to upload" items={videoTools} />
      <Section id="design" eyebrow="Design Tools" title="Look good. Always." items={designTools} />
      <Section id="resources" eyebrow="Creator Resources" title="Assets you can actually use" items={resources} />
    </>
  );
}
