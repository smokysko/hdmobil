import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getSupabase } from '../lib/supabase';

const homepageSectionSchema = z.object({
  section_key: z.string(),
  section_type: z.string(),
  title_sk: z.string().nullable().optional(),
  subtitle_sk: z.string().nullable().optional(),
  description_sk: z.string().nullable().optional(),
  badge_text: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  image_mobile_url: z.string().nullable().optional(),
  background_color: z.string().nullable().optional(),
  text_color: z.string().nullable().optional(),
  link_url: z.string().nullable().optional(),
  link_text: z.string().nullable().optional(),
  link_product_id: z.string().nullable().optional(),
  content: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

const bannerSchema = z.object({
  name: z.string(),
  title_sk: z.string().nullable().optional(),
  subtitle_sk: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  image_mobile_url: z.string().nullable().optional(),
  link_url: z.string().nullable().optional(),
  placement: z.string(),
  background_color: z.string().nullable().optional(),
  text_color: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  sort_order: z.number().optional(),
});

const contentBlockSchema = z.object({
  block_key: z.string(),
  block_type: z.string(),
  title_sk: z.string().nullable().optional(),
  content: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export const cmsRouter = router({
  getHomepageSections: publicProcedure.query(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }),

  getHomepageSection: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', input.key)
        .maybeSingle();

      if (error) throw error;
      return data;
    }),

  updateHomepageSection: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: homepageSectionSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('homepage_sections')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  createHomepageSection: publicProcedure
    .input(homepageSectionSchema)
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('homepage_sections')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  deleteHomepageSection: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('homepage_sections')
        .delete()
        .eq('id', input.id);

      if (error) throw error;
      return { success: true };
    }),

  getBanners: publicProcedure
    .input(
      z.object({
        placement: z.string().optional(),
        includeInactive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = getSupabase();
      let query = supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (input?.placement) {
        query = query.eq('placement', input.placement);
      }

      if (!input?.includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }),

  getBanner: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  createBanner: publicProcedure.input(bannerSchema).mutation(async ({ input }) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('banners')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }),

  updateBanner: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: bannerSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('banners')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  deleteBanner: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', input.id);

      if (error) throw error;
      return { success: true };
    }),

  getContentBlocks: publicProcedure.query(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }),

  getContentBlock: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('block_key', input.key)
        .maybeSingle();

      if (error) throw error;
      return data;
    }),

  updateContentBlock: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: contentBlockSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('content_blocks')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  createContentBlock: publicProcedure
    .input(contentBlockSchema)
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('content_blocks')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  deleteContentBlock: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', input.id);

      if (error) throw error;
      return { success: true };
    }),

  getMediaLibrary: publicProcedure
    .input(
      z.object({
        folder: z.string().optional(),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const supabase = getSupabase();
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(input?.limit || 50);

      if (input?.folder) {
        query = query.eq('folder', input.folder);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }),

  addMediaItem: publicProcedure
    .input(
      z.object({
        filename: z.string(),
        storage_path: z.string(),
        url: z.string(),
        alt_text: z.string().nullable().optional(),
        mime_type: z.string().nullable().optional(),
        file_size: z.number().nullable().optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        folder: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('media_library')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  deleteMediaItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data: mediaItem } = await supabase
        .from('media_library')
        .select('storage_path')
        .eq('id', input.id)
        .single();

      if (mediaItem?.storage_path) {
        await supabase.storage.from('images').remove([mediaItem.storage_path]);
      }

      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', input.id);

      if (error) throw error;
      return { success: true };
    }),

  getHomepageData: publicProcedure.query(async () => {
    const supabase = getSupabase();

    const [sectionsRes, blocksRes] = await Promise.all([
      supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('content_blocks')
        .select('*')
        .eq('is_active', true),
    ]);

    if (sectionsRes.error) throw sectionsRes.error;
    if (blocksRes.error) throw blocksRes.error;

    const sections: Record<string, (typeof sectionsRes.data)[0]> = {};
    for (const section of sectionsRes.data || []) {
      sections[section.section_key] = section;
    }

    const blocks: Record<string, (typeof blocksRes.data)[0]> = {};
    for (const block of blocksRes.data || []) {
      blocks[block.block_key] = block;
    }

    return { sections, blocks };
  }),
});
