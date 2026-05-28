import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  head: () => ({ meta: [{ title: "Sign in — CreatorHub" }, { name: "description", content: "Sign in to your CreatorHub account." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: decodeURIComponent(redirect) as string, replace: true });
    }
  }, [authLoading, user, navigate, redirect]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) toast.error("Google sign-in failed");
  };

  return <AuthShell title="Welcome back" subtitle="Sign in to continue creating.">
    <button onClick={onGoogle} type="button" className="w-full h-11 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium flex items-center justify-center gap-2">
      <GoogleIcon /> Continue with Google
    </button>
    <Divider />
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={setPassword} required autoComplete="current-password" />
      <button disabled={loading} className="h-11 rounded-lg bg-gradient-brand text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-60 inline-flex items-center justify-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />} Sign in
      </button>
    </form>
    <p className="mt-4 text-center text-sm text-muted-foreground">
      No account? <Link to="/signup" search={{ redirect } as never} className="text-foreground underline">Create one</Link>
    </p>
  </AuthShell>;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 font-semibold">
          <span className="grid place-items-center size-8 rounded-lg bg-gradient-brand shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span>CreatorHub <span className="text-muted-foreground font-normal">by Siri</span></span>
        </Link>
        <div className="glass rounded-2xl p-8 shadow-card">
          <h1 className="text-2xl font-semibold tracking-tight text-center">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">{subtitle}</p>
          <div className="mt-6 grid gap-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, required, autoComplete }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} autoComplete={autoComplete}
        className="h-11 rounded-lg bg-accent/40 border border-border px-3 outline-none focus:ring-2 focus:ring-ring/40" />
    </label>
  );
}

export function Divider() {
  return <div className="flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" /></div>;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5c-7 0-13 4-16 9.7z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-1.9 1.4-4.4 2.3-7.1 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5c3 6 9.2 10.3 17.8 10.3z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.6l6.1 5c4.3-3.9 7-9.6 7-16.1 0-1.3-.1-2.3-.4-3.5z"/></svg>
  );
}
