import { supabase } from "@/integrations/supabase/client";
import { fallbackImage, productImageBySlug, type Category, type Product } from "@/data/products";

type Row = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  category: Category;
  price_cents: number;
  rating: number;
  reviews_count: number;
  image_url: string;
  badge: string | null;
  stock: number;
  reorder_threshold: number;
  last_sold_at: string | null;
  is_active: boolean;
};

function mapRow(r: Row): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    category: r.category,
    price: Math.round(r.price_cents / 100),
    rating: Number(r.rating),
    reviews: r.reviews_count,
    image: productImageBySlug[r.slug] ?? fallbackImage,
    badge: r.badge,
    stock: r.stock,
    reorderThreshold: r.reorder_threshold,
    lastSoldAt: r.last_sold_at,
    isActive: r.is_active,
  };
}

export async function fetchProducts(opts: { activeOnly?: boolean } = {}): Promise<Product[]> {
  let q = supabase.from("products").select("*").order("created_at", { ascending: true });
  if (opts.activeOnly !== false) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}
