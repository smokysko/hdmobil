import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateCart,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartRecommendations,
} from '@/services/cart';

export function useCartInit(params: { customerId?: string; sessionId?: string }) {
  return useQuery({
    queryKey: ['cart', 'init', params],
    queryFn: () => getOrCreateCart(params),
    enabled: !!(params.customerId || params.sessionId),
  });
}

export function useCart(cartId: string | undefined) {
  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => getCart(cartId!),
    enabled: !!cartId,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.cartId] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCartRecommendations(cartId: string | undefined) {
  return useQuery({
    queryKey: ['cart', cartId, 'recommendations'],
    queryFn: () => getCartRecommendations(cartId!),
    enabled: !!cartId,
  });
}
