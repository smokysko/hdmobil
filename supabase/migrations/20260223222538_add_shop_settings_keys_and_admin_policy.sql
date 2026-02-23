/*
  # Extend shop settings and add admin write policy

  1. Changes
    - Add missing settings keys: free_shipping_threshold, default_vat_rate, currency, language
    - Add trigger to keep settings.updated_at current
    - Add admin write policies so authenticated admins can upsert settings

  2. Security
    - Existing public read policy remains
    - New admin-only insert/update policies using admin_users table
*/

-- Insert missing settings keys
INSERT INTO settings (key, value) VALUES
  ('free_shipping_threshold', '50'),
  ('default_vat_rate', '20'),
  ('currency', '"EUR"'),
  ('language', '"sk"')
ON CONFLICT (key) DO NOTHING;

-- Add trigger for updated_at on settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_settings_updated_at
      BEFORE UPDATE ON settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Admin insert policy
CREATE POLICY "admins_can_insert_settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin update policy
CREATE POLICY "admins_can_update_settings"
  ON settings FOR UPDATE
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
