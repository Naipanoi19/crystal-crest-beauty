import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [
    { title: "Returns — Crystal Crest" },
    { name: "description", content: "Crystal Crest returns and exchange policy." },
  ]}),
  component: Returns,
});

function Returns() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-luxe py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Returns & exchanges</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Fair returns, every time.</h1>
        <div className="mt-8 max-w-2xl space-y-5 text-sm text-muted-foreground">
          <p><strong className="text-foreground">7-day window.</strong> Unopened products in their original packaging may be exchanged or refunded within 7 days of pickup.</p>
          <p><strong className="text-foreground">Hygiene items.</strong> Lipsticks, mascara, nail polish and other hygiene-sensitive items can only be returned if the seal is intact.</p>
          <p><strong className="text-foreground">Faulty product?</strong> Bring it back any time within 30 days with your receipt — we'll replace it or refund you on the spot.</p>
          <p><strong className="text-foreground">How to return.</strong> Walk into the studio in Kajiado Town with your order number or receipt. No paperwork needed.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
