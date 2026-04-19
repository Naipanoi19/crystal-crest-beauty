import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My account — Crystal Crest" }] }),
  component: Account,
});

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  fulfillment: string;
  payment_method: string;
  total_cents: number;
  created_at: string;
}

function Account() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id, order_number, status, fulfillment, payment_method, total_cents, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoadingOrders(false); });
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-luxe py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Account</p>
            <h1 className="mt-3 font-display text-4xl">Hello, {user.email}</h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && <Button asChild variant="outline"><Link to="/admin">Admin</Link></Button>}
            <Button variant="outline" onClick={() => signOut().then(() => navigate({ to: "/" }))}>Sign out</Button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl">Your orders</h2>
          {loadingOrders ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet. <Link to="/shop" search={{ category: "all", sort: "featured" }} className="text-accent underline">Start shopping</Link>.</p>
          ) : (
            <div className="mt-6 overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="bg-cream/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Order</th><th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Fulfillment</th><th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-medium">{o.order_number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 capitalize">{o.fulfillment}</td>
                      <td className="px-4 py-3 capitalize">{o.payment_method}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{o.status}</span></td>
                      <td className="px-4 py-3 text-right">{formatKES(Math.round(o.total_cents / 100))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
