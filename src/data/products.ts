import serum from "@/assets/p-serum.jpg";

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

// Unique Unsplash placeholder per product slug
export const productImageBySlug: Record<string, string> = {
  "velvet-glow-serum":      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  "midnight-repair-drops":  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
  "rose-petal-matte-lip":   "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
  "crystal-crest-lip-tint": "https://images.unsplash.com/photo-1599733589046-8a35aa8b08e1?auto=format&fit=crop&w=800&q=80",
  "argan-silk-hair-oil":    "https://images.unsplash.com/photo-1626015449304-9077d3957a07?auto=format&fit=crop&w=800&q=80",
  "silk-scalp-elixir":      "https://images.unsplash.com/photo-1585870683043-49108d0b181a?auto=format&fit=crop&w=800&q=80",
  "blush-creme-polish":     "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
  "petal-glaze-top-coat":   "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80",
};

export const fallbackImage = serum;

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
