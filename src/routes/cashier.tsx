import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ClipboardList, PackagePlus, Boxes } from "lucide-react";

export const Route = createFileRoute("/cashier")({
  head: () => ({ meta: [{ title: "Cashier — Crystal Crest" }] }),
  component: CashierRoute,
});

const STORAGE = "cc.cashier.session";
type Session = { id: string; username: string; full_name: string };

export function getCashierSession(): Session | null {
  if (typeof window === "undefined") return null;
  try { const r = localStorage.getItem(STORAGE); return r ? JSON.parse(r) : null; } catch { return null; }
}

function CashierRoute() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { setSession(getCashierSession()); setReady(true); }, [location.pathname]);

  if (!ready) return null;
  if (!session) return <CashierLogin onLogin={(s) => setSession(s)} />;
  if (location.pathname === "/cashier") return <CashierHome session={session} />;
  return <CashierShell session={session} onLogout={() => { localStorage.removeItem(STORAGE); setSession(null); }} />;
}

function CashierLogin({ onLogin }: { onLogin: (s: Session) => void }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    const { data, error } = await (supabase as any).rpc("verify_cashier", { _username: username.trim().toLowerCase(), _pin: pin });
    setBusy(false);
    if (error) { setError(error.message); return; }
    if (!data || data.length === 0) { setError("Invalid username or PIN."); return; }
    const s = data[0] as Session;
    localStorage.setItem(STORAGE, JSON.stringify(s));
    onLogin(s);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f8] px-4 py-10 text-[#1C1C1E]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#C9967A] font-display text-xl text-white">CC</div>
          <h1 className="mt-5 text-2xl font-semibold">Cashier Sign-in</h1>
          <p className="mt-1 text-sm text-slate-500">Use your username and PIN.</p>
        </div>
        <label className="mt-8 block text-sm font-medium">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#C9967A]" autoCapitalize="none" autoCorrect="off" />
        <label className="mt-4 block text-sm font-medium">PIN</label>
        <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={8} type="password" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono tracking-widest outline-none focus:border-[#C9967A]" />
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-lg bg-[#1C1C1E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#C9967A] disabled:opacity-60">
          {busy ? "Checking…" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-xs text-slate-400">Need an account? Ask the admin to create one for you.</p>
      </form>
    </main>
  );
}

function CashierShell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const navigate = useNavigate();
  function logout() { onLogout(); navigate({ to: "/cashier" }); }
  return (
    <div className="min-h-screen bg-slate-50 text-[#1C1C1E]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
        <Link to="/cashier" className="font-display text-lg">Crystal Crest · Cashier</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{session.full_name}</span>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-[#C9967A] hover:text-[#C9967A]"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
      </header>
      <main className="p-4 lg:p-6"><Outlet /></main>
    </div>
  );
}

function CashierHome({ session }: { session: Session }) {
  const navigate = useNavigate();
  function logout() { localStorage.removeItem(STORAGE); navigate({ to: "/cashier" }); }
  return (
    <div className="min-h-screen bg-slate-50 text-[#1C1C1E]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
        <Link to="/cashier" className="font-display text-lg">Crystal Crest · Cashier</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{session.full_name}</span>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-[#C9967A] hover:text-[#C9967A]"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4 lg:p-6">
        <h1 className="font-display text-3xl">Hi, {session.full_name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">What would you like to do today?</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Tile to="/cashier/new-stock" icon={<PackagePlus className="h-5 w-5" />} title="Add new stock" desc="Record buying & selling price, quantity, picture and description." />
          <Tile to="/cashier/entries" icon={<ClipboardList className="h-5 w-5" />} title="My entries" desc="View and update today's saved entries (if admin granted access)." />
          <Tile to="/cashier/in-stock" icon={<Boxes className="h-5 w-5" />} title="In stock now" desc="See all available stock and quantities right now." />
        </div>
      </main>
    </div>
  );
}

function Tile({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to as any} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9967A] hover:shadow-md">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#C9967A]/10 text-[#C9967A]">{icon}</div>
      <p className="mt-4 font-display text-xl">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </Link>
  );
}
