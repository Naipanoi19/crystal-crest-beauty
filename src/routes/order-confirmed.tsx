import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: zodValidator(z.object({ n: fallback(z.string(), "").default("") })),
  head: () => ({ meta: [{ title: "Order confirmed — Crystal Crest" }] }),
  component: Confirmed,
});

function Confirmed() {
  const { n } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-luxe py-24 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-accent">Order received</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Thank you.</h1>
        <p className="mt-3 text-muted-foreground">Your order <span className="font-medium text-foreground">{n}</span> is being prepared.</p>
        <p className="mt-1 text-sm text-muted-foreground">We'll send confirmation by SMS shortly.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/account" className="rounded-sm border border-foreground px-6 py-3 text-xs uppercase tracking-[0.2em]">View my orders</Link>
          <Link to="/shop" search={{ category: "all", sort: "featured" }} className="rounded-sm bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-background">Continue shopping</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
