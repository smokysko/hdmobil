/*
  # Fix customer trigger and backfill existing users

  ## Summary
  The `on_auth_user_created` trigger was not being applied correctly.
  This migration re-creates the trigger and backfills any existing auth users
  that don't have a corresponding customer record.

  ## Changes
  - Re-creates trigger function and trigger on auth.users
  - Backfills missing customer records for all existing auth users
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_phone text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_phone     := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  IF v_phone LIKE '%@%' THEN
    v_phone := NULL;
  ELSE
    v_phone := NULLIF(left(v_phone, 20), '');
  END IF;

  IF position(' ' IN v_full_name) > 0 THEN
    v_first_name := split_part(v_full_name, ' ', 1);
    v_last_name  := substr(v_full_name, position(' ' IN v_full_name) + 1);
  ELSE
    v_first_name := v_full_name;
    v_last_name  := '';
  END IF;

  INSERT INTO public.customers (
    auth_user_id,
    email,
    phone,
    first_name,
    last_name,
    customer_type,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_phone,
    NULLIF(v_first_name, ''),
    NULLIF(v_last_name, ''),
    'individual',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.customers (
  auth_user_id,
  email,
  customer_type,
  is_active,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.email,
  'individual',
  true,
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.customers c WHERE c.auth_user_id = u.id
);
