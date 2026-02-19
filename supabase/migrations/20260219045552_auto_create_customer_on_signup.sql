/*
  # Auto-create customer record on user registration

  ## Summary
  When a new user registers via Supabase Auth, a corresponding record is
  automatically created in the `customers` table using the metadata provided
  during registration (full_name, phone, email).

  ## Changes
  - New trigger function: `handle_new_user()` — reads auth.users metadata and
    inserts a customer row
  - New trigger: `on_auth_user_created` on `auth.users` (AFTER INSERT)
  - Backfills existing auth users that currently have no customer record

  ## Notes
  - full_name is split on the first space into first_name / last_name
  - Phone values that look like emails (contain @) are stored as NULL
  - Phone is truncated to 20 chars max to match column constraint
  - The existing customer record is left untouched (ON CONFLICT DO NOTHING)
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

-- Backfill existing auth users that have no customer record
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
)
SELECT
  u.id,
  u.email,
  CASE
    WHEN COALESCE(u.raw_user_meta_data->>'phone', '') LIKE '%@%' THEN NULL
    ELSE NULLIF(left(COALESCE(u.raw_user_meta_data->>'phone', ''), 20), '')
  END,
  NULLIF(
    CASE
      WHEN position(' ' IN COALESCE(u.raw_user_meta_data->>'full_name', '')) > 0
        THEN split_part(COALESCE(u.raw_user_meta_data->>'full_name', ''), ' ', 1)
      ELSE COALESCE(u.raw_user_meta_data->>'full_name', '')
    END,
    ''
  ),
  NULLIF(
    CASE
      WHEN position(' ' IN COALESCE(u.raw_user_meta_data->>'full_name', '')) > 0
        THEN substr(
          COALESCE(u.raw_user_meta_data->>'full_name', ''),
          position(' ' IN COALESCE(u.raw_user_meta_data->>'full_name', '')) + 1
        )
      ELSE ''
    END,
    ''
  ),
  'individual',
  true,
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.customers c WHERE c.auth_user_id = u.id
);
