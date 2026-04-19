import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKES, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, Printer } from "lucide-react";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/admin/pos")({ component: POS });

interface Line { id: string; qty: number }
type Pay = "mpesa" | "airtel" | "cash";

function POS() {
  const products = rootApi.useLoaderData() as Product[];
  const [lines, setLines] = useState<Line[]>([]);
  const [pay, setPay] = useState<Pay>("cash");
  const [name, setName] = useState("Walk-in");
  const [phone, setPhone] = useState("000");
  const [eod, setEod] = useState<{ count: number; revenue: number } | null>(null);
  const [receipt, setReceipt] = useState<{ number: string; lines: { name: string; qty: number; total: number }[]; total: number; pay: Pay } | null>(null);

  const items = useMemo(() => lines.map((l) => ({ ...l, p: products.find((p) => p.id === l.id)! })).filter((l) => l.p), [lines, products]);
  const subtotal = items.reduce((s, l) => s + l.p.price * l.qty, 0);

  const add = (id: string) => setLines((prev) => prev.find((l) => l.id === id) ? prev.map((l) => l.id === id ? { ...l, qty: l.qty + 1 } : l) : [...prev, { id, qty: 1 }]);
  const setQty = (id: string, q: number) => setLines((prev) => q <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => l.id === id ? { ...l, qty: q } : l));

  const sell = async () => {
    if (items.length === 0) return;
    const { data, error } = await supabase.rpc("place_order", {
      _channel: "pos", _fulfillment: "pickup", _payment_method: pay,
      _customer_name: name, _customer_phone: phone, _customer_email: "",
      _delivery_address: "", _shipping_cents: 0, _notes: "",
      _items: items.map((l) => ({ product_id: l.p.id, quantity: l.qty })),
    });
    if (error) { alert(error.message); return; }
    const r = data as { order_number: string };
    setReceipt({
      number: r.order_number,
      lines: items.map((l) => ({ name: l.p.name, qty: l.qty, total: l.p.price * l.qty })),
      total: subtotal, pay,
    });
    setLines([]);
  };

  const runEod = async () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { data } = await supabase.from("orders").select("total_cents").gte("created_at", start.toISOString());
    const arr = data ?? [];
    setEod({ count: arr.length, revenue: arr.reduce((s, x) => s + x.total_cents, 0) / 100 });
  };

  useEffect(() => { runEod(); }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <h2 className="font-display text-2xl">Point of sale</h2>
        <p className="text-sm text-muted-foreground">Tap a product to add it to the current sale.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <button key={p.id} onClick={() => add(p.id)} disabled={p.stock <= 0}
              className="flex items-center gap-3 border border-border bg-background p-3 text-left transition hover:border-foreground disabled:opacity-40">
              <img src={p.image} alt="" className="h-14 w-12 rounded-sm object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatKES(p.price)} · stock {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <aside className="h-fit border border-border bg-cream/40 p-5">
        <h3 className="font-display text-xl">Current sale</h3>
        {items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No items.</p> : (
          <ul className="mt-3 divide-y divide-border">
            {items.map((l) => (
              <li key={l.id} className="flex items-center gap-2 py-2 text-sm">
                <span className="flex-1 truncate">{l.p.name}</span>
                <button onClick={() => setQty(l.id, l.qty - 1)} className="rounded border border-border p-1"><Minus className="h-3 w-3" /></button>
                <span className="w-6 text-center">{l.qty}</span>
                <button onClick={() => setQty(l.id, l.qty + 1)} className="rounded border border-border p-1"><Plus className="h-3 w-3" /></button>
                <button onClick={() => setQty(l.id, 0)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 border-t border-border pt-3 text-sm">
          <div className="flex justify-between font-medium"><span>Total</span><span>{formatKES(subtotal)}</span></div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["mpesa", "airtel", "cash"] as const).map((m) => (
            <button key={m} onClick={() => setPay(m)} className={`rounded-sm border px-2 py-1.5 text-xs uppercase ${pay === m ? "border-foreground bg-foreground text-background" : "border-border"}`}>{m}</button>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm" />
        </div>
        <Button onClick={sell} disabled={items.length === 0} className="mt-3 w-full rounded-none bg-foreground text-background">Charge {formatKES(subtotal)}</Button>

        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-display text-lg">End of day</h4>
          {eod && <p className="mt-1 text-sm text-muted-foreground">{eod.count} orders · {formatKES(Math.round(eod.revenue))}</p>}
          <Button variant="outline" size="sm" onClick={runEod} className="mt-2 w-full">Refresh</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="mt-2 w-full"><Printer className="mr-2 h-3.5 w-3.5" /> Print EOD</Button>
        </div>
      </aside>

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setReceipt(null)}>
          <div className="w-full max-w-sm bg-background p-6 font-mono text-xs" onClick={(e) => e.stopPropagation()}>
            <p className="text-center font-display text-lg">Crystal Crest</p>
            <p className="text-center text-muted-foreground">Westlands, Nairobi</p>
            <p className="mt-3 text-center">Receipt {receipt.number}</p>
            <p className="text-center text-muted-foreground">{new Date().toLocaleString()}</p>
            <div className="my-3 border-t border-dashed" />
            {receipt.lines.map((l, i) => (
              <div key={i} className="flex justify-between"><span>{l.qty} × {l.name}</span><span>{formatKES(l.total)}</span></div>
            ))}
            <div className="my-3 border-t border-dashed" />
            <div className="flex justify-between font-bold"><span>Total</span><span>{formatKES(receipt.total)}</span></div>
            <p className="mt-1 text-right uppercase">Paid · {receipt.pay}</p>
            <p className="mt-4 text-center text-muted-foreground">Thank you ✦</p>
            <div className="mt-4 flex gap-2 print:hidden">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setReceipt(null)}>Close</Button>
              <Button size="sm" className="flex-1" onClick={() => window.print()}><Printer className="mr-2 h-3.5 w-3.5" />Print</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
