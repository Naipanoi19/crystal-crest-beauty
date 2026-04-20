import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <div className="container-luxe grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-lg">Crystal <span className="text-accent">Crest</span></p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Considered beauty for the everyday ritual. Visit us in-store — delivery coming soon.
          </p>
          <div className="mt-4 flex gap-3">
            <a aria-label="Instagram" href="https://instagram.com/" target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:border-foreground hover:text-foreground"><Instagram className="h-4 w-4" /></a>
            <a aria-label="Facebook" href="https://facebook.com/" target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:border-foreground hover:text-foreground"><Facebook className="h-4 w-4" /></a>
            <a aria-label="WhatsApp" href="https://wa.me/254700000000" target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:border-foreground hover:text-foreground"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">Visit us</p>
          <address className="mt-4 text-sm not-italic text-muted-foreground">
            Crystal Crest Studio<br />
            Kajiado Town<br />
            Opposite Crapas Hotel<br />
            <span className="mt-2 block text-foreground/80">In-store pickup only</span>
          </address>
        </div>
        <FooterCol title="Shop" items={[
          { label: "Skincare", to: "/shop", search: { category: "skincare" } },
          { label: "Makeup", to: "/shop", search: { category: "makeup" } },
          { label: "Hair Care", to: "/shop", search: { category: "hair" } },
          { label: "Nails", to: "/shop", search: { category: "nails" } },
        ]} />
        <FooterCol title="Help" items={[
          { label: "About", to: "/about" },
          { label: "Pickup info", to: "/pickup" },
          { label: "Returns", to: "/returns" },
          { label: "Contact", to: "/contact" },
          { label: "FAQ", to: "/faq" },
        ]} />
      </div>
      <div className="hairline">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Crystal Crest. All rights reserved.</p>
          <p>Made with care · Kajiado, Kenya</p>
        </div>
      </div>
    </footer>
  );
}

interface FItem { label: string; to: string; search?: Record<string, string> }

function FooterCol({ title, items }: { title: string; items: FItem[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to as any} search={i.search as any} className="transition hover:text-foreground">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
