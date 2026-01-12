// Supabase Edge Function: Košík s cross-sell odporúčaniami
// Podporuje prihlásených aj neprihlásených zákazníkov

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = req.method !== "GET" ? await req.json() : {};
    
    // Získanie session ID alebo user ID
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let sessionId: string | null = body.sessionId || req.headers.get("x-session-id");

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) {
        // Získanie customer ID
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        userId = customer?.id || null;
      }
    }

    // Funkcia na získanie alebo vytvorenie košíka
    async function getOrCreateCart() {
      let cart;
      
      if (userId) {
        // Prihlásený zákazník
        const { data } = await supabase
          .from("carts")
          .select("*")
          .eq("customer_id", userId)
          .single();
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
        // Neprihlásený zákazník
        const { data } = await supabase
          .from("carts")
          .select("*")
          .eq("session_id", sessionId)
          .single();
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
        throw new Error("Chýba session ID");
      }
      
      return cart;
    }

    // Funkcia na získanie položiek košíka s detailmi produktov
    async function getCartItems(cartId: string) {
      const { data: items } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product:products (
            id,
            sku,
            name_sk,
            slug,
            price_without_vat,
            price_with_vat,
            vat_rate,
            vat_mode,
            stock_quantity,
            main_image_url,
            is_bazaar
          )
        `)
        .eq("cart_id", cartId);
      
      return items || [];
    }

    // Funkcia na získanie odporúčaného príslušenstva
    async function getAccessories(productIds: string[]) {
      if (productIds.length === 0) return [];
      
      const { data } = await supabase
        .from("product_accessories")
        .select(`
          accessory:products!product_accessories_accessory_id_fkey (
            id,
            sku,
            name_sk,
            slug,
            price_with_vat,
            main_image_url
          )
        `)
        .in("product_id", productIds)
        .limit(4);
      
      // Filtrovať duplicity a produkty už v košíku
      const accessories = data?.map(d => d.accessory).filter(Boolean) || [];
      const uniqueAccessories = accessories.filter(
        (acc, index, self) => 
          self.findIndex(a => a.id === acc.id) === index &&
          !productIds.includes(acc.id)
      );
      
      return uniqueAccessories.slice(0, 4);
    }

    // Výpočet súm
    function calculateTotals(items: any[]) {
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

    // === AKCIE ===

    switch (action) {
      case "get": {
        const cart = await getOrCreateCart();
        const items = await getCartItems(cart.id);
        const productIds = items.map(i => i.product?.id).filter(Boolean);
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items);
        
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              cartId: cart.id,
              items,
              accessories,
              ...totals,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add": {
        const { productId, quantity = 1 } = body;
        
        if (!productId) {
          throw new Error("productId je povinný");
        }
        
        // Kontrola dostupnosti produktu
        const { data: product } = await supabase
          .from("products")
          .select("id, stock_quantity, track_stock, is_active")
          .eq("id", productId)
          .single();
        
        if (!product || !product.is_active) {
          throw new Error("Produkt nie je dostupný");
        }
        
        if (product.track_stock && product.stock_quantity < quantity) {
          throw new Error("Nedostatočné množstvo na sklade");
        }
        
        const cart = await getOrCreateCart();
        
        // Skontrolovať, či už je v košíku
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("cart_id", cart.id)
          .eq("product_id", productId)
          .single();
        
        if (existingItem) {
          // Aktualizovať množstvo
          const newQuantity = existingItem.quantity + quantity;
          
          if (product.track_stock && product.stock_quantity < newQuantity) {
            throw new Error("Nedostatočné množstvo na sklade");
          }
          
          await supabase
            .from("cart_items")
            .update({ quantity: newQuantity })
            .eq("id", existingItem.id);
        } else {
          // Pridať novú položku
          await supabase
            .from("cart_items")
            .insert({
              cart_id: cart.id,
              product_id: productId,
              quantity,
            });
        }
        
        // Vrátiť aktualizovaný košík
        const items = await getCartItems(cart.id);
        const productIds = items.map(i => i.product?.id).filter(Boolean);
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Produkt bol pridaný do košíka",
            data: {
              cartId: cart.id,
              items,
              accessories,
              ...totals,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update": {
        const { itemId, quantity } = body;
        
        if (!itemId || quantity === undefined) {
          throw new Error("itemId a quantity sú povinné");
        }
        
        const cart = await getOrCreateCart();
        
        if (quantity <= 0) {
          // Odstrániť položku
          await supabase
            .from("cart_items")
            .delete()
            .eq("id", itemId)
            .eq("cart_id", cart.id);
        } else {
          // Aktualizovať množstvo
          await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", itemId)
            .eq("cart_id", cart.id);
        }
        
        const items = await getCartItems(cart.id);
        const productIds = items.map(i => i.product?.id).filter(Boolean);
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items);
        
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              cartId: cart.id,
              items,
              accessories,
              ...totals,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "remove": {
        const { itemId } = body;
        
        if (!itemId) {
          throw new Error("itemId je povinný");
        }
        
        const cart = await getOrCreateCart();
        
        await supabase
          .from("cart_items")
          .delete()
          .eq("id", itemId)
          .eq("cart_id", cart.id);
        
        const items = await getCartItems(cart.id);
        const productIds = items.map(i => i.product?.id).filter(Boolean);
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Položka bola odstránená z košíka",
            data: {
              cartId: cart.id,
              items,
              accessories,
              ...totals,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "clear": {
        const cart = await getOrCreateCart();
        
        await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Košík bol vyprázdnený",
            data: {
              cartId: cart.id,
              items: [],
              accessories: [],
              subtotal: 0,
              vatTotal: 0,
              total: 0,
              itemCount: 0,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "merge": {
        // Zlúčenie košíka po prihlásení
        // Prenesie položky z session košíka do zákazníckeho košíka
        if (!userId || !sessionId) {
          throw new Error("Potrebné userId aj sessionId pre zlúčenie");
        }
        
        // Získať session košík
        const { data: sessionCart } = await supabase
          .from("carts")
          .select("id")
          .eq("session_id", sessionId)
          .single();
        
        if (sessionCart) {
          // Získať položky session košíka
          const { data: sessionItems } = await supabase
            .from("cart_items")
            .select("product_id, quantity")
            .eq("cart_id", sessionCart.id);
          
          if (sessionItems && sessionItems.length > 0) {
            // Získať alebo vytvoriť zákaznícky košík
            let { data: userCart } = await supabase
              .from("carts")
              .select("id")
              .eq("customer_id", userId)
              .single();
            
            if (!userCart) {
              const { data: newCart } = await supabase
                .from("carts")
                .insert({ customer_id: userId })
                .select()
                .single();
              userCart = newCart;
            }
            
            // Preniesť položky
            for (const item of sessionItems) {
              const { data: existing } = await supabase
                .from("cart_items")
                .select("id, quantity")
                .eq("cart_id", userCart!.id)
                .eq("product_id", item.product_id)
                .single();
              
              if (existing) {
                await supabase
                  .from("cart_items")
                  .update({ quantity: existing.quantity + item.quantity })
                  .eq("id", existing.id);
              } else {
                await supabase
                  .from("cart_items")
                  .insert({
                    cart_id: userCart!.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                  });
              }
            }
            
            // Vymazať session košík
            await supabase
              .from("carts")
              .delete()
              .eq("id", sessionCart.id);
          }
        }
        
        // Vrátiť aktualizovaný košík
        const cart = await getOrCreateCart();
        const items = await getCartItems(cart.id);
        const productIds = items.map(i => i.product?.id).filter(Boolean);
        const accessories = await getAccessories(productIds);
        const totals = calculateTotals(items);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Košíky boli zlúčené",
            data: {
              cartId: cart.id,
              items,
              accessories,
              ...totals,
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
