import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

interface PRow {
  id: string; name: string; slug: string; category: string; price_cents: number;
  stock: number; reorder_threshold: number; is_active: boolean;
}

function ProductsAdmin() {
  const [rows, setRows] = useState<PRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ price: number; stock: number; reorder: number; active: boolean }>({ price: 0, stock: 0, reorder: 0, active: true });

  const load = async () => {
    const { data } = await supabase.from("products").select("id, name, slug, category, price_cents, stock, reorder_threshold, is_active").order("name");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (r: PRow) => {
    setEditing(r.id);
    setDraft({ price: Math.round(r.price_cents / 100), stock: r.stock, reorder: r.reorder_threshold, active: r.is_active });
  };
  const save = async (id: string) => {
    await supabase.from("products").update({
      price_cents: draft.price * 100, stock: draft.stock, reorder_threshold: draft.reorder, is_active: draft.active,
    }).eq("id", id);
    setEditing(null);
    load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl">Catalog</h2>
      <p className="text-sm text-muted-foreground">Edit price, stock and reorder threshold inline.</p>
      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-cream/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr><th className="px-3 py-3">Product</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Price (KES)</th><th className="px-3 py-3">Stock</th><th className="px-3 py-3">Reorder ≤</th><th className="px-3 py-3">Active</th><th className="px-3 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => editing === r.id ? (
              <tr key={r.id} className="bg-blush/20">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 capitalize">{r.category}</td>
                <td className="px-3 py-2"><input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: +e.target.value })} className="w-24 rounded-sm border border-border bg-background px-2 py-1" /></td>
                <td className="px-3 py-2"><input type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: +e.target.value })} className="w-20 rounded-sm border border-border bg-background px-2 py-1" /></td>
                <td className="px-3 py-2"><input type="number" value={draft.reorder} onChange={(e) => setDraft({ ...draft, reorder: +e.target.value })} className="w-20 rounded-sm border border-border bg-background px-2 py-1" /></td>
                <td className="px-3 py-2"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /></td>
                <td className="px-3 py-2 text-right"><Button size="sm" onClick={() => save(r.id)}>Save</Button> <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></td>
              </tr>
            ) : (
              <tr key={r.id}>
                <td className="px-3 py-3">{r.name}</td>
                <td className="px-3 py-3 capitalize">{r.category}</td>
                <td className="px-3 py-3">{formatKES(Math.round(r.price_cents / 100))}</td>
                <td className={`px-3 py-3 ${r.stock <= r.reorder_threshold ? "text-destructive" : ""}`}>{r.stock}</td>
                <td className="px-3 py-3">{r.reorder_threshold}</td>
                <td className="px-3 py-3">{r.is_active ? "Yes" : "No"}</td>
                <td className="px-3 py-3 text-right"><Button size="sm" variant="outline" onClick={() => startEdit(r)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
