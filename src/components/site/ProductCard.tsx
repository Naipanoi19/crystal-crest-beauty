import { Link } from "@tanstack/react-router";
import { Star, Heart, Eye, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { formatKES, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { QuickViewDialog } from "@/components/site/QuickViewDialog";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const wl = useWishlist();
  const [quickOpen, setQuickOpen] = useState(false);
  const out = product.stock <= 0;
  const liked = wl.has(product.id);

  // pick a badge: explicit > computed
  const computedBadge = out
    ? "Sold Out"
    : (product.badge ?? (product.reviews >= 100 ? "Bestseller" : null));
  const badgeTone =
    computedBadge === "Sold Out" ? "bg-foreground text-background"
    : computedBadge === "Bestseller" ? "bg-gradient-rose text-white"
    : computedBadge === "New" ? "bg-foreground text-background"
    : "bg-background/90 text-foreground";

  return (
    <>
      <article className="group flex flex-col">
        <div className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-cream shadow-card transition duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-card-hover">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={800}
              height={1000}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
            />
          </Link>

          {computedBadge && (
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur ${badgeTone}`}>
              {computedBadge}
            </span>
          )}

          {/* wishlist heart */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); wl.toggle(product.id); }}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background hover:text-accent"
          >
            <Heart className={`h-4 w-4 transition ${liked ? "fill-accent stroke-accent" : ""}`} />
          </button>

          {/* hover actions */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {out ? (
              <button
                type="button"
                disabled
                className="pointer-events-auto flex-1 cursor-not-allowed rounded-sm bg-muted py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                Sold Out
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); cart.add(product); cart.setOpen(true); }}
                className="pointer-events-auto flex flex-1 items-center justify-center gap-2 rounded-sm bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-background transition hover:bg-accent"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setQuickOpen(true); }}
              aria-label="Quick view"
              className="pointer-events-auto grid aspect-square place-items-center rounded-sm bg-background py-2.5 text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

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

      <QuickViewDialog product={product} open={quickOpen} onOpenChange={setQuickOpen} />
    </>
  );
}
