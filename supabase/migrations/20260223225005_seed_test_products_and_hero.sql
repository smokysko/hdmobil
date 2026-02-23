/*
  # Seed test data: products and homepage hero settings

  1. Products (14 items across categories)
     - Smartfóny: iPhone 17 Pro Max, iPhone 17, iPhone 17 Lite, Samsung Galaxy Fold, Budget Android
     - Notebooky: MacBook Pro 14
     - Tablety: iPad Pro 12.9
     - Audio: Sony WH-1000XM5 slúchadlá, Samsung Galaxy Buds
     - Príslušenstvo: Obal na telefón, Ochranné sklo, USB-C kábel, Bezdrôtová nabíjačka, Powerbank
     - Smartwatch: Apple Watch Series 10

  2. Homepage hero settings via settings table
*/

-- =====================================================
-- PRODUCTS
-- =====================================================

INSERT INTO products (
  sku, name_sk, slug, description_sk, short_description_sk,
  category_id, price_without_vat, price_with_vat, original_price,
  vat_mode, vat_rate, stock_quantity, low_stock_threshold,
  track_stock, is_active, is_featured, is_new,
  main_image_url,
  specifications
) VALUES

-- iPhone 17 Pro Max
(
  'IPH17PM-256-BLK',
  'iPhone 17 Pro Max 256GB Čierny titán',
  'iphone-17-pro-max-256gb-cierny-titan',
  'iPhone 17 Pro Max prináša revolučný fotoaparátový systém s 48MP hlavným senzorom, čip A19 Pro a titanový dizajn. Najvýkonnejší iPhone všetkých čias.',
  'Najvýkonnejší iPhone s čipom A19 Pro a titaniovým dizajnom',
  (SELECT id FROM categories WHERE slug = 'smartfony'),
  999.17, 1199.00, 1299.00,
  'standard', 20, 15, 3,
  true, true, true, true,
  '/images/products/smartphone_pro_max.png',
  '{"displej": "6.9\" Super Retina XDR OLED", "procesor": "Apple A19 Pro", "ram": "8 GB", "ulozisko": "256 GB", "fotoaparat": "48MP + 12MP + 12MP", "bateria": "4685 mAh", "os": "iOS 18", "5g": "Áno"}'
),

-- iPhone 17
(
  'IPH17-128-WHT',
  'iPhone 17 128GB Biely',
  'iphone-17-128gb-biely',
  'iPhone 17 s novým dizajnom, výkonným čipom A19 a vylepšeným fotoaparátom. Perfektná voľba pre každodenné použitie.',
  'Nový iPhone 17 s čipom A19 a vylepšeným fotoaparátom',
  (SELECT id FROM categories WHERE slug = 'smartfony'),
  749.17, 899.00, 949.00,
  'standard', 20, 28, 5,
  true, true, true, true,
  '/images/products/iphone17_retail.png',
  '{"displej": "6.1\" Super Retina XDR OLED", "procesor": "Apple A19", "ram": "8 GB", "ulozisko": "128 GB", "fotoaparat": "48MP + 12MP", "bateria": "3900 mAh", "os": "iOS 18", "5g": "Áno"}'
),

-- iPhone 17 Lite
(
  'IPH17L-128-BLU',
  'iPhone 17 Lite 128GB Modrý',
  'iphone-17-lite-128gb-modry',
  'iPhone 17 Lite je dostupnejšou verziou nového iPhonu 17 s rovnakým dizajnom a výborným výkonom pre bežné použitie.',
  'Dostupný iPhone 17 s výborným pomerom cena/výkon',
  (SELECT id FROM categories WHERE slug = 'smartfony'),
  624.17, 749.00, NULL,
  'standard', 20, 42, 5,
  true, true, false, true,
  '/images/products/smartphone_lite.png',
  '{"displej": "6.1\" OLED", "procesor": "Apple A18", "ram": "6 GB", "ulozisko": "128 GB", "fotoaparat": "48MP + 12MP", "bateria": "3700 mAh", "os": "iOS 18", "5g": "Áno"}'
),

-- Samsung Galaxy Fold
(
  'SAM-FOLD6-512-BLK',
  'Samsung Galaxy Z Fold 6 512GB Čierny',
  'samsung-galaxy-z-fold-6-512gb-cierny',
  'Samsung Galaxy Z Fold 6 je skladací smartfón s 7.6" vnútorným displejom a 6.3" vonkajším displejom. Ideálny pre multimédiá a produktivitu.',
  'Prémiový skladací smartfón s veľkým displejom',
  (SELECT id FROM categories WHERE slug = 'smartfony'),
  1499.17, 1799.00, 1899.00,
  'standard', 20, 8, 2,
  true, true, true, false,
  '/images/products/smartphone_fold.png',
  '{"displej": "7.6\" Dynamic AMOLED 2X (vnútorný)", "procesor": "Snapdragon 8 Gen 3", "ram": "12 GB", "ulozisko": "512 GB", "fotoaparat": "50MP + 10MP + 10MP", "bateria": "4400 mAh", "os": "Android 14", "5g": "Áno"}'
),

-- Budget smartphone
(
  'AND-BUD-64-GRN',
  'Motorola Moto G84 256GB Zelený',
  'motorola-moto-g84-256gb-zeleny',
  'Motorola Moto G84 je výkonný smartfón za skvelú cenu. Ponúka plynulý displej 120Hz, dlhú výdrž batérie a spoľahlivý výkon pre každodenné použitie.',
  'Výkonný smartfón za skvelú cenu s displejom 120Hz',
  (SELECT id FROM categories WHERE slug = 'smartfony'),
  207.50, 249.00, 299.00,
  'standard', 20, 35, 5,
  true, true, false, false,
  '/images/products/smartphone_budget.png',
  '{"displej": "6.55\" pOLED 120Hz", "procesor": "Snapdragon 695", "ram": "12 GB", "ulozisko": "256 GB", "fotoaparat": "50MP + 8MP", "bateria": "5000 mAh", "os": "Android 14", "5g": "Áno"}'
),

-- MacBook Pro
(
  'MBP14-M4-512-SIL',
  'MacBook Pro 14" M4 Pro 512GB Strieborný',
  'macbook-pro-14-m4-pro-512gb-strieborny',
  'MacBook Pro 14" s čipom Apple M4 Pro ponúka neuveriteľný výkon pre profesionálov. Liquid Retina XDR displej, až 22 hodín výdrže batérie.',
  'Profesionálny laptop s čipom M4 Pro a Liquid Retina XDR',
  (SELECT id FROM categories WHERE slug = 'notebooky'),
  1832.50, 2199.00, NULL,
  'standard', 20, 12, 2,
  true, true, true, true,
  '/images/products/laptop.png',
  '{"displej": "14.2\" Liquid Retina XDR", "procesor": "Apple M4 Pro", "ram": "24 GB", "ulozisko": "512 GB SSD", "grafika": "M4 Pro 20-jadrová GPU", "bateria": "Až 22 hodín", "os": "macOS Sequoia", "vaha": "1.61 kg"}'
),

-- iPad Pro
(
  'IPAD-PRO-13-256-SPC',
  'iPad Pro 13" M4 256GB WiFi Vesmírny sivý',
  'ipad-pro-13-m4-256gb-wifi-vesmirny-sivy',
  'iPad Pro 13" s čipom M4 je najvýkonnejší iPad vôbec. Ultra Retina XDR displej s OLED technológiou, tenký dizajn len 5.1mm.',
  'Najvýkonnejší iPad s OLED displejom a čipom M4',
  (SELECT id FROM categories WHERE slug = 'tablety'),
  1082.50, 1299.00, NULL,
  'standard', 20, 10, 2,
  true, true, true, false,
  '/images/products/tablet_pro.png',
  '{"displej": "13\" Ultra Retina XDR OLED", "procesor": "Apple M4", "ram": "8 GB", "ulozisko": "256 GB", "konektivita": "WiFi 6E, Bluetooth 5.3", "bateria": "Až 10 hodín", "os": "iPadOS 17", "vaha": "579 g"}'
),

-- Sony headphones
(
  'SNY-WH1000XM5-BLK',
  'Sony WH-1000XM5 Čierne',
  'sony-wh-1000xm5-cierne',
  'Sony WH-1000XM5 sú najlepšie bezdrôtové slúchadlá s potlačením hluku na svete. Až 30 hodín prehrávania a prémiový zvuk.',
  'Najlepšie slúchadlá s ANC a 30h výdržou batérie',
  (SELECT id FROM categories WHERE slug = 'audio'),
  290.83, 349.00, 399.00,
  'standard', 20, 20, 3,
  true, true, false, false,
  '/images/products/headphones.png',
  '{"typ": "Over-ear", "anc": "Áno - 8 mikrofónov", "bateria": "Až 30 hodín", "nabijanie": "USB-C, 3 min = 3 hodiny", "kodek": "LDAC, AAC, SBC", "vaha": "250 g", "multipoint": "Áno"}'
),

-- Galaxy Buds
(
  'SAM-BUDS3PRO-WHT',
  'Samsung Galaxy Buds 3 Pro Biele',
  'samsung-galaxy-buds-3-pro-biele',
  'Samsung Galaxy Buds 3 Pro s aktívnym potlačením hluku, hi-fi zvukom a inteligentným prispôsobením zvuku. Dokonalé pre hudbu aj hovory.',
  'Prémiové TWS slúchadlá s ANC a hi-fi zvukom',
  (SELECT id FROM categories WHERE slug = 'audio'),
  207.50, 249.00, 279.00,
  'standard', 20, 18, 3,
  true, true, false, true,
  '/images/products/wireless_earbuds.png',
  '{"typ": "In-ear TWS", "anc": "Áno", "bateria": "6h + 18h (puzdro)", "nabijanie": "USB-C + Qi", "kodek": "SSC, AAC, SBC", "vaha": "5.5 g (každé)", "ipx": "IPX7"}'
),

-- Phone case
(
  'ACC-CASE-IPH17PM-CLR',
  'Ochranný kryt pre iPhone 17 Pro Max Transparentný',
  'ochranný-kryt-iphone-17-pro-max-transparentny',
  'Prémiový transparentný ochranný kryt pre iPhone 17 Pro Max. Materiál MagSafe kompatibilný, extrémne odolný voči poškrabaniu.',
  'Transparentný MagSafe kryt pre iPhone 17 Pro Max',
  (SELECT id FROM categories WHERE slug = 'prislusenstvo'),
  20.75, 24.90, NULL,
  'standard', 20, 100, 10,
  true, false, false, false,
  '/images/products/phone_case.png',
  '{"material": "Polykarbonát + TPU", "magsafe": "Áno", "ochrana": "Military Grade Drop Test", "kompatibilita": "iPhone 17 Pro Max"}'
),

-- Screen protector
(
  'ACC-GLASS-IPH17-9H',
  'Ochranné sklo iPhone 17 9H Anti-fingerprint',
  'ochranne-sklo-iphone-17-9h-anti-fingerprint',
  'Prémiové ochranné sklo pre iPhone 17 s tvrdosťou 9H. Anti-fingerprint povrchová úprava, 99.9% priehľadnosť, jednoducha montáž.',
  'Ochranné sklo 9H s anti-fingerprint povrchom',
  (SELECT id FROM categories WHERE slug = 'prislusenstvo'),
  12.42, 14.90, NULL,
  'standard', 20, 150, 15,
  true, false, false, false,
  '/images/products/screen_protector.png',
  '{"tvrdost": "9H", "hrubka": "0.33 mm", "anti-fingerprint": "Áno", "kompatibilita": "iPhone 17"}'
),

-- USB cable
(
  'ACC-USBC-1M-BLK',
  'USB-C kábel 1m 60W Čierny',
  'usb-c-kabel-1m-60w-cierny',
  'Kvalitný USB-C kábel s podporou rýchleho nabíjania 60W a prenosom dát USB 3.2. Opletený dizajn pre dlhú životnosť.',
  'Odolný USB-C kábel s rýchlym nabíjaním 60W',
  (SELECT id FROM categories WHERE slug = 'prislusenstvo'),
  9.92, 11.90, NULL,
  'standard', 20, 200, 20,
  true, false, false, false,
  '/images/products/usb_cable.png',
  '{"dlzka": "1 metr", "vykون": "60W PD", "prenos": "USB 3.2 Gen 2 (10 Gbps)", "material": "Opletený nylon"}'
),

-- Wireless charger
(
  'ACC-WCHG-15W-WHT',
  'Bezdrôtová nabíjačka 15W MagSafe kompatibilná Biela',
  'bezdrotova-nabijacka-15w-magsafe-biela',
  'Rýchla bezdrôtová nabíjačka s podporou 15W pre MagSafe zariadenia a 10W pre Qi zariadenia. Kompaktný dizajn, LED indikátor.',
  'Rýchla 15W bezdrôtová nabíjačka kompatibilná s MagSafe',
  (SELECT id FROM categories WHERE slug = 'prislusenstvo'),
  29.08, 34.90, 44.90,
  'standard', 20, 60, 8,
  true, false, false, false,
  '/images/products/charger_wireless.png',
  '{"vykon": "15W (MagSafe) / 10W (Qi)", "vstup": "USB-C 18W", "kompatibilita": "MagSafe, Qi", "led": "Áno"}'
),

-- Powerbank
(
  'ACC-PB-20000-BLK',
  'PowerBank 20000mAh 65W USB-C Čierny',
  'powerbank-20000mah-65w-usbc-cierny',
  'Výkonná PowerBank s kapacitou 20000mAh a rýchlym nabíjaním 65W cez USB-C. Nabije laptop, tablet aj telefón. Dva USB-A porty.',
  'Výkonná PowerBank 20000mAh s nabíjaním laptopov 65W',
  (SELECT id FROM categories WHERE slug = 'prislusenstvo'),
  49.92, 59.90, 74.90,
  'standard', 20, 40, 5,
  true, true, false, false,
  '/images/products/power_bank.png',
  '{"kapacita": "20000 mAh", "usbc_vystup": "65W PD", "usba_vystup": "2x 22.5W", "nabijanie_pb": "USB-C 65W", "porty": "1x USB-C, 2x USB-A"}'
),

-- Apple Watch
(
  'AW-S10-44-BLK',
  'Apple Watch Series 10 44mm Čierny hliník',
  'apple-watch-series-10-44mm-cierny-hlinik',
  'Apple Watch Series 10 s najtenším dizajnom, najväčším displejom a pokročilými zdravotnými funkciami. Detekcia apnoe počas spánku, EKG.',
  'Najtenší Apple Watch s pokročilými zdravotnými funkciami',
  (SELECT id FROM categories WHERE slug = 'prislusenstvo'),
  374.17, 449.00, NULL,
  'standard', 20, 22, 4,
  true, true, false, true,
  '/images/products/smartwatch.png',
  '{"displej": "1.96\" Always-On Retina LTPO OLED", "procesor": "Apple S10", "gps": "Áno", "vodotesnost": "WR50", "bateria": "Až 18 hodín", "zdravie": "EKG, SpO2, Detekcia apnoe", "kompatibilita": "iPhone XS a novší"}'
);

-- =====================================================
-- HERO SETTINGS in settings table
-- =====================================================
INSERT INTO settings (key, value) VALUES
  ('hero_slide_1', '{
    "title": "iPhone 17 Pro Max",
    "subtitle": "Titanová dokonalosť. Čip A19 Pro.",
    "description": "Najvýkonnejší iPhone všetkých čias s revolučným fotoaparátovým systémom.",
    "image_url": "/images/hero_iphone17_v1.png",
    "cta_text": "Kúpiť teraz",
    "cta_url": "/product/iphone-17-pro-max-256gb-cierny-titan",
    "badge": "Nový",
    "is_active": true
  }')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
