import { useQuery } from '@tanstack/react-query';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductAccessories,
  getProductsByCategory,
  getFeaturedProducts,
  getNewProducts,
  searchProducts,
  type ProductsListParams,
} from '@/services/products';

export function useProducts(params: ProductsListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });
}

export function useProductAccessories(productId: string | undefined) {
  return useQuery({
    queryKey: ['product', productId, 'accessories'],
    queryFn: () => getProductAccessories(productId!),
    enabled: !!productId,
  });
}

export function useProductsByCategory(categoryId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ['products', 'category', categoryId, limit],
    queryFn: () => getProductsByCategory(categoryId!, limit),
    enabled: !!categoryId,
  });
}

export function useFeaturedProducts(limit?: number) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => getFeaturedProducts(limit),
  });
}

export function useNewProducts(limit?: number) {
  return useQuery({
    queryKey: ['products', 'new', limit],
    queryFn: () => getNewProducts(limit),
  });
}

export function useProductSearch(query: string, limit?: number) {
  return useQuery({
    queryKey: ['products', 'search', query, limit],
    queryFn: () => searchProducts(query, limit),
    enabled: query.length > 0,
  });
}
