/*
  # Fix customers RLS to support upsert from account settings

  ## Summary
  The existing `customers_own_data` FOR ALL policy was missing WITH CHECK,
  which blocked INSERT operations (upsert). This replaces it with explicit
  per-operation policies.

  ## Changes
  - Drop old FOR ALL policy
  - Add SELECT, INSERT, UPDATE, DELETE policies separately with correct USING/WITH CHECK
*/

DROP POLICY IF EXISTS "customers_own_data" ON public.customers;

CREATE POLICY "customers can read own record"
  ON public.customers FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = auth_user_id);

CREATE POLICY "customers can insert own record"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = auth_user_id);

CREATE POLICY "customers can update own record"
  ON public.customers FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = auth_user_id)
  WITH CHECK ((SELECT auth.uid()) = auth_user_id);

CREATE POLICY "customers can delete own record"
  ON public.customers FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = auth_user_id);
