import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const paymentsRouter = router({
  // Get all payment methods
  getMethods: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }),

  // Get payment method by ID
  getMethodById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  // Create payment intent (for card payments)
  createIntent: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        amount: z.number(),
        currency: z.string().default('EUR'),
      })
    )
    .mutation(async ({ input }) => {
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', input.orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      // In real implementation, this would create a Stripe intent
      // For now, return a mock response
      return {
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency,
        clientSecret: `pi_test_${Math.random().toString(36).substr(2, 9)}`,
        status: 'requires_payment_method',
      };
    }),

  // Confirm payment
  confirm: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentMethodCode: z.string(),
        transactionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Update order payment status
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          transaction_id: input.transactionId,
        })
        .eq('id', input.orderId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        orderId: input.orderId,
        paymentStatus: 'paid',
      };
    }),

  // Get payment fee
  getFee: publicProcedure
    .input(
      z.object({
        paymentMethodId: z.string(),
        amount: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { data: method } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', input.paymentMethodId)
        .single();

      if (!method) {
        throw new Error('Payment method not found');
      }

      let fee = 0;
      if (method.fee_type === 'fixed') {
        fee = method.fee_fixed || 0;
      } else if (method.fee_type === 'percentage') {
        fee = (input.amount * (method.fee_percentage || 0)) / 100;
      }

      return {
        method: method.code,
        feeType: method.fee_type,
        fee,
        total: input.amount + fee,
      };
    }),

  // Webhook handler for payment confirmation
  handleWebhook: publicProcedure
    .input(
      z.object({
        provider: z.enum(['stripe', 'trustpay', 'bank_transfer']),
        eventType: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      // Handle different payment provider webhooks
      switch (input.provider) {
        case 'stripe':
          // Handle Stripe webhook
          return handleStripeWebhook(input.data);
        case 'trustpay':
          // Handle TrustPay webhook
          return handleTrustPayWebhook(input.data);
        case 'bank_transfer':
          // Handle bank transfer confirmation
          return handleBankTransferWebhook(input.data);
        default:
          throw new Error('Unknown payment provider');
      }
    }),
});

async function handleStripeWebhook(data: any) {
  // Implementation for Stripe webhook
  return { success: true, provider: 'stripe' };
}

async function handleTrustPayWebhook(data: any) {
  // Implementation for TrustPay webhook
  return { success: true, provider: 'trustpay' };
}

async function handleBankTransferWebhook(data: any) {
  // Implementation for bank transfer webhook
  return { success: true, provider: 'bank_transfer' };
}
