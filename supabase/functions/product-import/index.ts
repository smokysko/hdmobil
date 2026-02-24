import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ImportRow {
  name_sk: string;
  name_cs?: string;
  name_pl?: string;
  sku?: string;
  price_with_vat: number;
  original_price?: number;
  stock_quantity?: number;
  category_slug?: string;
  description_sk?: string;
  is_active?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
}

interface ImportResult {
  row: number;
  sku: string;
  name: string;
  status: "created" | "updated" | "skipped" | "error";
  error?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminRecord } = await supabase
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!adminRecord) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get("content-type") || "";
    let csvText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      csvText = await file.text();
    } else {
      const body = await req.json();
      csvText = body.csv;
    }

    if (!csvText?.trim()) {
      return new Response(JSON.stringify({ error: "Empty CSV" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "No data rows in CSV" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, slug, name_sk");
    const categoryMap: Record<string, string> = {};
    (categoriesData || []).forEach((c) => {
      categoryMap[c.slug] = c.id;
      categoryMap[c.name_sk.toLowerCase()] = c.id;
    });

    const results: ImportResult[] = [];
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const rowNum = i + 2;

      const nameSk = raw["name_sk"] || raw["nazov"] || raw["name"] || "";
      const priceStr = raw["price_with_vat"] || raw["cena"] || raw["price"] || "0";
      const price = parseFloat(priceStr);

      if (!nameSk) {
        results.push({ row: rowNum, sku: raw["sku"] || "", name: "", status: "error", error: "Chýba name_sk" });
        errors++;
        continue;
      }

      if (isNaN(price) || price <= 0) {
        results.push({ row: rowNum, sku: raw["sku"] || "", name: nameSk, status: "error", error: "Neplatná cena" });
        errors++;
        continue;
      }

      const sku = raw["sku"] || "";
      const categorySlugOrName = raw["category_slug"] || raw["category"] || raw["kategoria"] || "";
      const categoryId = categorySlugOrName ? (categoryMap[categorySlugOrName] || categoryMap[categorySlugOrName.toLowerCase()] || null) : null;

      const originalPrice = raw["original_price"] || raw["povodna_cena"] ? parseFloat(raw["original_price"] || raw["povodna_cena"]) : null;
      const stockQty = parseInt(raw["stock_quantity"] || raw["sklad"] || "0") || 0;

      const productData: ImportRow = {
        name_sk: nameSk,
        name_cs: raw["name_cs"] || undefined,
        name_pl: raw["name_pl"] || undefined,
        sku: sku || undefined,
        price_with_vat: price,
        original_price: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
        stock_quantity: stockQty,
        description_sk: raw["description_sk"] || raw["popis"] || undefined,
        is_active: raw["is_active"] !== "false" && raw["is_active"] !== "0",
        is_new: raw["is_new"] === "true" || raw["is_new"] === "1",
        is_featured: raw["is_featured"] === "true" || raw["is_featured"] === "1",
        meta_title: raw["meta_title"] || undefined,
        meta_description: raw["meta_description"] || undefined,
      };

      let existingId: string | null = null;

      if (sku) {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("sku", sku)
          .maybeSingle();
        if (existing) existingId = existing.id;
      }

      const dbPayload: Record<string, unknown> = {
        name_sk: productData.name_sk,
        name_cs: productData.name_cs || null,
        name_pl: productData.name_pl || null,
        sku: productData.sku || null,
        price_with_vat: productData.price_with_vat,
        price_without_vat: productData.price_with_vat / 1.2,
        original_price: productData.original_price || null,
        vat_rate: 20,
        stock_quantity: productData.stock_quantity || 0,
        description_sk: productData.description_sk || null,
        category_id: categoryId,
        is_active: productData.is_active ?? true,
        is_new: productData.is_new ?? false,
        is_featured: productData.is_featured ?? false,
        meta_title: productData.meta_title || null,
        meta_description: productData.meta_description || null,
      };

      if (existingId) {
        dbPayload.updated_at = new Date().toISOString();
        const { error } = await supabase.from("products").update(dbPayload).eq("id", existingId);
        if (error) {
          results.push({ row: rowNum, sku, name: nameSk, status: "error", error: error.message });
          errors++;
        } else {
          results.push({ row: rowNum, sku, name: nameSk, status: "updated" });
          updated++;
        }
      } else {
        dbPayload.slug = generateSlug(productData.name_sk);
        const { error } = await supabase.from("products").insert(dbPayload);
        if (error) {
          if (error.message.includes("unique") || error.message.includes("duplicate")) {
            dbPayload.slug = `${dbPayload.slug}-${Date.now()}`;
            const { error: error2 } = await supabase.from("products").insert(dbPayload);
            if (error2) {
              results.push({ row: rowNum, sku, name: nameSk, status: "error", error: error2.message });
              errors++;
            } else {
              results.push({ row: rowNum, sku, name: nameSk, status: "created" });
              created++;
            }
          } else {
            results.push({ row: rowNum, sku, name: nameSk, status: "error", error: error.message });
            errors++;
          }
        } else {
          results.push({ row: rowNum, sku, name: nameSk, status: "created" });
          created++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, created, updated, errors, total: rows.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
