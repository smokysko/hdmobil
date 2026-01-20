import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getSupabase } from '../lib/supabase';

async function generateOrderNumber(): Promise<string> {
  const supabase = getSupabase();
  const { data: settings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'order_next_number')
    .single();

  const nextNumber = (settings?.value as number) || 1;
  const orderNumber = `OBJ${String(nextNumber).padStart(6, '0')}`;

  await supabase
    .from('settings')
    .update({ value: nextNumber + 1 })
    .eq('key', 'order_next_number');

  return orderNumber;
}

export const ordersRouter = router({
  create: publicProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        cartId: z.string(),
        shippingMethodId: z.string(),
        paymentMethodId: z.string(),
        discountCode: z.string().optional(),
        billingData: z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
          phone: z.string(),
          street: z.string(),
          city: z.string(),
          zip: z.string(),
          country: z.string().default('SK'),
          companyName: z.string().optional(),
          ico: z.string().optional(),
          dic: z.string().optional(),
          icDph: z.string().optional(),
        }),
        shippingData: z
          .object({
            firstName: z.string(),
            lastName: z.string(),
            street: z.string(),
            city: z.string(),
            zip: z.string(),
            country: z.string().default('SK'),
            phone: z.string(),
            companyName: z.string().optional(),
          })
          .optional(),
        customerNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('cart_id', input.cartId);

      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      const { data: shippingMethod } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('id', input.shippingMethodId)
        .single();

      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', input.paymentMethodId)
        .single();

      let subtotal = 0;
      let vatTotal = 0;

      const orderItems = cartItems.map((item) => {
        const lineTotal = (item.products?.price_with_vat || 0) * item.quantity;
        const lineTotalWithoutVat =
          (item.products?.price_without_vat || 0) * item.quantity;
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
      if (input.discountCode) {
        const { data: discount } = await supabase
          .from('discounts')
          .select('*')
          .eq('code', input.discountCode)
          .eq('is_active', true)
          .single();

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
          customer_id: input.customerId || null,
          status: 'pending',
          subtotal,
          vat_total: vatTotal,
          shipping_cost: shippingCost,
          payment_fee: paymentFee,
          discount_amount: discountAmount,
          total,
          discount_code: input.discountCode,
          shipping_method_id: input.shippingMethodId,
          shipping_method_name: shippingMethod?.name_sk,
          payment_method_id: input.paymentMethodId,
          payment_method_name: paymentMethod?.name_sk,
          payment_status: 'pending',
          billing_first_name: input.billingData.firstName,
          billing_last_name: input.billingData.lastName,
          billing_email: input.billingData.email,
          billing_phone: input.billingData.phone,
          billing_street: input.billingData.street,
          billing_city: input.billingData.city,
          billing_zip: input.billingData.zip,
          billing_country: input.billingData.country,
          billing_company_name: input.billingData.companyName,
          billing_ico: input.billingData.ico,
          billing_dic: input.billingData.dic,
          billing_ic_dph: input.billingData.icDph,
          shipping_first_name: input.shippingData?.firstName || input.billingData.firstName,
          shipping_last_name: input.shippingData?.lastName || input.billingData.lastName,
          shipping_street: input.shippingData?.street || input.billingData.street,
          shipping_city: input.shippingData?.city || input.billingData.city,
          shipping_zip: input.shippingData?.zip || input.billingData.zip,
          shipping_country: input.shippingData?.country || input.billingData.country,
          shipping_phone: input.shippingData?.phone || input.billingData.phone,
          customer_note: input.customerNote,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

      if (itemsError) throw itemsError;

      await supabase.from('cart_items').delete().eq('cart_id', input.cartId);

      return order;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', input.id)
        .single();

      if (orderError) throw orderError;

      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', input.id);

      return { ...order, items };
    }),

  getByCustomer: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data: orders, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('customer_id', input.customerId)
        .range((input.page - 1) * input.limit, input.page * input.limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        orders: orders || [],
        total: count || 0,
      };
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const updateData: Record<string, unknown> = { status: input.status };

      if (input.trackingNumber) {
        updateData.tracking_number = input.trackingNumber;
      }

      if (input.status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (input.status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', input.orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),

  updatePaymentStatus: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const updateData: Record<string, unknown> = { payment_status: input.paymentStatus };

      if (input.paymentStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', input.orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
});
