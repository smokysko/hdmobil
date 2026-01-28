/*
  # Add Multi-Language Support Columns

  This migration adds Czech (cs) and Polish (pl) language columns to support
  a multilingual e-commerce experience.

  1. Tables Modified:
    - `products` - name, description, short_description translations
    - `categories` - name, description translations
    - `hero_slides` - title, subtitle translations
    - `homepage_sections` - title, subtitle, description, badge_text, link_text translations
    - `homepage_categories` - name translations
    - `banners` - title, subtitle translations
    - `content_blocks` - title translations
    - `shipping_methods` - name, description translations
    - `payment_methods` - name, description translations

  2. Notes:
    - All new columns are nullable to maintain backward compatibility
    - Slovak (sk) remains the primary/fallback language
    - Frontend will select appropriate language based on user preference
*/

-- Products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_cs varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_pl varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_cs text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_pl text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description_cs varchar(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description_pl varchar(500);

-- Categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_cs varchar(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_pl varchar(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_cs text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_pl text;

-- Hero slides table
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title_cs varchar(255);
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title_pl varchar(255);
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS subtitle_cs varchar(500);
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS subtitle_pl varchar(500);

-- Homepage sections table
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS title_cs varchar(255);
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS title_pl varchar(255);
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS subtitle_cs text;
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS subtitle_pl text;
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS description_cs text;
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS description_pl text;
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS badge_text_cs varchar(100);
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS badge_text_pl varchar(100);
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS link_text_cs varchar(100);
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS link_text_pl varchar(100);

-- Homepage categories table
ALTER TABLE homepage_categories ADD COLUMN IF NOT EXISTS name_cs varchar(255);
ALTER TABLE homepage_categories ADD COLUMN IF NOT EXISTS name_pl varchar(255);

-- Banners table
ALTER TABLE banners ADD COLUMN IF NOT EXISTS title_cs varchar(255);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS title_pl varchar(255);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle_cs text;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle_pl text;

-- Content blocks table
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS title_cs varchar(255);
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS title_pl varchar(255);

-- Shipping methods table
ALTER TABLE shipping_methods ADD COLUMN IF NOT EXISTS name_cs varchar(255);
ALTER TABLE shipping_methods ADD COLUMN IF NOT EXISTS name_pl varchar(255);
ALTER TABLE shipping_methods ADD COLUMN IF NOT EXISTS description_cs text;
ALTER TABLE shipping_methods ADD COLUMN IF NOT EXISTS description_pl text;

-- Payment methods table
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS name_cs varchar(255);
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS name_pl varchar(255);
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS description_cs text;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS description_pl text;
