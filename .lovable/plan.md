
## Goal

Add a simple, protected profile page at `/profile` where signed-in users can:
- View their account email (read-only)
- Edit their display name (stored in a `profiles` table)
- Change their password (for email/password users)

## Scope

Small, focused addition. Keeps the existing glassmorphism style, `RequireAuth` pattern, and Supabase auth flow already in use.

## Steps

1. **Database — create `profiles` table**
   - Columns: `id` (uuid, PK, FK → `auth.users.id` cascade), `display_name` (text), `created_at`, `updated_at`.
   - GRANTs: `authenticated` (select/insert/update/delete on own row), `service_role` (all).
   - RLS enabled with policies scoped to `auth.uid() = id` for select / insert / update.
   - Trigger `handle_new_user()` → on `auth.users` insert, create a matching `profiles` row using `raw_user_meta_data->>'full_name'` as initial display name when present.
   - Trigger to keep `updated_at` fresh.

2. **New route — `src/routes/profile.tsx`**
   - Wrapped in `<RequireAuth>` (same pattern as `dashboard.tsx`).
   - Renders the existing `<Navbar />`.
   - Three glass cards:
     - **Account** — read-only email + provider badge (Google/email).
     - **Display name** — input + Save button. Loads/upserts row in `profiles` via the browser Supabase client (RLS limits to own row). Uses zod validation (1–60 chars, trimmed).
     - **Change password** — current/new password fields, calls `supabase.auth.updateUser({ password })`. Hidden if the user signed in only via Google (no password set — detected via `user.identities`).
   - Toast feedback via `sonner` (already used elsewhere).

3. **Navbar — add Profile link**
   - In `src/components/Navbar.tsx`, add a "Profile" link next to "Dashboard" in the signed-in section (desktop + mobile menu).

4. **Dashboard greeting — read display name from `profiles`**
   - Small enhancement in `src/routes/dashboard.tsx`: prefer `profiles.display_name` over `user_metadata.full_name` for the `Hi {name}` greeting (best-effort fetch; falls back to current behavior).

## Technical notes

- All DB access is via the browser `supabase` client; RLS does the authorization. No server function needed for this small surface.
- Auto-generated `src/integrations/supabase/types.ts` will be refreshed by the migration tool — no manual edit.
- No new dependencies. Reuses `AuthShell`-style `Field` controls inline for consistency.
- Route file naming `profile.tsx` maps to `/profile` — registered automatically by the TanStack Router Vite plugin.

## Files

- New: `supabase/migrations/<timestamp>_profiles.sql` (via migration tool)
- New: `src/routes/profile.tsx`
- Edit: `src/components/Navbar.tsx` (add Profile link)
- Edit: `src/routes/dashboard.tsx` (greeting reads `profiles.display_name`)
