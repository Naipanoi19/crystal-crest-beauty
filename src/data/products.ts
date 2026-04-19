import serum from "@/assets/p-serum.jpg";
import lipstick from "@/assets/p-lipstick.jpg";
import hairoil from "@/assets/p-hairoil.jpg";
import polish from "@/assets/p-polish.jpg";

export type Category = "skincare" | "makeup" | "hair" | "nails";

export interface Product {
  id: string;          // DB uuid
  slug: string;
  name: string;
  tagline: string;
  description?: string | null;
  category: Category;
  price: number;       // KES (whole shillings)
  rating: number;
  reviews: number;
  image: string;
  badge?: string | null;
  stock: number;
  reorderThreshold: number;
  lastSoldAt?: string | null;
  isActive: boolean;
}

export const categories: { id: Category; label: string; description: string }[] = [
  { id: "skincare", label: "Skincare", description: "Serums, masks & rituals" },
  { id: "makeup",   label: "Makeup",   description: "Lips, eyes & complexion" },
  { id: "hair",     label: "Hair Care", description: "Oils, treatments & shine" },
  { id: "nails",    label: "Nails",    description: "Polish & treatments" },
];

// Slug → bundled image (so DB doesn't need to ship binary URLs)
export const productImageBySlug: Record<string, string> = {
  "velvet-glow-serum": serum,
  "midnight-repair-drops": serum,
  "rose-petal-matte-lip": lipstick,
  "crystal-crest-lip-tint": lipstick,
  "argan-silk-hair-oil": hairoil,
  "silk-scalp-elixir": hairoil,
  "blush-creme-polish": polish,
  "petal-glaze-top-coat": polish,
};

export const fallbackImage = serum;

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
