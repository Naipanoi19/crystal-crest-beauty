import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, Music2, MapPin, Phone, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/site/NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-24 bg-charcoal text-ivory">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container-luxe grid gap-10 py-14 md:grid-cols-2 md:items-center md:py-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">The List</p>
            <h2 className="mt-3 font-display text-3xl text-ivory md:text-4xl">
              Get early access to new arrivals & exclusive offers.
            </h2>
            <p className="mt-3 max-w-md text-sm text-ivory/70">
              Soft launches, restocks, in-store events. One quiet email a month — no fluff.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main */}
      <div className="container-luxe grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">Crystal <span className="text-accent">Crest</span></p>
          <p className="mt-3 max-w-sm text-sm text-ivory/70">
            Considered beauty for the everyday ritual. 48h Nairobi delivery · 1–3 days countrywide.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-ivory/80">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-accent" /> Kajiado Town · Opposite Crapas Hotel</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-accent" /> 0700 074 333</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-accent" /> hello@crystalcrest.co.ke</li>
          </ul>
          <div className="mt-5 flex gap-2">
            <SocialIcon href="https://instagram.com/" label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>
            <SocialIcon href="https://tiktok.com/" label="TikTok"><Music2 className="h-4 w-4" /></SocialIcon>
            <SocialIcon href="https://facebook.com/" label="Facebook"><Facebook className="h-4 w-4" /></SocialIcon>
            <SocialIcon href="https://wa.me/254700074333" label="WhatsApp"><MessageCircle className="h-4 w-4" /></SocialIcon>
          </div>
        </div>

        <FooterCol title="Shop" items={[
          { label: "Skincare", to: "/shop", search: { category: "skincare", sort: "featured" } },
          { label: "Makeup", to: "/shop", search: { category: "makeup", sort: "featured" } },
          { label: "Hair Care", to: "/shop", search: { category: "hair", sort: "featured" } },
          { label: "Nails", to: "/shop", search: { category: "nails", sort: "featured" } },
        ]} />
        <FooterCol title="Help" items={[
          { label: "About", to: "/about" },
          { label: "Pickup info", to: "/pickup" },
          { label: "Returns", to: "/returns" },
          { label: "Contact", to: "/contact" },
          { label: "FAQ", to: "/faq" },
        ]} />

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ivory/60">We accept</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PayBadge>M-Pesa</PayBadge>
            <PayBadge>Airtel</PayBadge>
            <PayBadge>Visa</PayBadge>
            <PayBadge>Mastercard</PayBadge>
            <PayBadge>Cash</PayBadge>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-5 text-xs text-ivory/60 md:flex-row">
          <p>© {new Date().getFullYear()} Crystal Crest. All rights reserved.</p>
          <p>Made with care · Kajiado, Kenya</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      aria-label={label}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-ivory transition hover:border-accent hover:bg-accent hover:text-charcoal"
    >
      {children}
    </a>
  );
}

function PayBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ivory/85">
      {children}
    </span>
  );
}

interface FItem { label: string; to: string; search?: Record<string, string> }

function FooterCol({ title, items }: { title: string; items: FItem[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-ivory/60">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-ivory/80">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to as any} search={i.search as any} className="transition hover:text-accent">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
