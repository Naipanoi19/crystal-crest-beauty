import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface WishlistCtx {
  ids: Set<string>;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
  clear: () => void;
}

const Ctx = createContext<WishlistCtx | null>(null);
const KEY = "cc.wishlist.v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(new Set(JSON.parse(raw)));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
  }, [ids, hydrated]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo<WishlistCtx>(() => ({
    ids,
    has: (id) => ids.has(id),
    toggle,
    count: ids.size,
    clear: () => setIds(new Set()),
  }), [ids, toggle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
