import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { adminDb } from "@/lib/admin";
import { Plus, KeyRound, Trash2, Power } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/cashiers")({ component: CashiersAdmin });

type Cashier = { id: string; username: string; full_name: string; is_active: boolean; created_at: string };

function CashiersAdmin() {
  const [rows, setRows] = useState<Cashier[]>([]);
  const [open, setOpen] = useState(false);
  const [resetFor, setResetFor] = useState<Cashier | null>(null);
  const [draft, setDraft] = useState({ username: "", full_name: "", pin: "" });
  const [resetPin, setResetPin] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await adminDb.from("cashiers").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{4,8}$/.test(draft.pin)) { setError("PIN must be 4–8 digits."); return; }
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(draft.username)) { setError("Username: 3–32 letters/digits."); return; }
    const { error } = await adminDb.rpc("admin_create_cashier", {
      _username: draft.username.toLowerCase(),
      _pin: draft.pin,
      _full_name: draft.full_name.trim() || draft.username,
    });
    if (error) { setError(error.message); return; }
    setOpen(false); setDraft({ username: "", full_name: "", pin: "" });
    load();
  }

  async function resetPinSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(resetPin)) { setError("PIN must be 4–8 digits."); return; }
    const { error } = await adminDb.rpc("admin_reset_cashier_pin", { _cashier_id: resetFor!.id, _pin: resetPin });
    if (error) { setError(error.message); return; }
    setResetFor(null); setResetPin("");
  }

  async function toggleActive(c: Cashier) {
    await adminDb.from("cashiers").update({ is_active: !c.is_active }).eq("id", c.id);
    load();
  }

  async function del(c: Cashier) {
    if (!confirm(`Delete cashier "${c.username}"? This will fail if they have stock entries.`)) return;
    const { error } = await adminDb.from("cashiers").delete().eq("id", c.id);
    if (error) { alert(error.message); return; }
    load();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Cashiers</h2>
          <p className="text-sm text-slate-500">Create login PINs for in-store cashiers. They sign in at <code className="rounded bg-slate-100 px-1">/cashier</code>.</p>
        </div>
        <button onClick={() => { setOpen(true); setError(""); }} className="inline-flex items-center gap-2 rounded-lg bg-[#1C1C1E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C9967A]">
          <Plus className="h-4 w-4" /> New Cashier
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="p-3">Username</th><th className="p-3">Name</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-mono">{c.username}</td>
                <td className="p-3">{c.full_name}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {c.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setResetFor(c); setResetPin(""); setError(""); }} title="Reset PIN" className="rounded-lg border p-2 hover:text-[#C9967A]"><KeyRound className="h-4 w-4" /></button>
                    <button onClick={() => toggleActive(c)} title={c.is_active ? "Disable" : "Enable"} className="rounded-lg border p-2 hover:text-[#C9967A]"><Power className="h-4 w-4" /></button>
                    <button onClick={() => del(c)} title="Delete" className="rounded-lg border p-2 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No cashiers yet. Click "New Cashier" to add one.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Cashier</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <Field label="Username (login)"><input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} className="input-admin w-full" placeholder="e.g. mary" /></Field>
            <Field label="Full Name"><input value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} className="input-admin w-full" placeholder="Mary Wanjiku" /></Field>
            <Field label="PIN (4–8 digits)"><input value={draft.pin} onChange={(e) => setDraft({ ...draft, pin: e.target.value.replace(/\D/g, "") })} maxLength={8} inputMode="numeric" className="input-admin w-full font-mono" placeholder="••••" /></Field>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2">Cancel</button>
              <button className="rounded-lg bg-[#1C1C1E] px-4 py-2 text-white">Create</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetFor} onOpenChange={(v) => !v && setResetFor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Reset PIN — {resetFor?.username}</DialogTitle></DialogHeader>
          <form onSubmit={resetPinSubmit} className="space-y-3">
            <Field label="New PIN (4–8 digits)"><input value={resetPin} onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ""))} maxLength={8} inputMode="numeric" className="input-admin w-full font-mono" /></Field>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setResetFor(null)} className="rounded-lg border px-4 py-2">Cancel</button><button className="rounded-lg bg-[#1C1C1E] px-4 py-2 text-white">Save</button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-1">{children}</div></label>;
}
