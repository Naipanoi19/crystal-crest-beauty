import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { adminDb, money, type AdminOrder, type AdminProduct, type ContactMessage, type OrderItem } from "@/lib/admin";

export const Route = createFileRoute("/admin/dashboard")({ component: Dashboard });

function Dashboard() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    Promise.all([
      adminDb.from("products").select("*").order("name"),
      adminDb.from("orders").select("*").order("created_at", { ascending: false }),
      adminDb.from("order_items").select("order_id, product_name, quantity, unit_price_cents, line_total_cents"),
      adminDb.from("contact_messages").select("*").order("created_at", { ascending: false }),
    ]).then(([p, o, i, m]: any[]) => {
      setProducts(p.data ?? []); setOrders(o.data ?? []); setItems(i.data ?? []); setMessages(m.data ?? []);
    });
  }, []);

  const recent = orders.slice(0, 5);
  const soldOut = products.filter((p) => p.stock <= 0 || p.admin_status === "sold_out");
  const lowStock = products.filter((p) => p.stock < 3).length;
  const unread = messages.filter((m) => m.status === "unread").length;
  const itemsByOrder = useMemo(() => new Map(orders.map((o) => [o.id, items.filter((i) => i.order_id === o.id)])), [orders, items]);

  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card label="Total Products" value={products.length} />
      <Card label="Total Orders" value={orders.length} />
      <Card label="Low Stock Alert" value={lowStock} tone={lowStock > 0} />
      <Card label="New Messages" value={unread} tone={unread > 0} />
    </div>
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Recent orders</h2>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{recent.map((o) => <tr key={o.id}><td className="p-3 font-medium">{o.customer_name}</td><td className="p-3 text-slate-600">{(itemsByOrder.get(o.id) ?? []).map((i) => `${i.product_name} ×${i.quantity}`).join(", ") || "—"}</td><td className="p-3">{money(o.total_cents)}</td><td className="p-3 capitalize">{o.admin_status.replaceAll("_", " ")}</td><td className="p-3 text-slate-500">{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table>{recent.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No orders yet.</p>}</div>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-lg font-semibold">Sold out products</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{soldOut.map((p) => <div key={p.id} className="rounded-lg border border-slate-200 p-3 text-sm"><p className="font-medium">{p.name}</p><p className="text-slate-500">Stock: {p.stock}</p></div>)}{soldOut.length === 0 && <p className="text-sm text-slate-500">No sold out products.</p>}</div></section>
  </div>;
}
function Card({ label, value, tone }: { label: string; value: number; tone?: boolean }) { return <div className={`rounded-xl border bg-white p-5 shadow-sm ${tone ? "border-[#C9967A]" : "border-slate-200"}`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>; }
