import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/admin";
import { getCashierSession } from "./cashier";
import { Lock, Unlock, Save } from "lucide-react";

export const Route = createFileRoute("/cashier/entries")({ component: MyEntries });

type Entry = {
  id: string; product_name: string; category: string; description: string | null;
  buying_price_cents: number; selling_price_cents: number; quantity_bought: number; quantity_sold: number;
  entry_date: string; is_locked: boolean; edit_unlocked_until: string | null; image_data_url: string | null;
};

function MyEntries() {
  const navigate = useNavigate();
  const session = getCashierSession();
  const [rows, setRows] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<Record<string, Entry>>({});
  const [msg, setMsg] = useState("");

  async function load() {
    if (!session) return;
    const { data } = await (supabase as any).from("stock_entries").select("*").eq("cashier_id", session.id).order("entry_date", { ascending: false }).order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  if (!session) { navigate({ to: "/cashier" }); return null; }

  function isEditable(e: Entry) {
    return !e.is_locked || (e.edit_unlocked_until && new Date(e.edit_unlocked_until) > new Date());
  }

  function startEdit(e: Entry) {
    if (!isEditable(e)) { setMsg("This entry is locked. Ask the admin to grant edit access."); return; }
    setEditing((s) => ({ ...s, [e.id]: { ...e } }));
  }

  function change(id: string, patch: Partial<Entry>) {
    setEditing((s) => ({ ...s, [id]: { ...s[id], ...patch } }));
  }

  async function save(id: string) {
    const e = editing[id];
    const { error } = await (supabase as any).from("stock_entries").update({
      product_name: e.product_name, category: e.category, description: e.description,
      buying_price_cents: e.buying_price_cents, selling_price_cents: e.selling_price_cents,
      quantity_bought: e.quantity_bought, quantity_sold: e.quantity_sold,
      is_locked: true, edit_unlocked_until: null,
    }).eq("id", id);
    if (error) { setMsg(error.message); return; }
    setEditing((s) => { const c = { ...s }; delete c[id]; return c; });
    setMsg("Saved & re-locked.");
    load();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl">My entries</h1>
      <p className="text-sm text-slate-500">Locked entries are read-only. The admin can temporarily grant edit access.</p>
      {msg && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{msg}</p>}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="p-3">Date</th><th className="p-3">Product</th><th className="p-3">Cat</th><th className="p-3">Buy</th><th className="p-3">Sell</th><th className="p-3">Bought</th><th className="p-3">Sold</th><th className="p-3">In stock</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const e = editing[r.id];
              const editable = isEditable(r);
              const inStock = Math.max(0, r.quantity_bought - r.quantity_sold);
              if (e) {
                return (
                  <tr key={r.id} className="bg-amber-50/50">
                    <td className="p-3">{r.entry_date}</td>
                    <td className="p-3"><input value={e.product_name} onChange={(ev) => change(r.id, { product_name: ev.target.value })} className="input-admin w-44" /></td>
                    <td className="p-3"><select value={e.category} onChange={(ev) => change(r.id, { category: ev.target.value })} className="input-admin"><option value="skincare">Skincare</option><option value="makeup">Makeup</option><option value="hair">Hair</option><option value="nails">Nails</option></select></td>
                    <td className="p-3"><input type="number" value={Math.round(e.buying_price_cents / 100)} onChange={(ev) => change(r.id, { buying_price_cents: +ev.target.value * 100 })} className="input-admin w-24" /></td>
                    <td className="p-3"><input type="number" value={Math.round(e.selling_price_cents / 100)} onChange={(ev) => change(r.id, { selling_price_cents: +ev.target.value * 100 })} className="input-admin w-24" /></td>
                    <td className="p-3"><input type="number" value={e.quantity_bought} onChange={(ev) => change(r.id, { quantity_bought: +ev.target.value })} className="input-admin w-20" /></td>
                    <td className="p-3"><input type="number" value={e.quantity_sold} onChange={(ev) => change(r.id, { quantity_sold: +ev.target.value })} className="input-admin w-20" /></td>
                    <td className="p-3 font-semibold">{Math.max(0, e.quantity_bought - e.quantity_sold)}</td>
                    <td className="p-3"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Editing</span></td>
                    <td className="p-3"><button onClick={() => save(r.id)} className="inline-flex items-center gap-1 rounded-lg bg-[#1C1C1E] px-3 py-1.5 text-xs text-white hover:bg-[#C9967A]"><Save className="h-3.5 w-3.5" /> Save</button></td>
                  </tr>
                );
              }
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
                  <td className="p-3">{money(r.buying_price_cents)}</td>
                  <td className="p-3">{money(r.selling_price_cents)}</td>
                  <td className="p-3">{r.quantity_bought}</td>
                  <td className="p-3">{r.quantity_sold}</td>
                  <td className="p-3 font-semibold">{inStock}</td>
                  <td className="p-3">
                    {editable
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"><Unlock className="h-3 w-3" /> Editable</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"><Lock className="h-3 w-3" /> Locked</span>}
                  </td>
                  <td className="p-3"><button onClick={() => startEdit(r)} disabled={!editable} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40 hover:text-[#C9967A]">Edit</button></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={10} className="p-6 text-center text-slate-500">No entries yet. Use “Add new stock” to record one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
