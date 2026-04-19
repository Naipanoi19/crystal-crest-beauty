import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

interface ORow {
  id: string; order_number: string; status: string; channel: string; fulfillment: string;
  payment_method: string; customer_name: string; customer_phone: string; total_cents: number; created_at: string;
}

function OrdersAdmin() {
  const [rows, setRows] = useState<ORow[]>([]);
  const load = () => supabase.from("orders").select("id, order_number, status, channel, fulfillment, payment_method, customer_name, customer_phone, total_cents, created_at").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);

  const advance = async (id: string, status: "pending" | "paid" | "fulfilled" | "cancelled") => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl">Orders</h2>
      <div className="mt-4 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-cream/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr><th className="px-3 py-3">Order</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Channel</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Pay</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-3 font-medium">{r.order_number}<div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div></td>
                <td className="px-3 py-3">{r.customer_name}<div className="text-xs text-muted-foreground">{r.customer_phone}</div></td>
                <td className="px-3 py-3 capitalize">{r.channel}</td>
                <td className="px-3 py-3 capitalize">{r.fulfillment}</td>
                <td className="px-3 py-3 capitalize">{r.payment_method}</td>
                <td className="px-3 py-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{r.status}</span></td>
                <td className="px-3 py-3 text-right">{formatKES(Math.round(r.total_cents / 100))}</td>
                <td className="px-3 py-3 text-right">
                  {r.status === "pending" && <Button size="sm" onClick={() => advance(r.id, "paid")}>Mark paid</Button>}
                  {r.status === "paid" && <Button size="sm" onClick={() => advance(r.id, "fulfilled")}>Fulfill</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  );
}
