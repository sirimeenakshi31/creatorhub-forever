import { Instagram, Youtube, Twitter, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center size-8 rounded-lg bg-gradient-brand shadow-glow">
              <Sparkles className="size-4 text-primary-foreground" />
            </span>
            CreatorHub <span className="text-muted-foreground font-normal">by Siri</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Everything creators need — free forever. AI tools, templates, resources & inspiration.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Youtube, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="size-9 grid place-items-center glass rounded-xl hover-lift">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-3">Explore</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#tools" className="hover:text-foreground">AI Tools</a></li>
            <li><a href="#video" className="hover:text-foreground">Video Tools</a></li>
            <li><a href="#design" className="hover:text-foreground">Design</a></li>
            <li><a href="#resources" className="hover:text-foreground">Resources</a></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium mb-3">Hub</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#directory" className="hover:text-foreground">AI Directory</a></li>
            <li><a href="#community" className="hover:text-foreground">Community</a></li>
            <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} CreatorHub by Siri. Made with love for creators.</span>
          <span className="glass rounded-full px-3 py-1">Free Forever · No paywalls</span>
        </div>
      </div>
    </footer>
  );
}
