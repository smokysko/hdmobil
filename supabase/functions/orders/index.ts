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
