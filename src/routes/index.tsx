import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Star } from "lucide-react";
import catSkin from "@/assets/cat-skincare.jpg";
import catMakeup from "@/assets/cat-makeup.jpg";
import catHair from "@/assets/cat-hair.jpg";
import catNails from "@/assets/cat-nails.jpg";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { formatKES, type Product } from "@/data/products";

const rootApi = getRouteApi("__root__");

const HERO_IMG = "https://images.unsplash.com/photo-1522335789203-aaa42acce93b?auto=format&fit=crop&w=2000&q=85";

const IG_IMAGES = [
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crystal Crest — Considered beauty, curated in Kenya" },
      { name: "description", content: "Skincare, makeup, hair and nail products from Crystal Crest. Shop bestsellers, discover rituals, arrange in-store pickup." },
      { property: "og:title", content: "Crystal Crest — Considered beauty" },
      { property: "og:description", content: "Curated skincare, makeup, hair and nails. Shop now." },
      { property: "og:image", content: HERO_IMG },
    ],
  }),
  component: Index,
});

const categoryCards = [
  { id: "skincare", label: "Skincare", img: catSkin },
  { id: "makeup",   label: "Makeup",   img: catMakeup },
  { id: "hair",     label: "Hair Care", img: catHair },
  { id: "nails",    label: "Nails",    img: catNails },
] as const;

function Index() {
  const products = rootApi.useLoaderData() as Product[];
  const featured = products.slice(0, 4);
  const newArrivals = [...products].slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO — full screen cinematic */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[640px] w-full overflow-hidden">
        <img src={HERO_IMG} alt="Crystal Crest curated beauty editorial" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/40 to-charcoal/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container-luxe text-center text-ivory">
            <p className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.4em] text-accent" style={{ animationDelay: "60ms" }}>Spring Edit · 2026</p>
            <h1 className="mx-auto mt-6 max-w-4xl animate-fade-up font-display text-5xl leading-[1.02] text-balance md:text-7xl lg:text-[88px]" style={{ animationDelay: "120ms" }}>
              Quiet luxury for every ritual.
            </h1>
            <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-ivory/85 md:text-lg" style={{ animationDelay: "240ms" }}>
              Considered formulas. Beautiful objects. Curated for the way you actually live.
            </p>
            <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-3" style={{ animationDelay: "360ms" }}>
              <Link
                to="/shop"
                search={{ category: "all", sort: "featured" }}
                className="inline-flex items-center gap-2 rounded-sm bg-gradient-rose px-8 py-4 text-xs font-medium uppercase tracking-[0.24em] text-white shadow-luxe transition hover:opacity-95"
              >
                Shop the Edit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/shop"
                search={{ category: "skincare", sort: "featured" }}
                className="inline-flex items-center gap-2 rounded-sm border border-ivory/40 px-8 py-4 text-xs font-medium uppercase tracking-[0.24em] text-ivory transition hover:border-accent hover:text-accent"
              >
                Bestsellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP PRODUCT MARQUEE */}
      <section className="relative overflow-hidden border-y border-border bg-secondary py-6">
        <div className="flex w-max animate-marquee items-center gap-6 whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center gap-6">
              {newArrivals.map((p) => (
                <Link
                  key={`${dup}-${p.id}`}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="group flex items-center gap-4 rounded-sm border border-border/60 bg-background/70 px-4 py-2.5 backdrop-blur transition hover:border-accent hover:shadow-card"
                >
                  <img src={p.image} alt={p.name} loading="lazy" width={56} height={56} className="h-12 w-12 rounded-sm object-cover" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-accent">{p.category}</span>
                    <span className="text-sm font-medium text-foreground transition group-hover:text-accent">{p.name}</span>
                    <span className="text-xs text-foreground/70">{formatKES(p.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-luxe py-20 md:py-28">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">The Edit</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Shop by category</h2>
          </div>
          <Link to="/shop" search={{ category: "all", sort: "featured" }} className="hidden text-xs font-medium uppercase tracking-[0.2em] text-foreground/70 hover:text-accent md:inline-flex md:items-center md:gap-1">
            All products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id, sort: "featured" }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-sm bg-cream shadow-card transition duration-500 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <img src={c.img} alt={c.label} loading="lazy" width={800} height={1000}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-ivory">
                <p className="font-display text-2xl">{c.label}</p>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY CRYSTAL CREST */}
      <section className="bg-gradient-champagne py-20 md:py-28">
        <div className="container-luxe">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">The Promise</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Why Crystal Crest</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <WhyCard icon={<ShieldCheck className="h-6 w-6" />} title="Authentic, always" body="Sourced directly from authorised distributors. Every batch verified, every seal intact." />
            <WhyCard icon={<Truck className="h-6 w-6" />} title="Considered delivery" body="48h within Nairobi, 1–3 days countrywide. Pickup at our Kajiado studio anytime." />
            <WhyCard icon={<Sparkles className="h-6 w-6" />} title="Expert curation" body="Hand-picked by our beauty team. Nothing on the shelf we wouldn't use ourselves." />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-luxe py-20 md:py-28">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">Loved Right Now</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Featured pieces</h2>
          </div>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* INSTAGRAM GRID */}
      <section className="container-luxe py-20 md:py-28">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">@crystalcrest</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">The Crystal Crest Life</h2>
          </div>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="hidden text-xs uppercase tracking-[0.2em] text-foreground/70 hover:text-accent md:inline-flex md:items-center md:gap-1">
            Follow us <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {IG_IMAGES.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-sm bg-cream"
            >
              <img src={src} alt={`Crystal Crest moment ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.08]" />
              <div className="absolute inset-0 bg-charcoal/0 transition group-hover:bg-charcoal/30" />
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function WhyCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group rounded-sm border border-border/60 bg-background/70 p-8 text-center shadow-card transition duration-500 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-rose text-white shadow-luxe">
        {icon}
      </div>
      <p className="mt-5 font-display text-xl text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
