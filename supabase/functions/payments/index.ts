import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const TRUSTPAY_PROJECT_ID = Deno.env.get("TRUSTPAY_PROJECT_ID") || "";

const BANK_DETAILS = {
  iban: "SK12 1234 5678 9012 3456 7890",
  bic: "GIBASKBX",
  bankName: "Slovenska sporitelna",
  accountHolder: "HDmobil s.r.o.",
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: "card" | "google_pay" | "apple_pay" | "bank_transfer" | "cod";
  returnUrl: string;
  customerEmail?: string;
}

async function createStripePayment(
  data: PaymentRequest
): Promise<{ paymentUrl: string; paymentId: string }> {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price_data][currency]": data.currency.toLowerCase(),
      "line_items[0][price_data][product_data][name]": `Objednavka ${data.orderId}`,
      "line_items[0][price_data][unit_amount]": String(Math.round(data.amount * 100)),
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: `${data.returnUrl}?status=success&order=${data.orderId}`,
      cancel_url: `${data.returnUrl}?status=cancelled&order=${data.orderId}`,
      "metadata[order_id]": data.orderId,
      customer_email: data.customerEmail || "",
      "payment_intent_data[metadata][order_id]": data.orderId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stripe error: ${error.error?.message || "Unknown error"}`);
  }

  const session = await response.json();
  return { paymentUrl: session.url, paymentId: session.id };
}

function createTrustPayPayment(
  data: PaymentRequest
): { paymentUrl: string; paymentId: string } {
  const paymentId = `TP${Date.now()}`;
  const params = new URLSearchParams({
    AID: TRUSTPAY_PROJECT_ID,
    AMT: data.amount.toFixed(2),
    CUR: data.currency,
    REF: data.orderId,
    RURL: data.returnUrl,
    NURL: `${supabaseUrl}/functions/v1/payments/webhook-trustpay`,
    CURL: `${data.returnUrl}?status=cancelled`,
    LNG: "SK",
    SIG: "",
  });

  return {
    paymentUrl: `https://pay.trustpay.eu/v2/Checkout?${params.toString()}`,
    paymentId,
  };
}

function createBankTransferPayment(data: PaymentRequest): {
  paymentId: string;
  bankDetails: typeof BANK_DETAILS & {
    variableSymbol: string;
    amount: number;
    currency: string;
    qrCode: string;
  };
} {
  const variableSymbol = data.orderId.replace(/\D/g, "").slice(-10);
  const qrData = [
    "SPD*1.0",
    `ACC:${BANK_DETAILS.iban.replace(/\s/g, "")}`,
    `AM:${data.amount.toFixed(2)}`,
    `CC:${data.currency}`,
    `X-VS:${variableSymbol}`,
    `MSG:Objednavka ${data.orderId}`,
    `RN:${BANK_DETAILS.accountHolder}`,
  ].join("*");
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  return {
    paymentId: `BT${Date.now()}`,
    bankDetails: { ...BANK_DETAILS, variableSymbol, amount: data.amount, currency: data.currency, qrCode },
  };
}

function createCodPayment(data: PaymentRequest): { paymentId: string; codAmount: number } {
  return { paymentId: `COD${Date.now()}`, codAmount: data.amount };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (action === "webhook-stripe") {
      const body = await req.text();
      const event = JSON.parse(body);
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await supabase
            .from("orders")
            .update({ payment_status: "paid", payment_reference: session.payment_intent, paid_at: new Date().toISOString() })
            .eq("order_number", orderId);
        }
      }
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "webhook-trustpay") {
      const formData = await req.formData();
      const result = formData.get("RES");
      const orderId = formData.get("REF");
      if (result === "0" && orderId) {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", payment_reference: formData.get("PID"), paid_at: new Date().toISOString() })
          .eq("order_number", orderId);
      }
      return new Response("OK");
    }

    const body = await req.json();

    switch (action) {
      case "create": {
        const { orderId, method } = body;
        if (!orderId || !method) throw new Error("orderId a method su povinne");

        const { data: order } = await supabase
          .from("orders")
          .select("*, customer:customers(email)")
          .eq("id", orderId)
          .single();

        if (!order) throw new Error("Objednavka nebola najdena");
        if (order.payment_status === "paid") throw new Error("Objednavka je uz zaplatena");

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
            if (STRIPE_SECRET_KEY) {
              result = await createStripePayment(paymentData);
            } else if (TRUSTPAY_PROJECT_ID) {
              result = createTrustPayPayment(paymentData);
            } else {
              throw new Error("Platobna brana nie je nakonfigurovana");
            }
            await supabase.from("orders").update({ payment_status: "pending", payment_reference: result.paymentId }).eq("id", orderId);
            return new Response(
              JSON.stringify({ success: true, data: { type: "redirect", paymentUrl: result.paymentUrl, paymentId: result.paymentId } }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          case "bank_transfer": {
            result = createBankTransferPayment(paymentData);
            await supabase.from("orders").update({ payment_status: "awaiting", payment_reference: result.paymentId }).eq("id", orderId);
            return new Response(JSON.stringify({ success: true, data: { type: "bank_transfer", ...result } }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          case "cod": {
            result = createCodPayment(paymentData);
            await supabase.from("orders").update({ payment_status: "cod", payment_reference: result.paymentId }).eq("id", orderId);
            return new Response(
              JSON.stringify({ success: true, data: { type: "cod", ...result, message: "Platba bude vybrana pri doruceni" } }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          default:
            throw new Error(`Neznamy sposob platby: ${method}`);
        }
      }

      case "verify": {
        const { orderId } = body;
        if (!orderId) throw new Error("orderId je povinny");

        const { data: order } = await supabase
          .from("orders")
          .select("payment_status, payment_reference, total")
          .eq("id", orderId)
          .single();

        if (!order) throw new Error("Objednavka nebola najdena");

        return new Response(
          JSON.stringify({ success: true, data: { status: order.payment_status, isPaid: order.payment_status === "paid", reference: order.payment_reference } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark-paid": {
        const { orderId, reference } = body;
        if (!orderId) throw new Error("orderId je povinny");

        const { data: order, error } = await supabase
          .from("orders")
          .update({ payment_status: "paid", payment_reference: reference || `MANUAL${Date.now()}`, paid_at: new Date().toISOString() })
          .eq("id", orderId)
          .select()
          .single();

        if (error || !order) throw new Error("Nepodarilo sa aktualizovat platbu");

        return new Response(JSON.stringify({ success: true, message: "Platba bola oznacena ako prijata", data: order }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "methods": {
        const { data: methods } = await supabase.from("payment_methods").select("*").eq("is_active", true).order("sort_order");

        return new Response(JSON.stringify({ success: true, data: methods || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Neznama akcia: ${action}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznama chyba";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
