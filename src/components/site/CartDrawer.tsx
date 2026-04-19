import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatKES, products } from "@/data/products";

export function CartDrawer() {
  const cart = useCart();

  const lines = cart.items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id)! }))
    .filter((l) => l.product);

  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-display text-2xl">Your bag</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-xl">Your bag is empty.</p>
            <p className="text-sm text-muted-foreground">Add a little luxe to your day.</p>
            <Button onClick={() => cart.setOpen(false)} asChild className="mt-2">
              <Link to="/shop" search={{ category: "all", sort: "featured" }}>Browse the shop</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map((l) => (
                <div key={l.id} className="flex gap-4 py-4">
                  <img src={l.product.image} alt={l.product.name} className="h-24 w-20 rounded-sm object-cover" />
                  <div className="flex flex-1 flex-col">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{l.product.category}</p>
                    <p className="font-display text-base">{l.product.name}</p>
                    <p className="mt-auto text-sm">{formatKES(l.product.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button onClick={() => cart.setQty(l.id, l.qty - 1)} className="p-1.5 hover:text-accent" aria-label="Decrease">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center text-sm">{l.qty}</span>
                        <button onClick={() => cart.setQty(l.id, l.qty + 1)} className="p-1.5 hover:text-accent" aria-label="Increase">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button onClick={() => cart.remove(l.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border bg-secondary/30 px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatKES(cart.subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Shipping & taxes calculated at checkout.</p>
              <Button className="mt-4 w-full rounded-none bg-foreground text-background hover:bg-foreground/90" size="lg">
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
