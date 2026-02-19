/*
  # Add admin UPDATE and order_items SELECT policies

  ## Problem
  Admins can SELECT orders (policy already exists) but have no UPDATE policy,
  so status/payment changes silently fail and revert after refresh.
  Admins also cannot SELECT order_items, so item counts show as 0.

  ## Changes
  1. Add UPDATE policy for admins on orders table
  2. Add SELECT policy for admins on order_items table
*/

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can view all order_items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
