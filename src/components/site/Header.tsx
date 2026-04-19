import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";

export function Header() {
  const cart = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-luxe flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-display text-xl tracking-tight text-foreground">
          Crystal <span className="text-accent">Crest</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          <Link to="/shop" search={{ category: "all", sort: "featured" }} activeProps={{ className: "text-foreground" }} className="hover:text-foreground">Shop</Link>
          <Link to="/shop" search={{ category: "skincare", sort: "featured" }} className="hover:text-foreground">Skincare</Link>
          <Link to="/shop" search={{ category: "makeup", sort: "featured" }} className="hover:text-foreground">Makeup</Link>
          <Link to="/shop" search={{ category: "hair", sort: "featured" }} className="hover:text-foreground">Hair</Link>
          <Link to="/shop" search={{ category: "nails", sort: "featured" }} className="hover:text-foreground">Nails</Link>
        </nav>

        <div className="flex items-center gap-1 text-foreground/70">
          <button aria-label="Search" className="rounded-full p-2 transition hover:bg-secondary"><Search className="h-4 w-4" /></button>
          <button aria-label="Account" className="rounded-full p-2 transition hover:bg-secondary"><User className="h-4 w-4" /></button>
          <button
            onClick={() => cart.setOpen(true)}
            aria-label="Cart"
            className="relative rounded-full p-2 transition hover:bg-secondary"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
              {cart.count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
