import { supabase } from "@/integrations/supabase/client";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string | null;
  price_cents: number;
  stock: number;
  badge: string | null;
  image_url: string;
  image_data_url: string | null;
  is_active: boolean;
  admin_status?: string;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  total_cents: number;
  admin_status: "pending" | "confirmed" | "ready_for_pickup" | "collected" | "cancelled";
  created_at: string;
};

export type OrderItem = { order_id: string; product_name: string; quantity: number; unit_price_cents: number; line_total_cents: number };
export type ContactMessage = { id: string; sender_name: string; contact: string; subject: string; message: string; status: "unread" | "read" | "resolved"; created_at: string };
export type StoreCategory = { id: string; name: string; slug: string; is_active: boolean };

export const adminDb = supabase as any;
export const adminEmail = "admin@crystalcrest.local";

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `product-${Date.now()}`;
}

export function money(cents: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Math.round(cents / 100));
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
