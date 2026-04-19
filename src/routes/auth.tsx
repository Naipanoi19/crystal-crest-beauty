import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Crystal Crest" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (user) {
    navigate({ to: "/account" });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setInfo(null);
    const res = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password, fullName, phone);
    setBusy(false);
    if (res.error) setErr(res.error);
    else if (mode === "signup") setInfo("Check your email to confirm, then sign in.");
    else navigate({ to: "/account" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Account</p>
          <h1 className="mt-3 font-display text-4xl">{mode === "login" ? "Welcome back." : "Join Crystal Crest."}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to track orders and check out faster." : "Create an account to save your details for next time."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Full name" value={fullName} onChange={setFullName} required />
                <Field label="Phone" value={phone} onChange={setPhone} required type="tel" placeholder="+254…" />
              </>
            )}
            <Field label="Email" value={email} onChange={setEmail} required type="email" />
            <Field label="Password" value={password} onChange={setPassword} required type="password" />

            {err && <p className="text-sm text-destructive">{err}</p>}
            {info && <p className="text-sm text-accent">{info}</p>}

            <Button type="submit" disabled={busy} size="lg" className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90">
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-accent underline">
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Link to="/">Back to home</Link>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        type={type} required={required} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
      />
    </label>
  );
}
