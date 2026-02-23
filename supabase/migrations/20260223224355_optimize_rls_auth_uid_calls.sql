/*
  # Optimize RLS policies - wrap auth.uid() in SELECT

  Replaces direct auth.uid() calls with (select auth.uid()) in RLS policies.
  This causes the auth function to be evaluated once per query instead of once
  per row, significantly improving performance at scale.

  Tables affected:
  - customers: customers_own_data
  - orders: orders_own_data
  - order_items: order_items_own_data
  - carts: carts_own_data
  - cart_items: cart_items_own_data
*/

-- customers
DROP POLICY IF EXISTS "customers_own_data" ON customers;
CREATE POLICY "customers_own_data"
  ON customers FOR ALL
  TO authenticated
  USING ((select auth.uid()) = auth_user_id);

-- orders
DROP POLICY IF EXISTS "orders_own_data" ON orders;
CREATE POLICY "orders_own_data"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers
      WHERE customers.auth_user_id = (select auth.uid())
    )
  );

-- order_items
DROP POLICY IF EXISTS "order_items_own_data" ON order_items;
CREATE POLICY "order_items_own_data"
  ON order_items FOR SELECT
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

-- carts
DROP POLICY IF EXISTS "carts_own_data" ON carts;
CREATE POLICY "carts_own_data"
  ON carts FOR ALL
  USING (
    (
      customer_id IN (
        SELECT id FROM customers
        WHERE customers.auth_user_id = (select auth.uid())
      )
    ) OR (
      (session_id)::text = current_setting('app.session_id', true)
    )
  );

-- cart_items
DROP POLICY IF EXISTS "cart_items_own_data" ON cart_items;
CREATE POLICY "cart_items_own_data"
  ON cart_items FOR ALL
  USING (
    cart_id IN (
      SELECT carts.id FROM carts
      WHERE (
        carts.customer_id IN (
          SELECT id FROM customers
          WHERE customers.auth_user_id = (select auth.uid())
        )
      ) OR (
        (carts.session_id)::text = current_setting('app.session_id', true)
      )
    )
  );
