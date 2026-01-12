import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const cartRouter = router({
  // Get or create cart for session/customer
  getOrCreate: publicProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = supabase.from('carts').select('*');

      if (input.customerId) {
        query = query.eq('customer_id', input.customerId);
      } else if (input.sessionId) {
        query = query.eq('session_id', input.sessionId);
      } else {
        throw new Error('Either customerId or sessionId is required');
      }

      let { data: cart, error } = await query.single();

      // Create new cart if doesn't exist
      if (error?.code === 'PGRST116') {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({
            customer_id: input.customerId || null,
            session_id: input.sessionId || null,
          })
          .select()
          .single();

        if (createError) throw createError;
        cart = newCart;
      } else if (error) {
        throw error;
      }

      return cart;
    }),

  // Get cart with items
  get: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .query(async ({ input }) => {
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('id', input.cartId)
        .single();

      if (cartError) throw cartError;

      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('cart_id', input.cartId);

      if (itemsError) throw itemsError;

      // Calculate totals
      const subtotal = (items || []).reduce((sum, item) => {
        return sum + (item.products?.price_with_vat || 0) * item.quantity;
      }, 0);

      return {
        cart,
        items: items || [],
        subtotal,
      };
    }),

  // Add item to cart
  addItem: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        productId: z.string(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ input }) => {
      // Check if item already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', input.cartId)
        .eq('product_id', input.productId)
        .single();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + input.quantity })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: input.cartId,
            product_id: input.productId,
            quantity: input.quantity,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    }),

  // Update item quantity
  updateItem: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      if (input.quantity === 0) {
        // Delete item if quantity is 0
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', input.itemId);

        if (error) throw error;
        return null;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: input.quantity })
        .eq('id', input.itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  // Remove item from cart
  removeItem: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', input.itemId);

      if (error) throw error;
      return { success: true };
    }),

  // Clear cart
  clear: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', input.cartId);

      if (error) throw error;
      return { success: true };
    }),

  // Get recommended products (cross-sell)
  getRecommendations: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .query(async ({ input }) => {
      // Get items in cart
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('product_id')
        .eq('cart_id', input.cartId);

      if (!cartItems || cartItems.length === 0) {
        return [];
      }

      const productIds = cartItems.map((item) => item.product_id);

      // Get accessories for these products
      const { data: accessories } = await supabase
        .from('product_accessories')
        .select('accessory_id, accessories:accessory_id(*)')
        .in('product_id', productIds);

      if (!accessories) return [];

      // Get unique accessory products
      const uniqueAccessories = Array.from(
        new Map(
          accessories.map((acc) => [acc.accessory_id, acc.accessories])
        ).values()
      );

      return uniqueAccessories.slice(0, 5);
    }),
});
