import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: moduleSetting } = await supabase
      .from("module_settings")
      .select("config, is_enabled")
      .eq("module_id", "heureka")
      .maybeSingle();

    const storeUrl = moduleSetting?.config?.store_url || "https://www.hdmobil.sk";

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        sku,
        name_sk,
        description_sk,
        price_with_vat,
        main_image_url,
        gallery_images,
        is_active,
        stock_quantity,
        manufacturer,
        vat_rate,
        categories(name_sk)
      `)
      .eq("is_active", true)
      .gt("stock_quantity", 0);

    if (error) {
      throw new Error("Failed to fetch products: " + error.message);
    }

    const items = (products || [])
      .map((product) => {
        const productUrl = `${storeUrl}/product/${product.id}`;
        const categoryText = product.categories?.name_sk
          ? `Elektronika | ${product.categories.name_sk}`
          : "Elektronika";

        const imageUrl = product.main_image_url || "";

        let itemXml = `    <SHOPITEM>
      <ITEM_ID>${escapeXml(product.id)}</ITEM_ID>
      <PRODUCTNAME>${escapeXml(product.name_sk || "")}</PRODUCTNAME>
      <PRODUCT>${escapeXml(product.name_sk || "")}</PRODUCT>
      <DESCRIPTION>${escapeXml((product.description_sk || "").replace(/<[^>]*>/g, "").substring(0, 500))}</DESCRIPTION>
      <URL>${escapeXml(productUrl)}</URL>`;

        if (imageUrl) {
          itemXml += `
      <IMGURL>${escapeXml(imageUrl)}</IMGURL>`;
        }

        if (product.gallery_images && product.gallery_images.length > 0) {
          product.gallery_images.slice(0, 3).forEach((img: string) => {
            itemXml += `
      <IMGURL_ALTERNATIVE>${escapeXml(img)}</IMGURL_ALTERNATIVE>`;
          });
        }

        itemXml += `
      <PRICE_VAT>${product.price_with_vat.toFixed(2)}</PRICE_VAT>
      <VAT>${product.vat_rate || 20}</VAT>
      <CATEGORYTEXT>${escapeXml(categoryText)}</CATEGORYTEXT>`;

        if (product.sku) {
          itemXml += `
      <ITEM_TYPE>product</ITEM_TYPE>`;
        }

        if (product.manufacturer) {
          itemXml += `
      <MANUFACTURER>${escapeXml(product.manufacturer)}</MANUFACTURER>`;
        }

        const deliveryDate = product.stock_quantity > 0 ? 0 : 14;
        itemXml += `
      <DELIVERY_DATE>${deliveryDate}</DELIVERY_DATE>
    </SHOPITEM>`;

        return itemXml;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<SHOP>
${items}
</SHOP>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=7200",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
