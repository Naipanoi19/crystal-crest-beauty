import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/data/products";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, lowStock: 0, deadStock: 0 });

  useEffect(() => {
    (async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from("orders").select("total_cents, created_at"),
        supabase.from("products").select("stock, reorder_threshold, last_sold_at, is_active"),
      ]);
      const orders = o ?? []; const products = p ?? [];
      const revenue = orders.reduce((s, x) => s + x.total_cents, 0) / 100;
      const todayOrders = orders.filter((x) => new Date(x.created_at) >= today).length;
      const lowStock = products.filter((x) => x.is_active && x.stock <= x.reorder_threshold && x.stock > 0).length;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
      const deadStock = products.filter((x) => x.is_active && x.stock > 0 && (!x.last_sold_at || new Date(x.last_sold_at) < cutoff)).length;
      setStats({ orders: todayOrders, revenue, lowStock, deadStock });
    })();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Orders today" value={String(stats.orders)} />
      <Stat label="Lifetime revenue" value={formatKES(Math.round(stats.revenue))} />
      <Stat label="Low stock" value={String(stats.lowStock)} accent={stats.lowStock > 0} />
      <Stat label="Deadstock (60d+)" value={String(stats.deadStock)} accent={stats.deadStock > 0} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border p-5 ${accent ? "border-accent bg-blush/30" : "border-border bg-cream/40"}`}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
