import { supabase } from './supabase';

export interface DbProduct {
  id: string;
  sku: string | null;
  name_sk: string;
  slug: string;
  description_sk: string | null;
  short_description_sk: string | null;
  category_id: string | null;
  price_without_vat: number;
  price_with_vat: number;
  original_price: number | null;
  vat_rate: number;
  stock_quantity: number;
  main_image_url: string | null;
  gallery_urls: string[] | null;
  specifications: Record<string, string> | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bazaar: boolean;
  bazaar_condition: string | null;
  category?: {
    id: string;
    slug: string;
    name_sk: string;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  category: string;
  categorySlug: string;
  categoryId: string;
  isNew: boolean;
  isSale: boolean;
  salePrice?: number;
  description: string;
  specs: Record<string, string>;
  stock: number;
  sku: string;
  slug: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image?: string;
}

function mapDbProductToProduct(db: DbProduct): Product {
  const isSale = db.original_price !== null && db.original_price > db.price_with_vat;
  const mainImage = db.main_image_url || '/images/products/placeholder.png';
  const gallery = db.gallery_urls?.length ? db.gallery_urls : [mainImage];

  return {
    id: db.id,
    name: db.name_sk,
    price: db.original_price || db.price_with_vat,
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 300) + 50,
    image: mainImage,
    gallery,
    category: db.category?.name_sk || 'Uncategorized',
    categorySlug: db.category?.slug || 'all',
    categoryId: db.category_id || '',
    isNew: db.is_new,
    isSale,
    salePrice: isSale ? db.price_with_vat : undefined,
    description: db.description_sk || '',
    specs: db.specifications || {},
    stock: db.stock_quantity,
    sku: db.sku || '',
    slug: db.slug,
  };
}

export async function getProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
  search?: string;
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (options?.categorySlug && options.categorySlug !== 'all') {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .maybeSingle();

    if (category) {
      query = query.eq('category_id', category.id);
    }
  }

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.isNew) {
    query = query.eq('is_new', true);
  }

  if (options?.search) {
    query = query.ilike('name_sk', `%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(mapDbProductToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching product:', error);
    return null;
  }

  return mapDbProductToProduct(data);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching product:', error);
    return null;
  }

  return mapDbProductToProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name_sk, image_url')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data || []).map(cat => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name_sk,
    image: cat.image_url,
  }));
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return getProducts({ featured: true, limit });
}

export async function getNewProducts(limit = 4): Promise<Product[]> {
  return getProducts({ isNew: true, limit });
}

export async function getSaleProducts(limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .eq('is_active', true)
    .not('original_price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sale products:', error);
    return [];
  }

  return (data || []).map(mapDbProductToProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return getProducts({ search: query });
}

export async function getRecommendedAccessories(productId: string, limit = 4): Promise<Product[]> {
  const { data: directAccessories } = await supabase
    .from('product_accessories')
    .select(`
      accessory:accessory_id(
        *,
        category:categories(id, slug, name_sk)
      )
    `)
    .eq('product_id', productId)
    .order('sort_order')
    .limit(limit);

  if (directAccessories && directAccessories.length > 0) {
    return directAccessories
      .filter((item) => item.accessory)
      .map((item) => mapDbProductToProduct(item.accessory as DbProduct));
  }

  const { data: product } = await supabase
    .from('products')
    .select('category_id')
    .eq('id', productId)
    .maybeSingle();

  if (!product?.category_id) return [];

  const { data: rules } = await supabase
    .from('category_accessory_rules')
    .select('accessory_category_id')
    .eq('source_category_id', product.category_id)
    .order('priority');

  if (!rules || rules.length === 0) return [];

  const accessoryCategoryIds = rules.map((r) => r.accessory_category_id);

  const { data: accessories, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .in('category_id', accessoryCategoryIds)
    .eq('is_active', true)
    .neq('id', productId)
    .order('is_featured', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching accessories:', error);
    return [];
  }

  return (accessories || []).map(mapDbProductToProduct);
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, slug, name_sk)
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', productId)
    .order('is_featured', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return (data || []).map(mapDbProductToProduct);
}
