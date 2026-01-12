import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const productsRouter = router({
  // List all products with pagination and filters
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        isBazaar: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range((input.page - 1) * input.limit, input.page * input.limit - 1)
        .order('created_at', { ascending: false });

      if (input.categoryId) {
        query = query.eq('category_id', input.categoryId);
      }

      if (input.isBazaar !== undefined) {
        query = query.eq('is_bazaar', input.isBazaar);
      }

      if (input.search) {
        query = query.or(
          `name_sk.ilike.%${input.search}%,description_sk.ilike.%${input.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data || [],
        total: count || 0,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Get single product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  // Get product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', input.slug)
        .single();

      if (error) throw error;
      return data;
    }),

  // Get product accessories (cross-sell)
  getAccessories: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('product_accessories')
        .select('accessory_id, accessories:accessory_id(*)')
        .eq('product_id', input.productId)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    }),

  // Get products by category
  getByCategory: publicProcedure
    .input(
      z.object({
        categoryId: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', input.categoryId)
        .eq('is_active', true)
        .limit(input.limit)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }),

  // Get featured products
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(input.limit)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }),

  // Get new products
  getNew: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .eq('is_active', true)
        .limit(input.limit)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }),

  // Search products
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(
          `name_sk.ilike.%${input.query}%,description_sk.ilike.%${input.query}%,sku.ilike.%${input.query}%`
        )
        .limit(input.limit);

      if (error) throw error;
      return data || [];
    }),
});
