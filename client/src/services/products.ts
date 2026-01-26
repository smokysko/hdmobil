import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name_sk: string;
  name_cs: string | null;
  description_sk: string | null;
  description_cs: string | null;
  slug: string;
  sku: string;
  price_without_vat: number;
  price_with_vat: number;
  vat_rate: number;
  vat_mode: string;
  stock_quantity: number;
  category_id: string | null;
  main_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bazaar: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isBazaar?: boolean;
}

export interface ProductsListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export async function getProducts(params: ProductsListParams = {}): Promise<ProductsListResult> {
  const { page = 1, limit = 20, categoryId, search, isBazaar } = params;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (isBazaar !== undefined) {
    query = query.eq('is_bazaar', isBazaar);
  }

  if (search) {
    query = query.or(
      `name_sk.ilike.%${search}%,description_sk.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    products: data || [],
    total: count || 0,
    page,
    limit,
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProductAccessories(productId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_accessories')
    .select('accessory_id, accessories:accessory_id(*)')
    .eq('product_id', productId)
    .order('sort_order');

  if (error) throw error;

  return (data || []).map((item) => item.accessories as unknown as Product);
}

export async function getProductsByCategory(
  categoryId: string,
  limit: number = 20
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFeaturedProducts(limit: number = 10): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getNewProducts(limit: number = 10): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .eq('is_active', true)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(
      `name_sk.ilike.%${query}%,description_sk.ilike.%${query}%,sku.ilike.%${query}%`
    )
    .limit(limit);

  if (error) throw error;
  return data || [];
}
