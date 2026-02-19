/*
  # Add admin SELECT policy on customers table

  ## Summary
  Admins can view all customer records in the admin panel.
  Without this policy, RLS only allowed each user to see their own record,
  causing the admin customers page to appear empty.

  ## Changes
  - New SELECT policy on `customers`: admins can read all rows
*/

CREATE POLICY "Admins can view all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
  );
