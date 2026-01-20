import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getSupabase } from '../lib/supabase';

export const customersRouter = router({
  getProfile: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', input.customerId)
        .single();

      if (error) throw error;
      return data;
    }),

  updateProfile: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { customerId, ...updateData } = input;

      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  getCompanyInfo: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('customers')
        .select('company_name, ico, dic, ic_dph')
        .eq('id', input.customerId)
        .single();

      if (error) throw error;
      return data;
    }),

  updateCompanyInfo: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        companyName: z.string(),
        ico: z.string(),
        dic: z.string().optional(),
        icDph: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { customerId, ...updateData } = input;

      const { data, error } = await supabase
        .from('customers')
        .update({
          company_name: updateData.companyName,
          ico: updateData.ico,
          dic: updateData.dic,
          ic_dph: updateData.icDph,
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  lookupCompanyByIco: publicProcedure
    .input(z.object({ ico: z.string() }))
    .query(async ({ input }) => {
      return {
        ico: input.ico,
        name: 'Sample Company',
        street: 'Sample Street 123',
        city: 'Bratislava',
        zip: '81101',
        country: 'SK',
      };
    }),

  getOrders: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data: orders, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('customer_id', input.customerId)
        .range((input.page - 1) * input.limit, input.page * input.limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        orders: orders || [],
        total: count || 0,
      };
    }),

  getWishlists: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async () => {
      return [];
    }),

  addToWishlist: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        productId: z.string(),
      })
    )
    .mutation(async () => {
      return { success: true };
    }),

  removeFromWishlist: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        productId: z.string(),
      })
    )
    .mutation(async () => {
      return { success: true };
    }),
});
