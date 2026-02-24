/*
  # Admin Users Management Policies

  ## Summary
  Adds additional RLS policies on the admin_users table so that
  any active admin can read the full list of admins (not just their own row),
  and can insert / delete other admin records.

  ## Changes
  - DROP old restrictive select policy (only own row)
  - ADD new SELECT policy: any active admin can read all admin_users rows
  - ADD INSERT policy: active admin can create new admin records
  - ADD DELETE policy: active admin can remove admin records (cannot self-delete enforced in app)
*/

DROP POLICY IF EXISTS "admin_users_read_own" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_own" ON public.admin_users;

CREATE POLICY "Active admins can read all admin users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.auth_user_id = auth.uid() AND a.is_active = true
    )
  );

CREATE POLICY "Active admins can insert new admin users"
  ON public.admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.auth_user_id = auth.uid() AND a.is_active = true
    )
  );

CREATE POLICY "Active admins can update admin users"
  ON public.admin_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.auth_user_id = auth.uid() AND a.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.auth_user_id = auth.uid() AND a.is_active = true
    )
  );

CREATE POLICY "Active admins can delete admin users"
  ON public.admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.auth_user_id = auth.uid() AND a.is_active = true
    )
  );
