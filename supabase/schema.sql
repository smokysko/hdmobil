-- =====================================================
-- HDmobil E-commerce Database Schema (Supabase/PostgreSQL)
-- Jazyk zákazníkov: Slovenčina
-- Jazyk administrácie: Čeština
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Typ DPH režimu pre produkty
CREATE TYPE vat_mode AS ENUM (
  'standard',      -- Štandardná DPH 20% (bežný tovar)
  'reduced',       -- Znížená DPH 10% (potraviny, knihy)
  'zero',          -- 0% DPH (export, oslobodené)
  'margin'         -- Osobitný režim - použitý tovar (bazár), DPH len z marže
);

-- Typ zákazníka
CREATE TYPE customer_type AS ENUM (
  'individual',    -- Fyzická osoba
  'company'        -- Firma (IČO, DIČ, IČ DPH)
);

-- Stav objednávky
CREATE TYPE order_status AS ENUM (
  'pending',           -- Čaká na spracovanie
  'confirmed',         -- Potvrdená
  'processing',        -- Spracováva sa
  'shipped',           -- Odoslaná
  'delivered',         -- Doručená
  'cancelled',         -- Zrušená
  'returned'           -- Vrátená
);

-- Typ platby
CREATE TYPE payment_type AS ENUM (
  'card',              -- Platobná karta (Stripe)
  'google_pay',        -- Google Pay
  'apple_pay',         -- Apple Pay
  'bank_transfer',     -- Bankový prevod
  'cod'                -- Dobierka
);

-- Stav platby
CREATE TYPE payment_status AS ENUM (
  'pending',           -- Čaká na platbu
  'paid',              -- Zaplatené
  'failed',            -- Zlyhalo
  'refunded'           -- Vrátené
);

-- Typ zľavy
CREATE TYPE discount_type AS ENUM (
  'percentage',        -- Percentuálna zľava
  'fixed'              -- Fixná suma
);

-- =====================================================
-- CUSTOMERS (Zákazníci)
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Autentifikácia (prepojenie so Supabase Auth)
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Základné údaje
  email VARCHAR(320) NOT NULL UNIQUE,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Typ zákazníka
  customer_type customer_type DEFAULT 'individual',
  
  -- Firemné údaje (len pre company)
  company_name VARCHAR(255),
  ico VARCHAR(20),              -- IČO (8 číslic v SK)
  dic VARCHAR(20),              -- DIČ
  ic_dph VARCHAR(20),           -- IČ DPH (SK1234567890)
  
  -- Fakturačná adresa
  billing_street VARCHAR(255),
  billing_city VARCHAR(100),
  billing_zip VARCHAR(20),
  billing_country VARCHAR(2) DEFAULT 'SK',
  
  -- Doručovacia adresa (ak je iná)
  shipping_same_as_billing BOOLEAN DEFAULT true,
  shipping_street VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_zip VARCHAR(20),
  shipping_country VARCHAR(2) DEFAULT 'SK',
  
  -- Metadáta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Newsletter
  newsletter_subscribed BOOLEAN DEFAULT false
);

-- Index pre vyhľadávanie podľa IČO
CREATE INDEX idx_customers_ico ON customers(ico) WHERE ico IS NOT NULL;

-- =====================================================
-- CATEGORIES (Kategórie)
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Hierarchia
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Názvy (SK)
  name_sk VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description_sk TEXT,
  
  -- Obrázok
  image_url TEXT,
  
  -- Poradie zobrazenia
  sort_order INT DEFAULT 0,
  
  -- Viditeľnosť
  is_active BOOLEAN DEFAULT true,
  
  -- Metadáta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pre hierarchiu
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- =====================================================
-- PRODUCTS (Produkty)
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Základné info
  sku VARCHAR(50) UNIQUE,                    -- Kód produktu (pre MKSOFT)
  name_sk VARCHAR(255) NOT NULL,             -- Názov (SK)
  slug VARCHAR(255) NOT NULL UNIQUE,
  description_sk TEXT,
  short_description_sk VARCHAR(500),
  
  -- Kategória
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Ceny
  price_without_vat DECIMAL(10, 2) NOT NULL, -- Cena bez DPH
  price_with_vat DECIMAL(10, 2) NOT NULL,    -- Cena s DPH (vypočítaná)
  original_price DECIMAL(10, 2),             -- Pôvodná cena (pre zľavy)
  cost_price DECIMAL(10, 2),                 -- Nákupná cena (pre maržu)
  
  -- DPH
  vat_mode vat_mode DEFAULT 'standard',
  vat_rate DECIMAL(5, 2) DEFAULT 20.00,      -- Sadzba DPH v %
  
  -- Sklad
  stock_quantity INT DEFAULT 0,
  stock_reserved INT DEFAULT 0,              -- Rezervované (v košíkoch)
  low_stock_threshold INT DEFAULT 5,
  track_stock BOOLEAN DEFAULT true,
  
  -- Bazár
  is_bazaar BOOLEAN DEFAULT false,           -- Použitý tovar
  bazaar_condition VARCHAR(50),              -- Stav (výborný, dobrý, uspokojivý)
  
  -- Obrázky
  main_image_url TEXT,
  gallery_urls TEXT[],                       -- Pole URL obrázkov
  
  -- Parametre (JSON pre flexibilitu)
  specifications JSONB DEFAULT '{}',         -- {"RAM": "8GB", "Storage": "256GB"}
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  -- Viditeľnosť
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,         -- Odporúčané
  is_new BOOLEAN DEFAULT false,              -- Novinka
  
  -- Metadáta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- MKSOFT sync
  mksoft_id VARCHAR(50),                     -- ID v MKSOFT systéme
  last_synced_at TIMESTAMPTZ
);

-- Indexy
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_bazaar ON products(is_bazaar) WHERE is_bazaar = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- =====================================================
-- PRODUCT_ACCESSORIES (Príslušenstvo - Cross-sell)
-- =====================================================
CREATE TABLE product_accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  accessory_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Poradie zobrazenia
  sort_order INT DEFAULT 0,
  
  -- Unikátna kombinácia
  UNIQUE(product_id, accessory_id),
  
  -- Nemôže byť sám sebe príslušenstvom
  CHECK (product_id != accessory_id)
);

-- =====================================================
-- SHIPPING_METHODS (Spôsoby doručenia)
-- =====================================================
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifikátor
  code VARCHAR(50) NOT NULL UNIQUE,          -- 'dpd', 'packeta_home', 'packeta_zbox', 'sk_posta', 'sps'
  
  -- Názov (SK)
  name_sk VARCHAR(100) NOT NULL,
  description_sk TEXT,
  
  -- Cena
  price DECIMAL(10, 2) NOT NULL,
  free_shipping_threshold DECIMAL(10, 2),    -- Od akej sumy zadarmo
  
  -- Dodacia doba
  delivery_days_min INT DEFAULT 1,
  delivery_days_max INT DEFAULT 3,
  
  -- API integrácia
  api_provider VARCHAR(50),                  -- 'packeta', 'dpd', 'slovenska_posta'
  api_config JSONB DEFAULT '{}',
  
  -- Viditeľnosť
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT_METHODS (Spôsoby platby)
-- =====================================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifikátor
  code VARCHAR(50) NOT NULL UNIQUE,          -- 'card', 'google_pay', 'apple_pay', 'bank_transfer', 'cod'
  payment_type payment_type NOT NULL,
  
  -- Názov (SK)
  name_sk VARCHAR(100) NOT NULL,
  description_sk TEXT,
  
  -- Poplatok
  fee_fixed DECIMAL(10, 2) DEFAULT 0,        -- Fixný poplatok
  fee_percentage DECIMAL(5, 2) DEFAULT 0,    -- Percentuálny poplatok
  
  -- Viditeľnosť
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DISCOUNTS (Zľavy a kupóny)
-- =====================================================
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Kód kupónu
  code VARCHAR(50) UNIQUE,
  
  -- Typ a hodnota
  discount_type discount_type NOT NULL,
  value DECIMAL(10, 2) NOT NULL,             -- Hodnota (% alebo €)
  
  -- Obmedzenia
  min_order_value DECIMAL(10, 2),            -- Minimálna hodnota objednávky
  max_uses INT,                              -- Max počet použití celkovo
  max_uses_per_customer INT DEFAULT 1,       -- Max použití na zákazníka
  current_uses INT DEFAULT 0,
  
  -- Platnosť
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Aplikovateľnosť
  applies_to_categories UUID[],              -- Len pre tieto kategórie
  applies_to_products UUID[],                -- Len pre tieto produkty
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS (Objednávky)
-- =====================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Číslo objednávky (ľudsky čitateľné)
  order_number VARCHAR(20) NOT NULL UNIQUE,
  
  -- Zákazník
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Stav
  status order_status DEFAULT 'pending',
  
  -- Sumy
  subtotal DECIMAL(10, 2) NOT NULL,          -- Suma položiek bez DPH
  vat_total DECIMAL(10, 2) NOT NULL,         -- Celková DPH
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  payment_fee DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,             -- Celková suma s DPH
  
  -- Zľava
  discount_id UUID REFERENCES discounts(id),
  discount_code VARCHAR(50),
  
  -- Doručenie
  shipping_method_id UUID REFERENCES shipping_methods(id),
  shipping_method_name VARCHAR(100),
  tracking_number VARCHAR(100),              -- Podacie číslo
  tracking_url TEXT,
  
  -- Platba
  payment_method_id UUID REFERENCES payment_methods(id),
  payment_method_name VARCHAR(100),
  payment_status payment_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(255),
  
  -- Fakturačné údaje (snapshot)
  billing_first_name VARCHAR(100),
  billing_last_name VARCHAR(100),
  billing_company_name VARCHAR(255),
  billing_ico VARCHAR(20),
  billing_dic VARCHAR(20),
  billing_ic_dph VARCHAR(20),
  billing_street VARCHAR(255),
  billing_city VARCHAR(100),
  billing_zip VARCHAR(20),
  billing_country VARCHAR(2),
  billing_email VARCHAR(320),
  billing_phone VARCHAR(20),
  
  -- Doručovacie údaje (snapshot)
  shipping_first_name VARCHAR(100),
  shipping_last_name VARCHAR(100),
  shipping_company_name VARCHAR(255),
  shipping_street VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_zip VARCHAR(20),
  shipping_country VARCHAR(2),
  shipping_phone VARCHAR(20),
  
  -- Packeta pickup point
  packeta_point_id VARCHAR(50),
  packeta_point_name VARCHAR(255),
  
  -- Poznámky
  customer_note TEXT,
  admin_note TEXT,
  
  -- Metadáta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Indexy
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =====================================================
-- ORDER_ITEMS (Položky objednávky)
-- =====================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Snapshot produktu (pre históriu)
  product_sku VARCHAR(50),
  product_name VARCHAR(255) NOT NULL,
  product_image_url TEXT,
  
  -- Ceny
  quantity INT NOT NULL DEFAULT 1,
  price_without_vat DECIMAL(10, 2) NOT NULL,
  price_with_vat DECIMAL(10, 2) NOT NULL,
  vat_rate DECIMAL(5, 2) NOT NULL,
  vat_mode vat_mode NOT NULL,
  
  -- Celkom
  line_total DECIMAL(10, 2) NOT NULL,        -- quantity * price_with_vat
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =====================================================
-- INVOICES (Faktúry)
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Číslo faktúry
  invoice_number VARCHAR(20) NOT NULL UNIQUE,
  
  -- Typ
  is_proforma BOOLEAN DEFAULT false,         -- Proforma vs. ostrá faktúra
  
  -- PDF
  pdf_url TEXT,
  
  -- Dátumy
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  taxable_date DATE,                         -- Dátum zdaniteľného plnenia
  
  -- Sumy (snapshot)
  subtotal DECIMAL(10, 2) NOT NULL,
  vat_total DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CART (Košík - pre neprihlásených aj prihlásených)
-- =====================================================
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Vlastník (jeden z nich)
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(100),                   -- Pre neprihlásených
  
  -- Metadáta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Index
CREATE INDEX idx_carts_session ON carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_carts_customer ON carts(customer_id) WHERE customer_id IS NOT NULL;

-- =====================================================
-- CART_ITEMS (Položky košíka)
-- =====================================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  quantity INT NOT NULL DEFAULT 1,
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(cart_id, product_id)
);

-- =====================================================
-- ADMIN_USERS (Administrátori - CZ jazyk)
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  email VARCHAR(320) NOT NULL UNIQUE,
  name VARCHAR(100),
  
  -- Role
  role VARCHAR(50) DEFAULT 'admin',          -- 'admin', 'manager', 'support'
  
  -- Oprávnenia (JSON)
  permissions JSONB DEFAULT '["all"]',
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- =====================================================
-- SETTINGS (Nastavenia e-shopu)
-- =====================================================
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predvolené nastavenia
INSERT INTO settings (key, value) VALUES
  ('shop_name', '"HDmobil"'),
  ('shop_email', '"info@hdmobil.sk"'),
  ('shop_phone', '"+421 900 000 000"'),
  ('shop_address', '{"street": "", "city": "", "zip": "", "country": "SK"}'),
  ('company_info', '{"name": "", "ico": "", "dic": "", "ic_dph": ""}'),
  ('invoice_prefix', '"FA"'),
  ('invoice_next_number', '1'),
  ('order_prefix', '"OBJ"'),
  ('order_next_number', '1');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Funkcia na aktualizáciu updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery pre updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Funkcia na generovanie čísla objednávky
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  next_num INT;
BEGIN
  SELECT value::TEXT INTO prefix FROM settings WHERE key = 'order_prefix';
  SELECT (value::TEXT)::INT INTO next_num FROM settings WHERE key = 'order_next_number';
  
  prefix := COALESCE(TRIM(BOTH '"' FROM prefix), 'OBJ');
  next_num := COALESCE(next_num, 1);
  
  NEW.order_number := prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_num::TEXT, 6, '0');
  
  UPDATE settings SET value = to_jsonb(next_num + 1) WHERE key = 'order_next_number';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Funkcia na generovanie čísla faktúry
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  next_num INT;
BEGIN
  SELECT value::TEXT INTO prefix FROM settings WHERE key = 'invoice_prefix';
  SELECT (value::TEXT)::INT INTO next_num FROM settings WHERE key = 'invoice_next_number';
  
  prefix := COALESCE(TRIM(BOTH '"' FROM prefix), 'FA');
  next_num := COALESCE(next_num, 1);
  
  NEW.invoice_number := prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_num::TEXT, 6, '0');
  
  UPDATE settings SET value = to_jsonb(next_num + 1) WHERE key = 'invoice_next_number';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Zapnúť RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Zákazníci vidia len svoje údaje
CREATE POLICY customers_own_data ON customers
  FOR ALL USING (auth.uid() = auth_user_id);

-- Objednávky - zákazníci vidia len svoje
CREATE POLICY orders_own_data ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- Položky objednávok
CREATE POLICY order_items_own_data ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM customers WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Košíky
CREATE POLICY carts_own_data ON carts
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR session_id = current_setting('app.session_id', true)
  );

-- Položky košíka
CREATE POLICY cart_items_own_data ON cart_items
  FOR ALL USING (
    cart_id IN (
      SELECT id FROM carts WHERE 
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
        OR session_id = current_setting('app.session_id', true)
    )
  );

-- Produkty a kategórie sú verejné (len čítanie)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_public_read ON products FOR SELECT USING (true);
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);
CREATE POLICY shipping_public_read ON shipping_methods FOR SELECT USING (true);
CREATE POLICY payment_public_read ON payment_methods FOR SELECT USING (true);

-- =====================================================
-- SEED DATA (Základné dáta)
-- =====================================================

-- Spôsoby doručenia
INSERT INTO shipping_methods (code, name_sk, description_sk, price, free_shipping_threshold, delivery_days_min, delivery_days_max, api_provider, sort_order) VALUES
  ('dpd', 'DPD kuriér', 'Doručenie kuriérom DPD na vašu adresu', 4.99, 100, 1, 2, 'dpd', 1),
  ('packeta_home', 'Packeta na adresu', 'Doručenie Packetou priamo k vám domov', 3.99, 80, 1, 3, 'packeta', 2),
  ('packeta_zbox', 'Packeta Z-Box', 'Vyzdvihnutie v Z-Boxe 24/7', 2.49, 60, 1, 2, 'packeta', 3),
  ('sk_posta', 'Slovenská pošta', 'Doručenie Slovenskou poštou', 3.49, 100, 2, 5, 'slovenska_posta', 4),
  ('sps', 'SPS kuriér', 'Doručenie kuriérom SPS', 4.49, 100, 1, 2, 'sps', 5),
  ('personal', 'Osobný odber', 'Vyzdvihnutie na predajni', 0, NULL, 0, 0, NULL, 6);

-- Spôsoby platby
INSERT INTO payment_methods (code, payment_type, name_sk, description_sk, fee_fixed, fee_percentage, sort_order) VALUES
  ('card', 'card', 'Platobná karta', 'Platba kartou Visa, Mastercard', 0, 0, 1),
  ('google_pay', 'google_pay', 'Google Pay', 'Rýchla platba cez Google Pay', 0, 0, 2),
  ('apple_pay', 'apple_pay', 'Apple Pay', 'Rýchla platba cez Apple Pay', 0, 0, 3),
  ('bank_transfer', 'bank_transfer', 'Bankový prevod', 'Platba prevodom na účet', 0, 0, 4),
  ('cod', 'cod', 'Dobierka', 'Platba pri prevzatí', 1.50, 0, 5);

-- Kategórie
INSERT INTO categories (name_sk, slug, sort_order) VALUES
  ('Smartfóny', 'smartfony', 1),
  ('Tablety', 'tablety', 2),
  ('Notebooky', 'notebooky', 3),
  ('Audio', 'audio', 4),
  ('Príslušenstvo', 'prislusenstvo', 5),
  ('Náhradné diely', 'nahradne-diely', 6),
  ('Bazár', 'bazar', 7);
