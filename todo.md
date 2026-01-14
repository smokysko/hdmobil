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

## Phase 2: API Endpoints (tRPC/REST)
- [x] Products API (list, search, filter by category)
- [x] Cart API (add/remove items, get cart, update quantity)
- [x] Orders API (create, list, get details, update status)
- [x] Payments API (create payment intent, webhook handlers)
- [x] Customers API (register, login, profile, company lookup)
- [x] Shipping API (get methods, calculate cost)
- [x] Discounts API (validate coupon)
- [ ] Invoices API (generate, download)

## Phase 3: Admin Panel (Czech)
- [x] Dashboard with orders/revenue stats
- [x] Product management (CRUD, images, pricing)
- [x] Order management (status updates, tracking)
- [ ] Customer management
- [ ] Discount/coupon management
- [x] Shipping settings
- [x] Settings (shop info, company details)

## Phase 4: Frontend Migration
- [ ] Install Supabase client (`@supabase/supabase-js`)
- [ ] Configure Supabase connection
- [ ] Replace tRPC calls with Supabase client
- [ ] Implement Supabase Auth UI
- [ ] Update product listing to use Supabase
- [ ] Update cart to use Supabase

## Phase 5: Core E-commerce Features
- [ ] Product catalog with categories
- [ ] Shopping cart with cross-sell
- [ ] Checkout flow (shipping, payment selection)
- [ ] Customer registration (personal + company)
- [ ] Order management
- [ ] Bazaar section

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

## Phase 6: Localization & Admin Auth
- [x] Create i18n system with Slovak and Czech translations
- [x] Add language switcher component
- [x] Translate admin panel to Slovak (default) with Czech option
- [x] Create admin login page
- [x] Implement admin authentication (localStorage demo)
- [x] Protect admin routes with auth check
- [ ] Add admin user management (Supabase Auth)

## Phase 7: Admin Panel Redesign
- [x] Replace emoji icons with professional SVG outline icons (green theme)
- [x] Add real charts (Chart.js/Recharts) for revenue and orders
- [x] Modernize dashboard layout with cleaner design
- [x] Update color scheme to match website green (#22c55e)
- [x] Create 3 visual design concepts via nano banana slides

## Phase 8: Supabase Auth Implementation
- [x] Configure Supabase client with auth
- [x] Create auth context and hooks
- [x] Update admin login to use Supabase Auth
- [x] Create admin user in Supabase
- [x] Create customer registration page
- [x] Create customer login page
- [ ] Add user profile dropdown in header
- [x] Protect admin routes with Supabase session

## Phase 9: Language Switcher, User Profile & Cart
- [x] Create i18n context with Slovak and Czech translations
- [x] Add language switcher component in header (SK/CZ flags)
- [x] Create user profile dropdown menu
- [x] Add order history page for logged-in users
- [x] Connect cart to Supabase carts table
- [x] Sync cart between localStorage and database for logged-in users
- [x] Add cart item count badge in header

## Phase 10: UI/UX Improvements
- [x] Fix trust bar positioning - visible at bottom of viewport on page load
- [x] Trust bar scrolls normally with content (not fixed)
