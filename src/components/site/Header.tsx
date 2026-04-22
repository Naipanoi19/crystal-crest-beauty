import { Link, getRouteApi } from "@tanstack/react-router";
import { Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatKES, type Product } from "@/data/products";

const rootApi = getRouteApi("__root__");

export function Header() {
  const cart = useCart();
  const { user } = useAuth();
  const products = (rootApi.useLoaderData() as Product[]) ?? [];

  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(term) || p.tagline.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
      .slice(0, 6);
  }, [q, products]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-luxe flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-display text-xl tracking-tight text-foreground">
          Crystal <span className="text-accent">Crest</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          <Link to="/shop" search={{ category: "all", sort: "featured" }} className="hover:text-foreground">Shop</Link>
          <Link to="/shop" search={{ category: "skincare", sort: "featured" }} className="hover:text-foreground">Skincare</Link>
          <Link to="/shop" search={{ category: "makeup", sort: "featured" }} className="hover:text-foreground">Makeup</Link>
          <Link to="/shop" search={{ category: "hair", sort: "featured" }} className="hover:text-foreground">Hair</Link>
          <Link to="/shop" search={{ category: "nails", sort: "featured" }} className="hover:text-foreground">Nails</Link>
        </nav>

        <div className="flex items-center gap-1 text-foreground/70">
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Search" className="rounded-full p-2 transition hover:bg-secondary">
            <Search className="h-4 w-4" />
          </button>
          <Link to={user ? "/account" : "/auth"} aria-label="Account" className="rounded-full p-2 transition hover:bg-secondary">
            <User className="h-4 w-4" />
          </Link>
          <button onClick={() => cart.setOpen(true)} aria-label="Cart" className="relative rounded-full p-2 transition hover:bg-secondary">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
              {cart.count}
            </span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background">
          <div className="container-luxe py-4">
            <div className="flex items-center gap-3 rounded-sm border border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products by name…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {q.trim() && (
              <div className="mt-3 overflow-hidden rounded-sm border border-border bg-background shadow-sm">
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">No products match “{q}”.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/product/$slug"
                          params={{ slug: p.slug }}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 transition hover:bg-secondary/50"
                        >
                          <img src={p.image} alt={p.name} className="h-12 w-10 rounded-sm object-cover" />
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.category}</p>
                            <p className="text-sm text-foreground">{p.name}</p>
                          </div>
                          <p className="text-sm text-foreground">{formatKES(p.price)}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
