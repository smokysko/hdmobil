import { supabase } from '@/lib/supabase';
import type { Product } from './products';

export interface Cart {
  id: string;
  customer_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  products: Product;
}

export interface CartWithItems {
  cart: Cart;
  items: CartItem[];
  subtotal: number;
}

export async function getOrCreateCart(params: {
  customerId?: string;
  sessionId?: string;
}): Promise<Cart> {
  const { customerId, sessionId } = params;

  if (!customerId && !sessionId) {
    throw new Error('Either customerId or sessionId is required');
  }

  let query = supabase.from('carts').select('*');

  if (customerId) {
    query = query.eq('customer_id', customerId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { data: cart, error } = await query.maybeSingle();

  if (error) throw error;

  if (cart) {
    return cart;
  }

  const { data: newCart, error: createError } = await supabase
    .from('carts')
    .insert({
      customer_id: customerId || null,
      session_id: sessionId || null,
    })
    .select()
    .single();

  if (createError) throw createError;
  return newCart;
}

export async function getCart(cartId: string): Promise<CartWithItems> {
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('*')
    .eq('id', cartId)
    .single();

  if (cartError) throw cartError;

  const { data: items, error: itemsError } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('cart_id', cartId);

  if (itemsError) throw itemsError;

  const subtotal = (items || []).reduce((sum, item) => {
    return sum + (item.products?.price_with_vat || 0) * item.quantity;
  }, 0);

  return {
    cart,
    items: (items || []) as CartItem[],
    subtotal,
  };
}

export async function addCartItem(params: {
  cartId: string;
  productId: string;
  quantity?: number;
}): Promise<CartItem> {
  const { cartId, productId, quantity = 1 } = params;

  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select('*, products(*)')
      .single();

    if (error) throw error;
    return data as CartItem;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      cart_id: cartId,
      product_id: productId,
      quantity,
    })
    .select('*, products(*)')
    .single();

  if (error) throw error;
  return data as CartItem;
}

export async function updateCartItem(params: {
  itemId: string;
  quantity: number;
}): Promise<CartItem | null> {
  const { itemId, quantity } = params;

  if (quantity === 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return null;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select('*, products(*)')
    .single();

  if (error) throw error;
  return data as CartItem;
}

export async function removeCartItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function clearCart(cartId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);

  if (error) throw error;
}

export async function getCartRecommendations(cartId: string): Promise<Product[]> {
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('product_id')
    .eq('cart_id', cartId);

  if (!cartItems || cartItems.length === 0) {
    return [];
  }

  const productIds = cartItems.map((item) => item.product_id);

  const { data: accessories } = await supabase
    .from('product_accessories')
    .select('accessory_id, accessories:accessory_id(*)')
    .in('product_id', productIds);

  if (!accessories) return [];

  const uniqueAccessories = Array.from(
    new Map(
      accessories.map((acc) => [acc.accessory_id, acc.accessories])
    ).values()
  );

  return uniqueAccessories.slice(0, 5) as Product[];
}
