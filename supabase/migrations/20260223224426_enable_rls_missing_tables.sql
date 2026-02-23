/*
  # Enable RLS on tables that are missing it and add appropriate policies

  Tables getting RLS enabled:
  1. product_accessories - public read, admin write
  2. discounts - public read (needed for checkout validation), admin write
  3. invoices - customers see own invoices, admins see all
  4. admin_users - admins can read own record, no public access
  5. settings - public read (shop name, etc.), admin write (already have insert/update policies)

  Security notes:
  - Enabling RLS on settings keeps existing admin insert/update policies
  - A public SELECT policy is added for settings so the storefront can read shop config
  - admin_users is locked down - only the authenticated admin can read their own row
*/

-- =====================================================
-- product_accessories
-- =====================================================
ALTER TABLE product_accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_accessories_public_read"
  ON product_accessories FOR SELECT
  USING (true);

CREATE POLICY "product_accessories_admin_insert"
  ON product_accessories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

CREATE POLICY "product_accessories_admin_update"
  ON product_accessories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

CREATE POLICY "product_accessories_admin_delete"
  ON product_accessories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

-- =====================================================
-- discounts
-- =====================================================
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discounts_public_read"
  ON discounts FOR SELECT
  USING (true);

CREATE POLICY "discounts_admin_insert"
  ON discounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

CREATE POLICY "discounts_admin_update"
  ON discounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

CREATE POLICY "discounts_admin_delete"
  ON discounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

-- =====================================================
-- invoices
-- =====================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_customer_select"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT orders.id FROM orders
      WHERE orders.customer_id IN (
        SELECT id FROM customers
        WHERE customers.auth_user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "invoices_admin_select"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

CREATE POLICY "invoices_admin_insert"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

CREATE POLICY "invoices_admin_update"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = (select auth.uid())
        AND admin_users.is_active = true
    )
  );

-- =====================================================
-- admin_users
-- =====================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_read_own"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

-- =====================================================
-- settings
-- =====================================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read"
  ON settings FOR SELECT
  USING (true);
