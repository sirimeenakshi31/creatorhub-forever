import { Navigate, useLocation } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getAuthUnavailableMessage, isSupabaseConfigured } from "@/lib/supabase-config";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (typeof window === "undefined") return null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center shadow-card">
          <div className="mx-auto size-12 rounded-xl bg-gradient-brand grid place-items-center shadow-glow mb-4">
            <Lock className="size-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Sign in is temporarily unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">{getAuthUnavailableMessage()}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const currentPath = location.pathname || "/";
    const currentSearch = location.searchStr || "";
    const redirect = currentPath === "/login" || currentPath === "/signup"
      ? "/dashboard"
      : `${currentPath}${currentSearch}`;

    return <Navigate to="/login" search={{ redirect } as never} replace />;
  }

  return <>{children}</>;
}
