import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";

export interface CartItem {
  id: string; // product id (uuid)
  qty: number;
}

interface CartLine extends CartItem {
  product: Product;
}

interface CartCtx {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartCtx | null>(null);
const KEY = "cc.cart.v2";

export function CartProvider({ children, products }: { children: React.ReactNode; products: Product[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    const lines: CartLine[] = items
      .map((i) => ({ ...i, product: map.get(i.id)! }))
      .filter((l) => l.product);
    return {
      items,
      lines,
      open,
      setOpen,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.product.price * l.qty, 0),
      add: (p, qty = 1) =>
        setItems((prev) => {
          const found = prev.find((i) => i.id === p.id);
          if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
          return [...prev, { id: p.id, qty }];
        }),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) =>
          qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
        ),
      clear: () => setItems([]),
    };
  }, [items, open, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
