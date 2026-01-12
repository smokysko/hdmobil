import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const categoriesRouter = router({
  // Get all categories
  list: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .order('name_sk');

    if (error) throw error;
    return data || [];
  }),

  // Get category by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  // Get category by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', input.slug)
        .single();

      if (error) throw error;
      return data;
    }),

  // Get subcategories
  getSubcategories: publicProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', input.parentId)
        .order('sort_order')
        .order('name_sk');

      if (error) throw error;
      return data || [];
    }),

  // Get category with products
  getWithProducts: publicProcedure
    .input(
      z.object({
        categoryId: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', input.categoryId)
        .single();

      if (catError) throw catError;

      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', input.categoryId)
        .eq('is_active', true)
        .limit(input.limit)
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      return {
        category,
        products: products || [],
      };
    }),
});
