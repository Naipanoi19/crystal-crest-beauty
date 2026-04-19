
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PRODUCTS
CREATE TYPE public.product_category AS ENUM ('skincare', 'makeup', 'hair', 'nails');

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  category public.product_category NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  badge TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  reorder_threshold INTEGER NOT NULL DEFAULT 5,
  last_sold_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDERS
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'fulfilled', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'airtel', 'cash');
CREATE TYPE public.fulfillment_method AS ENUM ('delivery', 'pickup');
CREATE TYPE public.order_channel AS ENUM ('online', 'pos');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('CC-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*100000))::text,5,'0')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  channel public.order_channel NOT NULL DEFAULT 'online',
  status public.order_status NOT NULL DEFAULT 'pending',
  fulfillment public.fulfillment_method NOT NULL,
  payment_method public.payment_method NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT,
  pickup_time TIMESTAMPTZ,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FEEDBACK
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view feedback" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PLACE ORDER FUNCTION (atomic stock deduction)
CREATE OR REPLACE FUNCTION public.place_order(
  _channel public.order_channel,
  _fulfillment public.fulfillment_method,
  _payment_method public.payment_method,
  _customer_name TEXT,
  _customer_phone TEXT,
  _customer_email TEXT,
  _delivery_address TEXT,
  _shipping_cents INTEGER,
  _notes TEXT,
  _items JSONB
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _order_id UUID;
  _order_number TEXT;
  _subtotal INTEGER := 0;
  _line JSONB;
  _product RECORD;
  _qty INTEGER;
  _line_total INTEGER;
BEGIN
  -- Validate items, lock & deduct stock
  FOR _line IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_line->>'quantity')::INTEGER;
    SELECT id, name, price_cents, stock INTO _product
      FROM public.products WHERE id = (_line->>'product_id')::UUID FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', _line->>'product_id'; END IF;
    IF _product.stock < _qty THEN RAISE EXCEPTION 'Insufficient stock for %', _product.name; END IF;
    _subtotal := _subtotal + _product.price_cents * _qty;
  END LOOP;

  INSERT INTO public.orders (user_id, channel, status, fulfillment, payment_method, customer_name, customer_phone, customer_email, delivery_address, subtotal_cents, shipping_cents, total_cents, notes)
  VALUES (auth.uid(), _channel, CASE WHEN _payment_method = 'cash' THEN 'pending'::order_status ELSE 'paid'::order_status END,
          _fulfillment, _payment_method, _customer_name, _customer_phone, _customer_email, _delivery_address,
          _subtotal, _shipping_cents, _subtotal + _shipping_cents, _notes)
  RETURNING id, order_number INTO _order_id, _order_number;

  FOR _line IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_line->>'quantity')::INTEGER;
    SELECT id, name, price_cents INTO _product FROM public.products WHERE id = (_line->>'product_id')::UUID;
    _line_total := _product.price_cents * _qty;
    INSERT INTO public.order_items (order_id, product_id, product_name, unit_price_cents, quantity, line_total_cents)
    VALUES (_order_id, _product.id, _product.name, _product.price_cents, _qty, _line_total);
    UPDATE public.products SET stock = stock - _qty, last_sold_at = now() WHERE id = _product.id;
  END LOOP;

  RETURN jsonb_build_object('order_id', _order_id, 'order_number', _order_number, 'total_cents', _subtotal + _shipping_cents);
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order TO anon, authenticated;

-- Seed initial products
INSERT INTO public.products (slug, name, tagline, description, category, price_cents, rating, reviews_count, image_url, badge, stock, reorder_threshold) VALUES
  ('velvet-glow-serum',     'Velvet Glow Serum',      'Hyaluronic + niacinamide', 'A weightless daily serum that floods skin with moisture and softens the look of pores.', 'skincare', 420000, 4.8, 214, '/src/assets/p-serum.jpg',    'Bestseller', 24, 5),
  ('rose-petal-matte-lip',  'Rose Petal Matte Lip',   'Long-wear, weightless',    'A buttery matte lipstick with 8-hour wear and a kiss of rose oil.',                       'makeup',   185000, 4.6, 186, '/src/assets/p-lipstick.jpg', NULL,         32, 5),
  ('argan-silk-hair-oil',   'Argan Silk Hair Oil',    'Featherlight shine',       'Cold-pressed argan oil with silk amino acids for glassy, frizz-free hair.',               'hair',     240000, 4.9, 342, '/src/assets/p-hairoil.jpg',  'New',        18, 5),
  ('blush-creme-polish',    'Blush Crème Polish',     '10-free, gel finish',      'A creamy nude polish with a high-shine gel finish, free from 10 harsh ingredients.',      'nails',     95000, 4.5,  98, '/src/assets/p-polish.jpg',   NULL,         42, 5),
  ('midnight-repair-drops', 'Midnight Repair Drops',  'Retinal night treatment',  'Encapsulated retinal smooths and renews skin overnight without irritation.',              'skincare', 540000, 4.7, 121, '/src/assets/p-serum.jpg',    NULL,         12, 5),
  ('crystal-crest-lip-tint','Crystal Crest Lip Tint', 'Sheer dewy color',         'A juicy, hydrating tint that builds from sheer to bold.',                                 'makeup',   145000, 4.4,  76, '/src/assets/p-lipstick.jpg', NULL,         28, 5),
  ('silk-scalp-elixir',     'Silk Scalp Elixir',      'Soothing growth oil',      'Rosemary, peppermint and biotin for a calm, balanced scalp.',                             'hair',     320000, 4.6,  89, '/src/assets/p-hairoil.jpg',  NULL,          3, 5),
  ('petal-glaze-top-coat',  'Petal Glaze Top Coat',   'High-shine finish',        'A diamond-clear top coat that locks in color with mirror shine.',                         'nails',     85000, 4.3,  54, '/src/assets/p-polish.jpg',   NULL,         60, 5);
