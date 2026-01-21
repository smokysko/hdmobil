/*
  # Enable RLS on Remaining Tables
  
  This migration enables Row Level Security on tables that were missing it
  and creates appropriate access policies.
  
  1. Tables Modified
    - discounts: Public read for active discounts (needed for checkout)
    - product_accessories: Public read (product metadata)
    - invoices: Only accessible by order owner
    - admin_users: Only admins can read their own data
    - settings: Public read for application settings
  
  2. Security Considerations
    - All tables now have RLS enabled
    - Policies follow principle of least privilege
    - Admin operations handled via service role
*/

-- Enable RLS on discounts
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discounts_public_read_active" ON public.discounts
  FOR SELECT TO public
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Enable RLS on product_accessories
ALTER TABLE public.product_accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_accessories_public_read" ON public.product_accessories
  FOR SELECT TO public
  USING (true);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_owner_select" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT orders.id
      FROM orders
      WHERE orders.customer_id IN (
        SELECT customers.id
        FROM customers
        WHERE customers.auth_user_id = (select auth.uid())
      )
    )
  );

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select_own" ON public.admin_users
  FOR SELECT TO authenticated
  USING (auth_user_id = (select auth.uid()));

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON public.settings
  FOR SELECT TO public
  USING (true);
