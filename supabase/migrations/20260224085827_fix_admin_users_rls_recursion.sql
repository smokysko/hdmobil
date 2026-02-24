/*
  # Fix infinite recursion in admin_users RLS policies

  ## Problem
  The existing RLS policies on admin_users use subqueries that reference
  the same admin_users table, causing infinite recursion when PostgreSQL
  tries to evaluate them.

  ## Solution
  1. Drop all existing policies on admin_users
  2. Create a SECURITY DEFINER function that bypasses RLS to check admin status
  3. Recreate policies using this function to avoid recursion

  ## Changes
  - New function: `is_active_admin()` - checks if current user is an active admin
    without triggering RLS (SECURITY DEFINER bypasses row-level security)
  - Recreated policies:
    - SELECT: own record always readable, all records readable by active admins
    - INSERT: only active admins can insert
    - UPDATE: only active admins can update
    - DELETE: only active admins can delete
*/

DROP POLICY IF EXISTS "Active admins can delete admin users" ON admin_users;
DROP POLICY IF EXISTS "Active admins can insert new admin users" ON admin_users;
DROP POLICY IF EXISTS "Active admins can read all admin users" ON admin_users;
DROP POLICY IF EXISTS "Active admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can read own record" ON admin_users;

CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid()
      AND is_active = true
  );
$$;

CREATE POLICY "Admins can read own record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Active admins can read all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert new admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (is_active_admin());
