/*
  # Create Refunds, Loyalty Rules, VIP Tiers, and Referral Rewards tables

  ## Purpose
  This migration adds all the infrastructure needed for:
  1. Refund workflow - tracking refund requests and their status
  2. Loyalty points rules - configurable points per euro spend
  3. Loyalty point transactions - ledger of earned/spent points
  4. VIP tiers - configurable tier definitions with thresholds
  5. Referral rewards - configurable rewards for successful referrals

  ## New Tables

  ### `refunds`
  - `id` (uuid, primary key)
  - `order_id` (uuid, FK to orders)
  - `requested_by` (uuid, FK to auth.users) - customer who requested
  - `amount` (numeric) - refund amount in EUR
  - `reason` (text) - customer-provided reason
  - `status` (text) - requested / approved / rejected / completed
  - `admin_note` (text) - internal admin note
  - `created_at`, `updated_at` (timestamptz)

  ### `loyalty_rules`
  - `id` (uuid, primary key)
  - `points_per_euro` (numeric) - how many points per 1 EUR spent
  - `min_order_amount` (numeric) - minimum order for earning points
  - `expiry_days` (integer) - days until points expire (0 = never)
  - `is_active` (boolean)
  - `created_at`, `updated_at` (timestamptz)

  ### `loyalty_transactions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users)
  - `order_id` (uuid, nullable FK to orders)
  - `points` (integer) - positive = earned, negative = spent
  - `type` (text) - earned / spent / expired / admin_adjustment
  - `description` (text)
  - `created_at` (timestamptz)

  ### `vip_tiers`
  - `id` (uuid, primary key)
  - `name` (text) - e.g. 'bronze', 'silver', 'gold', 'platinum'
  - `label` (text) - display name e.g. 'Bronzový'
  - `min_spend` (numeric) - minimum total spend to reach this tier
  - `discount_percentage` (numeric) - automatic discount for this tier
  - `points_multiplier` (numeric) - loyalty points multiplier
  - `sort_order` (integer)
  - `color` (text) - hex color for UI
  - `created_at`, `updated_at` (timestamptz)

  ### `referral_rewards`
  - `id` (uuid, primary key)
  - `referrer_points` (integer) - points given to person who referred
  - `referee_discount_percentage` (numeric) - discount for new user who was referred
  - `min_order_amount` (numeric) - minimum first order to trigger reward
  - `is_active` (boolean)
  - `created_at`, `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Customers can read/create their own refunds; admins can do everything
  - Customers can read their own loyalty transactions
  - VIP tiers and loyalty rules are readable by all authenticated users, writable by admins only
*/

-- ============================================================
-- REFUNDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'rejected', 'completed')),
  admin_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_requested_by ON refunds(requested_by);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Customers can request refunds"
  ON refunds FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Admins can view all refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update refunds"
  ON refunds FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE OR REPLACE FUNCTION update_refunds_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_refunds_updated_at();

-- ============================================================
-- LOYALTY RULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_euro numeric(6, 2) NOT NULL DEFAULT 1.00,
  min_order_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  expiry_days integer NOT NULL DEFAULT 365,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE loyalty_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read loyalty rules"
  ON loyalty_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert loyalty rules"
  ON loyalty_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update loyalty rules"
  ON loyalty_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Seed default loyalty rule
INSERT INTO loyalty_rules (points_per_euro, min_order_amount, expiry_days, is_active)
VALUES (1.00, 10.00, 365, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- LOYALTY TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  points integer NOT NULL,
  type text NOT NULL DEFAULT 'earned'
    CHECK (type IN ('earned', 'spent', 'expired', 'admin_adjustment', 'referral_bonus')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all loyalty transactions"
  ON loyalty_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can insert loyalty transactions"
  ON loyalty_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- ============================================================
-- VIP TIERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vip_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  min_spend numeric(10, 2) NOT NULL DEFAULT 0,
  discount_percentage numeric(5, 2) NOT NULL DEFAULT 0,
  points_multiplier numeric(4, 2) NOT NULL DEFAULT 1.00,
  sort_order integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#6b7280',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vip_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read VIP tiers"
  ON vip_tiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert VIP tiers"
  ON vip_tiers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update VIP tiers"
  ON vip_tiers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can delete VIP tiers"
  ON vip_tiers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Seed default VIP tiers
INSERT INTO vip_tiers (name, label, min_spend, discount_percentage, points_multiplier, sort_order, color) VALUES
  ('standard', 'Štandard', 0, 0, 1.00, 0, '#6b7280'),
  ('bronze', 'Bronzový', 200, 2, 1.25, 1, '#cd7f32'),
  ('silver', 'Strieborný', 500, 5, 1.50, 2, '#9ca3af'),
  ('gold', 'Zlatý', 1000, 8, 2.00, 3, '#f59e0b'),
  ('platinum', 'Platinový', 2500, 12, 3.00, 4, '#3b82f6')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- REFERRAL REWARDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_points integer NOT NULL DEFAULT 100,
  referee_discount_percentage numeric(5, 2) NOT NULL DEFAULT 5.00,
  min_order_amount numeric(10, 2) NOT NULL DEFAULT 20.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read referral rewards"
  ON referral_rewards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert referral rewards"
  ON referral_rewards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update referral rewards"
  ON referral_rewards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Seed default referral reward config
INSERT INTO referral_rewards (referrer_points, referee_discount_percentage, min_order_amount, is_active)
VALUES (100, 5.00, 20.00, true)
ON CONFLICT DO NOTHING;
