// Supabase Edge Function: Objednávky
// Vytvorenie, správa a tracking objednávok

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Typy
interface OrderItem {
  productId: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
}

interface BillingAddress extends ShippingAddress {
  companyName?: string;
  ico?: string;
  dic?: string;
  icDph?: string;
}

interface CreateOrderInput {
  items?: OrderItem[];
  cartId?: string;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  shippingMethodId: string;
  paymentMethodId: string;
  discountCode?: string;
  note?: string;
  isCompany: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = req.method !== "GET" ? await req.json() : {};
    
    // Autentifikácia
    const authHeader = req.headers.get("Authorization");
    let customerId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
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
        const input: CreateOrderInput = body;
        
        // Validácia
        if (!input.shippingAddress || !input.billingAddress) {
          throw new Error("Dodacia a fakturačná adresa sú povinné");
        }
        if (!input.shippingMethodId || !input.paymentMethodId) {
          throw new Error("Spôsob dopravy a platby sú povinné");
        }

        // Získanie položiek (z košíka alebo priamo)
        let orderItems: { product: any; quantity: number }[] = [];
        
        if (input.cartId) {
          const { data: cartItems } = await supabase
            .from("cart_items")
            .select(`
              quantity,
              product:products (*)
            `)
            .eq("cart_id", input.cartId);
          
          orderItems = cartItems?.map(ci => ({
            product: ci.product,
            quantity: ci.quantity,
          })) || [];
        } else if (input.items && input.items.length > 0) {
          for (const item of input.items) {
            const { data: product } = await supabase
              .from("products")
              .select("*")
              .eq("id", item.productId)
              .single();
            
            if (product) {
              orderItems.push({ product, quantity: item.quantity });
            }
          }
        }

        if (orderItems.length === 0) {
          throw new Error("Objednávka musí obsahovať aspoň jeden produkt");
        }

        // Kontrola dostupnosti a výpočet cien
        let subtotal = 0;
        let vatTotal = 0;
        const itemsToInsert = [];

        for (const item of orderItems) {
          const product = item.product;
          
          // Kontrola skladu
          if (product.track_stock && product.stock_quantity < item.quantity) {
            throw new Error(`Produkt "${product.name_sk}" nie je dostupný v požadovanom množstve`);
          }

          const lineSubtotal = product.price_without_vat * item.quantity;
          const lineVat = (product.price_with_vat - product.price_without_vat) * item.quantity;
          const lineTotal = product.price_with_vat * item.quantity;

          subtotal += lineSubtotal;
          vatTotal += lineVat;

          itemsToInsert.push({
            product_id: product.id,
            product_sku: product.sku,
            product_name: product.name_sk,
            quantity: item.quantity,
            price_without_vat: product.price_without_vat,
            price_with_vat: product.price_with_vat,
            vat_rate: product.vat_rate,
            vat_mode: product.vat_mode,
            line_total: lineTotal,
            // Pre bazár: uložiť nákupnú cenu pre výpočet marže
            purchase_price: product.is_bazaar ? product.purchase_price : null,
          });
        }

        // Získanie dopravy
        const { data: shippingMethod } = await supabase
          .from("shipping_methods")
          .select("*")
          .eq("id", input.shippingMethodId)
          .single();

        if (!shippingMethod) {
          throw new Error("Neplatný spôsob dopravy");
        }

        const shippingCost = shippingMethod.price;
        const shippingVat = shippingMethod.price * (shippingMethod.vat_rate / 100);

        // Získanie platby
        const { data: paymentMethod } = await supabase
          .from("payment_methods")
          .select("*")
          .eq("id", input.paymentMethodId)
          .single();

        if (!paymentMethod) {
          throw new Error("Neplatný spôsob platby");
        }

        const paymentFee = paymentMethod.fee || 0;

        // Aplikovanie zľavy
        let discountAmount = 0;
        let discountId: string | null = null;

        if (input.discountCode) {
          const { data: discount } = await supabase
            .from("discounts")
            .select("*")
            .eq("code", input.discountCode.toUpperCase())
            .eq("is_active", true)
            .single();

          if (discount) {
            const now = new Date();
            const validFrom = discount.valid_from ? new Date(discount.valid_from) : null;
            const validTo = discount.valid_to ? new Date(discount.valid_to) : null;

            if ((!validFrom || now >= validFrom) && (!validTo || now <= validTo)) {
              if (!discount.usage_limit || discount.usage_count < discount.usage_limit) {
                if (!discount.min_order_value || (subtotal + vatTotal) >= discount.min_order_value) {
                  if (discount.type === "percentage") {
                    discountAmount = (subtotal + vatTotal) * (discount.value / 100);
                    if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
                      discountAmount = discount.max_discount_amount;
                    }
                  } else {
                    discountAmount = discount.value;
                  }
                  discountId = discount.id;
                }
              }
            }
          }
        }

        // Finálny výpočet
        const totalWithoutVat = subtotal;
        const totalVat = vatTotal + shippingVat;
        const grandTotal = subtotal + vatTotal + shippingCost + paymentFee - discountAmount;

        // Vytvorenie zákazníka ak neexistuje
        if (!customerId) {
          const { data: newCustomer } = await supabase
            .from("customers")
            .insert({
              email: input.billingAddress.email || `guest_${Date.now()}@hdmobil.sk`,
              first_name: input.billingAddress.firstName,
              last_name: input.billingAddress.lastName,
              phone: input.billingAddress.phone,
              customer_type: input.isCompany ? "company" : "individual",
              company_name: input.billingAddress.companyName,
              ico: input.billingAddress.ico,
              dic: input.billingAddress.dic,
              ic_dph: input.billingAddress.icDph,
              billing_street: input.billingAddress.street,
              billing_city: input.billingAddress.city,
              billing_zip: input.billingAddress.zip,
              billing_country: input.billingAddress.country || "SK",
              shipping_street: input.shippingAddress.street,
              shipping_city: input.shippingAddress.city,
              shipping_zip: input.shippingAddress.zip,
              shipping_country: input.shippingAddress.country || "SK",
            })
            .select()
            .single();
          
          customerId = newCustomer?.id || null;
        }

        // Vytvorenie objednávky
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            customer_id: customerId,
            status: "pending",
            payment_status: paymentMethod.code === "bank_transfer" ? "pending" : "awaiting",
            payment_method_id: input.paymentMethodId,
            shipping_method_id: input.shippingMethodId,
            discount_id: discountId,
            
            // Adresy (snapshot)
            shipping_first_name: input.shippingAddress.firstName,
            shipping_last_name: input.shippingAddress.lastName,
            shipping_street: input.shippingAddress.street,
            shipping_city: input.shippingAddress.city,
            shipping_zip: input.shippingAddress.zip,
            shipping_country: input.shippingAddress.country || "SK",
            shipping_phone: input.shippingAddress.phone,
            
            billing_first_name: input.billingAddress.firstName,
            billing_last_name: input.billingAddress.lastName,
            billing_company_name: input.billingAddress.companyName,
            billing_ico: input.billingAddress.ico,
            billing_dic: input.billingAddress.dic,
            billing_ic_dph: input.billingAddress.icDph,
            billing_street: input.billingAddress.street,
            billing_city: input.billingAddress.city,
            billing_zip: input.billingAddress.zip,
            billing_country: input.billingAddress.country || "SK",
            billing_phone: input.billingAddress.phone,
            
            // Sumy
            subtotal: totalWithoutVat,
            vat_total: totalVat,
            shipping_cost: shippingCost,
            payment_fee: paymentFee,
            discount_amount: discountAmount,
            total: grandTotal,
            
            note: input.note,
            currency: "EUR",
          })
          .select()
          .single();

        if (orderError || !order) {
          throw new Error("Nepodarilo sa vytvoriť objednávku");
        }

        // Vloženie položiek
        const orderItemsToInsert = itemsToInsert.map(item => ({
          ...item,
          order_id: order.id,
        }));

        await supabase
          .from("order_items")
          .insert(orderItemsToInsert);

        // Aktualizácia skladu
        for (const item of orderItems) {
          if (item.product.track_stock) {
            await supabase
              .from("products")
              .update({
                stock_quantity: item.product.stock_quantity - item.quantity,
              })
              .eq("id", item.product.id);
          }
        }

        // Aktualizácia použitia zľavy
        if (discountId) {
          await supabase.rpc("increment_discount_usage", { discount_id: discountId });
        }

        // Vymazanie košíka
        if (input.cartId) {
          await supabase
            .from("carts")
            .delete()
            .eq("id", input.cartId);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Objednávka bola úspešne vytvorená",
            data: {
              orderId: order.id,
              orderNumber: order.order_number,
              total: grandTotal,
              paymentMethod: paymentMethod.code,
              // Pre bankový prevod vrátiť údaje
              bankDetails: paymentMethod.code === "bank_transfer" ? {
                iban: "SK12 1234 5678 9012 3456 7890",
                variableSymbol: order.order_number.replace(/\D/g, ""),
                amount: grandTotal,
              } : null,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        if (!customerId) {
          throw new Error("Pre zobrazenie objednávok sa musíte prihlásiť");
        }

        const { data: orders } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            status,
            payment_status,
            total,
            created_at,
            tracking_number,
            shipping_method:shipping_methods (name_sk)
          `)
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });

        return new Response(
          JSON.stringify({ success: true, data: orders || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "detail": {
        const { orderId } = body;
        
        if (!orderId) {
          throw new Error("orderId je povinný");
        }

        const { data: order } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items (*),
            shipping_method:shipping_methods (*),
            payment_method:payment_methods (*),
            invoice:invoices (*)
          `)
          .eq("id", orderId)
          .single();

        if (!order) {
          throw new Error("Objednávka nebola nájdená");
        }

        // Kontrola oprávnenia
        if (customerId && order.customer_id !== customerId) {
          throw new Error("Nemáte oprávnenie zobraziť túto objednávku");
        }

        return new Response(
          JSON.stringify({ success: true, data: order }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update-status": {
        // Admin only - TODO: pridať kontrolu admin role
        const { orderId, status, trackingNumber, notifyCustomer } = body;
        
        if (!orderId || !status) {
          throw new Error("orderId a status sú povinné");
        }

        const updateData: any = { status };
        
        if (trackingNumber) {
          updateData.tracking_number = trackingNumber;
        }

        if (status === "shipped" && !trackingNumber) {
          throw new Error("Pre stav 'odoslané' je potrebné tracking číslo");
        }

        const { data: order, error } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", orderId)
          .select(`
            *,
            customer:customers (email, first_name)
          `)
          .single();

        if (error || !order) {
          throw new Error("Nepodarilo sa aktualizovať objednávku");
        }

        // Odoslanie notifikácie zákazníkovi
        if (notifyCustomer && order.customer?.email) {
          // TODO: Implementovať odosielanie emailov
          // await sendOrderStatusEmail(order);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Stav objednávky bol aktualizovaný",
            data: order,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "tracking": {
        const { orderNumber } = body;
        
        if (!orderNumber) {
          throw new Error("Číslo objednávky je povinné");
        }

        const { data: order } = await supabase
          .from("orders")
          .select(`
            order_number,
            status,
            tracking_number,
            shipping_method:shipping_methods (name_sk, tracking_url_template)
          `)
          .eq("order_number", orderNumber)
          .single();

        if (!order) {
          throw new Error("Objednávka nebola nájdená");
        }

        let trackingUrl = null;
        if (order.tracking_number && order.shipping_method?.tracking_url_template) {
          trackingUrl = order.shipping_method.tracking_url_template.replace(
            "{tracking_number}",
            order.tracking_number
          );
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
