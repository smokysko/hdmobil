/*
  # Create CMS Tables for Homepage Management

  1. New Tables
    - `homepage_sections` - Configurable homepage sections (hero, promo banner, etc.)
      - `id` (uuid, primary key)
      - `section_key` (varchar, unique) - Identifier like 'hero', 'promo_banner'
      - `section_type` (varchar) - Type: 'hero', 'banner', 'products_grid', 'trust_bar'
      - `title_sk` (varchar) - Slovak title
      - `subtitle_sk` (text) - Slovak subtitle
      - `description_sk` (text) - Slovak description
      - `badge_text` (varchar) - Badge/label text
      - `image_url` (text) - Main image URL
      - `image_mobile_url` (text) - Mobile version image
      - `background_color` (varchar) - Hex color
      - `text_color` (varchar) - Hex text color
      - `link_url` (text) - Link destination
      - `link_text` (varchar) - Link button text
      - `link_product_id` (uuid) - Reference to featured product
      - `content` (jsonb) - Flexible JSON content (features list, prices, specs, etc.)
      - `is_active` (boolean) - Visibility flag
      - `sort_order` (int) - Display order
      - `created_at`, `updated_at` (timestamptz)
    
    - `banners` - Promotional banners with scheduling
      - `id` (uuid, primary key)
      - `name` (varchar) - Internal name for identification
      - `title_sk` (varchar) - Display title
      - `subtitle_sk` (text) - Subtitle text
      - `image_url` (text) - Desktop banner image
      - `image_mobile_url` (text) - Mobile banner image
      - `link_url` (text) - Click destination
      - `placement` (varchar) - Where to display: 'homepage_hero', 'homepage_middle', 'category_top'
      - `background_color` (varchar) - Fallback background color
      - `text_color` (varchar) - Text color
      - `is_active` (boolean) - Visibility
      - `start_date` (timestamptz) - Scheduled start
      - `end_date` (timestamptz) - Scheduled end
      - `sort_order` (int) - Display priority
      - `created_at`, `updated_at` (timestamptz)

    - `content_blocks` - Reusable content blocks
      - `id` (uuid, primary key)
      - `block_key` (varchar, unique) - Identifier like 'trust_bar', 'footer_about'
      - `block_type` (varchar) - Type: 'text', 'html', 'json', 'list'
      - `title_sk` (varchar) - Optional title
      - `content` (jsonb) - Block content (flexible structure)
      - `is_active` (boolean) - Visibility
      - `created_at`, `updated_at` (timestamptz)

    - `media_library` - Centralized media management
      - `id` (uuid, primary key)
      - `filename` (varchar) - Original filename
      - `storage_path` (text) - Supabase storage path
      - `url` (text) - Public URL
      - `alt_text` (varchar) - Alt text for accessibility
      - `mime_type` (varchar) - File type
      - `file_size` (int) - Size in bytes
      - `width` (int) - Image width
      - `height` (int) - Image height
      - `folder` (varchar) - Organization folder: 'banners', 'products', 'content'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Public read access for active content
    - Admin-only write access
*/

-- =====================================================
-- HOMEPAGE_SECTIONS (Homepage Content Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  section_key VARCHAR(100) UNIQUE NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  
  title_sk VARCHAR(255),
  subtitle_sk TEXT,
  description_sk TEXT,
  badge_text VARCHAR(100),
  
  image_url TEXT,
  image_mobile_url TEXT,
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  
  link_url TEXT,
  link_text VARCHAR(100),
  link_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  content JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active) WHERE is_active = true;

-- =====================================================
-- BANNERS (Promotional Banners)
-- =====================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(255) NOT NULL,
  title_sk VARCHAR(255),
  subtitle_sk TEXT,
  
  image_url TEXT,
  image_mobile_url TEXT,
  
  link_url TEXT,
  
  placement VARCHAR(100) NOT NULL DEFAULT 'homepage_hero',
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_placement ON banners(placement);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_schedule ON banners(start_date, end_date);

-- =====================================================
-- CONTENT_BLOCKS (Reusable Content)
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
-- MEDIA_LIBRARY (Centralized Media Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  
  alt_text VARCHAR(255),
  mime_type VARCHAR(100),
  file_size INT,
  width INT,
  height INT,
  
  folder VARCHAR(100) DEFAULT 'general',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active homepage sections"
  ON homepage_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active banners within schedule"
  ON banners FOR SELECT
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "Public can read active content blocks"
  ON content_blocks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read media library"
  ON media_library FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage homepage sections"
  ON homepage_sections FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage banners"
  ON banners FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage content blocks"
  ON content_blocks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage media library"
  ON media_library FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SEED DATA - Default Homepage Configuration
-- =====================================================

INSERT INTO homepage_sections (section_key, section_type, title_sk, subtitle_sk, badge_text, image_url, link_url, link_text, content, sort_order)
VALUES (
  'hero',
  'hero',
  'iPhone 17 Pro',
  'Titanium',
  'Vlajkova lod 2026',
  '/images/hero_iphone17_v1.png',
  '/category/smartfony',
  'Vsetky smartfony',
  '{
    "features": [
      {"icon": "check", "text": "Cip A19 Bionic s Neural Engine"},
      {"icon": "check", "text": "200MPx Fusion Camera System"},
      {"icon": "check", "text": "Ultra-odolne titanove telo"},
      {"icon": "check", "text": "Vydrz baterie az 35 hodin"}
    ],
    "price": 1299,
    "original_price": 1399,
    "buy_button_text": "Kupit teraz",
    "specs": [
      {"label": "Procesor", "value": "A19 Bionic"},
      {"label": "Kamera", "value": "200 MPx"}
    ]
  }',
  1
) ON CONFLICT (section_key) DO NOTHING;

INSERT INTO homepage_sections (section_key, section_type, title_sk, subtitle_sk, badge_text, image_url, link_url, link_text, content, sort_order)
VALUES (
  'promo_banner',
  'banner',
  'Upgrade pre vasu domacu kancelariu',
  'Zvyste svoju produktivitu s nasou ponukou monitorov, dokovacich stanic a prislusenstva. Teraz so zlavou az 30%.',
  'VYPREDAJ',
  '/images/categories/cat_laptop.png',
  '/category/notebooky',
  'Pozret ponuku',
  '{}',
  2
) ON CONFLICT (section_key) DO NOTHING;

INSERT INTO content_blocks (block_key, block_type, title_sk, content)
VALUES (
  'trust_bar',
  'list',
  'Trust Bar',
  '{
    "items": [
      {"icon": "Truck", "title": "Doprava do 24h", "description": "Pri objednavke do 15:00"},
      {"icon": "ShieldCheck", "title": "Autorizovany predajca", "description": "100% originalne produkty"},
      {"icon": "RotateCcw", "title": "Vratenie do 14 dni", "description": "Bez udania dovodu"},
      {"icon": "Headphones", "title": "Odborna podpora", "description": "Po-Pia 8:00 - 17:00"}
    ]
  }'
) ON CONFLICT (block_key) DO NOTHING;

INSERT INTO content_blocks (block_key, block_type, title_sk, content)
VALUES (
  'section_titles',
  'json',
  'Section Titles',
  '{
    "categories": {"title": "Popularne kategorie", "link_text": "Zobrazit vsetky"},
    "featured": {"title": "Najnovsie v ponuke", "subtitle": "Cerstvo naskladnene novinky"},
    "bestsellers": {"title": "Najpredavanejsie", "subtitle": "Oblubene produkty nasich zakaznikov"}
  }'
) ON CONFLICT (block_key) DO NOTHING;
