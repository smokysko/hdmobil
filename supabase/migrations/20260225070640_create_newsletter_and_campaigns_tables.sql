/*
  # Create Newsletter Subscribers and Marketing Campaigns Tables

  1. New Tables
    - `newsletter_subscribers` - stores email newsletter subscriptions
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `language` (text)
      - `discount_code` (text, nullable)
      - `discount_used` (boolean)
      - `discount_expires_at` (timestamptz, nullable)
      - `is_active` (boolean)
      - `subscribed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `marketing_campaigns` - stores history of sent marketing campaigns
      - `id` (uuid, primary key)
      - `subject` (text)
      - `message` (text)
      - `target_segment` (text)
      - `discount_code` (text, nullable)
      - `recipients_count` (integer)
      - `status` (text)
      - `sent_at` (timestamptz)
      - `created_by` (uuid, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Admins can manage all records
    - Authenticated users can subscribe to newsletter
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  language text NOT NULL DEFAULT 'sk',
  discount_code text UNIQUE,
  discount_used boolean NOT NULL DEFAULT false,
  discount_used_at timestamptz,
  discount_expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active ON newsletter_subscribers(is_active);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update newsletter subscribers"
  ON newsletter_subscribers
  FOR UPDATE
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

CREATE POLICY "Admins can delete newsletter subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  target_segment text NOT NULL DEFAULT 'all',
  discount_code text,
  recipients_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sent' CHECK (status = ANY (ARRAY['sent', 'failed', 'scheduled'])),
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_sent_at ON marketing_campaigns(sent_at DESC);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view marketing campaigns"
  ON marketing_campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can insert marketing campaigns"
  ON marketing_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update marketing campaigns"
  ON marketing_campaigns
  FOR UPDATE
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
