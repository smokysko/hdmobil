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
          .maybeSingle();
        customerId = customer?.id || null;
      }
    }

    switch (action) {
      case "list": {
        if (!customerId) {
          return new Response(
            JSON.stringify({ success: true, data: [] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: wishlistItems } = await supabase
          .from("wishlist")
          .select(`
            id,
            product_id,
            added_at,
            product:products (
              id,
              name_sk,
              slug,
              price_with_vat,
              original_price,
              main_image_url,
              stock_quantity,
              is_active,
              category:categories (name_sk, slug)
            )
          `)
          .eq("customer_id", customerId)
          .order("added_at", { ascending: false });

        const items = (wishlistItems || [])
          .filter((item) => item.product && item.product.is_active)
          .map((item) => ({
            id: item.id,
            productId: item.product_id,
            addedAt: item.added_at,
            product: {
              id: item.product.id,
              name: item.product.name_sk,
              slug: item.product.slug,
              price: item.product.price_with_vat,
              salePrice: item.product.original_price ? item.product.price_with_vat : null,
              originalPrice: item.product.original_price,
              image: item.product.main_image_url,
              inStock: item.product.stock_quantity > 0,
              category: item.product.category?.name_sk,
              categorySlug: item.product.category?.slug,
            },
          }));

        return new Response(
          JSON.stringify({ success: true, data: items }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add": {
        const { productId } = body;
        if (!productId) throw new Error("productId je povinný");

        if (!customerId) {
          throw new Error("Pre pridanie do obľúbených sa musíte prihlásiť");
        }

        const { data: product } = await supabase
          .from("products")
          .select("id")
          .eq("id", productId)
          .eq("is_active", true)
          .maybeSingle();

        if (!product) {
          throw new Error("Produkt nebol nájdený");
        }

        const { data: existing } = await supabase
          .from("wishlist")
          .select("id")
          .eq("customer_id", customerId)
          .eq("product_id", productId)
          .maybeSingle();

        if (existing) {
          return new Response(
            JSON.stringify({ success: true, message: "Produkt už je v obľúbených" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("wishlist")
          .insert({ customer_id: customerId, product_id: productId });

        if (error) throw new Error("Nepodarilo sa pridať do obľúbených");

        return new Response(
          JSON.stringify({ success: true, message: "Produkt bol pridaný do obľúbených" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "remove": {
        const { productId } = body;
        if (!productId) throw new Error("productId je povinný");

        if (!customerId) {
          throw new Error("Pre odstránenie z obľúbených sa musíte prihlásiť");
        }

        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("customer_id", customerId)
          .eq("product_id", productId);

        if (error) throw new Error("Nepodarilo sa odstrániť z obľúbených");

        return new Response(
          JSON.stringify({ success: true, message: "Produkt bol odstránený z obľúbených" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "toggle": {
        const { productId } = body;
        if (!productId) throw new Error("productId je povinný");

        if (!customerId) {
          throw new Error("Pre správu obľúbených sa musíte prihlásiť");
        }

        const { data: existing } = await supabase
          .from("wishlist")
          .select("id")
          .eq("customer_id", customerId)
          .eq("product_id", productId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("wishlist")
            .delete()
            .eq("customer_id", customerId)
            .eq("product_id", productId);

          return new Response(
            JSON.stringify({ success: true, action: "removed", message: "Produkt bol odstránený z obľúbených" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          const { data: product } = await supabase
            .from("products")
            .select("id")
            .eq("id", productId)
            .eq("is_active", true)
            .maybeSingle();

          if (!product) {
            throw new Error("Produkt nebol nájdený");
          }

          await supabase
            .from("wishlist")
            .insert({ customer_id: customerId, product_id: productId });

          return new Response(
            JSON.stringify({ success: true, action: "added", message: "Produkt bol pridaný do obľúbených" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "check": {
        const productId = url.searchParams.get("productId");
        if (!productId) throw new Error("productId je povinný");

        if (!customerId) {
          return new Response(
            JSON.stringify({ success: true, isInWishlist: false }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: existing } = await supabase
          .from("wishlist")
          .select("id")
          .eq("customer_id", customerId)
          .eq("product_id", productId)
          .maybeSingle();

        return new Response(
          JSON.stringify({ success: true, isInWishlist: !!existing }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Neznáma akcia: ${action}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznáma chyba";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
