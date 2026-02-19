import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FINBY_API_KEY = "mhEBk0gVYutUu0lBvCypxLhlaQxrmIky";
const FINBY_ACCOUNT_ID = "4107647532";

const FINBY_CARD_URL = "https://amapi.finby.eu/mapi5/Card/PayPopup";
const FINBY_WIRE_URL = "https://amapi.finby.eu/mapi5/wire/paypopup";

const BANK_DETAILS = {
  iban: "SK12 1234 5678 9012 3456 7890",
  bic: "GIBASKBX",
  bankName: "Slovenska sporitelna",
  accountHolder: "HDmobil s.r.o.",
};

async function computeHmacSha256(message: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function sanitizePostcode(postcode: string): string {
  return (postcode || "").replace(/[^a-zA-Z0-9]/g, "");
}

interface CardPaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  cardHolder: string;
  email: string;
  billingStreet: string;
  billingCity: string;
  billingCountry: string;
  billingPostcode: string;
  returnUrl: string;
  cancelUrl: string;
  notificationUrl: string;
}

async function createFinbyCardPayment(p: CardPaymentParams): Promise<{ paymentUrl: string; paymentId: string }> {
  const amount = p.amount.toFixed(2);
  const postcode = sanitizePostcode(p.billingPostcode);
  const cardHolder = p.cardHolder.length < 3 ? p.cardHolder.padEnd(3, " ") : p.cardHolder;

  const sigMessage = `${FINBY_ACCOUNT_ID}/${amount}/${p.currency}/${p.orderNumber}/0/${p.billingCity}/${p.billingCountry}/${postcode}/${p.billingStreet}/${cardHolder}/${p.email}`;
  const signature = await computeHmacSha256(sigMessage, FINBY_API_KEY);

  const params = new URLSearchParams({
    AccountId: FINBY_ACCOUNT_ID,
    Amount: amount,
    Currency: p.currency,
    Reference: p.orderNumber,
    PaymentType: "0",
    CardHolder: cardHolder,
    BillingCity: p.billingCity,
    BillingCountry: p.billingCountry,
    BillingPostcode: postcode,
    BillingStreet: p.billingStreet,
    Email: p.email,
    ReturnUrl: p.returnUrl,
    CancelUrl: p.cancelUrl,
    ErrorUrl: p.cancelUrl,
    NotificationUrl: p.notificationUrl,
    Localization: "SK",
    Signature: signature,
  });

  return {
    paymentUrl: `${FINBY_CARD_URL}?${params.toString()}`,
    paymentId: `FINBY_CARD_${p.orderNumber}`,
  };
}

interface WirePaymentParams {
  orderNumber: string;
  amount: number;
  currency: string;
  email?: string;
  returnUrl: string;
  cancelUrl: string;
  notificationUrl: string;
}

async function createFinbyWirePayment(p: WirePaymentParams): Promise<{ paymentUrl: string; paymentId: string }> {
  const amount = p.amount.toFixed(2);
  const sigMessage = `${FINBY_ACCOUNT_ID}/${amount}/${p.currency}/${p.orderNumber}/0`;
  const signature = await computeHmacSha256(sigMessage, FINBY_API_KEY);

  const params = new URLSearchParams({
    AccountId: FINBY_ACCOUNT_ID,
    Amount: amount,
    Currency: p.currency,
    Reference: p.orderNumber,
    PaymentType: "0",
    ReturnUrl: p.returnUrl,
    CancelUrl: p.cancelUrl,
    ErrorUrl: p.cancelUrl,
    NotificationUrl: p.notificationUrl,
    Localization: "SK",
    Signature: signature,
  });

  if (p.email) params.set("Email", p.email);

  return {
    paymentUrl: `${FINBY_WIRE_URL}?${params.toString()}`,
    paymentId: `FINBY_WIRE_${p.orderNumber}`,
  };
}

function createBankTransferPayment(orderId: string, orderNumber: string, amount: number, currency: string) {
  const variableSymbol = orderNumber.replace(/\D/g, "").slice(-10);
  const qrData = [
    "SPD*1.0",
    `ACC:${BANK_DETAILS.iban.replace(/\s/g, "")}`,
    `AM:${amount.toFixed(2)}`,
    `CC:${currency}`,
    `X-VS:${variableSymbol}`,
    `MSG:Objednavka ${orderNumber}`,
    `RN:${BANK_DETAILS.accountHolder}`,
  ].join("*");
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  return {
    paymentId: `BT${Date.now()}`,
    bankDetails: { ...BANK_DETAILS, variableSymbol, amount, currency, qrCode },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    if (action === "webhook-finby") {
      const reference = url.searchParams.get("Reference") || url.searchParams.get("REF");
      const resultCode = url.searchParams.get("ResultCode") || url.searchParams.get("RES");
      const paymentRequestId = url.searchParams.get("PaymentRequestId") || url.searchParams.get("PID");

      if (resultCode === "0" && reference) {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            payment_reference: paymentRequestId || reference,
            paid_at: new Date().toISOString(),
          })
          .eq("order_number", reference);
      }
      return new Response("OK", { status: 200 });
    }

    const body = req.method === "POST" ? await req.json() : {};

    switch (action) {
      case "create": {
        const { orderId, method, returnUrl, cancelUrl } = body;
        if (!orderId || !method) throw new Error("orderId a method su povinne");

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("id, order_number, total, billing_email, billing_first_name, billing_last_name, billing_street, billing_city, billing_zip, billing_country, payment_status")
          .eq("id", orderId)
          .single();

        if (orderError || !order) throw new Error("Objednavka nebola najdena");
        if (order.payment_status === "paid") throw new Error("Objednavka je uz zaplatena");

        const notificationUrl = `${supabaseUrl}/functions/v1/payments/webhook-finby`;
        const baseReturnUrl = returnUrl || "https://hdmobil.sk/success";
        const baseCancelUrl = cancelUrl || "https://hdmobil.sk/checkout";
        const currency = "EUR";
        const cardHolder = `${order.billing_first_name || ""} ${order.billing_last_name || ""}`.trim() || "Zakaznik";

        let result: { paymentUrl: string; paymentId: string };

        if (method === "card") {
          result = await createFinbyCardPayment({
            orderId: order.id,
            orderNumber: order.order_number,
            amount: parseFloat(order.total),
            currency,
            cardHolder,
            email: order.billing_email || "",
            billingStreet: order.billing_street || "N/A",
            billingCity: order.billing_city || "N/A",
            billingCountry: order.billing_country || "SK",
            billingPostcode: order.billing_zip || "00000",
            returnUrl: `${baseReturnUrl}?orderNumber=${encodeURIComponent(order.order_number)}&orderId=${order.id}`,
            cancelUrl: baseCancelUrl,
            notificationUrl,
          });
        } else if (method === "wire") {
          result = await createFinbyWirePayment({
            orderNumber: order.order_number,
            amount: parseFloat(order.total),
            currency,
            email: order.billing_email || undefined,
            returnUrl: `${baseReturnUrl}?orderNumber=${encodeURIComponent(order.order_number)}&orderId=${order.id}`,
            cancelUrl: baseCancelUrl,
            notificationUrl,
          });
        } else if (method === "bank_transfer") {
          const bt = createBankTransferPayment(order.id, order.order_number, parseFloat(order.total), currency);
          await supabase.from("orders").update({ payment_status: "awaiting", payment_reference: bt.paymentId }).eq("id", orderId);
          return new Response(JSON.stringify({ success: true, data: { type: "bank_transfer", ...bt } }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (method === "cod") {
          await supabase.from("orders").update({ payment_status: "cod", payment_reference: `COD${Date.now()}` }).eq("id", orderId);
          return new Response(JSON.stringify({ success: true, data: { type: "cod", message: "Platba bude vybrana pri doruceni" } }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          throw new Error(`Neznamy sposob platby: ${method}`);
        }

        await supabase.from("orders").update({ payment_status: "pending", payment_reference: result.paymentId }).eq("id", orderId);

        return new Response(
          JSON.stringify({ success: true, data: { type: "redirect", paymentUrl: result.paymentUrl, paymentId: result.paymentId } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
