import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Sparkles, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/RequireAuth";
import { Navbar } from "@/components/Navbar";
import { TOOLS } from "@/lib/tools";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CreatorHub" }, { name: "description", content: "Your creator dashboard." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <RequireAuth><DashboardPage /></RequireAuth>,
});

function DashboardPage() {
  const { user, signOut } = useAuth();
  const featured = TOOLS.slice(0, 8);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (active) setProfileName(data?.display_name ?? null); });
    return () => { active = false; };
  }, [user]);

  const name = profileName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "creator";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">Hi {name} 👋</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">Pick up where you left off. All tools are free and unlimited.</p>
          </div>
          <button onClick={signOut} className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border text-sm hover:bg-accent">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Star className="size-4" /> Quick start
          </h2>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {featured.map((t) => (
              <Link
                key={t.slug}
                to={`/tools/${t.slug}` as never}
                className="glass rounded-xl p-4 shadow-card hover:shadow-glow transition group"
              >
                <div className="size-9 rounded-lg bg-gradient-brand grid place-items-center shadow-glow mb-3">
                  <Sparkles className="size-4 text-primary-foreground" />
                </div>
                <div className="font-medium">{t.name}</div>
                <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.description}</div>
                <div className="mt-3 text-xs inline-flex items-center gap-1 text-foreground/80 group-hover:translate-x-0.5 transition">
                  Open <ArrowRight className="size-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 grid lg:grid-cols-2 gap-4">
          <EmptyCard title="Recent generations" body="Your generated outputs will appear here once you start creating." />
          <EmptyCard title="Saved projects" body="Save any output to build up your project library." />
        </section>
      </main>
    </div>
  );
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
