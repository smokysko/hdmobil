/*
  # Extend Invoices Table for Full Invoice Generation

  1. Changes to `invoices` table:
    - Add `customer_id` - reference to customer
    - Add `invoice_type` - 'invoice' or 'proforma'
    - Add `status` - 'draft', 'issued', 'paid', 'cancelled'
    - Add `delivery_date` - date of goods delivery
    - Add seller info fields (name, ico, dic, ic_dph, address, bank)
    - Add buyer info fields (name, ico, dic, ic_dph, address)
    - Add `shipping_cost`, `discount_amount`, `currency`
    - Add `payment_method`, `variable_symbol`, `note`, `paid_at`

  2. New `invoice_items` table:
    - Line items for each invoice
    - Product details snapshot (name, sku, quantity, prices, vat)

  3. Security:
    - Enable RLS on invoice_items
    - Add policy for customers to view their own invoice items
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'customer_id') THEN
    ALTER TABLE invoices ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'invoice_type') THEN
    ALTER TABLE invoices ADD COLUMN invoice_type VARCHAR(20) DEFAULT 'invoice';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'status') THEN
    ALTER TABLE invoices ADD COLUMN status VARCHAR(20) DEFAULT 'issued';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'delivery_date') THEN
    ALTER TABLE invoices ADD COLUMN delivery_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_name') THEN
    ALTER TABLE invoices ADD COLUMN seller_name VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_ico') THEN
    ALTER TABLE invoices ADD COLUMN seller_ico VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_dic') THEN
    ALTER TABLE invoices ADD COLUMN seller_dic VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_ic_dph') THEN
    ALTER TABLE invoices ADD COLUMN seller_ic_dph VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_street') THEN
    ALTER TABLE invoices ADD COLUMN seller_street VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_city') THEN
    ALTER TABLE invoices ADD COLUMN seller_city VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_zip') THEN
    ALTER TABLE invoices ADD COLUMN seller_zip VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_country') THEN
    ALTER TABLE invoices ADD COLUMN seller_country VARCHAR(2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_bank_account') THEN
    ALTER TABLE invoices ADD COLUMN seller_bank_account VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'seller_bank_name') THEN
    ALTER TABLE invoices ADD COLUMN seller_bank_name VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_name') THEN
    ALTER TABLE invoices ADD COLUMN buyer_name VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_ico') THEN
    ALTER TABLE invoices ADD COLUMN buyer_ico VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_dic') THEN
    ALTER TABLE invoices ADD COLUMN buyer_dic VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_ic_dph') THEN
    ALTER TABLE invoices ADD COLUMN buyer_ic_dph VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_street') THEN
    ALTER TABLE invoices ADD COLUMN buyer_street VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_city') THEN
    ALTER TABLE invoices ADD COLUMN buyer_city VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_zip') THEN
    ALTER TABLE invoices ADD COLUMN buyer_zip VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'buyer_country') THEN
    ALTER TABLE invoices ADD COLUMN buyer_country VARCHAR(2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'shipping_cost') THEN
    ALTER TABLE invoices ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'discount_amount') THEN
    ALTER TABLE invoices ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'currency') THEN
    ALTER TABLE invoices ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_method') THEN
    ALTER TABLE invoices ADD COLUMN payment_method VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'variable_symbol') THEN
    ALTER TABLE invoices ADD COLUMN variable_symbol VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'note') THEN
    ALTER TABLE invoices ADD COLUMN note TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'paid_at') THEN
    ALTER TABLE invoices ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(50),
  quantity INT NOT NULL DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'ks',
  price_without_vat DECIMAL(10, 2) NOT NULL,
  price_with_vat DECIMAL(10, 2) NOT NULL,
  vat_rate DECIMAL(5, 2) NOT NULL,
  vat_mode VARCHAR(20) DEFAULT 'standard',
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own invoices" ON invoices;
CREATE POLICY "Customers can view own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Customers can view own invoice items" ON invoice_items;
CREATE POLICY "Customers can view own invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE customer_id IN (
        SELECT id FROM customers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Service role can manage invoices" ON invoices;
CREATE POLICY "Service role can manage invoices"
  ON invoices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage invoice items" ON invoice_items;
CREATE POLICY "Service role can manage invoice items"
  ON invoice_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
