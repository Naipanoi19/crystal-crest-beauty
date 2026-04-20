import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/pickup")({
  head: () => ({ meta: [
    { title: "In-store pickup — Crystal Crest" },
    { name: "description", content: "How in-store pickup works at Crystal Crest, Kajiado Town." },
  ]}),
  component: Pickup,
});

function Pickup() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-luxe py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Pickup info</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">In-store pickup, made simple.</h1>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Order online", b: "Browse the shop and check out. Pay via M-Pesa, Airtel or cash on pickup." },
            { n: "02", t: "We prepare it", b: "We pack your items at the studio in Kajiado Town within a few hours." },
            { n: "03", t: "Walk in & collect", b: "Show your order number at the counter (opposite Crapas Hotel) — that's it." },
          ].map((s) => (
            <li key={s.n} className="border border-border p-6">
              <p className="font-display text-3xl text-accent">{s.n}</p>
              <p className="mt-2 font-medium">{s.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.b}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-muted-foreground">Delivery is coming soon — we'll announce it on our socials when it's live.</p>
      </main>
      <Footer />
    </div>
  );
}
