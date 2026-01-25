import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = req.method !== "GET" ? await req.json() : {};

    const authHeader = req.headers.get("Authorization");
    let customerId: string | null = null;

    if (authHeader) {
      const {
        data: { user },
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) {
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        customerId = customer?.id || null;
      }
    }

    switch (action) {
      case "create": {
        const {
          items,
          billingFirstName,
          billingLastName,
          billingEmail,
          billingPhone,
          billingStreet,
          billingCity,
          billingZip,
          billingCountry,
          shippingMethodId,
          paymentMethodId,
          customerNote,
        } = body;

        if (!items || items.length === 0) {
          throw new Error("Kosik je prazdny");
        }

        if (!billingEmail || !billingFirstName || !billingLastName) {
          throw new Error("Fakturacne udaje su povinne");
        }

        const { data: shippingMethod } = shippingMethodId
          ? await supabase.from("shipping_methods").select("*").eq("id", shippingMethodId).single()
          : { data: null };

        const { data: paymentMethod } = paymentMethodId
          ? await supabase.from("payment_methods").select("*").eq("id", paymentMethodId).single()
          : { data: null };

        let subtotalWithoutVat = 0;
        let vatTotal = 0;
        const orderItems: {
          product_id: string;
          product_sku: string;
          product_name: string;
          product_image_url: string;
          quantity: number;
          price_without_vat: number;
          price_with_vat: number;
          vat_rate: number;
          vat_mode: string;
          line_total: number;
        }[] = [];

        for (const item of items) {
          const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.productId)
            .single();

          if (!product) {
            throw new Error(`Produkt ${item.productId} nebol najdeny`);
          }

          const quantity = item.quantity || 1;
          const priceWithVat = product.price_with_vat;
          const priceWithoutVat = product.price_without_vat;
          const vatRate = product.vat_rate || 20;
          const lineTotal = priceWithVat * quantity;

          subtotalWithoutVat += priceWithoutVat * quantity;
          vatTotal += (priceWithVat - priceWithoutVat) * quantity;

          orderItems.push({
            product_id: product.id,
            product_sku: product.sku || "",
            product_name: product.name_sk,
            product_image_url: product.main_image_url || "",
            quantity,
            price_without_vat: priceWithoutVat,
            price_with_vat: priceWithVat,
            vat_rate: vatRate,
            vat_mode: product.vat_mode || "standard",
            line_total: lineTotal,
          });
        }

        const shippingCost = shippingMethod?.price || 0;
        const paymentFee = paymentMethod?.fee_fixed || 0;
        const total = subtotalWithoutVat + vatTotal + shippingCost + paymentFee;

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            customer_id: customerId,
            status: "pending",
            subtotal: subtotalWithoutVat,
            vat_total: vatTotal,
            shipping_cost: shippingCost,
            payment_fee: paymentFee,
            total,
            currency: "EUR",
            shipping_method_id: shippingMethodId || null,
            shipping_method_name: shippingMethod?.name_sk || null,
            payment_method_id: paymentMethodId || null,
            payment_method_name: paymentMethod?.name_sk || null,
            payment_status: "pending",
            billing_first_name: billingFirstName,
            billing_last_name: billingLastName,
            billing_email: billingEmail,
            billing_phone: billingPhone || null,
            billing_street: billingStreet,
            billing_city: billingCity,
            billing_zip: billingZip,
            billing_country: billingCountry || "SK",
            shipping_first_name: billingFirstName,
            shipping_last_name: billingLastName,
            shipping_street: billingStreet,
            shipping_city: billingCity,
            shipping_zip: billingZip,
            shipping_country: billingCountry || "SK",
            customer_note: customerNote || null,
          })
          .select()
          .single();

        if (orderError || !order) {
          throw new Error("Nepodarilo sa vytvorit objednavku: " + (orderError?.message || "Neznama chyba"));
        }

        const itemsWithOrderId = orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);

        if (itemsError) {
          await supabase.from("orders").delete().eq("id", order.id);
          throw new Error("Nepodarilo sa ulozit polozky objednavky");
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Objednavka bola uspesne vytvorena",
            data: {
              orderId: order.id,
              orderNumber: order.order_number,
              total: order.total,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        if (!customerId) {
          throw new Error("Pre zobrazenie objednavok sa musite prihlasit");
        }

        const { data: orders } = await supabase
          .from("orders")
          .select("id, order_number, status, payment_status, total, created_at, tracking_number, shipping_method:shipping_methods(name_sk)")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });

        return new Response(JSON.stringify({ success: true, data: orders || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "detail": {
        const { orderId } = body;
        if (!orderId) throw new Error("orderId je povinny");

        const { data: order } = await supabase
          .from("orders")
          .select("*, items:order_items(*), shipping_method:shipping_methods(*), payment_method:payment_methods(*), invoice:invoices(*)")
          .eq("id", orderId)
          .single();

        if (!order) throw new Error("Objednavka nebola najdena");

        if (customerId && order.customer_id !== customerId) {
          throw new Error("Nemate opravnenie zobrazit tuto objednavku");
        }

        return new Response(JSON.stringify({ success: true, data: order }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update-status": {
        const { orderId, status, trackingNumber, notifyCustomer } = body;
        if (!orderId || !status) throw new Error("orderId a status su povinne");

        const updateData: Record<string, unknown> = { status };
        if (trackingNumber) updateData.tracking_number = trackingNumber;
        if (status === "shipped" && !trackingNumber) {
          throw new Error("Pre stav 'odoslane' je potrebne tracking cislo");
        }

        const { data: order, error } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", orderId)
          .select("*, customer:customers(email, first_name)")
          .single();

        if (error || !order) throw new Error("Nepodarilo sa aktualizovat objednavku");

        if (notifyCustomer && order.customer?.email) {
          // TODO: Implement email sending
        }

        return new Response(
          JSON.stringify({ success: true, message: "Stav objednavky bol aktualizovany", data: order }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "tracking": {
        const { orderNumber } = body;
        if (!orderNumber) throw new Error("Cislo objednavky je povinne");

        const { data: order } = await supabase
          .from("orders")
          .select("order_number, status, tracking_number, shipping_method:shipping_methods(name_sk, tracking_url_template)")
          .eq("order_number", orderNumber)
          .single();

        if (!order) throw new Error("Objednavka nebola najdena");

        let trackingUrl = null;
        if (order.tracking_number && order.shipping_method?.tracking_url_template) {
          trackingUrl = order.shipping_method.tracking_url_template.replace("{tracking_number}", order.tracking_number);
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              orderNumber: order.order_number,
              status: order.status,
              trackingNumber: order.tracking_number,
              trackingUrl,
              shippingMethod: order.shipping_method?.name_sk,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
