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
    let userId: string | null = null;
    const sessionId: string | null = body.sessionId || req.headers.get("x-session-id");

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
        userId = customer?.id || null;
      }
    }

    async function getOrCreateCart() {
      let cart;
      if (userId) {
        const { data } = await supabase.from("carts").select("*").eq("customer_id", userId).single();
        cart = data;
        if (!cart) {
          const { data: newCart } = await supabase
            .from("carts")
            .insert({ customer_id: userId })
            .select()
            .single();
          cart = newCart;
        }
      } else if (sessionId) {
        const { data } = await supabase.from("carts").select("*").eq("session_id", sessionId).single();
        cart = data;
        if (!cart) {
          const { data: newCart } = await supabase
            .from("carts")
            .insert({ session_id: sessionId })
            .select()
            .single();
          cart = newCart;
        }
      } else {
        throw new Error("Chyba session ID");
      }
      return cart;
    }

    async function getCartItems(cartId: string) {
      const { data: items } = await supabase
        .from("cart_items")
        .select(
          `id, quantity, product:products (id, sku, name_sk, slug, price_without_vat, price_with_vat, vat_rate, vat_mode, stock_quantity, main_image_url, is_bazaar)`
        )
        .eq("cart_id", cartId);
      return items || [];
    }

    async function getAccessories(productIds: string[]) {
      if (productIds.length === 0) return [];
      const { data } = await supabase
        .from("product_accessories")
        .select(`accessory:products!product_accessories_accessory_id_fkey (id, sku, name_sk, slug, price_with_vat, main_image_url)`)
        .in("product_id", productIds)
        .limit(4);
      const accessories = data?.map((d) => d.accessory).filter(Boolean) || [];
      const uniqueAccessories = accessories.filter(
        (acc, index, self) =>
          self.findIndex((a) => (a as { id: string }).id === (acc as { id: string }).id) === index &&
          !productIds.includes((acc as { id: string }).id)
      );
      return uniqueAccessories.slice(0, 4);
    }

    function calculateTotals(items: { product: { price_with_vat: number; price_without_vat: number } | null; quantity: number }[]) {
      let subtotal = 0;
      let vatTotal = 0;
      let total = 0;
      for (const item of items) {
        const product = item.product;
        if (!product) continue;
        const lineTotal = product.price_with_vat * item.quantity;
        const lineSubtotal = product.price_without_vat * item.quantity;
        total += lineTotal;
        subtotal += lineSubtotal;
        vatTotal += lineTotal - lineSubtotal;
      }
      return {
        subtotal: Math.round(subtotal * 100) / 100,
        vatTotal: Math.round(vatTotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    switch (action) {
      case "get": {
        const cart = await getOrCreateCart();
        const items = await getCartItems(cart.id);
        const productIds = items.map((i) => (i.product as { id: string } | null)?.id).filter(Boolean) as string[];
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items as { product: { price_with_vat: number; price_without_vat: number } | null; quantity: number }[]);
        return new Response(
          JSON.stringify({ success: true, data: { cartId: cart.id, items, accessories, ...totals } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add": {
        const { productId, quantity = 1 } = body;
        if (!productId) throw new Error("productId je povinny");
        const { data: product } = await supabase
          .from("products")
          .select("id, stock_quantity, track_stock, is_active")
          .eq("id", productId)
          .single();
        if (!product || !product.is_active) throw new Error("Produkt nie je dostupny");
        if (product.track_stock && product.stock_quantity < quantity)
          throw new Error("Nedostatocne mnozstvo na sklade");
        const cart = await getOrCreateCart();
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("cart_id", cart.id)
          .eq("product_id", productId)
          .single();
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (product.track_stock && product.stock_quantity < newQuantity)
            throw new Error("Nedostatocne mnozstvo na sklade");
          await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", existingItem.id);
        } else {
          await supabase.from("cart_items").insert({ cart_id: cart.id, product_id: productId, quantity });
        }
        const items = await getCartItems(cart.id);
        const productIds = items.map((i) => (i.product as { id: string } | null)?.id).filter(Boolean) as string[];
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items as { product: { price_with_vat: number; price_without_vat: number } | null; quantity: number }[]);
        return new Response(
          JSON.stringify({ success: true, message: "Produkt bol pridany do kosika", data: { cartId: cart.id, items, accessories, ...totals } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update": {
        const { itemId, quantity } = body;
        if (!itemId || quantity === undefined) throw new Error("itemId a quantity su povinne");
        const cart = await getOrCreateCart();
        if (quantity <= 0) {
          await supabase.from("cart_items").delete().eq("id", itemId).eq("cart_id", cart.id);
        } else {
          await supabase.from("cart_items").update({ quantity }).eq("id", itemId).eq("cart_id", cart.id);
        }
        const items = await getCartItems(cart.id);
        const productIds = items.map((i) => (i.product as { id: string } | null)?.id).filter(Boolean) as string[];
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items as { product: { price_with_vat: number; price_without_vat: number } | null; quantity: number }[]);
        return new Response(
          JSON.stringify({ success: true, data: { cartId: cart.id, items, accessories, ...totals } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "remove": {
        const { itemId } = body;
        if (!itemId) throw new Error("itemId je povinny");
        const cart = await getOrCreateCart();
        await supabase.from("cart_items").delete().eq("id", itemId).eq("cart_id", cart.id);
        const items = await getCartItems(cart.id);
        const productIds = items.map((i) => (i.product as { id: string } | null)?.id).filter(Boolean) as string[];
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items as { product: { price_with_vat: number; price_without_vat: number } | null; quantity: number }[]);
        return new Response(
          JSON.stringify({ success: true, message: "Polozka bola odstranena z kosika", data: { cartId: cart.id, items, accessories, ...totals } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "clear": {
        const cart = await getOrCreateCart();
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Kosik bol vyprazdneny",
            data: { cartId: cart.id, items: [], accessories: [], subtotal: 0, vatTotal: 0, total: 0, itemCount: 0 },
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
