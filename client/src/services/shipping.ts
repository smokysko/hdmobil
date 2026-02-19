import { supabase } from '@/lib/supabase';

export interface ShippingMethod {
  id: string;
  code: string;
  name_sk: string;
  name_cs: string | null;
  name_pl: string | null;
  description_sk: string | null;
  description_cs: string | null;
  price: number;
  free_shipping_threshold: number | null;
  delivery_days_min: number | null;
  delivery_days_max: number | null;
  api_provider: string | null;
  api_config: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  code: string;
  payment_type: string;
  name_sk: string;
  name_cs: string | null;
  description_sk: string | null;
  description_cs: string | null;
  fee_fixed: number;
  fee_percentage: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}
