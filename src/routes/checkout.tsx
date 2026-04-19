import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/data/products";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Crystal Crest" }] }),
  component: Checkout,
});

type Fulfillment = "delivery" | "pickup";
type Payment = "mpesa" | "airtel" | "cash";

function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [payment, setPayment] = useState<Payment>("mpesa");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const shipping = fulfillment === "pickup" || cart.subtotal >= 5000 ? 0 : 350;
  const total = cart.subtotal + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.lines.length === 0) return;
    setBusy(true); setErr(null);
    const { data, error } = await supabase.rpc("place_order", {
      _channel: "online",
      _fulfillment: fulfillment,
      _payment_method: payment,
      _customer_name: name,
      _customer_phone: phone,
      _customer_email: email || "",
      _delivery_address: fulfillment === "delivery" ? address : "",
      _shipping_cents: shipping * 100,
      _notes: notes || "",
      _items: cart.lines.map((l) => ({ product_id: l.product.id, quantity: l.qty })),
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    const result = data as { order_number: string };
    cart.clear();
    navigate({ to: "/order-confirmed", search: { n: result.order_number } });
  };

  if (cart.lines.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container-luxe py-32 text-center">
          <h1 className="font-display text-3xl">Your bag is empty.</h1>
          <Link to="/shop" search={{ category: "all", sort: "featured" }} className="mt-4 inline-block text-sm text-accent underline">Continue shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-luxe py-12 md:py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Checkout</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Complete your order</h1>

        <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-10">
            {/* Fulfillment */}
            <Section title="How would you like it?">
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice active={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")} title="Delivery" desc="Same-day Nairobi · 1–3 days countrywide" />
                <Choice active={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")} title="In-store pickup" desc="Westlands studio · ready in 2 hours" />
              </div>
            </Section>

            {/* Contact */}
            <Section title="Your details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={name} onChange={setName} required />
                <Field label="Phone" type="tel" value={phone} onChange={setPhone} required placeholder="+254…" />
                <Field label="Email" type="email" value={email} onChange={setEmail} className="sm:col-span-2" />
                {fulfillment === "delivery" && (
                  <Field label="Delivery address" value={address} onChange={setAddress} required className="sm:col-span-2" />
                )}
              </div>
            </Section>

            {/* Payment */}
            <Section title="Payment">
              <div className="grid gap-3 sm:grid-cols-3">
                <Choice active={payment === "mpesa"} onClick={() => setPayment("mpesa")} title="M-Pesa" desc="Pay on confirmation" />
                <Choice active={payment === "airtel"} onClick={() => setPayment("airtel")} title="Airtel Money" desc="Pay on confirmation" />
                <Choice active={payment === "cash"} onClick={() => setPayment("cash")} title="Cash" desc="On delivery / pickup" />
              </div>
            </Section>

            <Section title="Order notes (optional)">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
            </Section>
          </div>

          {/* Summary */}
          <aside className="h-fit border border-border bg-cream/40 p-6">
            <h2 className="font-display text-2xl">Your order</h2>
            <ul className="mt-4 divide-y divide-border">
              {cart.lines.map((l) => (
                <li key={l.id} className="flex justify-between gap-3 py-3 text-sm">
                  <span>{l.product.name} <span className="text-muted-foreground">× {l.qty}</span></span>
                  <span>{formatKES(l.product.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatKES(cart.subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatKES(shipping)} />
              <Row label="Total" value={formatKES(total)} bold />
            </dl>
            {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
            <Button type="submit" size="lg" disabled={busy} className="mt-5 w-full rounded-none bg-foreground text-background hover:bg-foreground/90">
              {busy ? "Placing order…" : `Place order · ${formatKES(total)}`}
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground">By placing this order you agree to our terms and confirm the payment method above.</p>
          </aside>
        </form>
      </section>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-sm border p-4 text-left transition ${active ? "border-foreground bg-background" : "border-border bg-background/60 hover:border-foreground/50"}`}>
      <p className="font-display text-lg">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder, className = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input type={type} required={required} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-medium text-foreground" : "text-muted-foreground"}`}>
      <dt>{label}</dt><dd>{value}</dd>
    </div>
  );
}
