// Supabase Edge Function: Integrácie dopravcov
// DPD, Packeta (Z-BOX), Slovenská pošta, SPS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// API kľúče (budú v env premenných)
const DPD_API_KEY = Deno.env.get("DPD_API_KEY") || "";
const DPD_CUSTOMER_ID = Deno.env.get("DPD_CUSTOMER_ID") || "";
const PACKETA_API_KEY = Deno.env.get("PACKETA_API_KEY") || "";
const PACKETA_SENDER_ID = Deno.env.get("PACKETA_SENDER_ID") || "";
const SPS_API_KEY = Deno.env.get("SPS_API_KEY") || "";

// Typy
interface ShipmentData {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  weight: number; // v kg
  codAmount?: number; // dobierka
  note?: string;
  pickupPointId?: string; // pre Z-BOX, Packeta, SPS boxy
}

// === DPD Integrácia ===
async function createDpdShipment(data: ShipmentData): Promise<{ trackingNumber: string; labelUrl: string }> {
  // DPD API endpoint (sandbox/production)
  const apiUrl = "https://api.dpd.sk/v1/shipments";
  
  const shipmentData = {
    sender: {
      name: "HDmobil s.r.o.",
      street: "Hlavná 123",
      city: "Bratislava",
      postalCode: "81101",
      country: "SK",
      phone: "+421900123456",
      email: "expedicia@hdmobil.sk",
    },
    recipient: {
      name: data.recipientName,
      street: data.street,
      city: data.city,
      postalCode: data.zip,
      country: data.country || "SK",
      phone: data.recipientPhone,
      email: data.recipientEmail,
    },
    parcels: [
      {
        weight: data.weight,
        reference: data.orderId,
      },
    ],
    services: {
      cod: data.codAmount ? {
        amount: data.codAmount,
        currency: "EUR",
        reference: data.orderId,
      } : undefined,
      notification: {
        email: data.recipientEmail,
        sms: data.recipientPhone,
      },
    },
    reference: data.orderId,
    note: data.note,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DPD_API_KEY}`,
      "X-Customer-Id": DPD_CUSTOMER_ID,
    },
    body: JSON.stringify(shipmentData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DPD API error: ${error}`);
  }

  const result = await response.json();
  
  return {
    trackingNumber: result.trackingNumber || result.parcels?.[0]?.trackingNumber,
    labelUrl: result.labelUrl || result.labels?.[0]?.url,
  };
}

// === Packeta (Zásielkovňa) Integrácia ===
async function createPacketaShipment(data: ShipmentData): Promise<{ trackingNumber: string; labelUrl: string }> {
  // Packeta API (XML)
  const apiUrl = "https://www.zasilkovna.cz/api/rest";
  
  // Packeta používa XML API
  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${PACKETA_API_KEY}</apiPassword>
  <packetAttributes>
    <number>${data.orderId}</number>
    <name>${escapeXml(data.recipientName)}</name>
    <surname></surname>
    <email>${data.recipientEmail || ""}</email>
    <phone>${data.recipientPhone}</phone>
    <addressId>${data.pickupPointId || ""}</addressId>
    <street>${escapeXml(data.street)}</street>
    <city>${escapeXml(data.city)}</city>
    <zip>${data.zip}</zip>
    <country>${data.country || "sk"}</country>
    <value>${data.codAmount || 0}</value>
    <weight>${data.weight}</weight>
    <eshop>${PACKETA_SENDER_ID}</eshop>
    ${data.codAmount ? `<cod>${data.codAmount}</cod>` : ""}
  </packetAttributes>
</createPacket>`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
    },
    body: xmlRequest,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Packeta API error: ${error}`);
  }

  const xmlResponse = await response.text();
  
  // Parsovanie XML odpovede
  const trackingMatch = xmlResponse.match(/<barcode>(\d+)<\/barcode>/);
  const trackingNumber = trackingMatch ? trackingMatch[1] : "";
  
  return {
    trackingNumber,
    labelUrl: `https://www.zasilkovna.cz/api/labels/${trackingNumber}?apiPassword=${PACKETA_API_KEY}`,
  };
}

// === Packeta Z-BOX Integrácia ===
async function createZboxShipment(data: ShipmentData): Promise<{ trackingNumber: string; labelUrl: string }> {
  // Z-BOX používa rovnaké API ako Packeta, len s iným typom doručenia
  if (!data.pickupPointId) {
    throw new Error("Pre Z-BOX je potrebné ID boxu");
  }
  
  return createPacketaShipment({
    ...data,
    // Z-BOX má špecifické ID formáty
  });
}

// === Slovenská pošta Integrácia ===
async function createSlovakPostShipment(data: ShipmentData): Promise<{ trackingNumber: string; labelUrl: string }> {
  // Slovenská pošta API
  const apiUrl = "https://api.posta.sk/v1/shipments";
  
  const shipmentData = {
    sender: {
      name: "HDmobil s.r.o.",
      address: {
        street: "Hlavná 123",
        city: "Bratislava",
        postalCode: "81101",
        country: "SK",
      },
      contact: {
        phone: "+421900123456",
        email: "expedicia@hdmobil.sk",
      },
    },
    recipient: {
      name: data.recipientName,
      address: {
        street: data.street,
        city: data.city,
        postalCode: data.zip,
        country: data.country || "SK",
      },
      contact: {
        phone: data.recipientPhone,
        email: data.recipientEmail,
      },
    },
    parcel: {
      weight: data.weight * 1000, // v gramoch
      reference: data.orderId,
    },
    services: {
      cod: data.codAmount ? {
        amount: data.codAmount,
        currency: "EUR",
      } : undefined,
    },
    productCode: data.codAmount ? "BA" : "EX", // Balík na adresu / Expres
  };

  // Poznámka: Slovenská pošta má komplexnejšie API, toto je zjednodušená verzia
  // V produkcii by bolo potrebné implementovať plnú integráciu

  return {
    trackingNumber: `SP${Date.now()}`, // Placeholder
    labelUrl: "", // Placeholder
  };
}

// === SPS (Slovak Parcel Service) Integrácia ===
async function createSpsShipment(data: ShipmentData): Promise<{ trackingNumber: string; labelUrl: string }> {
  const apiUrl = "https://api.sps-sro.sk/v1/shipments";
  
  const shipmentData = {
    sender: {
      company: "HDmobil s.r.o.",
      street: "Hlavná 123",
      city: "Bratislava",
      zip: "81101",
      country: "SK",
      phone: "+421900123456",
      email: "expedicia@hdmobil.sk",
    },
    recipient: {
      name: data.recipientName,
      street: data.street,
      city: data.city,
      zip: data.zip,
      country: data.country || "SK",
      phone: data.recipientPhone,
      email: data.recipientEmail,
    },
    parcel: {
      weight: data.weight,
      reference: data.orderId,
    },
    services: {
      cod: data.codAmount,
      pickupPoint: data.pickupPointId, // Pre SPS boxy
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SPS_API_KEY}`,
    },
    body: JSON.stringify(shipmentData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SPS API error: ${error}`);
  }

  const result = await response.json();
  
  return {
    trackingNumber: result.trackingNumber,
    labelUrl: result.labelUrl,
  };
}

// === Hlavný handler ===
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = await req.json();

    switch (action) {
      case "create-shipment": {
        const { orderId, carrier } = body;
        
        if (!orderId || !carrier) {
          throw new Error("orderId a carrier sú povinné");
        }

        // Získanie objednávky
        const { data: order } = await supabase
          .from("orders")
          .select(`
            *,
            shipping_method:shipping_methods (*),
            payment_method:payment_methods (*)
          `)
          .eq("id", orderId)
          .single();

        if (!order) {
          throw new Error("Objednávka nebola nájdená");
        }

        // Príprava dát pre zásielku
        const shipmentData: ShipmentData = {
          orderId: order.order_number,
          recipientName: `${order.shipping_first_name} ${order.shipping_last_name}`,
          recipientPhone: order.shipping_phone,
          recipientEmail: order.customer?.email,
          street: order.shipping_street,
          city: order.shipping_city,
          zip: order.shipping_zip,
          country: order.shipping_country,
          weight: 0.5, // TODO: vypočítať z produktov
          codAmount: order.payment_method?.code === "cod" ? order.total : undefined,
          note: order.note,
          pickupPointId: order.pickup_point_id,
        };

        let result;
        
        switch (carrier.toLowerCase()) {
          case "dpd":
            result = await createDpdShipment(shipmentData);
            break;
          case "packeta":
            result = await createPacketaShipment(shipmentData);
            break;
          case "zbox":
            result = await createZboxShipment(shipmentData);
            break;
          case "slovak_post":
            result = await createSlovakPostShipment(shipmentData);
            break;
          case "sps":
            result = await createSpsShipment(shipmentData);
            break;
          default:
            throw new Error(`Neznámy dopravca: ${carrier}`);
        }

        // Aktualizácia objednávky
        await supabase
          .from("orders")
          .update({
            tracking_number: result.trackingNumber,
            label_url: result.labelUrl,
            status: "processing",
          })
          .eq("id", orderId);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Zásielka bola vytvorená",
            data: result,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get-pickup-points": {
        const { carrier, country = "SK", city } = body;
        
        // Získanie výdajných miest podľa dopravcu
        let pickupPoints = [];
        
        switch (carrier.toLowerCase()) {
          case "packeta":
          case "zbox": {
            // Packeta API pre výdajné miesta
            const response = await fetch(
              `https://www.zasilkovna.cz/api/v4/${PACKETA_API_KEY}/branch.json?country=${country.toLowerCase()}`
            );
            const data = await response.json();
            pickupPoints = data.data?.map((p: any) => ({
              id: p.id,
              name: p.name,
              address: `${p.street}, ${p.city}`,
              city: p.city,
              zip: p.zip,
              type: p.isZbox ? "zbox" : "branch",
              openingHours: p.openingHours,
              lat: p.latitude,
              lng: p.longitude,
            })) || [];
            
            if (city) {
              pickupPoints = pickupPoints.filter((p: any) => 
                p.city.toLowerCase().includes(city.toLowerCase())
              );
            }
            break;
          }
          
          case "sps": {
            // SPS API pre boxy
            const response = await fetch(
              `https://api.sps-sro.sk/v1/pickup-points?country=${country}`
            );
            const data = await response.json();
            pickupPoints = data.points || [];
            break;
          }
          
          default:
            throw new Error(`Výdajné miesta nie sú dostupné pre: ${carrier}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: pickupPoints.slice(0, 100), // Limit 100
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "track": {
        const { trackingNumber, carrier } = body;
        
        if (!trackingNumber || !carrier) {
          throw new Error("trackingNumber a carrier sú povinné");
        }

        let trackingInfo;
        
        switch (carrier.toLowerCase()) {
          case "dpd": {
            const response = await fetch(
              `https://tracking.dpd.sk/api/v1/parcels/${trackingNumber}`,
              {
                headers: {
                  "Authorization": `Bearer ${DPD_API_KEY}`,
                },
              }
            );
            trackingInfo = await response.json();
            break;
          }
          
          case "packeta":
          case "zbox": {
            const response = await fetch(
              `https://www.zasilkovna.cz/api/rest?apiPassword=${PACKETA_API_KEY}&packetId=${trackingNumber}`
            );
            const xmlResponse = await response.text();
            // Parsovanie XML...
            trackingInfo = { status: "in_transit" }; // Placeholder
            break;
          }
          
          default:
            trackingInfo = { status: "unknown" };
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: trackingInfo,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "print-label": {
        const { orderId } = body;
        
        if (!orderId) {
          throw new Error("orderId je povinný");
        }

        const { data: order } = await supabase
          .from("orders")
          .select("label_url, tracking_number")
          .eq("id", orderId)
          .single();

        if (!order?.label_url) {
          throw new Error("Štítok nie je dostupný");
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              labelUrl: order.label_url,
              trackingNumber: order.tracking_number,
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

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
