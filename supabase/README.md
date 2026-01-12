# HDmobil - Supabase Backend Dokumentácia

## Prehľad architektúry

Tento projekt používa **Supabase** ako backend platformu, ktorá poskytuje:
- **PostgreSQL databázu** - hlavné úložisko dát
- **Supabase Auth** - autentifikácia zákazníkov
- **Supabase Storage** - úložisko obrázkov produktov
- **Edge Functions** - serverová logika (Deno runtime)

## Štruktúra projektu

```
supabase/
├── schema.sql              # Kompletná databázová schéma
├── functions/
│   ├── auth/
│   │   └── company-lookup.ts   # Vyhľadanie firmy podľa IČO
│   ├── cart/
│   │   └── index.ts            # Košík s cross-sell
│   ├── orders/
│   │   └── index.ts            # Správa objednávok
│   ├── invoices/
│   │   └── index.ts            # Faktúry + MKSOFT export
│   ├── payments/
│   │   └── index.ts            # Platobné integrácie
│   └── integrations/
│       └── shipping.ts         # Dopravcovia (DPD, Packeta, SPS, Pošta)
└── README.md               # Táto dokumentácia
```

## Databázové tabuľky

### Zákazníci (`customers`)
- Fyzické osoby aj firmy
- IČO, DIČ, IČ DPH pre firmy
- Oddelené fakturačné a dodacie adresy

### Produkty (`products`)
- SKU, názvy v SK/CZ/EN
- 4 režimy DPH: štandardný, znížený, nulový, oslobodený
- Podpora bazárových produktov
- Sledovanie skladu

### Kategórie (`categories`)
- Hierarchická štruktúra (parent_id)
- SEO friendly slugy

### Objednávky (`orders` + `order_items`)
- Automatické číslovanie (OBJ-2026-000001)
- Kompletný snapshot adries a cien
- Tracking čísla

### Faktúry (`invoices` + `invoice_items`)
- Automatické číslovanie (FA-2026-000001)
- Kompletné údaje predajcu a kupujúceho
- Export do MKSOFT (XML)

### Košíky (`carts` + `cart_items`)
- Podpora prihlásených aj neprihlásených
- Zlúčenie košíkov po prihlásení

### Doprava a platby
- `shipping_methods` - DPD, Packeta, Z-BOX, SK Pošta, SPS
- `payment_methods` - Karta, Google Pay, Apple Pay, prevod, dobierka

### Zľavy (`discounts`)
- Percentuálne aj fixné
- Časová platnosť
- Minimálna hodnota objednávky

### Cross-sell (`product_accessories`)
- Väzby medzi produktmi
- Automatické odporúčania v košíku

## API Endpointy

### Vyhľadanie firmy
```
POST /functions/v1/auth/company-lookup
Body: { "ico": "12345678" }
```

### Košík
```
POST /functions/v1/cart/get      # Získať košík
POST /functions/v1/cart/add      # Pridať produkt
POST /functions/v1/cart/update   # Aktualizovať množstvo
POST /functions/v1/cart/remove   # Odstrániť položku
POST /functions/v1/cart/clear    # Vyprázdniť košík
POST /functions/v1/cart/merge    # Zlúčiť košíky po prihlásení
```

### Objednávky
```
POST /functions/v1/orders/create         # Vytvoriť objednávku
POST /functions/v1/orders/list           # Zoznam objednávok
POST /functions/v1/orders/detail         # Detail objednávky
POST /functions/v1/orders/update-status  # Aktualizovať stav (admin)
POST /functions/v1/orders/tracking       # Sledovanie zásielky
```

### Faktúry
```
POST /functions/v1/invoices/generate     # Vygenerovať faktúru
POST /functions/v1/invoices/get          # Získať faktúru
POST /functions/v1/invoices/list         # Zoznam faktúr
POST /functions/v1/invoices/mark-paid    # Označiť ako zaplatenú
POST /functions/v1/invoices/cancel       # Stornovať
POST /functions/v1/invoices/export-mksoft # Export pre MKSOFT
```

### Platby
```
POST /functions/v1/payments/create       # Iniciovať platbu
POST /functions/v1/payments/verify       # Overiť stav platby
POST /functions/v1/payments/mark-paid    # Manuálne označiť (admin)
POST /functions/v1/payments/refund       # Vrátiť platbu
POST /functions/v1/payments/methods      # Dostupné metódy
```

### Doprava
```
POST /functions/v1/integrations/shipping/create-shipment  # Vytvoriť zásielku
POST /functions/v1/integrations/shipping/get-pickup-points # Výdajné miesta
POST /functions/v1/integrations/shipping/track            # Sledovanie
POST /functions/v1/integrations/shipping/print-label      # Tlač štítku
```

## Konfigurácia

### Potrebné environment premenné

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Platby
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
# alebo
TRUSTPAY_API_KEY=xxx
TRUSTPAY_PROJECT_ID=xxx

# Dopravcovia
DPD_API_KEY=xxx
DPD_CUSTOMER_ID=xxx
PACKETA_API_KEY=xxx
PACKETA_SENDER_ID=xxx
SPS_API_KEY=xxx
```

## Nasadenie

### 1. Vytvorenie Supabase projektu
1. Prejdite na [supabase.com](https://supabase.com)
2. Vytvorte nový projekt
3. Skopírujte credentials (URL, anon key, service role key)

### 2. Aplikovanie databázovej schémy
1. Otvorte SQL Editor v Supabase Dashboard
2. Skopírujte obsah `schema.sql`
3. Spustite SQL

### 3. Nasadenie Edge Functions
```bash
# Inštalácia Supabase CLI
npm install -g supabase

# Prihlásenie
supabase login

# Prepojenie s projektom
supabase link --project-ref YOUR_PROJECT_REF

# Nasadenie funkcií
supabase functions deploy auth/company-lookup
supabase functions deploy cart
supabase functions deploy orders
supabase functions deploy invoices
supabase functions deploy payments
supabase functions deploy integrations/shipping
```

### 4. Konfigurácia secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_xxx
supabase secrets set DPD_API_KEY=xxx
# ... ďalšie
```

## Jazykové verzie

- **Zákaznícky frontend**: Slovenčina (SK)
- **Admin panel**: Čeština (CZ)
- **Databáza**: Podporuje SK, CZ, EN názvy produktov

## DPH režimy

| Režim | Sadzba | Použitie |
|-------|--------|----------|
| `standard` | 23% | Bežné produkty |
| `reduced` | 10% | Knihy, potraviny |
| `zero` | 0% | Export do EÚ |
| `exempt` | 0% | Oslobodené od DPH |

## Bezpečnosť

- Row Level Security (RLS) na všetkých tabuľkách
- Zákazníci vidia len svoje dáta
- Admin operácie vyžadujú service role key
- Webhook podpisy pre platobné brány

## Podpora

Pre technickú podporu kontaktujte: dev@hdmobil.sk
