
-- Cashiers table: PIN-based login managed by admin
CREATE TABLE public.cashiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cashiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage cashiers" ON public.cashiers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Stock entries: each row is a stock-in / sale event recorded by a cashier
CREATE TABLE public.stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashier_id UUID NOT NULL REFERENCES public.cashiers(id) ON DELETE RESTRICT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_data_url TEXT,
  buying_price_cents INTEGER NOT NULL DEFAULT 0,
  selling_price_cents INTEGER NOT NULL DEFAULT 0,
  quantity_bought INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  edit_unlocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_entries_cashier ON public.stock_entries(cashier_id);
CREATE INDEX idx_stock_entries_date ON public.stock_entries(entry_date DESC);

ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;

-- Admins do anything
CREATE POLICY "Admins manage stock entries" ON public.stock_entries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read of stock entries (used by cashier app via anon key)
CREATE POLICY "Anyone can read stock entries" ON public.stock_entries
  FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone (cashier app) can insert; lock starts false until they save
CREATE POLICY "Anyone can insert stock entry" ON public.stock_entries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Anyone can update only if not locked OR within unlock window
CREATE POLICY "Update only when unlocked" ON public.stock_entries
  FOR UPDATE TO anon, authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR is_locked = false
    OR (edit_unlocked_until IS NOT NULL AND edit_unlocked_until > now())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR is_locked = false
    OR (edit_unlocked_until IS NOT NULL AND edit_unlocked_until > now())
  );

CREATE TRIGGER trg_stock_entries_updated
BEFORE UPDATE ON public.stock_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_cashiers_updated
BEFORE UPDATE ON public.cashiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verify cashier login: returns cashier row if username + pin match (pin compared as plain hash via digest)
CREATE OR REPLACE FUNCTION public.verify_cashier(_username TEXT, _pin TEXT)
RETURNS TABLE(id UUID, username TEXT, full_name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT c.id, c.username, c.full_name
  FROM public.cashiers c
  WHERE c.is_active = true
    AND lower(c.username) = lower(_username)
    AND c.pin_hash = encode(extensions.digest(_pin, 'sha256'), 'hex');
$$;

GRANT EXECUTE ON FUNCTION public.verify_cashier(TEXT, TEXT) TO anon, authenticated;

-- Helper for admin to create cashier with hashed pin
CREATE OR REPLACE FUNCTION public.admin_create_cashier(_username TEXT, _pin TEXT, _full_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE _id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create cashiers';
  END IF;
  INSERT INTO public.cashiers(username, pin_hash, full_name)
  VALUES (lower(_username), encode(extensions.digest(_pin, 'sha256'), 'hex'), _full_name)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_cashier_pin(_cashier_id UUID, _pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reset PIN';
  END IF;
  UPDATE public.cashiers SET pin_hash = encode(extensions.digest(_pin, 'sha256'), 'hex') WHERE id = _cashier_id;
  RETURN true;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
