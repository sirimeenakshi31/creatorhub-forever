import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Mail, User as UserIcon, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/RequireAuth";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — CreatorHub" }, { name: "description", content: "Manage your account and preferences." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <RequireAuth><ProfilePage /></RequireAuth>,
});

const displayNameSchema = z.string().trim().min(1, "Display name can't be empty").max(60, "Max 60 characters");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72, "Max 72 characters");

function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const providers = (user?.identities ?? []).map((i) => i.provider);
  const hasPassword = providers.includes("email");

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error) toast.error("Couldn't load profile");
      setDisplayName(data?.display_name ?? "");
      setLoadingProfile(false);
    })();
    return () => { active = false; };
  }, [user]);

  const onSaveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = displayNameSchema.safeParse(displayName);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: parsed.data }, { onConflict: "id" });
    setSavingName(false);
    if (error) return toast.error(error.message);
    toast.success("Display name updated");
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setSavingPassword(false);
    if (error) return toast.error(error.message);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 grid gap-6">
        <header>
          <p className="text-sm text-muted-foreground">Settings</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Your profile</h1>
          <p className="mt-2 text-muted-foreground">Manage your account info and preferences.</p>
        </header>

        {/* Account card */}
        <section className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">Account</h2>
          </div>
          <div className="grid gap-1.5 text-sm">
            <span className="text-muted-foreground">Email</span>
            <div className="h-11 rounded-lg bg-accent/40 border border-border px-3 flex items-center text-sm">
              {user?.email}
            </div>
          </div>
          {providers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {providers.map((p) => (
                <span key={p} className="text-xs px-2 py-1 rounded-md border border-border bg-accent/30 capitalize">
                  {p === "email" ? "Email & Password" : p}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Display name card */}
        <section className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">Display name</h2>
          </div>
          <form onSubmit={onSaveName} className="grid gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted-foreground">How should we greet you?</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loadingProfile}
                placeholder="e.g. Alex Rivers"
                maxLength={60}
                className="h-11 rounded-lg bg-accent/40 border border-border px-3 outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
              />
            </label>
            <div>
              <button
                disabled={savingName || loadingProfile}
                className="h-10 px-5 rounded-lg bg-gradient-brand text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-60 inline-flex items-center gap-2"
              >
                {savingName && <Loader2 className="size-4 animate-spin" />} Save
              </button>
            </div>
          </form>
        </section>

        {/* Password card */}
        {hasPassword && (
          <section className="glass rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">Change password</h2>
            </div>
            <form onSubmit={onChangePassword} className="grid gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="text-muted-foreground">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-11 rounded-lg bg-accent/40 border border-border px-3 outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="text-muted-foreground">Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-11 rounded-lg bg-accent/40 border border-border px-3 outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
              <div>
                <button
                  disabled={savingPassword || !newPassword}
                  className="h-10 px-5 rounded-lg border border-border text-sm font-medium hover:bg-accent disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {savingPassword && <Loader2 className="size-4 animate-spin" />} Update password
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
