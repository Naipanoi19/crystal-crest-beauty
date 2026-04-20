import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/uploads")({ component: Uploads });

type Category = "skincare" | "makeup" | "hair" | "nails";

interface RestockRow { name: string; qty: number; buying: number; selling: number }
interface SalesRow { name: string; qty: number }
interface LogLine { kind: "ok" | "warn" | "err"; msg: string }

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function downloadTemplate(rows: any[][], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
}

async function readSheet<T>(file: File): Promise<T[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<T>(ws, { defval: "" });
}

function pick(row: any, ...keys: string[]): string {
  for (const k of keys) {
    for (const rk of Object.keys(row)) {
      if (rk.toLowerCase().trim() === k.toLowerCase()) return String(row[rk] ?? "").trim();
    }
  }
  return "";
}

function Uploads() {
  return (
    <div className="space-y-12">
      <RestockUploader />
      <SalesUploader />
    </div>
  );
}

function RestockUploader() {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);

  const handle = async (file: File) => {
    setBusy(true); setLog([]);
    const lines: LogLine[] = [];
    try {
      const raw = await readSheet<any>(file);
      const rows: RestockRow[] = raw.map((r) => ({
        name: pick(r, "name", "product", "product name"),
        qty: Number(pick(r, "qty", "quantity", "stock")) || 0,
        buying: Number(pick(r, "buying", "buying price", "cost", "cost price")) || 0,
        selling: Number(pick(r, "selling", "selling price", "price")) || 0,
      })).filter((r) => r.name);

      if (rows.length === 0) { lines.push({ kind: "err", msg: "No valid rows found. Check column headers." }); setLog(lines); return; }

      const { data: existing } = await supabase.from("products").select("id, name, slug, stock");
      const byName = new Map((existing ?? []).map((p) => [p.name.toLowerCase(), p]));

      for (const r of rows) {
        const match = byName.get(r.name.toLowerCase());
        if (match) {
          const { error } = await supabase.from("products").update({
            stock: match.stock + r.qty,
            price_cents: r.selling > 0 ? Math.round(r.selling * 100) : undefined,
          }).eq("id", match.id);
          if (error) lines.push({ kind: "err", msg: `${r.name}: ${error.message}` });
          else lines.push({ kind: "ok", msg: `${r.name}: +${r.qty} stock${r.selling > 0 ? `, sell @ KES ${r.selling}` : ""}` });
        } else {
          const slug = slugify(r.name);
          const { error } = await supabase.from("products").insert({
            name: r.name, slug, tagline: "New arrival",
            category: "skincare" as Category,
            price_cents: Math.round(r.selling * 100),
            image_url: "", stock: r.qty, is_active: false,
          });
          if (error) lines.push({ kind: "err", msg: `${r.name} (new): ${error.message}` });
          else lines.push({ kind: "warn", msg: `${r.name}: created as DRAFT (inactive). Edit in Products to publish.` });
        }
      }
    } catch (e: any) {
      lines.push({ kind: "err", msg: e.message });
    } finally {
      setLog(lines); setBusy(false);
    }
  };

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Restock from Excel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Columns: <strong>Name</strong>, <strong>Qty</strong>, <strong>Buying Price</strong>, <strong>Selling Price</strong>. Quantities are added to existing stock; selling price is updated. Unknown products are saved as inactive drafts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadTemplate(
          [["Name", "Qty", "Buying Price", "Selling Price"], ["Velvet Glow Serum", 10, 1800, 3200]],
          "restock-template.xlsx",
        )}><Download className="mr-2 h-4 w-4" />Template</Button>
      </div>
      <UploadDrop disabled={busy} onFile={handle} label="Drop restock .xlsx here or click to browse" />
      <LogList log={log} />
    </section>
  );
}

function SalesUploader() {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);

  const handle = async (file: File) => {
    setBusy(true); setLog([]);
    const lines: LogLine[] = [];
    try {
      const raw = await readSheet<any>(file);
      const rows: SalesRow[] = raw.map((r) => ({
        name: pick(r, "name", "product", "product name"),
        qty: Number(pick(r, "qty", "quantity", "sold")) || 0,
      })).filter((r) => r.name && r.qty > 0);

      if (rows.length === 0) { lines.push({ kind: "err", msg: "No valid rows found." }); setLog(lines); return; }

      const { data: existing } = await supabase.from("products").select("id, name, stock, price_cents");
      const byName = new Map((existing ?? []).map((p) => [p.name.toLowerCase(), p]));

      const items: { product_id: string; quantity: number }[] = [];
      for (const r of rows) {
        const m = byName.get(r.name.toLowerCase());
        if (!m) { lines.push({ kind: "warn", msg: `${r.name}: not found, skipped` }); continue; }
        if (m.stock < r.qty) { lines.push({ kind: "err", msg: `${r.name}: insufficient stock (have ${m.stock}, sold ${r.qty})` }); continue; }
        items.push({ product_id: m.id, quantity: r.qty });
        lines.push({ kind: "ok", msg: `${r.name}: -${r.qty}` });
      }

      if (items.length === 0) { setLog(lines); return; }

      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.rpc("place_order", {
        _channel: "pos", _fulfillment: "pickup", _payment_method: "cash",
        _customer_name: `EOD bulk ${today}`, _customer_phone: "000",
        _customer_email: "", _delivery_address: "", _shipping_cents: 0,
        _notes: `End-of-day bulk upload (${items.length} line items)`,
        _items: items,
      });
      if (error) { lines.push({ kind: "err", msg: `Order create failed: ${error.message}` }); setLog(lines); return; }

      // The RPC creates a 'pending' cash order. Mark it paid so stock deducts via trigger.
      const { data: ord } = await supabase.from("orders").select("id").eq("notes", `End-of-day bulk upload (${items.length} line items)`).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (ord) await supabase.from("orders").update({ status: "paid" }).eq("id", ord.id);
      lines.push({ kind: "ok", msg: `Bulk order created and marked paid. Stock updated.` });
    } catch (e: any) {
      lines.push({ kind: "err", msg: e.message });
    } finally {
      setLog(lines); setBusy(false);
    }
  };

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">End-of-day sales upload</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Columns: <strong>Name</strong>, <strong>Qty</strong>. Creates one bulk paid POS order and deducts stock automatically.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadTemplate(
          [["Name", "Qty"], ["Velvet Glow Serum", 3], ["Rose Petal Matte Lip", 2]],
          "eod-sales-template.xlsx",
        )}><Download className="mr-2 h-4 w-4" />Template</Button>
      </div>
      <UploadDrop disabled={busy} onFile={handle} label="Drop EOD sales .xlsx here or click to browse" />
      <LogList log={log} />
    </section>
  );
}

function UploadDrop({ onFile, label, disabled }: { onFile: (f: File) => void; label: string; disabled?: boolean }) {
  return (
    <label className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-cream/30 px-6 py-10 text-center text-sm text-muted-foreground transition hover:border-foreground ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      <Upload className="h-5 w-5" />
      <span>{label}</span>
      <input type="file" accept=".xlsx,.xls" className="hidden" disabled={disabled}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
    </label>
  );
}

function LogList({ log }: { log: LogLine[] }) {
  if (log.length === 0) return null;
  return (
    <ul className="mt-4 max-h-80 space-y-1 overflow-y-auto border border-border bg-background p-3 text-sm">
      {log.map((l, i) => (
        <li key={i} className="flex items-start gap-2">
          {l.kind === "ok" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />}
          {l.kind === "warn" && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
          {l.kind === "err" && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
          <span className={l.kind === "err" ? "text-destructive" : l.kind === "warn" ? "text-foreground" : "text-foreground"}>{l.msg}</span>
        </li>
      ))}
    </ul>
  );
}
