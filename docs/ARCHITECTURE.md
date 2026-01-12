# HDmobil E-commerce Architecture

## Prehľad

HDmobil je moderný e-shop postavený na **Supabase** platforme s **React** frontendom. Celé riešenie je navrhnuté pre bezplatnú prevádzku (free tier) s možnosťou škálovania.

## Technologický Stack

| Vrstva | Technológia | Účel |
|--------|-------------|------|
| **Frontend** | React 19 + Tailwind CSS 4 | UI pre zákazníkov a admin |
| **Backend** | Supabase Edge Functions | Serverless API logika |
| **Databáza** | Supabase PostgreSQL | Uloženie všetkých dát |
| **Autentifikácia** | Supabase Auth | Prihlásenie zákazníkov/adminov |
| **Súbory** | Supabase Storage | Obrázky produktov |
| **Hosting** | Vercel / Netlify | Statický frontend |
| **Doména** | hdmobil.sk (WebSupport DNS) | Vlastná doména |

## Databázová Schéma

```
┌─────────────────┐     ┌─────────────────┐
│   customers     │     │   categories    │
├─────────────────┤     ├─────────────────┤
│ id (UUID)       │     │ id (UUID)       │
│ auth_user_id    │     │ parent_id       │
│ email           │     │ name_sk         │
│ customer_type   │     │ slug            │
│ company_name    │     └─────────────────┘
│ ico, dic, ic_dph│              │
│ billing_*       │              │
│ shipping_*      │              ▼
└────────┬────────┘     ┌─────────────────┐
         │              │    products     │
         │              ├─────────────────┤
         │              │ id (UUID)       │
         │              │ sku             │
         │              │ name_sk         │
         │              │ price_*         │
         │              │ vat_mode        │
         │              │ stock_quantity  │
         │              │ is_bazaar       │
         │              │ category_id ────┘
         │              └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│     orders      │     │  order_items    │
├─────────────────┤     ├─────────────────┤
│ id (UUID)       │◄────│ order_id        │
│ order_number    │     │ product_id ─────┘
│ customer_id ────┘     │ quantity        │
│ status          │     │ price_*         │
│ total           │     │ vat_*           │
│ tracking_number │     └─────────────────┘
│ payment_status  │
└─────────────────┘
```

## DPH Režimy

E-shop podporuje 4 režimy DPH pre rôzne typy tovaru:

| Režim | Sadzba | Použitie |
|-------|--------|----------|
| `standard` | 20% | Bežná elektronika |
| `reduced` | 10% | Knihy, potraviny |
| `zero` | 0% | Export do EÚ/mimo EÚ |
| `margin` | Z marže | Bazár (použitý tovar) |

### Osobitný režim (Margin Scheme)

Pre bazárové položky sa DPH počíta len z **marže** (rozdiel medzi predajnou a nákupnou cenou), nie z celej sumy. Toto je v súlade so slovenskou legislatívou pre predaj použitého tovaru.

```
Príklad:
- Nákupná cena: 100€
- Predajná cena: 150€
- Marža: 50€
- DPH (20% z marže): 10€
```

## Supabase Edge Functions

### Autentifikácia
- `auth/register` - Registrácia zákazníka
- `auth/login` - Prihlásenie
- `auth/company-lookup` - Vyhľadanie firmy podľa IČO (ORSR API)

### Produkty
- `products/list` - Zoznam produktov s filtrami
- `products/detail` - Detail produktu
- `products/search` - Fulltextové vyhľadávanie

### Košík
- `cart/get` - Získanie košíka
- `cart/add` - Pridanie produktu
- `cart/update` - Zmena množstva
- `cart/remove` - Odstránenie produktu
- `cart/accessories` - Odporúčané príslušenstvo

### Objednávky
- `orders/create` - Vytvorenie objednávky
- `orders/list` - Zoznam objednávok zákazníka
- `orders/detail` - Detail objednávky
- `orders/update-status` - Zmena stavu (admin)
- `orders/add-tracking` - Pridanie tracking čísla

### Platby
- `payments/create-intent` - Stripe PaymentIntent
- `payments/webhook` - Stripe webhook
- `payments/confirm-transfer` - Potvrdenie prevodu (admin)

### Faktúry
- `invoices/generate` - Generovanie PDF faktúry
- `invoices/send` - Odoslanie emailom

### Integrácie
- `integrations/mksoft-export` - Export pre MKSOFT
- `integrations/packeta` - Packeta API
- `integrations/dpd` - DPD API

## Frontend Štruktúra

```
client/src/
├── pages/
│   ├── Home.tsx              # Domovská stránka
│   ├── Category.tsx          # Kategória produktov
│   ├── Product.tsx           # Detail produktu
│   ├── Cart.tsx              # Košík
│   ├── Checkout.tsx          # Pokladňa
│   ├── Account/              # Zákaznícky účet
│   │   ├── Orders.tsx
│   │   ├── Profile.tsx
│   │   └── Addresses.tsx
│   ├── Bazaar.tsx            # Bazár sekcia
│   └── admin/                # Administrácia (CZ)
│       ├── Dashboard.tsx
│       ├── Products.tsx
│       ├── Orders.tsx
│       └── Settings.tsx
├── components/
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   └── ...
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── utils.ts
└── hooks/
    ├── useCart.ts
    ├── useAuth.ts
    └── useProducts.ts
```

## Jazykové Nastavenie

| Časť | Jazyk |
|------|-------|
| Frontend (zákazníci) | Slovenčina |
| Administrácia | Čeština |
| Databáza (stĺpce) | Angličtina (technické) |
| Obsah (produkty) | Slovenčina |

## Bezpečnosť

### Row Level Security (RLS)

Supabase RLS zabezpečuje, že:
- Zákazníci vidia len svoje objednávky a údaje
- Produkty a kategórie sú verejne čitateľné
- Administrátori majú plný prístup

### API Kľúče

| Kľúč | Použitie | Viditeľnosť |
|------|----------|-------------|
| `anon` | Frontend, verejné operácie | Verejný |
| `service_role` | Edge Functions, admin operácie | Tajný |

## Nasadenie

### 1. Supabase Setup
```bash
# Vytvorenie projektu na supabase.com
# Spustenie schema.sql v SQL editore
```

### 2. Frontend Build
```bash
pnpm build
# Output: dist/
```

### 3. Vercel Deploy
```bash
vercel --prod
# Nastaviť environment variables:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

### 4. DNS Konfigurácia
```
# Na WebSupport DNS:
A     @     76.76.21.21 (Vercel IP)
CNAME www   cname.vercel-dns.com
```

## Limity Free Tier

| Služba | Limit | Poznámka |
|--------|-------|----------|
| Supabase DB | 500 MB | Dostačujúce pre tisíce produktov |
| Supabase Storage | 1 GB | Obrázky produktov |
| Supabase Edge Functions | 500K/mesiac | API volania |
| Vercel | 100 GB bandwidth | Frontend |

Pre väčšinu malých/stredných e-shopov sú tieto limity viac než dostačujúce.
