import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Crystal Crest" },
    { name: "description", content: "Crystal Crest is a beauty studio in Kajiado Town, opposite Crapas Hotel — curating skincare, makeup, hair and nail essentials." },
  ]}),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-luxe py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Our story</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">A considered beauty studio in Kajiado.</h1>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <p className="text-muted-foreground">
            Crystal Crest began as a small pop-up serving friends and neighbours in Kajiado Town. Today, we curate a tight selection of skincare, makeup, haircare and nail essentials — the kind of pieces you reach for every morning and trust at every step of your ritual.
          </p>
          <p className="text-muted-foreground">
            Every product on our shelf is tested by us first. We choose formulas that respect your skin, packaging that respects your space, and prices that respect your time. Visit us opposite Crapas Hotel — we'd love to help you find your next favourite.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
