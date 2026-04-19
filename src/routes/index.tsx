import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero-beauty.jpg";
import catSkin from "@/assets/cat-skincare.jpg";
import catMakeup from "@/assets/cat-makeup.jpg";
import catHair from "@/assets/cat-hair.jpg";
import catNails from "@/assets/cat-nails.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/data/products";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crystal Crest — Considered beauty, curated in Nairobi" },
      { name: "description", content: "Skincare, makeup, hair and nail products from Crystal Crest. Shop bestsellers, discover rituals, and arrange in-store pickup or delivery." },
      { property: "og:title", content: "Crystal Crest — Considered beauty" },
      { property: "og:description", content: "Curated skincare, makeup, hair and nails. Shop now." },
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
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative">
        <div className="container-luxe grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">Spring Edit · 2026</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-foreground text-balance md:text-7xl">
              Quiet luxury for every ritual.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Considered formulas, beautiful objects. Crystal Crest brings together
              the world's finest skincare, makeup, hair and nail essentials — curated for
              the way you actually live.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                search={{ category: "all" }}
                className="inline-flex items-center gap-2 rounded-sm bg-foreground px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-background transition hover:bg-foreground/85"
              >
                Shop the Edit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/shop"
                search={{ category: "skincare" }}
                className="inline-flex items-center gap-2 rounded-sm border border-foreground/20 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
              >
                Bestsellers
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-8 text-xs text-muted-foreground">
              <Stat n="240+" label="Curated products" />
              <Stat n="4.8★" label="Customer rating" />
              <Stat n="48h" label="Nairobi delivery" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-sm bg-blush/40 blur-2xl" />
            <img
              src={hero}
              alt="Curated beauty products on a cream backdrop"
              width={1600}
              height={1200}
              className="aspect-[5/4] w-full rounded-sm object-cover shadow-[0_30px_80px_-30px_rgba(120,60,40,0.35)]"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-luxe py-16 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">The Edit</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Shop by category</h2>
          </div>
          <Link to="/shop" search={{ category: "all" }} className="hidden text-xs font-medium uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground md:inline-flex md:items-center md:gap-1">
            All products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-sm bg-cream"
            >
              <img src={c.img} alt={c.label} loading="lazy" width={800} height={1000}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-background">
                <p className="font-display text-2xl">{c.label}</p>
                <ArrowRight className="h-4 w-4 translate-x-0 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-luxe py-16 md:py-24">
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

      {/* PROMISE STRIP */}
      <section className="border-y border-border bg-cream">
        <div className="container-luxe grid gap-8 py-12 md:grid-cols-3 md:py-14">
          <Promise title="Authentic, always" body="Sourced directly from brands and verified suppliers." />
          <Promise title="Express delivery" body="Same-day in Nairobi · 1–3 days countrywide." />
          <Promise title="In-store pickup" body="Schedule a pickup at our Westlands studio." />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl text-foreground">{n}</p>
      <p className="mt-1 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}

function Promise({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-display text-xl text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
