/*
  # Create Product Reviews System

  1. New Tables
    - `product_reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `customer_id` (uuid, foreign key to users)
      - `rating` (smallint, 1-5)
      - `title` (text, optional review title)
      - `content` (text, review body)
      - `is_verified_purchase` (boolean, true if customer bought the product)
      - `is_approved` (boolean, moderation status)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modified Tables
    - `products`
      - Added `average_rating` (numeric, cached average)
      - Added `reviews_count` (integer, cached count)

  3. Functions
    - `update_product_rating_stats()` - Trigger function to recalculate rating stats

  4. Security
    - Enable RLS on `product_reviews` table
    - Policies for customers to read approved reviews and manage their own
    - Policies for admins to manage all reviews

  5. Indexes
    - Index on product_id for fast review lookups
    - Index on customer_id for user's reviews
    - Index on is_approved for filtering
*/

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text NOT NULL CHECK (char_length(content) >= 20),
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, customer_id)
);

-- Add rating columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE products ADD COLUMN average_rating numeric(2,1) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'reviews_count'
  ) THEN
    ALTER TABLE products ADD COLUMN reviews_count integer DEFAULT 0;
  END IF;
END $$;

-- Create function to update product rating statistics
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id uuid;
  v_avg numeric(2,1);
  v_count integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_product_id := OLD.product_id;
  ELSE
    v_product_id := NEW.product_id;
  END IF;

  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
    COUNT(*)
  INTO v_avg, v_count
  FROM product_reviews
  WHERE product_id = v_product_id
    AND is_approved = true;

  UPDATE products
  SET 
    average_rating = v_avg,
    reviews_count = v_count
  WHERE id = v_product_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update stats
DROP TRIGGER IF EXISTS trigger_update_product_rating_stats ON product_reviews;
CREATE TRIGGER trigger_update_product_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating_stats();

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON product_reviews
  FOR SELECT
  USING (is_approved = true);

-- Policy: Authenticated users can read their own reviews (even unapproved)
CREATE POLICY "Users can read own reviews"
  ON product_reviews
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Policy: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON product_reviews
  FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- Policy: Admins can read all reviews
CREATE POLICY "Admins can read all reviews"
  ON product_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Admins can update all reviews (for moderation)
CREATE POLICY "Admins can update all reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Admins can delete all reviews
CREATE POLICY "Admins can delete all reviews"
  ON product_reviews
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON products(average_rating DESC NULLS LAST);
