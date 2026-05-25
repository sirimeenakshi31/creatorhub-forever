import { Link } from "@tanstack/react-router";
import { Sparkles, Search, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { href: "/#tools", label: "AI Tools" },
  { href: "/#video", label: "Video" },
  { href: "/#design", label: "Design" },
  { href: "/#resources", label: "Resources" },
  { href: "/#directory", label: "Directory" },
  { href: "/#community", label: "Community" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-6xl glass rounded-2xl px-4 py-3 flex items-center gap-4 shadow-card">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid place-items-center size-8 rounded-lg bg-gradient-brand shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span className="tracking-tight">CreatorHub <span className="text-muted-foreground font-normal">by Siri</span></span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50 transition">{l.label}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2 ml-auto lg:ml-0">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search tools…"
              className="h-9 w-48 rounded-lg bg-accent/40 border border-border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          {!loading && (user ? (
            <>
              <Link to="/dashboard" className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border text-sm hover:bg-accent">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
              <button onClick={signOut} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent" aria-label="Sign out">
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="h-9 px-3 inline-flex items-center rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent">Sign in</Link>
              <Link to="/signup" className="h-9 px-4 inline-flex items-center rounded-lg bg-gradient-brand text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition">Get started</Link>
            </>
          ))}
        </div>
        <button className="lg:hidden ml-auto p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden mx-auto max-w-6xl mt-2 glass rounded-2xl p-3 grid gap-1 animate-fade-in">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-accent text-sm">{l.label}</a>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-accent text-sm">Dashboard</Link>
              <button onClick={() => { signOut(); setOpen(false); }} className="px-3 py-2 rounded-lg hover:bg-accent text-sm text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-accent text-sm">Sign in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-accent text-sm">Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
