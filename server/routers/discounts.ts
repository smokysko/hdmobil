import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getSupabase } from '../lib/supabase';

export const discountsRouter = router({
  validate: publicProcedure
    .input(
      z.object({
        code: z.string(),
        cartTotal: z.number(),
      })
    )
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data: discount, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', input.code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error?.code === 'PGRST116') {
        throw new Error('Discount code not found');
      }

      if (error) throw error;

      const now = new Date();
      if (discount.valid_from && new Date(discount.valid_from) > now) {
        throw new Error('Discount code is not yet valid');
      }

      if (discount.valid_until && new Date(discount.valid_until) < now) {
        throw new Error('Discount code has expired');
      }

      if (discount.min_order_amount && input.cartTotal < discount.min_order_amount) {
        throw new Error(
          `Minimum order amount is ${discount.min_order_amount} EUR`
        );
      }

      if (discount.usage_limit) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('discount_code', discount.code);

        if ((count || 0) >= discount.usage_limit) {
          throw new Error('Discount code usage limit reached');
        }
      }

      let discountAmount = 0;
      if (discount.discount_type === 'percentage') {
        discountAmount = (input.cartTotal * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }

      return {
        code: discount.code,
        type: discount.discount_type,
        value: discount.value,
        amount: discountAmount,
        description: discount.description_sk,
      };
    }),

  getActive: publicProcedure.query(async () => {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }),
});
