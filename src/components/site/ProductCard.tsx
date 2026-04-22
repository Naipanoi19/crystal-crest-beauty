import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { formatKES, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const out = product.stock <= 0;
  return (
    <article className="group flex flex-col">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-cream"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground backdrop-blur">
            {product.badge}
          </span>
        )}
        {out ? (
          <>
            <span className="absolute right-3 top-3 rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-background">
              Sold out
            </span>
            <button
              type="button"
              disabled
              onClick={(e) => e.preventDefault()}
              className="absolute inset-x-3 bottom-3 cursor-not-allowed rounded-sm bg-muted py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Sold Out
            </button>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              cart.add(product);
              cart.setOpen(true);
            }}
            className="absolute inset-x-3 bottom-3 translate-y-2 rounded-sm bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-background opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            Add to Bag
          </button>
        )}
      </Link>

      <Link to="/product/$slug" params={{ slug: product.slug }} className="mt-4 flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-lg text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{formatKES(product.price)}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent stroke-accent" />
            <span className="text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.reviews})</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
