/*
  # Optimize RLS Policies Performance
  
  This migration recreates RLS policies using (select auth.uid()) instead of auth.uid()
  to prevent re-evaluation for each row, significantly improving query performance at scale.
  
  1. Modified Policies
    - customers: customers_own_data
    - orders: orders_own_data
    - order_items: order_items_own_data
    - users: users_select_own, users_insert_own, users_update_own
    - carts: carts_select_own, carts_insert_own, carts_update_own, carts_delete_own
    - cart_items: cart_items_select_own, cart_items_insert_own, cart_items_update_own, cart_items_delete_own
*/

-- customers policy
DROP POLICY IF EXISTS "customers_own_data" ON public.customers;
CREATE POLICY "customers_own_data" ON public.customers
  FOR ALL TO public
  USING ((select auth.uid()) = auth_user_id)
  WITH CHECK ((select auth.uid()) = auth_user_id);

-- orders policy
DROP POLICY IF EXISTS "orders_own_data" ON public.orders;
CREATE POLICY "orders_own_data" ON public.orders
  FOR SELECT TO public
  USING (
    customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.auth_user_id = (select auth.uid())
    )
  );

-- order_items policy
DROP POLICY IF EXISTS "order_items_own_data" ON public.order_items;
CREATE POLICY "order_items_own_data" ON public.order_items
  FOR SELECT TO public
  USING (
    order_id IN (
      SELECT orders.id
      FROM orders
      WHERE orders.customer_id IN (
        SELECT customers.id
        FROM customers
        WHERE customers.auth_user_id = (select auth.uid())
      )
    )
  );

-- users policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- carts policies
DROP POLICY IF EXISTS "carts_select_own" ON public.carts;
CREATE POLICY "carts_select_own" ON public.carts
  FOR SELECT TO authenticated
  USING (
    customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "carts_insert_own" ON public.carts;
CREATE POLICY "carts_insert_own" ON public.carts
  FOR INSERT TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "carts_update_own" ON public.carts;
CREATE POLICY "carts_update_own" ON public.carts
  FOR UPDATE TO authenticated
  USING (
    customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "carts_delete_own" ON public.carts;
CREATE POLICY "carts_delete_own" ON public.carts
  FOR DELETE TO authenticated
  USING (
    customer_id IN (
      SELECT customers.id
      FROM customers
      WHERE customers.auth_user_id = (select auth.uid())
    )
  );

-- cart_items policies
DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
CREATE POLICY "cart_items_select_own" ON public.cart_items
  FOR SELECT TO authenticated
  USING (
    cart_id IN (
      SELECT c.id
      FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
CREATE POLICY "cart_items_insert_own" ON public.cart_items
  FOR INSERT TO authenticated
  WITH CHECK (
    cart_id IN (
      SELECT c.id
      FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;
CREATE POLICY "cart_items_update_own" ON public.cart_items
  FOR UPDATE TO authenticated
  USING (
    cart_id IN (
      SELECT c.id
      FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;
CREATE POLICY "cart_items_delete_own" ON public.cart_items
  FOR DELETE TO authenticated
  USING (
    cart_id IN (
      SELECT c.id
      FROM carts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE cu.auth_user_id = (select auth.uid())
    )
  );
