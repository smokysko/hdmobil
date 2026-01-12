# Project Requirements: HDmobil E-commerce Platform

## Core Infrastructure
- [ ] **Full-Stack Upgrade**: Database, Backend, Auth.
- [ ] **Admin Panel**: CMS for products, discounts, orders, content.

## Inventory & Invoicing
- [ ] **MKSOFT Integration**: Sync warehouse stock with DB.
- [ ] **Automated Invoicing**: Generate invoices based on order data.
- [ ] **VAT Management**: Per-product VAT settings (Standard 20% vs. Margin Scheme/0% for used goods).

## Payments & Shipping
- [ ] **Payment Gateways**: Card (Stripe), Google Pay, Apple Pay, Bank Transfer, COD (Dobierka).
- [ ] **Shipping Providers**: DPD, SK Posta, Packeta (Home + Z-Box), SPS Boxes.
- [ ] **Tracking**: Auto-send tracking numbers on status change.

## User Experience
- [ ] **Company Auto-fill**: Fetch company data by ICO during registration.
- [ ] **Bazaar Section**: Dedicated section for used/refurbished items.
- [ ] **Cross-selling**: "Recommended accessories" popup/section in cart (e.g., iPhone -> Glass/Case).

## Technical Stack
- **Frontend**: React 19, Tailwind 4, Shadcn UI.
- **Backend**: Node.js (Hono/Express), Drizzle ORM.
- **Database**: PostgreSQL.
