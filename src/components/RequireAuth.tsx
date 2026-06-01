import type { ReactNode } from "react";

// Auth has been removed from the app. RequireAuth is now a transparent
// pass-through so existing route files don't need to be refactored.
export function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
