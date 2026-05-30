import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { AuthShell, Field, Divider, safeRedirect } from "./login";
import { getAuthUnavailableMessage, isSupabaseConfigured } from "@/lib/supabase-config";

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect:
      typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//")
        ? s.redirect
        : "/dashboard",
  }),
  head: () => ({ meta: [{ title: "Create account — CreatorHub" }, { name: "description", content: "Create your free CreatorHub account." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { user, loading: authLoading } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const authReady = typeof window !== "undefined" && isSupabaseConfigured();

  useEffect(() => {
    if (!authLoading && user) navigate({ to: safeRedirect(redirect), replace: true });
  }, [authLoading, user, navigate, redirect]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authReady) return toast.error(getAuthUnavailableMessage());
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) return toast.error(error.message);
      toast.success("Account created — check your email to confirm.");
    } catch {
      toast.error(getAuthUnavailableMessage());
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    if (!authReady) return toast.error(getAuthUnavailableMessage());
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      if (result.error) toast.error("Google sign-up failed");
    } catch {
      toast.error("Google sign-up failed");
    }
  };

  return <AuthShell title="Create your account" subtitle="Free forever. No credits, no paywalls.">
    <button onClick={onGoogle} type="button" className="w-full h-11 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium flex items-center justify-center gap-2">
      Continue with Google
    </button>
    <Divider />
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      <Field label="Password (min 6 chars)" type="password" value={password} onChange={setPassword} required autoComplete="new-password" />
      <button disabled={loading} className="h-11 rounded-lg bg-gradient-brand text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-60 inline-flex items-center justify-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />} Create account
      </button>
    </form>
    <p className="mt-4 text-center text-sm text-muted-foreground">
      Already have an account? <Link to="/login" search={{ redirect } as never} className="text-foreground underline">Sign in</Link>
    </p>
  </AuthShell>;
}
