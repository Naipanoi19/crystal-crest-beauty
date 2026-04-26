import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fileToDataUrl } from "@/lib/admin";
import { getCashierSession } from "./cashier";

export const Route = createFileRoute("/cashier/new-stock")({ component: NewStock });

const CATEGORIES = [
  { value: "skincare", label: "Skincare" },
  { value: "makeup", label: "Makeup" },
  { value: "hair", label: "Hair Care" },
  { value: "nails", label: "Nails" },
];

function NewStock() {
  const navigate = useNavigate();
  const session = getCashierSession();
  const [draft, setDraft] = useState({
    product_name: "", category: "skincare", description: "",
    buying_price: 0, selling_price: 0, quantity_bought: 1, image: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!session) { navigate({ to: "/cashier" }); return null; }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    const payload = {
      cashier_id: session!.id,
      product_name: draft.product_name.trim(),
      category: draft.category,
      description: draft.description.trim() || null,
      image_data_url: draft.image || null,
      buying_price_cents: Math.round(Number(draft.buying_price) * 100),
      selling_price_cents: Math.round(Number(draft.selling_price) * 100),
      quantity_bought: Math.max(0, Math.floor(Number(draft.quantity_bought))),
      quantity_sold: 0,
      is_locked: true, // lock immediately on save
    };
    if (!payload.product_name) { setError("Product name is required."); setBusy(false); return; }
    const { error } = await (supabase as any).from("stock_entries").insert(payload);
    setBusy(false);
    if (error) { setError(error.message); return; }
    navigate({ to: "/cashier/entries" });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl">Add new stock</h1>
      <p className="text-sm text-slate-500">Once saved, this entry is locked. The admin must grant edit access to change it.</p>
      <form onSubmit={save} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <Field label="Product name" full><input required value={draft.product_name} onChange={(e) => setDraft({ ...draft, product_name: e.target.value })} className="input-admin w-full" /></Field>
        <Field label="Category"><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="input-admin w-full">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></Field>
        <Field label="Quantity bought"><input type="number" min={0} required value={draft.quantity_bought} onChange={(e) => setDraft({ ...draft, quantity_bought: +e.target.value })} className="input-admin w-full" /></Field>
        <Field label="Buying price (Ksh)"><input type="number" min={0} required value={draft.buying_price} onChange={(e) => setDraft({ ...draft, buying_price: +e.target.value })} className="input-admin w-full" /></Field>
        <Field label="Selling price (Ksh)"><input type="number" min={0} required value={draft.selling_price} onChange={(e) => setDraft({ ...draft, selling_price: +e.target.value })} className="input-admin w-full" /></Field>
        <Field label="Description" full><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="input-admin w-full" rows={3} /></Field>
        <Field label="Picture" full>
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setDraft({ ...draft, image: await fileToDataUrl(f) }); }} className="text-sm" />
          {draft.image && <img src={draft.image} alt="" className="mt-2 h-32 w-32 rounded-lg object-cover" />}
        </Field>
        {error && <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={() => navigate({ to: "/cashier" })} className="rounded-lg border px-4 py-2">Cancel</button>
          <button disabled={busy} className="rounded-lg bg-[#1C1C1E] px-4 py-2 text-white disabled:opacity-60">{busy ? "Saving…" : "Save & Lock"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block text-sm font-medium text-slate-700 ${full ? "sm:col-span-2" : ""}`}>{label}<div className="mt-1">{children}</div></label>;
}
