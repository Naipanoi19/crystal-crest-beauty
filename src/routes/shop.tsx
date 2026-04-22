import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, formatKES, type Category, type Product } from "@/data/products";
import { getRouteApi } from "@tanstack/react-router";
import { Slider } from "@/components/ui/slider";
import { Star, SlidersHorizontal, X } from "lucide-react";

const searchSchema = z.object({
  category: fallback(z.enum(["all", "skincare", "makeup", "hair", "nails"]), "all").default("all"),
  sort: fallback(z.enum(["featured", "price-asc", "price-desc", "rating"]), "featured").default("featured"),
});

const rootApi = getRouteApi("__root__");
const PAGE_SIZE = 9;

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Shop — Crystal Crest" },
      { name: "description", content: "Browse skincare, makeup, hair and nail products at Crystal Crest. Filter by category, price and rating." },
      { property: "og:title", content: "Shop — Crystal Crest" },
      { property: "og:description", content: "Browse our curated edit of beauty essentials." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const products = rootApi.useLoaderData() as Product[];

  const priceBounds = useMemo(() => {
    if (products.length === 0) return [0, 10000] as [number, number];
    const prices = products.map((p) => p.price);
    return [Math.min(...prices), Math.max(...prices)] as [number, number];
  }, [products]);

  const [price, setPrice] = useState<[number, number]>(priceBounds);
  const [minRating, setMinRating] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return products
      .filter((p) => (category === "all" ? true : p.category === (category as Category)))
      .filter((p) => p.price >= price[0] && p.price <= price[1])
      .filter((p) => p.rating >= minRating)
      .slice()
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [products, category, sort, price, minRating]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > shown.length;

  const reset = () => {
    setPrice(priceBounds);
    setMinRating(0);
    setVisible(PAGE_SIZE);
    navigate({ search: { category: "all", sort: "featured" } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container-luxe py-12 md:py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">The Shop</p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-6xl">
          {category === "all" ? "All products" : categories.find((c) => c.id === category)?.label}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {category === "all"
            ? "Every piece in the Crystal Crest edit, in one place."
            : categories.find((c) => c.id === category)?.description}
        </p>
      </section>

      <section className="container-luxe pb-24">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className={`${filtersOpen ? "fixed inset-0 z-40 block bg-background p-6 overflow-y-auto" : "hidden"} lg:static lg:block lg:p-0`}>
            <div className="flex items-center justify-between lg:hidden">
              <p className="font-display text-2xl">Filters</p>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="rounded-full p-2 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <FilterSection title="Category">
              <ul className="space-y-2">
                <li>
                  <FilterPill active={category === "all"} onClick={() => { navigate({ search: { category: "all", sort } }); setVisible(PAGE_SIZE); }}>
                    All products
                  </FilterPill>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <FilterPill active={category === c.id} onClick={() => { navigate({ search: { category: c.id, sort } }); setVisible(PAGE_SIZE); }}>
                      {c.label}
                    </FilterPill>
                  </li>
                ))}
              </ul>
            </FilterSection>

            <FilterSection title="Price">
              <Slider
                min={priceBounds[0]}
                max={priceBounds[1]}
                step={50}
                value={price}
                onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
                className="mt-2"
              />
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>{formatKES(price[0])}</span>
                <span>{formatKES(price[1])}</span>
              </div>
            </FilterSection>

            <FilterSection title="Rating">
              <ul className="space-y-2">
                {[0, 3, 4, 4.5].map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => setMinRating(r)}
                      className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${minRating === r ? "bg-foreground text-background" : "border border-border text-foreground/70 hover:border-foreground hover:text-foreground"}`}
                    >
                      {r === 0 ? "Any rating" : (
                        <>
                          <Star className="h-3.5 w-3.5 fill-accent stroke-accent" /> {r}+
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterSection>

            <button onClick={reset} className="mt-2 w-full rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] transition hover:border-foreground">
              Reset filters
            </button>
          </aside>

          {/* Main */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-xs uppercase tracking-[0.18em] lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                </button>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "product" : "products"}
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Sort
                <select
                  value={sort}
                  onChange={(e) => navigate({ search: { category, sort: e.target.value as typeof sort } })}
                  className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Rating</option>
                  <option value="price-asc">Price · Low</option>
                  <option value="price-desc">Price · High</option>
                </select>
              </label>
            </div>

            <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {filtered.length === 0 && (
              <div className="py-24 text-center">
                <p className="font-display text-2xl">Nothing matches those filters.</p>
                <button onClick={reset} className="mt-3 inline-block text-sm text-accent underline">
                  Reset filters
                </button>
              </div>
            )}

            {hasMore && (
              <div className="mt-14 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-sm border border-foreground px-8 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-foreground transition hover:bg-foreground hover:text-background"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {filtered.length > 0 && (
        <section className="container-luxe pb-12">
          <Link to="/shop" search={{ category: "all", sort: "featured" }} className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-accent">
            ← Back to all products
          </Link>
        </section>
      )}

      <Footer />
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/60">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-sm px-3 py-2 text-left text-xs uppercase tracking-[0.18em] transition ${active ? "bg-foreground text-background" : "text-foreground/70 hover:bg-secondary hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}
