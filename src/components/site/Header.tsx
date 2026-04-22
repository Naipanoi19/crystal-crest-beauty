import { Link, getRouteApi } from "@tanstack/react-router";
import { Search, ShoppingBag, User, X, Heart, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { formatKES, type Product } from "@/data/products";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const rootApi = getRouteApi("__root__");

const NAV = [
  { label: "Shop", category: "all" as const },
  { label: "Skincare", category: "skincare" as const },
  { label: "Makeup", category: "makeup" as const },
  { label: "Hair", category: "hair" as const },
  { label: "Nails", category: "nails" as const },
];

export function Header() {
  const cart = useCart();
  const wl = useWishlist();
  const { user } = useAuth();
  const products = (rootApi.useLoaderData() as Product[]) ?? [];

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
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
    <header className="glass-nav sticky top-0 z-40 border-b border-border">
      <div className="container-luxe flex h-16 items-center justify-between gap-4 md:h-18">
        {/* Mobile menu */}
        <button onClick={() => setMobileOpen(true)} aria-label="Menu" className="rounded-full p-2 text-foreground/70 transition hover:bg-secondary md:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="font-display text-xl tracking-tight text-foreground md:text-2xl">
          Crystal <span className="text-accent">Crest</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to="/shop"
              search={{ category: n.category, sort: "featured" }}
              className="relative transition hover:text-foreground after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 text-foreground/70 md:gap-1">
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Search" className="rounded-full p-2 transition hover:bg-secondary hover:text-accent">
            <Search className="h-4 w-4" />
          </button>
          <Link to={user ? "/account" : "/auth"} aria-label="Account" className="rounded-full p-2 transition hover:bg-secondary hover:text-accent">
            <User className="h-4 w-4" />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2 transition hover:bg-secondary hover:text-accent">
            <Heart className="h-4 w-4" />
            {wl.count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                {wl.count}
              </span>
            )}
          </Link>
          <button onClick={() => cart.setOpen(true)} aria-label="Cart" className="relative rounded-full p-2 transition hover:bg-secondary hover:text-accent">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
              {cart.count}
            </span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur">
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

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[86%] max-w-sm border-r border-border bg-background p-0">
          <SheetHeader className="border-b border-border p-6">
            <SheetTitle className="font-display text-2xl">
              Crystal <span className="text-accent">Crest</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-2">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to="/shop"
                search={{ category: n.category, sort: "featured" }}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm px-4 py-3 font-display text-2xl text-foreground transition hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-3 h-px bg-border" />
            <Link to="/about" onClick={() => setMobileOpen(false)} className="rounded-sm px-4 py-2 text-sm text-foreground/80 transition hover:bg-secondary">About</Link>
            <Link to="/pickup" onClick={() => setMobileOpen(false)} className="rounded-sm px-4 py-2 text-sm text-foreground/80 transition hover:bg-secondary">Pickup info</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="rounded-sm px-4 py-2 text-sm text-foreground/80 transition hover:bg-secondary">Contact</Link>
            <Link to="/faq" onClick={() => setMobileOpen(false)} className="rounded-sm px-4 py-2 text-sm text-foreground/80 transition hover:bg-secondary">FAQ</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="rounded-sm px-4 py-2 text-sm text-foreground/80 transition hover:bg-secondary">
              Wishlist {wl.count > 0 && <span className="ml-1 text-accent">({wl.count})</span>}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
