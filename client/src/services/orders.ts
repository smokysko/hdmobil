import { supabase } from '@/lib/supabase';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_sku: string | null;
  product_name: string | null;
  product_image_url: string | null;
  quantity: number;
  price_without_vat: number | null;
  price_with_vat: number | null;
  vat_rate: number | null;
  vat_mode: string | null;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: string;
  subtotal: number;
  vat_total: number;
  shipping_cost: number;
  payment_fee: number;
  discount_amount: number;
  total: number;
  discount_code: string | null;
  shipping_method_id: string | null;
  shipping_method_name: string | null;
  payment_method_id: string | null;
  payment_method_name: string | null;
  payment_status: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_street: string;
  billing_city: string;
  billing_zip: string;
  billing_country: string;
  billing_company_name: string | null;
  billing_ico: string | null;
  billing_dic: string | null;
  billing_ic_dph: string | null;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone: string;
  customer_note: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  country?: string;
  companyName?: string;
  ico?: string;
  dic?: string;
  icDph?: string;
}

export interface ShippingData {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  zip: string;
  country?: string;
  phone: string;
  companyName?: string;
}

export interface CreateOrderParams {
  customerId?: string;
  cartId: string;
  shippingMethodId: string;
  paymentMethodId: string;
  discountCode?: string;
  billingData: BillingData;
  shippingData?: ShippingData;
  customerNote?: string;
}

async function generateOrderNumber(): Promise<string> {
  const { data: settings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'order_next_number')
    .maybeSingle();

  const nextNumber = (settings?.value as number) || 1;
  const orderNumber = `OBJ${String(nextNumber).padStart(6, '0')}`;

  await supabase
    .from('settings')
    .upsert({ key: 'order_next_number', value: nextNumber + 1 });

  return orderNumber;
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('cart_id', params.cartId);

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  const { data: shippingMethod } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('id', params.shippingMethodId)
    .maybeSingle();

  const { data: paymentMethod } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('id', params.paymentMethodId)
    .maybeSingle();

  let subtotal = 0;
  let vatTotal = 0;

  const orderItems = cartItems.map((item) => {
    const lineTotal = (item.products?.price_with_vat || 0) * item.quantity;
    const lineTotalWithoutVat = (item.products?.price_without_vat || 0) * item.quantity;
    const lineVat = lineTotal - lineTotalWithoutVat;

    subtotal += lineTotalWithoutVat;
    vatTotal += lineVat;

    return {
      product_id: item.product_id,
      product_sku: item.products?.sku,
      product_name: item.products?.name_sk,
      product_image_url: item.products?.main_image_url,
      quantity: item.quantity,
      price_without_vat: item.products?.price_without_vat,
      price_with_vat: item.products?.price_with_vat,
      vat_rate: item.products?.vat_rate,
      vat_mode: item.products?.vat_mode,
      line_total: lineTotal,
    };
  });

  const shippingCost = shippingMethod?.price || 0;
  const paymentFee = paymentMethod?.fee_fixed || 0;

  let discountAmount = 0;
  if (params.discountCode) {
    const { data: discount } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', params.discountCode)
      .eq('is_active', true)
      .maybeSingle();

    if (discount) {
      if (discount.discount_type === 'percentage') {
        discountAmount = ((subtotal + vatTotal) * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }
    }
  }

  const total = subtotal + vatTotal + shippingCost + paymentFee - discountAmount;
  const orderNumber = await generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: params.customerId || null,
      status: 'pending',
      subtotal,
      vat_total: vatTotal,
      shipping_cost: shippingCost,
      payment_fee: paymentFee,
      discount_amount: discountAmount,
      total,
      discount_code: params.discountCode,
      shipping_method_id: params.shippingMethodId,
      shipping_method_name: shippingMethod?.name_sk,
      payment_method_id: params.paymentMethodId,
      payment_method_name: paymentMethod?.name_sk,
      payment_status: 'pending',
      billing_first_name: params.billingData.firstName,
      billing_last_name: params.billingData.lastName,
      billing_email: params.billingData.email,
      billing_phone: params.billingData.phone,
      billing_street: params.billingData.street,
      billing_city: params.billingData.city,
      billing_zip: params.billingData.zip,
      billing_country: params.billingData.country || 'SK',
      billing_company_name: params.billingData.companyName,
      billing_ico: params.billingData.ico,
      billing_dic: params.billingData.dic,
      billing_ic_dph: params.billingData.icDph,
      shipping_first_name: params.shippingData?.firstName || params.billingData.firstName,
      shipping_last_name: params.shippingData?.lastName || params.billingData.lastName,
      shipping_street: params.shippingData?.street || params.billingData.street,
      shipping_city: params.shippingData?.city || params.billingData.city,
      shipping_zip: params.shippingData?.zip || params.billingData.zip,
      shipping_country: params.shippingData?.country || params.billingData.country || 'SK',
      shipping_phone: params.shippingData?.phone || params.billingData.phone,
      customer_note: params.customerNote,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) throw itemsError;

  await supabase.from('cart_items').delete().eq('cart_id', params.cartId);

  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!order) return null;

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  return { ...order, items: items || [] };
}

export async function getOrdersByCustomer(params: {
  customerId: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; total: number }> {
  const { customerId: authUserId, page = 1, limit = 10 } = params;

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (!customer) {
    return { orders: [], total: 0 };
  }

  const { data: orders, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('customer_id', customer.id)
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    orders: orders || [],
    total: count || 0,
  };
}
