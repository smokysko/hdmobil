import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  getOrderById,
  getOrdersByCustomer,
  type CreateOrderParams,
} from '@/services/orders';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateOrderParams) => createOrder(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.cartId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });
}

export function useCustomerOrders(params: {
  customerId: string | undefined;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['orders', 'customer', params.customerId, params.page, params.limit],
    queryFn: () =>
      getOrdersByCustomer({
        customerId: params.customerId!,
        page: params.page,
        limit: params.limit,
      }),
    enabled: !!params.customerId,
  });
}
