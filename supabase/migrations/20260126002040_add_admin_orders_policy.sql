/*
  # Add admin access policy for orders

  1. Security Changes
    - Add SELECT policy for admins to view all orders
    - Admins are identified by is_admin = true in public.users table

  2. Notes
    - This allows admin users to see all orders in the admin dashboard
*/

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );