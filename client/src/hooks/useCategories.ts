import { useQuery } from '@tanstack/react-query';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  getRootCategories,
  getSubcategories,
} from '@/services/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['category', 'slug', slug],
    queryFn: () => getCategoryBySlug(slug!),
    enabled: !!slug,
  });
}

export function useRootCategories() {
  return useQuery({
    queryKey: ['categories', 'root'],
    queryFn: getRootCategories,
  });
}

export function useSubcategories(parentId: string | undefined) {
  return useQuery({
    queryKey: ['categories', 'subcategories', parentId],
    queryFn: () => getSubcategories(parentId!),
    enabled: !!parentId,
  });
}
