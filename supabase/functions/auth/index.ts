import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CompanyData {
  ico: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  dic?: string;
  icDph?: string;
}

async function lookupCompanyByICO(ico: string): Promise<CompanyData | null> {
  const cleanICO = ico.replace(/\s/g, "");
  if (!/^\d{8}$/.test(cleanICO)) {
    throw new Error("ICO musi mat 8 cislic");
  }

  try {
    const response = await fetch(
      `https://autoform.ekosystem.slovensko.digital/api/corporate_bodies/search?q=${cleanICO}&limit=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("ORSR API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const company = data[0];

    const address = company.formatted_address || "";
    const addressParts = address.split(",").map((p: string) => p.trim());

    return {
      ico: cleanICO,
      name: company.name || "",
      street: addressParts[0] || "",
      city: addressParts[1] || "",
      zip: addressParts[2]?.replace(/\D/g, "") || "",
      dic: company.tin || undefined,
      icDph: company.vat_number || undefined,
    };
  } catch (error) {
    console.error("Error looking up company:", error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { ico } = await req.json();

    if (!ico) {
      return new Response(JSON.stringify({ error: "ICO je povinne" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const company = await lookupCompanyByICO(ico);

    if (!company) {
      return new Response(
        JSON.stringify({ error: "Firma s tymto ICO nebola najdena" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, data: company }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznama chyba";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
