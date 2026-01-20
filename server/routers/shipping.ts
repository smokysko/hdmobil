import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getSupabase } from '../lib/supabase';

export const shippingRouter = router({
  getMethods: publicProcedure.query(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }),

  getMethodById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  calculateCost: publicProcedure
    .input(
      z.object({
        shippingMethodId: z.string(),
        weight: z.number().optional(),
        country: z.string().default('SK'),
      })
    )
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data: method, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('id', input.shippingMethodId)
        .single();

      if (error) throw error;

      return {
        method: method.code,
        price: method.price,
        estimatedDays: method.estimated_days,
      };
    }),

  getMethodsByCountry: publicProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .contains('available_countries', [input.country])
        .order('sort_order');

      if (error) throw error;
      return data || [];
    }),

  getFreeShippingThreshold: publicProcedure.query(async () => {
    const supabase = getSupabase();
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'free_shipping_threshold')
      .single();

    return (settings?.value as number) || 0;
  }),
});
