// Supabase Edge Function: Platobné integrácie
// Kartové platby (Stripe/TrustPay), Google Pay, Apple Pay, bankový prevod, dobierka

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// API kľúče pre platobné brány
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const TRUSTPAY_API_KEY = Deno.env.get("TRUSTPAY_API_KEY") || "";
const TRUSTPAY_PROJECT_ID = Deno.env.get("TRUSTPAY_PROJECT_ID") || "";

// Bankové údaje pre prevody
const BANK_DETAILS = {
  iban: "SK12 1234 5678 9012 3456 7890",
  bic: "GIBASKBX",
  bankName: "Slovenská sporiteľňa",
  accountHolder: "HDmobil s.r.o.",
};

// Typy
interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: "card" | "google_pay" | "apple_pay" | "bank_transfer" | "cod";
  returnUrl: string;
  customerEmail?: string;
}

// === Stripe integrácia ===
async function createStripePayment(data: PaymentRequest): Promise<{ paymentUrl: string; paymentId: string }> {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "payment_method_types[]": data.method === "card" ? "card" : data.method === "google_pay" ? "card" : "card",
      "line_items[0][price_data][currency]": data.currency.toLowerCase(),
      "line_items[0][price_data][product_data][name]": `Objednávka ${data.orderId}`,
      "line_items[0][price_data][unit_amount]": String(Math.round(data.amount * 100)),
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": `${data.returnUrl}?status=success&order=${data.orderId}`,
      "cancel_url": `${data.returnUrl}?status=cancelled&order=${data.orderId}`,
      "metadata[order_id]": data.orderId,
      "customer_email": data.customerEmail || "",
      "payment_intent_data[metadata][order_id]": data.orderId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stripe error: ${error.error?.message || "Unknown error"}`);
  }

  const session = await response.json();
  
  return {
    paymentUrl: session.url,
    paymentId: session.id,
  };
}

// === TrustPay integrácia (slovenská platobná brána) ===
async function createTrustPayPayment(data: PaymentRequest): Promise<{ paymentUrl: string; paymentId: string }> {
  const paymentId = `TP${Date.now()}`;
  
  // TrustPay redirect URL
  const params = new URLSearchParams({
    AID: TRUSTPAY_PROJECT_ID,
    AMT: data.amount.toFixed(2),
    CUR: data.currency,
    REF: data.orderId,
    RURL: data.returnUrl,
    NURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payments/webhook-trustpay`,
    CURL: `${data.returnUrl}?status=cancelled`,
    LNG: "SK",
    SIG: "", // TODO: Vypočítať HMAC podpis
  });

  // Pre Google Pay / Apple Pay
  if (data.method === "google_pay" || data.method === "apple_pay") {
    params.set("PaymentType", data.method === "google_pay" ? "GooglePay" : "ApplePay");
  }

  return {
    paymentUrl: `https://pay.trustpay.eu/v2/Checkout?${params.toString()}`,
    paymentId,
  };
}

// === Bankový prevod ===
function createBankTransferPayment(data: PaymentRequest): { 
  paymentId: string; 
  bankDetails: typeof BANK_DETAILS & { 
    variableSymbol: string; 
    amount: number; 
    currency: string;
    qrCode: string;
  } 
} {
  const variableSymbol = data.orderId.replace(/\D/g, "").slice(-10);
  
  // Generovanie QR kódu pre platbu (PAY by square formát)
  const qrData = [
    "SPD*1.0",
    `ACC:${BANK_DETAILS.iban.replace(/\s/g, "")}`,
    `AM:${data.amount.toFixed(2)}`,
    `CC:${data.currency}`,
    `X-VS:${variableSymbol}`,
    `MSG:Objednavka ${data.orderId}`,
    `RN:${BANK_DETAILS.accountHolder}`,
  ].join("*");
  
  // Base64 encode pre QR
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  return {
    paymentId: `BT${Date.now()}`,
    bankDetails: {
      ...BANK_DETAILS,
      variableSymbol,
      amount: data.amount,
      currency: data.currency,
      qrCode,
    },
  };
}

// === Dobierka (COD) ===
function createCodPayment(data: PaymentRequest): { paymentId: string; codAmount: number } {
  return {
    paymentId: `COD${Date.now()}`,
    codAmount: data.amount,
  };
}

// === Webhook handler pre Stripe ===
async function handleStripeWebhook(req: Request, supabase: any): Promise<Response> {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  
  // TODO: Overiť webhook podpis
  
  const event = JSON.parse(body);
  
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    
    if (orderId) {
      // Aktualizácia stavu platby
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_reference: session.payment_intent,
          paid_at: new Date().toISOString(),
        })
        .eq("order_number", orderId);
      
      // Generovanie faktúry
      await fetch(`${supabaseUrl}/functions/v1/invoices/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ orderId }),
      });
    }
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

// === Webhook handler pre TrustPay ===
async function handleTrustPayWebhook(req: Request, supabase: any): Promise<Response> {
  const formData = await req.formData();
  const result = formData.get("RES");
  const orderId = formData.get("REF");
  
  // TODO: Overiť podpis
  
  if (result === "0" && orderId) {
    // Úspešná platba
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_reference: formData.get("PID"),
        paid_at: new Date().toISOString(),
      })
      .eq("order_number", orderId);
  }
  
  return new Response("OK");
}

// === Hlavný handler ===
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    // Webhook handlery
    if (action === "webhook-stripe") {
      return handleStripeWebhook(req, supabase);
    }
    if (action === "webhook-trustpay") {
      return handleTrustPayWebhook(req, supabase);
    }

    const body = await req.json();

    switch (action) {
      case "create": {
        const { orderId, method } = body;
        
        if (!orderId || !method) {
          throw new Error("orderId a method sú povinné");
        }

        // Získanie objednávky
        const { data: order } = await supabase
          .from("orders")
          .select(`
            *,
            customer:customers (email)
          `)
          .eq("id", orderId)
          .single();

        if (!order) {
          throw new Error("Objednávka nebola nájdená");
        }

        if (order.payment_status === "paid") {
          throw new Error("Objednávka je už zaplatená");
        }

        const paymentData: PaymentRequest = {
          orderId: order.order_number,
          amount: order.total,
          currency: order.currency || "EUR",
          method,
          returnUrl: body.returnUrl || "https://hdmobil.sk/order/complete",
          customerEmail: order.customer?.email,
        };

        let result;

        switch (method) {
          case "card":
          case "google_pay":
          case "apple_pay": {
            // Použiť Stripe alebo TrustPay podľa konfigurácie
            if (STRIPE_SECRET_KEY) {
              result = await createStripePayment(paymentData);
            } else if (TRUSTPAY_API_KEY) {
              result = await createTrustPayPayment(paymentData);
            } else {
              throw new Error("Platobná brána nie je nakonfigurovaná");
            }
            
            // Aktualizácia objednávky
            await supabase
              .from("orders")
              .update({
                payment_status: "pending",
                payment_reference: result.paymentId,
              })
              .eq("id", orderId);

            return new Response(
              JSON.stringify({
                success: true,
                data: {
                  type: "redirect",
                  paymentUrl: result.paymentUrl,
                  paymentId: result.paymentId,
                },
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          case "bank_transfer": {
            result = createBankTransferPayment(paymentData);
            
            await supabase
              .from("orders")
              .update({
                payment_status: "awaiting",
                payment_reference: result.paymentId,
              })
              .eq("id", orderId);

            return new Response(
              JSON.stringify({
                success: true,
                data: {
                  type: "bank_transfer",
                  ...result,
                },
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          case "cod": {
            result = createCodPayment(paymentData);
            
            await supabase
              .from("orders")
              .update({
                payment_status: "cod",
                payment_reference: result.paymentId,
              })
              .eq("id", orderId);

            return new Response(
              JSON.stringify({
                success: true,
                data: {
                  type: "cod",
                  ...result,
                  message: "Platba bude vybraná pri doručení",
                },
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          default:
            throw new Error(`Neznámy spôsob platby: ${method}`);
        }
      }

      case "verify": {
        const { orderId, paymentId } = body;
        
        if (!orderId) {
          throw new Error("orderId je povinný");
        }

        const { data: order } = await supabase
          .from("orders")
          .select("payment_status, payment_reference, total")
          .eq("id", orderId)
          .single();

        if (!order) {
          throw new Error("Objednávka nebola nájdená");
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              status: order.payment_status,
              isPaid: order.payment_status === "paid",
              reference: order.payment_reference,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark-paid": {
        // Admin only - manuálne označenie ako zaplatené (pre bankové prevody)
        const { orderId, reference } = body;
        
        if (!orderId) {
          throw new Error("orderId je povinný");
        }

        const { data: order, error } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            payment_reference: reference || `MANUAL${Date.now()}`,
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .select()
          .single();

        if (error || !order) {
          throw new Error("Nepodarilo sa aktualizovať platbu");
        }

        // Generovanie faktúry
        await fetch(`${supabaseUrl}/functions/v1/invoices/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ orderId }),
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: "Platba bola označená ako prijatá",
            data: order,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "refund": {
        const { orderId, amount, reason } = body;
        
        if (!orderId) {
          throw new Error("orderId je povinný");
        }

        const { data: order } = await supabase
          .from("orders")
          .select("payment_reference, payment_status, total")
          .eq("id", orderId)
          .single();

        if (!order) {
          throw new Error("Objednávka nebola nájdená");
        }

        if (order.payment_status !== "paid") {
          throw new Error("Objednávka nie je zaplatená");
        }

        const refundAmount = amount || order.total;

        // Stripe refund
        if (STRIPE_SECRET_KEY && order.payment_reference?.startsWith("pi_")) {
          const response = await fetch("https://api.stripe.com/v1/refunds", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              payment_intent: order.payment_reference,
              amount: String(Math.round(refundAmount * 100)),
              reason: reason || "requested_by_customer",
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Refund error: ${error.error?.message}`);
          }
        }

        // Aktualizácia objednávky
        await supabase
          .from("orders")
          .update({
            payment_status: refundAmount >= order.total ? "refunded" : "partially_refunded",
            refunded_amount: refundAmount,
            refunded_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Vrátených ${refundAmount} ${order.currency || "EUR"}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "methods": {
        // Získanie dostupných platobných metód
        const { data: methods } = await supabase
          .from("payment_methods")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        return new Response(
          JSON.stringify({
            success: true,
            data: methods || [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Neznáma akcia: ${action}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznáma chyba";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
