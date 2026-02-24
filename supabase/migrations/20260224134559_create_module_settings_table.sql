/*
  # Create module_settings table

  ## Purpose
  The admin modules page (admin/modules) references a `module_settings` table
  that did not exist in the database, causing all module configurations to fail
  to persist. This migration creates the missing table.

  ## New Tables
  - `module_settings`
    - `id` (uuid, primary key)
    - `module_id` (text, unique) - identifier of the module (e.g. 'heureka', 'packeta')
    - `is_enabled` (boolean) - whether the module is active
    - `config` (jsonb) - key/value configuration for the module (API keys etc.)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Only admin users (those with a record in admin_users table) can SELECT, INSERT, UPDATE, DELETE
*/

CREATE TABLE IF NOT EXISTS module_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text UNIQUE NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE module_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read module settings"
  ON module_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can insert module settings"
  ON module_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update module settings"
  ON module_settings FOR UPDATE
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

CREATE POLICY "Admins can delete module settings"
  ON module_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE OR REPLACE FUNCTION update_module_settings_updated_at()
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

CREATE TRIGGER module_settings_updated_at
  BEFORE UPDATE ON module_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_module_settings_updated_at();
