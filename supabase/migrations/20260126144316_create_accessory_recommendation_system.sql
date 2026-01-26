/*
  # Smart Accessory Recommendation System

  1. New Tables
    - `category_accessory_rules`
      - `id` (uuid, primary key)
      - `source_category_id` (uuid, FK to categories) - category of the main product
      - `accessory_category_id` (uuid, FK to categories) - category of recommended accessories
      - `priority` (int) - order of recommendation
      - `is_active` (boolean)

  2. Data
    - Smart rules for recommending accessories:
      - Smartphones -> Screen protectors, Cases, Cables, Wireless chargers, Power banks
      - Tablets -> Cases, Screen protectors, Cables
      - Notebooks -> Cables, Audio devices
      - Audio -> Cables

  3. Security
    - Enable RLS on category_accessory_rules table
    - Add public read policy
*/

CREATE TABLE IF NOT EXISTS category_accessory_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  accessory_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_category_id, accessory_category_id)
);

CREATE INDEX IF NOT EXISTS idx_category_accessory_rules_source ON category_accessory_rules(source_category_id);

ALTER TABLE category_accessory_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Category accessory rules are publicly readable"
  ON category_accessory_rules
  FOR SELECT
  USING (true);

INSERT INTO category_accessory_rules (source_category_id, accessory_category_id, priority)
SELECT 
  src.id as source_category_id,
  acc.id as accessory_category_id,
  rules.priority
FROM (
  VALUES 
    ('smartfony', 'prislusenstvo', 1),
    ('smartfony', 'audio', 2),
    ('tablety', 'prislusenstvo', 1),
    ('tablety', 'audio', 2),
    ('notebooky', 'prislusenstvo', 1),
    ('notebooky', 'audio', 2),
    ('audio', 'prislusenstvo', 1)
) AS rules(source_slug, accessory_slug, priority)
JOIN categories src ON src.slug = rules.source_slug
JOIN categories acc ON acc.slug = rules.accessory_slug
ON CONFLICT (source_category_id, accessory_category_id) DO NOTHING;
