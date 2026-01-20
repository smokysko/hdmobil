import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getSupabase } from '../lib/supabase';

export const cartRouter = router({
  getOrCreate: publicProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const supabase = getSupabase();
      let query = supabase.from('carts').select('*');

      if (input.customerId) {
        query = query.eq('customer_id', input.customerId);
      } else if (input.sessionId) {
        query = query.eq('session_id', input.sessionId);
      } else {
        throw new Error('Either customerId or sessionId is required');
      }

      let { data: cart, error } = await query.single();

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

  get: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
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

      const subtotal = (items || []).reduce((sum, item) => {
        return sum + (item.products?.price_with_vat || 0) * item.quantity;
      }, 0);

      return {
        cart,
        items: items || [],
        subtotal,
      };
    }),

  addItem: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        productId: z.string(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', input.cartId)
        .eq('product_id', input.productId)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + input.quantity })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
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

  updateItem: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      if (input.quantity === 0) {
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

  removeItem: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', input.itemId);

      if (error) throw error;
      return { success: true };
    }),

  clear: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', input.cartId);

      if (error) throw error;
      return { success: true };
    }),

  getRecommendations: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('product_id')
        .eq('cart_id', input.cartId);

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

      return uniqueAccessories.slice(0, 5);
    }),
});
