import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function ToolShell({ title, eyebrow, description, children }: {
  title: string; eyebrow: string; description: string; children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-hero pointer-events-none" />
      <header className="relative px-4 pt-6">
        <div className="mx-auto max-w-5xl flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm hover-lift">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <span className="ml-auto glass rounded-full px-3 py-1 text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Sparkles className="size-3 text-brand" /> Free Forever
          </span>
        </div>
      </header>
      <main className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase tracking-widest text-brand mb-2">{eyebrow}</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
