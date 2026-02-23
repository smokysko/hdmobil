/*
  # Add missing foreign key indexes

  Adds covering indexes for foreign key columns that lack them.
  This prevents sequential scans on the referenced tables during joins and cascades.

  Tables affected:
  - cart_items.product_id
  - invoices.order_id
  - order_items.product_id
  - orders.discount_id
  - orders.payment_method_id
  - orders.shipping_method_id
  - product_accessories.accessory_id
*/

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
  ON cart_items (product_id);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id
  ON invoices (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_orders_discount_id
  ON orders (discount_id);

CREATE INDEX IF NOT EXISTS idx_orders_payment_method_id
  ON orders (payment_method_id);

CREATE INDEX IF NOT EXISTS idx_orders_shipping_method_id
  ON orders (shipping_method_id);

CREATE INDEX IF NOT EXISTS idx_product_accessories_accessory_id
  ON product_accessories (accessory_id);
