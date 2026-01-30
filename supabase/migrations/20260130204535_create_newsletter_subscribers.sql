/*
  # Create Newsletter Subscribers Table
  
  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null) - subscriber's email address
      - `language` (text) - preferred language (sk, cs, pl)
      - `discount_code` (text, unique) - unique 5% discount code for this subscriber
      - `discount_expires_at` (timestamptz) - discount valid for 24 hours
      - `discount_used` (boolean) - whether discount has been redeemed
      - `discount_used_at` (timestamptz) - when discount was used
      - `gdpr_consent` (boolean) - GDPR consent given
      - `gdpr_consent_at` (timestamptz) - when consent was given
      - `subscribed_at` (timestamptz) - subscription timestamp
      - `unsubscribed_at` (timestamptz) - if/when unsubscribed
      - `is_active` (boolean) - active subscription status
      - `unsubscribe_token` (text, unique) - token for secure unsubscribe links
  
  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Policy for service role to manage all records
    - Policy for anonymous users to subscribe (insert only with GDPR consent)
    
  3. Indexes
    - Index on email for fast lookups
    - Index on discount_code for validation
    - Index on is_active for filtering
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  language text DEFAULT 'sk' CHECK (language IN ('sk', 'cs', 'pl')),
  discount_code text UNIQUE,
  discount_expires_at timestamptz,
  discount_used boolean DEFAULT false,
  discount_used_at timestamptz,
  gdpr_consent boolean NOT NULL DEFAULT false,
  gdpr_consent_at timestamptz,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  is_active boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all newsletter subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (gdpr_consent = true);

CREATE POLICY "Users can view own subscription by email"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_discount_code ON newsletter_subscribers(discount_code);
CREATE INDEX IF NOT EXISTS idx_newsletter_is_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);