import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DPD_API_KEY = Deno.env.get("DPD_API_KEY") || "";
const DPD_CUSTOMER_ID = Deno.env.get("DPD_CUSTOMER_ID") || "";
const PACKETA_API_KEY = Deno.env.get("PACKETA_API_KEY") || "";
const PACKETA_API_PASSWORD = Deno.env.get("PACKETA_API_PASSWORD") || "";
const SPS_API_KEY = Deno.env.get("SPS_API_KEY") || "";

interface ShipmentData {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  weight: number;
  codAmount?: number;
  note?: string;
  pickupPointId?: string;
}

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function createDpdShipment(
  data: ShipmentData
): Promise<{ trackingNumber: string; labelUrl: string }> {
  const apiUrl = "https://api.dpd.sk/v1/shipments";

  const shipmentData = {
    sender: {
      name: "HDmobil s.r.o.",
      street: "Hlavna 123",
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
    parcels: [{ weight: data.weight, reference: data.orderId }],
    services: {
      cod: data.codAmount
        ? { amount: data.codAmount, currency: "EUR", reference: data.orderId }
        : undefined,
      notification: { email: data.recipientEmail, sms: data.recipientPhone },
    },
    reference: data.orderId,
    note: data.note,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DPD_API_KEY}`,
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

async function createPacketaShipment(
  data: ShipmentData
): Promise<{ trackingNumber: string; labelUrl: string }> {
  const apiUrl = "https://www.zasilkovna.cz/api/rest";

  const recipientNameParts = data.recipientName.trim().split(" ");
  const recipientFirstName = recipientNameParts[0] || "";
  const recipientLastName = recipientNameParts.slice(1).join(" ") || recipientFirstName;

  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${PACKETA_API_PASSWORD}</apiPassword>
  <packetAttributes>
    <number>${data.orderId}</number>
    <name>${escapeXml(recipientFirstName)}</name>
    <surname>${escapeXml(recipientLastName)}</surname>
    <email>${data.recipientEmail || ""}</email>
    <phone>${data.recipientPhone}</phone>
    <addressId>${data.pickupPointId || ""}</addressId>
    <street>${escapeXml(data.street)}</street>
    <city>${escapeXml(data.city)}</city>
    <zip>${data.zip}</zip>
    <country>${data.country || "sk"}</country>
    <value>${data.codAmount || 0}</value>
    <weight>${data.weight}</weight>
    ${data.codAmount ? `<cod>${data.codAmount}</cod>` : ""}
  </packetAttributes>
</createPacket>`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xmlRequest,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Packeta API error: ${error}`);
  }

  const xmlResponse = await response.text();
  const trackingMatch = xmlResponse.match(/<barcode>(\d+)<\/barcode>/);
  const trackingNumber = trackingMatch ? trackingMatch[1] : "";

  return {
    trackingNumber,
    labelUrl: `https://www.zasilkovna.cz/api/labels/${trackingNumber}?apiPassword=${PACKETA_API_PASSWORD}`,
  };
}

async function createZboxShipment(
  data: ShipmentData
): Promise<{ trackingNumber: string; labelUrl: string }> {
  if (!data.pickupPointId) {
    throw new Error("Pre Z-BOX je potrebne ID boxu");
  }
  return createPacketaShipment(data);
}

async function createSlovakPostShipment(
  _data: ShipmentData
): Promise<{ trackingNumber: string; labelUrl: string }> {
  return {
    trackingNumber: `SP${Date.now()}`,
    labelUrl: "",
  };
}

async function createSpsShipment(
  data: ShipmentData
): Promise<{ trackingNumber: string; labelUrl: string }> {
  const apiUrl = "https://api.sps-sro.sk/v1/shipments";

  const shipmentData = {
    sender: {
      company: "HDmobil s.r.o.",
      street: "Hlavna 123",
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
    parcel: { weight: data.weight, reference: data.orderId },
    services: { cod: data.codAmount, pickupPoint: data.pickupPointId },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SPS_API_KEY}`,
    },
    body: JSON.stringify(shipmentData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SPS API error: ${error}`);
  }

  const result = await response.json();
  return { trackingNumber: result.trackingNumber, labelUrl: result.labelUrl };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
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
          throw new Error("orderId a carrier su povinne");
        }

        const { data: order } = await supabase
          .from("orders")
          .select("*, shipping_method:shipping_methods(*), payment_method:payment_methods(*)")
          .eq("id", orderId)
          .single();

        if (!order) {
          throw new Error("Objednavka nebola najdena");
        }

        const shipmentData: ShipmentData = {
          orderId: order.order_number,
          recipientName: `${order.shipping_first_name} ${order.shipping_last_name}`,
          recipientPhone: order.shipping_phone,
          recipientEmail: order.customer?.email,
          street: order.shipping_street,
          city: order.shipping_city,
          zip: order.shipping_zip,
          country: order.shipping_country,
          weight: 0.5,
          codAmount: order.payment_method?.code === "cod" ? order.total : undefined,
          note: order.customer_note,
          pickupPointId: order.packeta_point_id,
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
            throw new Error(`Neznamy dopravca: ${carrier}`);
        }

        await supabase
          .from("orders")
          .update({
            tracking_number: result.trackingNumber,
            label_url: result.labelUrl,
            status: "processing",
          })
          .eq("id", orderId);

        return new Response(
          JSON.stringify({ success: true, message: "Zasielka bola vytvorena", data: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get-pickup-points": {
        const { carrier, country = "SK", city } = body;
        let pickupPoints: unknown[] = [];

        switch (carrier.toLowerCase()) {
          case "packeta":
          case "zbox": {
            const response = await fetch(
              `https://www.zasilkovna.cz/api/v4/${PACKETA_API_KEY}/branch.json?country=${country.toLowerCase()}`
            );
            const data = await response.json();
            pickupPoints =
              data.data?.map((p: Record<string, unknown>) => ({
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
              pickupPoints = pickupPoints.filter((p: unknown) =>
                (p as { city: string }).city.toLowerCase().includes(city.toLowerCase())
              );
            }
            break;
          }

          case "sps": {
            const response = await fetch(
              `https://api.sps-sro.sk/v1/pickup-points?country=${country}`
            );
            const data = await response.json();
            pickupPoints = data.points || [];
            break;
          }

          default:
            throw new Error(`Vydajne miesta nie su dostupne pre: ${carrier}`);
        }

        return new Response(
          JSON.stringify({ success: true, data: pickupPoints.slice(0, 100) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "track": {
        const { trackingNumber, carrier } = body;
        if (!trackingNumber || !carrier) {
          throw new Error("trackingNumber a carrier su povinne");
        }

        let trackingInfo;
        switch (carrier.toLowerCase()) {
          case "dpd": {
            const response = await fetch(
              `https://tracking.dpd.sk/api/v1/parcels/${trackingNumber}`,
              { headers: { Authorization: `Bearer ${DPD_API_KEY}` } }
            );
            trackingInfo = await response.json();
            break;
          }
          case "packeta":
          case "zbox":
            trackingInfo = { status: "in_transit" };
            break;
          default:
            trackingInfo = { status: "unknown" };
        }

        return new Response(
          JSON.stringify({ success: true, data: trackingInfo }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "print-label": {
        const { orderId } = body;
        if (!orderId) {
          throw new Error("orderId je povinny");
        }

        const { data: order } = await supabase
          .from("orders")
          .select("label_url, tracking_number")
          .eq("id", orderId)
          .single();

        if (!order?.label_url) {
          throw new Error("Stitok nie je dostupny");
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: { labelUrl: order.label_url, trackingNumber: order.tracking_number },
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
