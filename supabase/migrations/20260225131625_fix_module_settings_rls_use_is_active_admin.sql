/*
  # Fix module_settings RLS policies

  ## Problem
  The existing RLS policies on module_settings use a direct EXISTS subquery
  on admin_users, but admin_users also has RLS enabled. This causes the check
  to fail silently because the subquery returns no rows when evaluated under
  the authenticated user's RLS context.

  ## Solution
  Replace all module_settings policies to use the existing `is_active_admin()`
  SECURITY DEFINER function which bypasses RLS on admin_users correctly.
*/

DROP POLICY IF EXISTS "Admins can read module settings" ON module_settings;
DROP POLICY IF EXISTS "Admins can insert module settings" ON module_settings;
DROP POLICY IF EXISTS "Admins can update module settings" ON module_settings;
DROP POLICY IF EXISTS "Admins can delete module settings" ON module_settings;

CREATE POLICY "Admins can read module settings"
  ON module_settings FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE POLICY "Admins can insert module settings"
  ON module_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin());

CREATE POLICY "Admins can update module settings"
  ON module_settings FOR UPDATE
  TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

CREATE POLICY "Admins can delete module settings"
  ON module_settings FOR DELETE
  TO authenticated
  USING (is_active_admin());
