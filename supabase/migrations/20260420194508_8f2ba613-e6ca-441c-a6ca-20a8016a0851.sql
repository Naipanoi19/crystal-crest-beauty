
-- Replace place_order: do NOT deduct stock for pending (cash) orders.
-- Only deduct immediately if status is paid (mpesa/airtel sales auto-paid, POS cash kept pending).
CREATE OR REPLACE FUNCTION public.place_order(
  _channel order_channel, _fulfillment fulfillment_method, _payment_method payment_method,
  _customer_name text, _customer_phone text, _customer_email text, _delivery_address text,
  _shipping_cents integer, _notes text, _items jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  _order_id UUID; _order_number TEXT; _subtotal INTEGER := 0;
  _line JSONB; _product RECORD; _qty INTEGER; _line_total INTEGER;
  _status order_status;
BEGIN
  _status := CASE WHEN _payment_method = 'cash' THEN 'pending'::order_status ELSE 'paid'::order_status END;

  -- Validate items + lock rows; only deduct stock if order will be 'paid'
  FOR _line IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_line->>'quantity')::INTEGER;
    SELECT id, name, price_cents, stock INTO _product
      FROM public.products WHERE id = (_line->>'product_id')::UUID FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', _line->>'product_id'; END IF;
    IF _status = 'paid' AND _product.stock < _qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', _product.name;
    END IF;
    _subtotal := _subtotal + _product.price_cents * _qty;
  END LOOP;

  INSERT INTO public.orders (user_id, channel, status, fulfillment, payment_method, customer_name, customer_phone, customer_email, delivery_address, subtotal_cents, shipping_cents, total_cents, notes)
  VALUES (auth.uid(), _channel, _status, _fulfillment, _payment_method, _customer_name, _customer_phone, _customer_email, _delivery_address,
          _subtotal, _shipping_cents, _subtotal + _shipping_cents, _notes)
  RETURNING id, order_number INTO _order_id, _order_number;

  FOR _line IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_line->>'quantity')::INTEGER;
    SELECT id, name, price_cents INTO _product FROM public.products WHERE id = (_line->>'product_id')::UUID;
    _line_total := _product.price_cents * _qty;
    INSERT INTO public.order_items (order_id, product_id, product_name, unit_price_cents, quantity, line_total_cents)
    VALUES (_order_id, _product.id, _product.name, _product.price_cents, _qty, _line_total);
    IF _status = 'paid' THEN
      UPDATE public.products SET stock = stock - _qty, last_sold_at = now() WHERE id = _product.id;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('order_id', _order_id, 'order_number', _order_number, 'total_cents', _subtotal + _shipping_cents);
END;
$function$;

-- Trigger: when order status changes, sync stock
CREATE OR REPLACE FUNCTION public.sync_stock_on_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _item RECORD;
BEGIN
  -- Pending -> Paid (or Fulfilled): deduct stock
  IF (OLD.status = 'pending' AND NEW.status IN ('paid','fulfilled')) THEN
    FOR _item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id LOOP
      UPDATE public.products SET stock = stock - _item.quantity, last_sold_at = now() WHERE id = _item.product_id;
    END LOOP;
  -- Paid/Fulfilled -> Cancelled: restore stock
  ELSIF (OLD.status IN ('paid','fulfilled') AND NEW.status = 'cancelled') THEN
    FOR _item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id LOOP
      UPDATE public.products SET stock = stock + _item.quantity WHERE id = _item.product_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS orders_sync_stock ON public.orders;
CREATE TRIGGER orders_sync_stock
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_stock_on_status_change();
