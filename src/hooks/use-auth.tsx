import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-config";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(() => typeof window !== "undefined" && isSupabaseConfigured());

  useEffect(() => {
    if (typeof window === "undefined" || !isSupabaseConfigured()) {
      setSession(null);
      setLoading(false);
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      // Subscribe FIRST, then hydrate the existing session. Do not await inside the auth callback.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        if (!active) return;
        setSession(s ?? null);
        setLoading(false);
      });
      unsubscribe = () => subscription.unsubscribe();

      supabase.auth.getSession()
        .then(({ data }) => {
          if (!active) return;
          setSession(data?.session ?? null);
        })
        .catch(() => {
          if (!active) return;
          setSession(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } catch {
      setSession(null);
      setLoading(false);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    signOut: async () => {
      if (typeof window === "undefined" || !isSupabaseConfigured()) return;
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
