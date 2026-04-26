import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Boxes, ChevronRight, FolderTree, Home, Inbox, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Users, X, UserCog, ClipboardList } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminDb, adminEmail } from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Crystal Crest" }] }),
  component: AdminRoute,
});

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/cashiers", label: "Cashiers", icon: UserCog },
  { to: "/admin/stock-entries", label: "Stock Entries", icon: ClipboardList },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/content", label: "Homepage Content", icon: Home },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/uploads", label: "Excel Uploads", icon: Boxes },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminRoute() {
  const location = useLocation();
  return location.pathname === "/admin" ? <AdminLogin /> : <AdminShell />;
}

function AdminLogin() {
  const { signIn, signOut, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin/dashboard" });
  }, [loading, user, isAdmin, navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (username.trim().toLowerCase() !== "admin") {
      setError("Incorrect credentials. Try again.");
      return;
    }
    setBusy(true);
    const res = await signIn(adminEmail, password);
    setBusy(false);
    if (res.error) {
      await signOut();
      setError("Incorrect credentials. Try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 text-[#1C1C1E]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <form onSubmit={submit} className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#C9967A] font-display text-xl text-white">CC</div>
            <h1 className="mt-5 text-2xl font-semibold">Crystal Crest Admin</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage the business.</p>
          </div>
          <label className="mt-8 block text-sm font-medium">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#C9967A]" autoComplete="username" />
          <label className="mt-4 block text-sm font-medium">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#C9967A]" autoComplete="current-password" />
          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="mt-6 w-full rounded-lg bg-[#1C1C1E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#C9967A] disabled:opacity-60">
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

function AdminShell() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/admin" });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    adminDb.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "unread").then(({ count }: any) => setUnread(count ?? 0));
  }, [location.pathname]);

  const activeTitle = useMemo(() => nav.find((n) => location.pathname.startsWith(n.to))?.label ?? "Dashboard", [location.pathname]);

  if (loading || !user || !isAdmin) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Checking admin access…</div>;

  async function logout() {
    await signOut();
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#1C1C1E] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className={`${open ? "fixed inset-0 z-50" : "hidden"} bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:border-r lg:border-slate-200`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <p className="text-lg font-semibold">Crystal Crest</p>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to as any} onClick={() => setOpen(false)} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[#C9967A]/10 text-[#C9967A]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                <span className="flex items-center gap-3"><item.icon className="h-4 w-4" />{item.label}</span>
                {item.to === "/admin/messages" && unread > 0 && <span className="rounded-full bg-[#C9967A] px-2 py-0.5 text-xs text-white">{unread}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-lg border border-slate-200 p-2 lg:hidden"><Menu className="h-4 w-4" /></button>
            <div>
              <p className="text-sm text-slate-500">Crystal Crest Admin</p>
              <h1 className="text-lg font-semibold">{activeTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:border-[#C9967A] hover:text-[#C9967A]"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </header>
        <main className="p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
