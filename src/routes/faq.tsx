import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — Crystal Crest" },
    { name: "description", content: "Frequently asked questions about ordering, pickup, payment and products at Crystal Crest." },
  ]}),
  component: FAQ,
});

const faqs = [
  { q: "Where are you located?", a: "Kajiado Town, opposite Crapas Hotel. Walk-ins welcome during open hours." },
  { q: "Do you deliver?", a: "Not yet — delivery is coming soon. For now, all orders are in-store pickup." },
  { q: "How do I pay?", a: "M-Pesa, Airtel Money, or cash on pickup. Online orders confirm instantly when paid via mobile money." },
  { q: "Are products authentic?", a: "Yes. We source directly from authorised distributors and test every product before stocking it." },
  { q: "Can I reserve a product?", a: "Place an order online and we'll hold it for you for 48 hours after preparation." },
  { q: "Do you offer makeup services?", a: "Walk-in consultations are free. DM us on Instagram to book a sit-down session." },
];

function FAQ() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-luxe py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Help</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Frequently asked.</h1>
        <Accordion type="single" collapsible className="mt-8 max-w-2xl">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
}
