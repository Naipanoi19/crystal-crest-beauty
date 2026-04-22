import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatKES, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

export function QuickViewDialog({ product, open, onOpenChange }: {
  product: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const cart = useCart();
  const wl = useWishlist();
  if (!product) return null;
  const out = product.stock <= 0;
  const liked = wl.has(product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-sm">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/5] bg-cream">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground backdrop-blur">
                {product.badge}
              </span>
            )}
          </div>
          <div className="flex flex-col p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{product.category}</p>
            <h2 className="mt-2 font-display text-3xl text-foreground">{product.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "fill-accent stroke-accent" : "stroke-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-muted-foreground">({product.reviews})</span>
            </div>

            <p className="mt-5 font-display text-2xl">{formatKES(product.price)}</p>
            <p className={`mt-1 text-[11px] uppercase tracking-[0.2em] ${out ? "text-destructive" : "text-muted-foreground"}`}>
              {out ? "Sold out" : "In stock"}
            </p>

            <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-foreground/80">
              {product.description ?? "A signature Crystal Crest formula — clean, considered, crafted in small batches."}
            </p>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <div className="flex gap-2">
                <Button
                  disabled={out}
                  onClick={() => { cart.add(product); cart.setOpen(true); onOpenChange(false); }}
                  className="flex-1 rounded-sm bg-foreground text-background hover:bg-foreground/85"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {out ? "Sold out" : "Add to bag"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => wl.toggle(product.id)}
                  aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  className="rounded-sm border-border"
                >
                  <Heart className={`h-4 w-4 transition ${liked ? "fill-accent stroke-accent" : ""}`} />
                </Button>
              </div>
              <Button asChild variant="ghost" className="text-xs uppercase tracking-[0.2em]">
                <Link to="/product/$slug" params={{ slug: product.slug }} onClick={() => onOpenChange(false)}>
                  View full details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
