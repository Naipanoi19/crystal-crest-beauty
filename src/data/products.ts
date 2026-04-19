import serum from "@/assets/p-serum.jpg";
import lipstick from "@/assets/p-lipstick.jpg";
import hairoil from "@/assets/p-hairoil.jpg";
import polish from "@/assets/p-polish.jpg";

export type Category = "skincare" | "makeup" | "hair" | "nails";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
}

export const categories: { id: Category; label: string; description: string }[] = [
  { id: "skincare", label: "Skincare", description: "Serums, masks & rituals" },
  { id: "makeup",   label: "Makeup",   description: "Lips, eyes & complexion" },
  { id: "hair",     label: "Hair Care", description: "Oils, treatments & shine" },
  { id: "nails",    label: "Nails",    description: "Polish & treatments" },
];

export const products: Product[] = [
  { id: "p1", name: "Velvet Glow Serum",     tagline: "Hyaluronic + niacinamide", category: "skincare", price: 4200, rating: 4.8, reviews: 214, image: serum,    badge: "Bestseller" },
  { id: "p2", name: "Rose Petal Matte Lip",  tagline: "Long-wear, weightless",    category: "makeup",   price: 1850, rating: 4.6, reviews: 186, image: lipstick },
  { id: "p3", name: "Argan Silk Hair Oil",   tagline: "Featherlight shine",       category: "hair",     price: 2400, rating: 4.9, reviews: 342, image: hairoil,  badge: "New" },
  { id: "p4", name: "Blush Crème Polish",    tagline: "10-free, gel finish",      category: "nails",    price: 950,  rating: 4.5, reviews: 98,  image: polish },
  { id: "p5", name: "Midnight Repair Drops", tagline: "Retinal night treatment",  category: "skincare", price: 5400, rating: 4.7, reviews: 121, image: serum },
  { id: "p6", name: "Crystal Crest Lip Tint",tagline: "Sheer dewy color",         category: "makeup",   price: 1450, rating: 4.4, reviews: 76,  image: lipstick },
  { id: "p7", name: "Silk Scalp Elixir",     tagline: "Soothing growth oil",      category: "hair",     price: 3200, rating: 4.6, reviews: 89,  image: hairoil },
  { id: "p8", name: "Petal Glaze Top Coat",  tagline: "High-shine finish",        category: "nails",    price: 850,  rating: 4.3, reviews: 54,  image: polish },
];

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
