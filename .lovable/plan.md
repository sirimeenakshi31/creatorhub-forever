
## Goal

Stop a single render-time exception from blanking the whole live site. The current `errorComponent` on the root route only catches errors thrown inside TanStack Router's tree-walking machinery (loaders, route components). A throw inside `AuthProvider`, the `Toaster`, or any deeply-nested child during render is not caught and crashes the whole React tree, producing the "Something went wrong" full-page failure on production.

## Changes

### 1. New `src/components/error-boundary.tsx`

A small class component `<AppErrorBoundary>` implementing `componentDidCatch` / `getDerivedStateFromError`. On error it:
- Logs the raw `Error` via `console.error(error)` (preserves stack for Server Logs).
- Renders a self-contained branded fallback (same visual language as the existing root `ErrorComponent`: heading, message, "Try again" + "Go home" buttons).
- "Try again" resets local error state (`setState({ error: null })`) and calls `window.location.reload()` as a hard fallback.
- Uses only Tailwind tokens already in the design system — no new dependencies, no imports from app code that could themselves fail.

### 2. Wrap the app in `src/routes/__root.tsx`

Inside `RootComponent`, wrap children with the new boundary so it sits above `AuthProvider`, `Outlet`, and `Toaster`:

```tsx
<QueryClientProvider client={queryClient}>
  <AppErrorBoundary>
    <AuthProvider>
      <Outlet />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  </AppErrorBoundary>
</QueryClientProvider>
```

Keep the existing route-level `errorComponent` and `notFoundComponent` untouched — they still handle loader/router errors first; the class boundary is the safety net for everything else.

### 3. Register `defaultErrorComponent` on the router in `src/router.tsx`

Reuse the same branded fallback (extracted into the boundary file or inlined) as `defaultErrorComponent` so any descendant route without its own `errorComponent` also gets a non-crashing fallback instead of bubbling to the root.

## Out of scope

- No UI redesign, no new features, no auth/data logic changes.
- No changes to existing API routes, loaders, or server functions.
- The SSR/h3 wrapper hardening (separate `src/server.ts` work) is not part of this task — this plan only addresses render-time error boundary coverage.
