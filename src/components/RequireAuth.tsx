import { Link, useLocation } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.searchStr);
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center shadow-card">
          <div className="mx-auto size-12 rounded-xl bg-gradient-brand grid place-items-center shadow-glow mb-4">
            <Lock className="size-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Sign in to use this tool</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            CreatorHub is 100% free — we just need an account so your work stays with you.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link
              to="/login"
              search={{ redirect } as never}
              className="h-10 px-5 inline-flex items-center rounded-lg bg-gradient-brand text-primary-foreground text-sm font-medium shadow-glow"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              search={{ redirect } as never}
              className="h-10 px-5 inline-flex items-center rounded-lg border border-border text-sm font-medium hover:bg-accent"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
