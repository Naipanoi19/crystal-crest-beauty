import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminDb, money } from "@/lib/admin";
import { Lock, Unlock } from "lucide-react";

export const Route = createFileRoute("/admin/stock-entries")({ component: StockEntriesAdmin });

type Entry = {
  id: string; cashier_id: string; product_name: string; category: string; description: string | null;
  buying_price_cents: number; selling_price_cents: number; quantity_bought: number; quantity_sold: number;
  entry_date: string; is_locked: boolean; edit_unlocked_until: string | null; image_data_url: string | null;
};
type Cashier = { id: string; username: string; full_name: string };

function StockEntriesAdmin() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [cashiers, setCashiers] = useState<Record<string, Cashier>>({});
  const [filter, setFilter] = useState<"all" | "locked" | "unlocked">("all");

  const load = async () => {
    const [{ data: entries }, { data: cs }]: any[] = await Promise.all([
      adminDb.from("stock_entries").select("*").order("entry_date", { ascending: false }).order("created_at", { ascending: false }),
      adminDb.from("cashiers").select("id, username, full_name"),
    ]);
    setRows(entries ?? []);
    setCashiers(Object.fromEntries((cs ?? []).map((c: Cashier) => [c.id, c])));
  };
  useEffect(() => { load(); }, []);

  async function grantEdit(e: Entry) {
    const minutes = Number(prompt(`Grant edit access to "${e.product_name}" for how many minutes?`, "30"));
    if (!minutes || minutes < 1) return;
    const until = new Date(Date.now() + minutes * 60_000).toISOString();
    await adminDb.from("stock_entries").update({ edit_unlocked_until: until, is_locked: true }).eq("id", e.id);
    load();
  }

  async function relock(e: Entry) {
    await adminDb.from("stock_entries").update({ edit_unlocked_until: null, is_locked: true }).eq("id", e.id);
    load();
  }

  const filtered = rows.filter((r) => {
    if (filter === "locked") return r.is_locked && !(r.edit_unlocked_until && new Date(r.edit_unlocked_until) > new Date());
    if (filter === "unlocked") return !r.is_locked || (r.edit_unlocked_until && new Date(r.edit_unlocked_until) > new Date());
    return true;
  });

  const totals = filtered.reduce((acc, r) => {
    acc.stock += Math.max(0, r.quantity_bought - r.quantity_sold);
    acc.bought += r.quantity_bought;
    acc.sold += r.quantity_sold;
    acc.revenue += r.selling_price_cents * r.quantity_sold;
    acc.cost += r.buying_price_cents * r.quantity_bought;
    return acc;
  }, { stock: 0, bought: 0, sold: 0, revenue: 0, cost: 0 });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="In Stock" value={String(totals.stock)} />
        <Stat label="Total Sold" value={String(totals.sold)} />
        <Stat label="Revenue" value={money(totals.revenue)} />
        <Stat label="Cost" value={money(totals.cost)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Cashier Stock Entries</h2>
          <div className="flex gap-2 text-sm">
            {(["all", "locked", "unlocked"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-lg border px-3 py-1.5 capitalize ${filter === f ? "border-[#C9967A] bg-[#C9967A]/10 text-[#C9967A]" : "border-slate-200 text-slate-600"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Date</th><th className="p-3">Product</th><th className="p-3">Cat</th><th className="p-3">Cashier</th>
                <th className="p-3">Buy</th><th className="p-3">Sell</th><th className="p-3">Bought</th><th className="p-3">Sold</th>
                <th className="p-3">In stock</th><th className="p-3">Lock</th><th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const c = cashiers[r.cashier_id];
                const inStock = Math.max(0, r.quantity_bought - r.quantity_sold);
                const unlockActive = r.edit_unlocked_until && new Date(r.edit_unlocked_until) > new Date();
                return (
                  <tr key={r.id}>
                    <td className="p-3 text-slate-500">{r.entry_date}</td>
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        {r.image_data_url && <img src={r.image_data_url} className="h-8 w-8 rounded object-cover" alt="" />}
                        {r.product_name}
                      </div>
                    </td>
                    <td className="p-3 capitalize">{r.category}</td>
                    <td className="p-3 text-slate-600">{c?.username ?? "—"}</td>
                    <td className="p-3">{money(r.buying_price_cents)}</td>
                    <td className="p-3">{money(r.selling_price_cents)}</td>
                    <td className="p-3">{r.quantity_bought}</td>
                    <td className="p-3">{r.quantity_sold}</td>
                    <td className="p-3 font-semibold">{inStock}</td>
                    <td className="p-3">
                      {unlockActive ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Editable</span>
                        : r.is_locked ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Locked</span>
                        : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Open</span>}
                    </td>
                    <td className="p-3">
                      {unlockActive
                        ? <button onClick={() => relock(r)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:text-[#C9967A]"><Lock className="h-3.5 w-3.5" /> Re-lock</button>
                        : <button onClick={() => grantEdit(r)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:text-[#C9967A]"><Unlock className="h-3.5 w-3.5" /> Grant edit</button>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={11} className="p-6 text-center text-slate-500">No entries yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1C1C1E]">{value}</p>
    </div>
  );
}
