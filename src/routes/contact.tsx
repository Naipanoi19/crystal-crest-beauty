import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Crystal Crest" },
    { name: "description", content: "Visit Crystal Crest in Kajiado Town, opposite Crapas Hotel. Call, WhatsApp or email us." },
  ]}),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-luxe py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Get in touch</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Visit us in Kajiado.</h1>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <Row icon={<MapPin className="h-4 w-4" />} title="Studio" body={<>Kajiado Town<br />Opposite Crapas Hotel</>} />
            <Row icon={<Clock className="h-4 w-4" />} title="Hours" body={<>Mon – Sat · 9:00 – 19:00<br />Sunday · 10:00 – 16:00</>} />
            <Row icon={<Phone className="h-4 w-4" />} title="Phone / WhatsApp" body={<a href="tel:+254700000000" className="hover:text-foreground">+254 700 000 000</a>} />
            <Row icon={<Mail className="h-4 w-4" />} title="Email" body={<a href="mailto:hello@crystalcrest.co.ke" className="hover:text-foreground">hello@crystalcrest.co.ke</a>} />
          </div>
          <div className="aspect-[4/3] overflow-hidden border border-border">
            <iframe
              title="Crystal Crest location"
              src="https://www.google.com/maps?q=Kajiado+Town,+Kenya&output=embed"
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
