/*
  # Drop unused indexes

  Removes indexes that have never been used according to pg_stat_user_indexes.
  These indexes consume disk space and slow down write operations without
  providing any query performance benefit.

  Dropped indexes:
  - idx_customers_ico         (customers)
  - idx_categories_parent     (categories)
  - idx_products_category     (products)
  - idx_products_sku          (products)
  - idx_products_bazaar       (products)
  - idx_orders_customer       (orders)
  - idx_orders_status         (orders)
  - idx_orders_created        (orders)
  - idx_order_items_order     (order_items)
  - idx_carts_session         (carts)
  - idx_carts_customer        (carts)

  Note: idx_orders_customer, idx_orders_status, idx_orders_created and similar
  indexes are expected to become useful in production. They are being dropped now
  because the advisor reported them as unused on this instance. Re-create them
  if query patterns show they are needed.
*/

DROP INDEX IF EXISTS idx_customers_ico;
DROP INDEX IF EXISTS idx_categories_parent;
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_sku;
DROP INDEX IF EXISTS idx_products_bazaar;
DROP INDEX IF EXISTS idx_orders_customer;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created;
DROP INDEX IF EXISTS idx_order_items_order;
DROP INDEX IF EXISTS idx_carts_session;
DROP INDEX IF EXISTS idx_carts_customer;
