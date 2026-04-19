import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products, type Category } from "@/data/products";

const searchSchema = z.object({
  category: fallback(z.enum(["all", "skincare", "makeup", "hair", "nails"]), "all").default("all"),
  sort: fallback(z.enum(["featured", "price-asc", "price-desc", "rating"]), "featured").default("featured"),
});

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Shop — Crystal Crest" },
      { name: "description", content: "Browse skincare, makeup, hair and nail products at Crystal Crest. Filter by category and sort by what matters to you." },
      { property: "og:title", content: "Shop — Crystal Crest" },
      { property: "og:description", content: "Browse our curated edit of beauty essentials." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const filtered = (category === "all" ? products : products.filter((p) => p.category === (category as Category)))
    .slice()
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

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

      <section className="container-luxe">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={category === "all"} onClick={() => navigate({ search: (prev: typeof Route.types.fullSearchSchema) => ({ ...prev, category: "all" as const }) })}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={category === c.id}
                onClick={() => navigate({ search: (prev) => ({ ...prev, category: c.id }) })}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Sort
            <select
              value={sort}
              onChange={(e) => navigate({ search: (prev) => ({ ...prev, sort: e.target.value as typeof sort }) })}
              className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="featured">Featured</option>
              <option value="rating">Rating</option>
              <option value="price-asc">Price · Low</option>
              <option value="price-desc">Price · High</option>
            </select>
          </label>
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">Nothing here yet.</p>
            <Link to="/shop" search={{ category: "all" }} className="mt-3 inline-block text-sm text-accent underline">
              Browse all products
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.18em] transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground/70 hover:border-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
