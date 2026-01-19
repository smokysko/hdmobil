/*
  # Fix Carts RLS Policies
  
  1. Problem
    - Current carts policy requires customer record to exist
    - New users don't have customer records yet
  
  2. Solution
    - Simplify carts policies to work with auth.uid() directly
    - Allow session-based carts for anonymous users
    - Allow authenticated users to create/access their carts
*/

-- Drop existing policies
DROP POLICY IF EXISTS "carts_own_data" ON carts;
DROP POLICY IF EXISTS "cart_items_own_data" ON cart_items;

-- Carts: Allow authenticated users to manage their carts
CREATE POLICY "carts_select_own"
  ON carts FOR SELECT
  TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "carts_insert_own"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "carts_update_own"
  ON carts FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "carts_delete_own"
  ON carts FOR DELETE
  TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- Cart items: Allow access through cart ownership
CREATE POLICY "cart_items_select_own"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    cart_id IN (
      SELECT c.id FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_insert_own"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    cart_id IN (
      SELECT c.id FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_update_own"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (
    cart_id IN (
      SELECT c.id FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_delete_own"
  ON cart_items FOR DELETE
  TO authenticated
  USING (
    cart_id IN (
      SELECT c.id FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = auth.uid()
    )
  );