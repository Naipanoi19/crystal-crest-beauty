import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/admin";
import { getCashierSession } from "./cashier";

export const Route = createFileRoute("/cashier/in-stock")({ component: InStock });

type Row = {
  id: string; product_name: string; category: string; image_data_url: string | null;
  selling_price_cents: number; quantity_bought: number; quantity_sold: number;
};

function InStock() {
  const navigate = useNavigate();
  const session = getCashierSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (supabase as any).from("stock_entries")
      .select("id, product_name, category, image_data_url, selling_price_cents, quantity_bought, quantity_sold")
      .order("product_name")
      .then(({ data }: any) => setRows(data ?? []));
  }, []);

  if (!session) { navigate({ to: "/cashier" }); return null; }

  // aggregate by product_name + category
  const groups = new Map<string, { name: string; category: string; image: string | null; price: number; stock: number }>();
  rows.forEach((r) => {
    const key = `${r.product_name.toLowerCase()}|${r.category}`;
    const stock = Math.max(0, r.quantity_bought - r.quantity_sold);
    const existing = groups.get(key);
    if (existing) {
      existing.stock += stock;
      if (!existing.image && r.image_data_url) existing.image = r.image_data_url;
    } else {
      groups.set(key, { name: r.product_name, category: r.category, image: r.image_data_url, price: r.selling_price_cents, stock });
    }
  });
  const list = [...groups.values()].filter((g) => filter === "all" || g.category === filter);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl">In stock right now</h1>
      <p className="text-sm text-slate-500">Live stock totals across all entries.</p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {["all", "skincare", "makeup", "hair", "nails"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg border px-3 py-1.5 capitalize ${filter === f ? "border-[#C9967A] bg-[#C9967A]/10 text-[#C9967A]" : "border-slate-200 text-slate-600"}`}>{f}</button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Selling price</th><th className="p-3">In stock</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((g) => (
              <tr key={`${g.name}-${g.category}`}>
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    {g.image && <img src={g.image} alt="" className="h-9 w-9 rounded object-cover" />}
                    {g.name}
                  </div>
                </td>
                <td className="p-3 capitalize">{g.category}</td>
                <td className="p-3">{money(g.price)}</td>
                <td className={`p-3 font-semibold ${g.stock === 0 ? "text-red-600" : g.stock < 5 ? "text-amber-600" : "text-emerald-700"}`}>{g.stock}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">No stock recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
