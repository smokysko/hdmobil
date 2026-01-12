// Supabase Edge Function: Vyhľadanie firmy podľa IČO
// Používa slovenský ORSR/FinStat API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Funkcia na vyhľadanie firmy v slovenskom registri
async function lookupCompanyByICO(ico: string): Promise<CompanyData | null> {
  // Validácia IČO (8 číslic)
  const cleanICO = ico.replace(/\s/g, "");
  if (!/^\d{8}$/.test(cleanICO)) {
    throw new Error("IČO musí mať 8 číslic");
  }

  try {
    // Použijeme verejné API pre slovenský obchodný register
    // Alternatíva: FinStat API (platené, ale spoľahlivejšie)
    const response = await fetch(
      `https://autoform.ekosystem.slovensko.digital/api/corporate_bodies/search?q=${cleanICO}&limit=1`,
      {
        headers: {
          "Accept": "application/json",
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
    
    // Parsovanie adresy
    const address = company.formatted_address || "";
    const addressParts = address.split(",").map((p: string) => p.trim());
    
    return {
      ico: cleanICO,
      name: company.name || "",
      street: addressParts[0] || "",
      city: addressParts[1] || "",
      zip: addressParts[2]?.replace(/\D/g, "") || "",
      dic: company.tin || undefined, // DIČ
      icDph: company.vat_number || undefined, // IČ DPH
    };
  } catch (error) {
    console.error("Error looking up company:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ico } = await req.json();

    if (!ico) {
      return new Response(
        JSON.stringify({ error: "IČO je povinné" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const company = await lookupCompanyByICO(ico);

    if (!company) {
      return new Response(
        JSON.stringify({ error: "Firma s týmto IČO nebola nájdená" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: company }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznáma chyba";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
