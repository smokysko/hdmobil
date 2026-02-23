/*
  # Create hero_slides table and missing CMS tables

  1. New Tables
    - `hero_slides` - Hero carousel slides for the homepage
      - Full structure matching HeroSlide interface in HeroCarousel.tsx
      - Supports product_id reference, features/specs as JSONB
    - `homepage_sections` - Homepage content sections
    - `homepage_categories` - Homepage category tiles
    - `content_blocks` - Reusable content blocks

  2. Security
    - RLS enabled on all tables
    - Public read for active records
    - Service role full access

  3. Seed Data
    - iPhone 17 Pro Max hero slide
    - Default homepage sections and categories
*/

-- =====================================================
-- HERO_SLIDES
-- =====================================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  title_sk VARCHAR(255) NOT NULL,
  subtitle_sk TEXT,
  badge_text VARCHAR(100),

  image_url TEXT,
  image_alt TEXT,

  price NUMERIC(10,2),
  original_price NUMERIC(10,2),

  features JSONB DEFAULT '[]',
  specs JSONB DEFAULT '[]',

  link_url TEXT,
  link_text VARCHAR(100),
  secondary_link_url TEXT,
  secondary_link_text VARCHAR(100),

  background_color VARCHAR(7),
  text_color VARCHAR(7),

  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active, sort_order) WHERE is_active = true;

-- =====================================================
-- HOMEPAGE_SECTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  section_key VARCHAR(100) UNIQUE NOT NULL,
  section_type VARCHAR(50) NOT NULL,

  title_sk VARCHAR(255),
  title_cs VARCHAR(255),
  title_pl VARCHAR(255),
  subtitle_sk TEXT,
  subtitle_cs TEXT,
  subtitle_pl TEXT,
  description_sk TEXT,
  description_cs TEXT,
  description_pl TEXT,
  badge_text_sk VARCHAR(100),
  badge_text_cs VARCHAR(100),
  badge_text_pl VARCHAR(100),

  image_url TEXT,
  image_mobile_url TEXT,
  background_color VARCHAR(7),
  text_color VARCHAR(7),

  link_url TEXT,
  link_text_sk VARCHAR(100),
  link_text_cs VARCHAR(100),
  link_text_pl VARCHAR(100),

  content JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active) WHERE is_active = true;

-- =====================================================
-- HOMEPAGE_CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS homepage_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  name_sk VARCHAR(100) NOT NULL,
  name_cs VARCHAR(100),
  name_pl VARCHAR(100),

  image_url TEXT,
  link_url VARCHAR(255) NOT NULL,

  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_categories_active ON homepage_categories(is_active, sort_order) WHERE is_active = true;

-- =====================================================
-- CONTENT_BLOCKS
-- =====================================================
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  block_key VARCHAR(100) UNIQUE NOT NULL,
  block_type VARCHAR(50) NOT NULL DEFAULT 'json',

  title_sk VARCHAR(255),
  content JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_key ON content_blocks(block_key);

-- =====================================================
-- TRIGGERS
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hero_slides_updated_at') THEN
    CREATE TRIGGER update_hero_slides_updated_at
      BEFORE UPDATE ON hero_slides
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_homepage_sections_updated_at') THEN
    CREATE TRIGGER update_homepage_sections_updated_at
      BEFORE UPDATE ON homepage_sections
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_blocks_updated_at') THEN
    CREATE TRIGGER update_content_blocks_updated_at
      BEFORE UPDATE ON content_blocks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active hero slides"
  ON hero_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage hero slides"
  ON hero_slides FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active homepage sections"
  ON homepage_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage homepage sections"
  ON homepage_sections FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active homepage categories"
  ON homepage_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage homepage categories"
  ON homepage_categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read active content blocks"
  ON content_blocks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage content blocks"
  ON content_blocks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SEED: Hero Slides
-- =====================================================
INSERT INTO hero_slides (
  product_id, title_sk, subtitle_sk, badge_text,
  image_url,
  price, original_price,
  features, specs,
  link_url, link_text,
  secondary_link_url, secondary_link_text,
  is_active, sort_order
)
SELECT
  p.id,
  'iPhone 17 Pro Max',
  'Titanová dokonalosť',
  'Novinka 2026',
  '/images/hero_iphone17_v1.png',
  1199.00, 1299.00,
  '[
    {"text": "Čip A19 Pro s Neural Engine"},
    {"text": "Titanový rám vojenskej kvality"},
    {"text": "Kamera 48 MPx s 5x optickým zoomom"},
    {"text": "Výdrž batérie až 29 hodín"}
  ]'::jsonb,
  '[
    {"label": "Procesor", "value": "A19 Pro"},
    {"label": "Kamera", "value": "48 MPx"}
  ]'::jsonb,
  '/product/iphone-17-pro-max-256gb-cierny-titan', 'Kúpiť teraz',
  '/category/smartfony', 'Všetky smartfóny',
  true, 1
FROM products p
WHERE p.slug = 'iphone-17-pro-max-256gb-cierny-titan'
LIMIT 1;

-- Fallback: if product not found, insert without product_id
INSERT INTO hero_slides (
  title_sk, subtitle_sk, badge_text,
  image_url,
  price, original_price,
  features, specs,
  link_url, link_text,
  secondary_link_url, secondary_link_text,
  is_active, sort_order
)
SELECT
  'iPhone 17 Pro Max',
  'Titanová dokonalosť',
  'Novinka 2026',
  '/images/hero_iphone17_v1.png',
  1199.00, 1299.00,
  '[
    {"text": "Čip A19 Pro s Neural Engine"},
    {"text": "Titanový rám vojenskej kvality"},
    {"text": "Kamera 48 MPx s 5x optickým zoomom"},
    {"text": "Výdrž batérie až 29 hodín"}
  ]'::jsonb,
  '[
    {"label": "Procesor", "value": "A19 Pro"},
    {"label": "Kamera", "value": "48 MPx"}
  ]'::jsonb,
  '/category/smartfony', 'Kúpiť teraz',
  '/category/all', 'Všetky produkty',
  true, 1
WHERE NOT EXISTS (SELECT 1 FROM hero_slides WHERE title_sk = 'iPhone 17 Pro Max');

-- =====================================================
-- SEED: Homepage sections
-- =====================================================
INSERT INTO homepage_sections (section_key, section_type, title_sk, description_sk, badge_text_sk, image_url, link_url, link_text_sk, sort_order)
VALUES (
  'promo_banner',
  'banner',
  'Upgrade pre vašu domácu kanceláriu',
  'Zvýšte svoju produktivitu s našou ponukou notebookov, dokovacích staníc a príslušenstva. Teraz so zľavou až 30%.',
  'VÝPREDAJ',
  '/images/categories/cat_laptop.png',
  '/category/notebooky',
  'Pozrieť ponuku',
  1
) ON CONFLICT (section_key) DO NOTHING;

-- =====================================================
-- SEED: Content blocks
-- =====================================================
INSERT INTO content_blocks (block_key, block_type, title_sk, content)
VALUES (
  'trust_bar',
  'list',
  'Trust Bar',
  '{
    "items": [
      {"icon": "Truck", "title": "Doprava do 24h", "description": "Pri objednávke do 15:00"},
      {"icon": "ShieldCheck", "title": "Autorizovaný predajca", "description": "100% originálne produkty"},
      {"icon": "RotateCcw", "title": "Vrátenie do 14 dní", "description": "Bez udania dôvodu"},
      {"icon": "Headphones", "title": "Odborná podpora", "description": "Po-Pia 8:00 - 17:00"}
    ]
  }'
) ON CONFLICT (block_key) DO NOTHING;
