/*
  # Add invoice_id to orders table

  1. Changes:
    - Add `invoice_id` column to orders table to link order with its invoice
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'invoice_id') THEN
    ALTER TABLE orders ADD COLUMN invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice_id) WHERE invoice_id IS NOT NULL;
