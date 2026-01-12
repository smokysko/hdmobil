# HDmobil Supabase Database Setup - COMPLETE

## Database Tables Created

All 14 tables have been successfully created in Supabase:

| Table | Description |
|-------|-------------|
| `customers` | Zákazníci s fakturačnými a doručovacími údajmi |
| `categories` | Kategórie produktov s hierarchiou |
| `products` | Produkty s cenami, DPH, skladom, bazár |
| `product_accessories` | Cross-sell príslušenstvo |
| `shipping_methods` | Spôsoby doručenia (DPD, Packeta, SPS, Pošta) |
| `payment_methods` | Spôsoby platby (karta, Google Pay, Apple Pay, prevod, dobierka) |
| `discounts` | Zľavové kupóny |
| `orders` | Objednávky so všetkými údajmi |
| `order_items` | Položky objednávok |
| `invoices` | Faktúry |
| `carts` | Košíky (pre prihlásených aj neprihlásených) |
| `cart_items` | Položky košíka |
| `admin_users` | Administrátori |
| `settings` | Nastavenia eshopu |

## ENUM Types Created

- `vat_mode`: standard, reduced, zero, margin (bazár)
- `customer_type`: individual, company
- `order_status`: pending, confirmed, processing, shipped, delivered, cancelled, returned
- `payment_type`: card, google_pay, apple_pay, bank_transfer, cod
- `payment_status`: pending, paid, failed, refunded
- `discount_type`: percentage, fixed

## Default Data Inserted

### Shipping Methods
- DPD kuriér (4.90€, free from 50€)
- Packeta na adresu (3.90€)
- Packeta Z-BOX (2.90€)
- Packeta výdajné miesto (2.50€)
- Slovenská pošta (3.50€)
- SPS kuriér (4.50€)

### Payment Methods
- Platobná karta (0€)
- Google Pay (0€)
- Apple Pay (0€)
- Bankový prevod (0€)
- Dobierka (1.50€)

## Supabase Credentials

- **Project URL**: https://uenmpipmzowoxnylpgws.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbm1waXBtem93b3hueWxwZ3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTk0NjYsImV4cCI6MjA1MjIzNTQ2Nn0.nHHFUzCJBJdqOiDMQnNJpkVLJdDFCMYrjsGZVoHgQCw
- **Service Role Key**: (stored securely in .env.supabase)

## Next Steps

1. ✅ Database schema deployed
2. ⏳ Configure RLS (Row Level Security) policies
3. ⏳ Deploy Edge Functions
4. ⏳ Connect frontend to Supabase
5. ⏳ Build admin panel
