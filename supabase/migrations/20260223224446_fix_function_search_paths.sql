/*
  # Fix mutable search_path on functions

  Sets a fixed search_path on all functions that currently have a mutable one.
  A mutable search_path can be exploited by an attacker with CREATE privileges to
  shadow system objects. Setting search_path = '' and using fully-qualified names
  eliminates this risk.

  Functions fixed:
  - public.update_updated_at
  - public.generate_order_number
  - public.generate_invoice_number
*/

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_prefix TEXT;
  v_next_num INTEGER;
  v_order_number TEXT;
BEGIN
  SELECT value::text INTO v_prefix
  FROM public.settings WHERE key = 'order_prefix';

  IF v_prefix IS NULL THEN
    v_prefix := '"OBJ"';
  END IF;

  v_prefix := trim(both '"' from v_prefix);

  SELECT (value::text)::integer INTO v_next_num
  FROM public.settings WHERE key = 'order_next_number';

  IF v_next_num IS NULL THEN
    v_next_num := 1;
  END IF;

  v_order_number := v_prefix || '-' || lpad(v_next_num::text, 6, '0');

  UPDATE public.settings
  SET value = (v_next_num + 1)::text::jsonb
  WHERE key = 'order_next_number';

  NEW.order_number := v_order_number;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_prefix TEXT;
  v_next_num INTEGER;
  v_invoice_number TEXT;
BEGIN
  SELECT value::text INTO v_prefix
  FROM public.settings WHERE key = 'invoice_prefix';

  IF v_prefix IS NULL THEN
    v_prefix := '"FA"';
  END IF;

  v_prefix := trim(both '"' from v_prefix);

  SELECT (value::text)::integer INTO v_next_num
  FROM public.settings WHERE key = 'invoice_next_number';

  IF v_next_num IS NULL THEN
    v_next_num := 1;
  END IF;

  v_invoice_number := v_prefix || lpad(v_next_num::text, 8, '0');

  UPDATE public.settings
  SET value = (v_next_num + 1)::text::jsonb
  WHERE key = 'invoice_next_number';

  NEW.invoice_number := v_invoice_number;
  RETURN NEW;
END;
$$;
