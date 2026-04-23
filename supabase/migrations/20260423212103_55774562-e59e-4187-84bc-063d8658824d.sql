DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_order_status') THEN
    CREATE TYPE public.admin_order_status AS ENUM ('pending', 'confirmed', 'ready_for_pickup', 'collected', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Website message',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins manage contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  length(trim(sender_name)) > 0 AND length(trim(sender_name)) <= 120 AND
  length(trim(contact)) > 2 AND length(trim(contact)) <= 160 AND
  length(trim(subject)) > 0 AND length(trim(subject)) <= 160 AND
  length(trim(message)) > 0 AND length(trim(message)) <= 2000 AND
  status = 'unread'
);
CREATE POLICY "Admins manage contact messages"
ON public.contact_messages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.store_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.store_categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.store_categories;
CREATE POLICY "Anyone can view active categories"
ON public.store_categories
FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories"
ON public.store_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.store_categories (name, slug) VALUES
  ('Skincare', 'skincare'),
  ('Makeup', 'makeup'),
  ('Hair', 'hair'),
  ('Nails', 'nails')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins manage site content" ON public.site_content;
CREATE POLICY "Anyone can view site content"
ON public.site_content
FOR SELECT
USING (true);
CREATE POLICY "Admins manage site content"
ON public.site_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_content (key, value)
VALUES ('homepage', jsonb_build_object(
  'heroHeadline', 'Quiet luxury for every ritual.',
  'heroSubheadline', 'Considered formulas. Beautiful objects. Curated for the way you actually live.',
  'stats', jsonb_build_array(
    jsonb_build_object('label', 'Curated products', 'number', '8'),
    jsonb_build_object('label', 'Nairobi delivery', 'number', '48h'),
    jsonb_build_object('label', 'Countrywide', 'number', '1–3 days')
  ),
  'featuredProductIds', jsonb_build_array(),
  'storeAddress', 'Kajiado Town · Opposite Crapas Hotel',
  'pickupInfo', 'Pickup at Kajiado Town Studio',
  'announcementText', 'Now open in Kajiado Town!',
  'announcementVisible', false
))
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);
CREATE POLICY "Admins manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value)
VALUES ('store', jsonb_build_object(
  'storeOpen', true,
  'deliveryComingSoon', false,
  'phone', '+254 700 000 000',
  'whatsapp', 'https://wa.me/254700000000'
))
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage order history" ON public.order_status_history;
DROP POLICY IF EXISTS "Users view own order history" ON public.order_status_history;
CREATE POLICY "Admins manage order history"
ON public.order_status_history
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own order history"
ON public.order_status_history
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND o.user_id = auth.uid()));

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_status public.admin_order_status NOT NULL DEFAULT 'pending';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS admin_status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_data_url TEXT;

CREATE OR REPLACE FUNCTION public.sync_product_admin_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.stock <= 0 THEN
    NEW.admin_status := 'sold_out';
    NEW.is_active := false;
  ELSIF NEW.admin_status = 'active' THEN
    NEW.is_active := true;
  ELSIF NEW.admin_status = 'sold_out' THEN
    NEW.is_active := false;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_admin_status_trigger ON public.products;
CREATE TRIGGER products_admin_status_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_admin_status();

CREATE OR REPLACE FUNCTION public.log_order_admin_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, status, note, created_by)
    VALUES (NEW.id, NEW.admin_status::text, 'Order created', auth.uid());
  ELSIF OLD.admin_status IS DISTINCT FROM NEW.admin_status THEN
    INSERT INTO public.order_status_history (order_id, status, note, created_by)
    VALUES (NEW.id, NEW.admin_status::text, 'Status updated', auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_admin_status_history_trigger ON public.orders;
CREATE TRIGGER orders_admin_status_history_trigger
AFTER INSERT OR UPDATE OF admin_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_admin_status_change();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_categories_updated_at ON public.store_categories;
CREATE TRIGGER update_store_categories_updated_at
BEFORE UPDATE ON public.store_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_content_updated_at ON public.site_content;
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_orders_admin_status ON public.orders(admin_status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);