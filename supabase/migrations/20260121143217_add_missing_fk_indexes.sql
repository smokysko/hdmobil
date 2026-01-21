/*
  # Add Missing Foreign Key Indexes
  
  This migration adds indexes on foreign key columns that were missing indexes,
  which improves JOIN performance and query optimization.
  
  1. New Indexes
    - `idx_cart_items_product_id` on cart_items(product_id)
    - `idx_invoices_order_id` on invoices(order_id)
    - `idx_order_items_product_id` on order_items(product_id)
    - `idx_orders_discount_id` on orders(discount_id)
    - `idx_orders_payment_method_id` on orders(payment_method_id)
    - `idx_orders_shipping_method_id` on orders(shipping_method_id)
    - `idx_product_accessories_accessory_id` on product_accessories(accessory_id)
    - `idx_users_referred_by` on users(referred_by)
*/

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_discount_id ON public.orders(discount_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method_id ON public.orders(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method_id ON public.orders(shipping_method_id);
CREATE INDEX IF NOT EXISTS idx_product_accessories_accessory_id ON public.product_accessories(accessory_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
