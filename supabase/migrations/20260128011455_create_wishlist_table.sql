/*
  # Create Wishlist Table

  1. New Tables
    - `wishlist`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers)
      - `product_id` (uuid, references products)
      - `added_at` (timestamptz)
      - Unique constraint on customer_id + product_id

  2. Security
    - Enable RLS on `wishlist` table
    - Policies for authenticated users to manage their own wishlist items

  3. Indexes
    - Index on customer_id for faster lookups
    - Index on product_id for joins
*/

CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  CONSTRAINT wishlist_customer_product_unique UNIQUE (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON wishlist(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add to own wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from own wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );