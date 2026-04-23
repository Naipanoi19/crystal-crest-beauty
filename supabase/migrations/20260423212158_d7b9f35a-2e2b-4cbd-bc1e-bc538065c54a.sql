CREATE OR REPLACE FUNCTION public.sync_product_admin_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.stock <= 0 THEN
    NEW.admin_status := 'sold_out';
  END IF;
  NEW.is_active := true;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;