import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/data/products";
import { Heart } from "lucide-react";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Crystal Crest" },
      { name: "description", content: "Your saved Crystal Crest products." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const products = rootApi.useLoaderData() as Product[];
  const wl = useWishlist();
  const items = products.filter((p) => wl.has(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container-luxe py-12 md:py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">Saved for later</p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-6xl">Your wishlist</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">A quiet collection of pieces you've fallen for.</p>
      </section>

      <section className="container-luxe pb-24">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-sm border border-dashed border-border py-24 text-center">
            <Heart className="h-10 w-10 text-accent" />
            <p className="font-display text-2xl">Nothing saved yet.</p>
            <p className="max-w-sm text-sm text-muted-foreground">Tap the heart on any product to keep it close.</p>
            <Link to="/shop" search={{ category: "all", sort: "featured" }} className="mt-3 inline-flex rounded-sm bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-background transition hover:bg-accent">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
