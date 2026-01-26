import { useQuery } from '@tanstack/react-query';
import { getShippingMethods, getPaymentMethods } from '@/services/shipping';

export function useShippingMethods() {
  return useQuery({
    queryKey: ['shipping-methods'],
    queryFn: getShippingMethods,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
  });
}
