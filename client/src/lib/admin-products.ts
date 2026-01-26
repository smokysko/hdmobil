import { supabase } from './supabase';
import { nanoid } from 'nanoid';

export interface AdminProduct {
  id: string;
  sku: string | null;
  name_sk: string;
  slug: string;
  description_sk: string | null;
  category_id: string | null;
  price_without_vat: number;
  price_with_vat: number;
  original_price: number | null;
  vat_rate: number;
  stock_quantity: number;
  main_image_url: string | null;
  specifications: Record<string, string> | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bazaar: boolean;
  created_at: string;
  category?: {
    id: string;
    slug: string;
    name_sk: string;
  };
}

export interface AdminCategory {
  id: string;
  slug: string;
  name_sk: string;
}

export interface CreateProductData {
  name_sk: string;
  sku?: string;
  description_sk?: string;
  category_id?: string;
  price_with_vat: number;
  original_price?: number;
  stock_quantity?: number;
  main_image_url?: string;
  is_active?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name_sk')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function createProduct(productData: CreateProductData): Promise<{ success: boolean; error?: string; product?: AdminProduct }> {
  const slug = generateSlug(productData.name_sk);
  const priceWithoutVat = productData.price_with_vat / 1.2;

  const { data, error } = await supabase
    .from('products')
    .insert({
      name_sk: productData.name_sk,
      slug,
      sku: productData.sku || null,
      description_sk: productData.description_sk || null,
      category_id: productData.category_id || null,
      price_with_vat: productData.price_with_vat,
      price_without_vat: priceWithoutVat,
      original_price: productData.original_price || null,
      vat_rate: 20,
      stock_quantity: productData.stock_quantity || 0,
      main_image_url: productData.main_image_url || null,
      is_active: productData.is_active ?? true,
      is_new: productData.is_new ?? false,
      is_featured: productData.is_featured ?? false,
    })
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }

  return { success: true, product: data };
}

export async function updateProduct(productData: UpdateProductData): Promise<{ success: boolean; error?: string }> {
  const updates: Record<string, unknown> = {};

  if (productData.name_sk !== undefined) {
    updates.name_sk = productData.name_sk;
    updates.slug = generateSlug(productData.name_sk);
  }
  if (productData.sku !== undefined) updates.sku = productData.sku;
  if (productData.description_sk !== undefined) updates.description_sk = productData.description_sk;
  if (productData.category_id !== undefined) updates.category_id = productData.category_id;
  if (productData.price_with_vat !== undefined) {
    updates.price_with_vat = productData.price_with_vat;
    updates.price_without_vat = productData.price_with_vat / 1.2;
  }
  if (productData.original_price !== undefined) updates.original_price = productData.original_price;
  if (productData.stock_quantity !== undefined) updates.stock_quantity = productData.stock_quantity;
  if (productData.main_image_url !== undefined) updates.main_image_url = productData.main_image_url;
  if (productData.is_active !== undefined) updates.is_active = productData.is_active;
  if (productData.is_new !== undefined) updates.is_new = productData.is_new;
  if (productData.is_featured !== undefined) updates.is_featured = productData.is_featured;

  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productData.id);

  if (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function toggleProductStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling product status:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function uploadProductImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${nanoid()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

export async function deleteProductImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  const path = imageUrl.split('/images/')[1];
  if (!path) {
    return { success: false, error: 'Invalid image URL' };
  }

  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getProductById(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}
