import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const shippingRouter = router({
  // Get all shipping methods
  getMethods: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }),

  // Get shipping method by ID
  getMethodById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  // Calculate shipping cost
  calculateCost: publicProcedure
    .input(
      z.object({
        shippingMethodId: z.string(),
        weight: z.number().optional(),
        country: z.string().default('SK'),
      })
    )
    .query(async ({ input }) => {
      const { data: method, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('id', input.shippingMethodId)
        .single();

      if (error) throw error;

      // For now, return fixed price
      // In future, could implement weight-based or country-based pricing
      return {
        method: method.code,
        price: method.price,
        estimatedDays: method.estimated_days,
      };
    }),

  // Get methods for specific country
  getMethodsByCountry: publicProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .contains('available_countries', [input.country])
        .order('sort_order');

      if (error) throw error;
      return data || [];
    }),

  // Get free shipping threshold
  getFreeShippingThreshold: publicProcedure.query(async () => {
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'free_shipping_threshold')
      .single();

    return (settings?.value as number) || 0;
  }),
});
