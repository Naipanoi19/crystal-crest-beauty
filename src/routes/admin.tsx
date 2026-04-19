import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, Boxes, ScanBarcode } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Crystal Crest" }] }),
  component: AdminLayout,
});

const tabs: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/pos", label: "POS", icon: ScanBarcode },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
];

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/account" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-luxe py-24 text-center text-sm text-muted-foreground">Checking access…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container-luxe py-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Admin</p>
        <h1 className="mt-2 font-display text-3xl">Crystal Crest control room</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_1fr]">
          <aside className="space-y-1">
            {tabs.map((t) => {
              const active = t.end ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
              return (
                <Link key={t.to} to={t.to}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition ${active ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </Link>
              );
            })}
          </aside>
          <main className="min-w-0"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
