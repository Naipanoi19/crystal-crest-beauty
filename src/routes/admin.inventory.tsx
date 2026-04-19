import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({ component: Inventory });

interface IRow {
  id: string; name: string; stock: number; reorder_threshold: number; last_sold_at: string | null;
}

function Inventory() {
  const [rows, setRows] = useState<IRow[]>([]);
  useEffect(() => {
    supabase.from("products").select("id, name, stock, reorder_threshold, last_sold_at").eq("is_active", true)
      .then(({ data }) => setRows(data ?? []));
  }, []);

  const lowStock = rows.filter((r) => r.stock <= r.reorder_threshold);
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
  const deadStock = rows.filter((r) => r.stock > 0 && (!r.last_sold_at || new Date(r.last_sold_at) < cutoff));

  return (
    <div className="space-y-10">
      <Section title="Restock alerts" icon={<AlertTriangle className="h-4 w-4 text-destructive" />} rows={lowStock} empty="All stock is healthy." kind="low" />
      <Section title="Deadstock (no sales in 60+ days)" icon={<Clock className="h-4 w-4 text-accent" />} rows={deadStock} empty="No deadstock detected." kind="dead" />
    </div>
  );
}

function Section({ title, icon, rows, empty, kind }: { title: string; icon: React.ReactNode; rows: IRow[]; empty: string; kind: "low" | "dead" }) {
  return (
    <div>
      <div className="flex items-center gap-2"><span className="font-display text-2xl">{title}</span>{icon}</div>
      {rows.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{empty}</p> : (
        <div className="mt-4 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead className="bg-cream/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr><th className="px-3 py-3">Product</th><th className="px-3 py-3">Stock</th>{kind === "low" ? <th className="px-3 py-3">Reorder ≤</th> : <th className="px-3 py-3">Last sold</th>}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-3">{r.name}</td>
                  <td className={`px-3 py-3 ${kind === "low" ? "text-destructive" : ""}`}>{r.stock}</td>
                  {kind === "low" ? <td className="px-3 py-3">{r.reorder_threshold}</td>
                    : <td className="px-3 py-3">{r.last_sold_at ? new Date(r.last_sold_at).toLocaleDateString() : "Never"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
