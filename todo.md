# HDmobil E-commerce - Supabase Migration

## Phase 1: Database Schema (PostgreSQL)
- [x] Design `customers` table (with company fields: ICO, DIC, IC_DPH)
- [x] Design `products` table (VAT modes, bazaar flag, stock)
- [x] Design `categories` table (hierarchical)
- [x] Design `orders` and `order_items` tables
- [x] Design `discounts` table (coupons, percentage, fixed)
- [x] Design `shipping_methods` table (DPD, Packeta, SK Posta, SPS)
- [x] Design `payment_methods` table
- [x] Design `invoices` table
- [x] Design `product_accessories` table (cross-sell relations)
- [x] Create SQL migration file for Supabase

## Phase 2: Supabase Edge Functions
- [ ] Auth functions (register, login, company auto-fill by ICO)
- [ ] Product functions (CRUD, search, filter)
- [ ] Cart functions (add, remove, update quantity)
- [ ] Order functions (create, update status, tracking)
- [ ] Payment webhooks (Stripe, bank transfer confirmation)
- [ ] Invoice generation (PDF)
- [ ] Email notifications (order confirmation, tracking)
- [ ] MKSOFT export function

## Phase 3: Frontend Migration
- [ ] Install Supabase client (`@supabase/supabase-js`)
- [ ] Configure Supabase connection
- [ ] Replace tRPC calls with Supabase client
- [ ] Implement Supabase Auth UI
- [ ] Update product listing to use Supabase
- [ ] Update cart to use Supabase

## Phase 4: Core E-commerce Features
- [ ] Product catalog with categories
- [ ] Shopping cart with cross-sell
- [ ] Checkout flow (shipping, payment selection)
- [ ] Customer registration (personal + company)
- [ ] Order management
- [ ] Bazaar section
- [ ] Admin panel for product/order management

## Phase 5: Integrations & Deployment
- [ ] Stripe integration (card, Apple Pay, Google Pay)
- [ ] Shipping API integrations (Packeta, DPD)
- [ ] ICO lookup API (Slovak business register)
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Connect custom domain (hdmobil.sk)
- [ ] Final testing

## Completed
- [x] Initial project setup
- [x] Basic frontend design
- [x] Banner generation tests
