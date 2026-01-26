import { supabase } from '@/lib/supabase';

export interface ShippingMethod {
  id: string;
  name_sk: string;
  name_cs: string | null;
  description_sk: string | null;
  description_cs: string | null;
  price: number;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name_sk: string;
  name_cs: string | null;
  description_sk: string | null;
  description_cs: string | null;
  fee_fixed: number;
  fee_percent: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
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
