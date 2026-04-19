import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { formatKES, products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Star, Truck, ShieldCheck, Sparkles, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Crystal Crest` },
          { name: "description", content: loaderData.product.tagline },
          { property: "og:title", content: `${loaderData.product.name} — Crystal Crest` },
          { property: "og:description", content: loaderData.product.tagline },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Header />
      <div className="container-luxe py-32 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Not found</p>
        <h1 className="mt-3 font-display text-4xl">This product has wandered off.</h1>
        <Link to="/shop" search={{ category: "all", sort: "featured" }} className="mt-6 inline-block text-sm underline">
          Back to the shop
        </Link>
      </div>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const cart = useCart();
  const [qty, setQty] = useState(1);

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container-luxe py-8 md:py-12">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" search={{ category: "all", sort: "featured" }} className="hover:text-foreground">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative overflow-hidden rounded-sm bg-cream">
            <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground backdrop-blur">
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{product.category}</p>
            <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>

            <div className="mt-4 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-accent stroke-accent" : "stroke-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <p className="mt-6 font-display text-3xl">{formatKES(product.price)}</p>

            <p className="mt-6 max-w-prose text-sm leading-relaxed text-foreground/80">
              A signature Crystal Crest formula — clean, considered, and crafted in small batches. Designed to slot
              effortlessly into your daily ritual, with a finish that feels as good as it looks.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:text-accent" aria-label="Decrease">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-8 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-2.5 hover:text-accent" aria-label="Increase">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90"
                onClick={() => {
                  cart.add(product, qty);
                  cart.setOpen(true);
                }}
              >
                Add to bag · {formatKES(product.price * qty)}
              </Button>
            </div>

            <ul className="mt-10 space-y-3 border-t border-border pt-6 text-sm text-foreground/80">
              <li className="flex items-center gap-3"><Truck className="h-4 w-4 text-accent" /> Free delivery in Nairobi over KES 5,000</li>
              <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-accent" /> Authentic, sealed & batch-tracked</li>
              <li className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-accent" /> 30-day satisfaction promise</li>
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-luxe py-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl">You may also love</h2>
            <Link to="/shop" search={{ category: product.category, sort: "featured" }} className="text-xs uppercase tracking-[0.2em] text-accent hover:underline">
              See all {product.category}
            </Link>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
