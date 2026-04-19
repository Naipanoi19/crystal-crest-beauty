export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <div className="container-luxe grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-lg">Crystal <span className="text-accent">Crest</span></p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Considered beauty for the everyday ritual. Curated in Nairobi, shipped countrywide.
          </p>
        </div>
        <FooterCol title="Shop" items={["Skincare", "Makeup", "Hair Care", "Nails"]} />
        <FooterCol title="Help" items={["Shipping", "Returns", "Contact", "FAQ"]} />
        <FooterCol title="Studio" items={["Our Story", "Journal", "Stockists", "Press"]} />
      </div>
      <div className="hairline">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Crystal Crest. All rights reserved.</p>
          <p>Made with care · Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => <li key={i} className="cursor-pointer transition hover:text-foreground">{i}</li>)}
      </ul>
    </div>
  );
}
