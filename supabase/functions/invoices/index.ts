// Supabase Edge Function: Faktúry
// Automatické generovanie a správa faktúr

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Konfigurácia predajcu
const SELLER_INFO = {
  name: "HDmobil s.r.o.",
  ico: "12345678",
  dic: "2012345678",
  icDph: "SK2012345678",
  street: "Hlavná 123",
  city: "Bratislava",
  zip: "81101",
  country: "SK",
  bankAccount: "SK12 1234 5678 9012 3456 7890",
  bankName: "Slovenská sporiteľňa",
  email: "faktury@hdmobil.sk",
  phone: "+421 900 123 456",
  web: "www.hdmobil.sk",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = req.method !== "GET" ? await req.json() : {};

    switch (action) {
      case "generate": {
        const { orderId } = body;
        
        if (!orderId) {
          throw new Error("orderId je povinný");
        }

        // Získanie objednávky s položkami
        const { data: order } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items (*),
            customer:customers (*),
            shipping_method:shipping_methods (*),
            payment_method:payment_methods (*)
          `)
          .eq("id", orderId)
          .single();

        if (!order) {
          throw new Error("Objednávka nebola nájdená");
        }

        // Kontrola, či už faktúra existuje
        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("id, invoice_number")
          .eq("order_id", orderId)
          .single();

        if (existingInvoice) {
          return new Response(
            JSON.stringify({
              success: true,
              message: "Faktúra už existuje",
              data: existingInvoice,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Dátum vystavenia a splatnosti
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 dní splatnosť

        // Dátum dodania (dátum odoslania alebo dnešok)
        const deliveryDate = order.shipped_at ? new Date(order.shipped_at) : issueDate;

        // Vytvorenie faktúry
        const { data: invoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            order_id: orderId,
            customer_id: order.customer_id,
            invoice_type: "invoice",
            status: "issued",
            
            // Dátumy
            issue_date: issueDate.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
            delivery_date: deliveryDate.toISOString().split("T")[0],
            
            // Predajca
            seller_name: SELLER_INFO.name,
            seller_ico: SELLER_INFO.ico,
            seller_dic: SELLER_INFO.dic,
            seller_ic_dph: SELLER_INFO.icDph,
            seller_street: SELLER_INFO.street,
            seller_city: SELLER_INFO.city,
            seller_zip: SELLER_INFO.zip,
            seller_country: SELLER_INFO.country,
            seller_bank_account: SELLER_INFO.bankAccount,
            seller_bank_name: SELLER_INFO.bankName,
            
            // Kupujúci
            buyer_name: order.billing_company_name || 
              `${order.billing_first_name} ${order.billing_last_name}`,
            buyer_ico: order.billing_ico,
            buyer_dic: order.billing_dic,
            buyer_ic_dph: order.billing_ic_dph,
            buyer_street: order.billing_street,
            buyer_city: order.billing_city,
            buyer_zip: order.billing_zip,
            buyer_country: order.billing_country,
            
            // Sumy
            subtotal: order.subtotal,
            vat_total: order.vat_total,
            shipping_cost: order.shipping_cost,
            discount_amount: order.discount_amount,
            total: order.total,
            
            currency: order.currency,
            payment_method: order.payment_method?.name_sk || "Neznámy",
            variable_symbol: order.order_number.replace(/\D/g, ""),
            
            // Poznámky
            note: order.billing_ic_dph 
              ? "Dodanie tovaru je oslobodené od DPH podľa § 43 zákona o DPH."
              : null,
          })
          .select()
          .single();

        if (invoiceError || !invoice) {
          throw new Error("Nepodarilo sa vytvoriť faktúru");
        }

        // Vytvorenie položiek faktúry
        const invoiceItems = order.items.map((item: any) => ({
          invoice_id: invoice.id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          quantity: item.quantity,
          unit: "ks",
          price_without_vat: item.price_without_vat,
          price_with_vat: item.price_with_vat,
          vat_rate: item.vat_rate,
          vat_mode: item.vat_mode,
          line_total: item.line_total,
        }));

        // Pridať dopravu ako položku
        if (order.shipping_cost > 0) {
          invoiceItems.push({
            invoice_id: invoice.id,
            product_name: `Doprava - ${order.shipping_method?.name_sk || "Štandardná"}`,
            product_sku: "SHIPPING",
            quantity: 1,
            unit: "ks",
            price_without_vat: order.shipping_cost / (1 + (order.shipping_method?.vat_rate || 20) / 100),
            price_with_vat: order.shipping_cost,
            vat_rate: order.shipping_method?.vat_rate || 20,
            vat_mode: "standard",
            line_total: order.shipping_cost,
          });
        }

        await supabase
          .from("invoice_items")
          .insert(invoiceItems);

        // Aktualizácia objednávky
        await supabase
          .from("orders")
          .update({ invoice_id: invoice.id })
          .eq("id", orderId);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Faktúra bola úspešne vytvorená",
            data: {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoice_number,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get": {
        const { invoiceId, orderId } = body;
        
        let query = supabase
          .from("invoices")
          .select(`
            *,
            items:invoice_items (*)
          `);

        if (invoiceId) {
          query = query.eq("id", invoiceId);
        } else if (orderId) {
          query = query.eq("order_id", orderId);
        } else {
          throw new Error("invoiceId alebo orderId je povinný");
        }

        const { data: invoice } = await query.single();

        if (!invoice) {
          throw new Error("Faktúra nebola nájdená");
        }

        return new Response(
          JSON.stringify({ success: true, data: invoice }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        const { customerId, status, from, to, page = 1, limit = 20 } = body;
        
        let query = supabase
          .from("invoices")
          .select(`
            id,
            invoice_number,
            invoice_type,
            status,
            issue_date,
            due_date,
            total,
            buyer_name,
            order:orders (order_number)
          `, { count: "exact" });

        if (customerId) {
          query = query.eq("customer_id", customerId);
        }
        if (status) {
          query = query.eq("status", status);
        }
        if (from) {
          query = query.gte("issue_date", from);
        }
        if (to) {
          query = query.lte("issue_date", to);
        }

        const offset = (page - 1) * limit;
        query = query
          .order("issue_date", { ascending: false })
          .range(offset, offset + limit - 1);

        const { data: invoices, count } = await query;

        return new Response(
          JSON.stringify({
            success: true,
            data: invoices || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark-paid": {
        const { invoiceId, paidAt } = body;
        
        if (!invoiceId) {
          throw new Error("invoiceId je povinný");
        }

        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_at: paidAt || new Date().toISOString(),
          })
          .eq("id", invoiceId)
          .select()
          .single();

        if (error || !invoice) {
          throw new Error("Nepodarilo sa aktualizovať faktúru");
        }

        // Aktualizácia stavu platby objednávky
        if (invoice.order_id) {
          await supabase
            .from("orders")
            .update({ payment_status: "paid" })
            .eq("id", invoice.order_id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Faktúra bola označená ako zaplatená",
            data: invoice,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        const { invoiceId, reason } = body;
        
        if (!invoiceId) {
          throw new Error("invoiceId je povinný");
        }

        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({
            status: "cancelled",
            note: reason ? `Storno: ${reason}` : "Stornovaná faktúra",
          })
          .eq("id", invoiceId)
          .select()
          .single();

        if (error || !invoice) {
          throw new Error("Nepodarilo sa stornovať faktúru");
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Faktúra bola stornovaná",
            data: invoice,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "export-mksoft": {
        // Export faktúr pre MKSOFT (XML formát)
        const { from, to } = body;
        
        if (!from || !to) {
          throw new Error("from a to dátumy sú povinné");
        }

        const { data: invoices } = await supabase
          .from("invoices")
          .select(`
            *,
            items:invoice_items (*)
          `)
          .gte("issue_date", from)
          .lte("issue_date", to)
          .eq("status", "paid");

        if (!invoices || invoices.length === 0) {
          return new Response(
            JSON.stringify({
              success: true,
              message: "Žiadne faktúry na export",
              data: { xml: "", count: 0 },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generovanie XML pre MKSOFT
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<Faktury>\n`;
        xml += `  <Export datum="${new Date().toISOString().split("T")[0]}" />\n`;

        for (const inv of invoices) {
          xml += `  <Faktura>\n`;
          xml += `    <CisloFaktury>${inv.invoice_number}</CisloFaktura>\n`;
          xml += `    <DatumVystavenia>${inv.issue_date}</DatumVystavenia>\n`;
          xml += `    <DatumSplatnosti>${inv.due_date}</DatumSplatnosti>\n`;
          xml += `    <DatumDodania>${inv.delivery_date}</DatumDodania>\n`;
          xml += `    <Odberatel>\n`;
          xml += `      <Nazov>${escapeXml(inv.buyer_name)}</Nazov>\n`;
          xml += `      <ICO>${inv.buyer_ico || ""}</ICO>\n`;
          xml += `      <DIC>${inv.buyer_dic || ""}</DIC>\n`;
          xml += `      <ICDPH>${inv.buyer_ic_dph || ""}</ICDPH>\n`;
          xml += `      <Ulica>${escapeXml(inv.buyer_street)}</Ulica>\n`;
          xml += `      <Mesto>${escapeXml(inv.buyer_city)}</Mesto>\n`;
          xml += `      <PSC>${inv.buyer_zip}</PSC>\n`;
          xml += `    </Odberatel>\n`;
          xml += `    <Polozky>\n`;
          
          for (const item of inv.items) {
            xml += `      <Polozka>\n`;
            xml += `        <Nazov>${escapeXml(item.product_name)}</Nazov>\n`;
            xml += `        <SKU>${item.product_sku}</SKU>\n`;
            xml += `        <Mnozstvo>${item.quantity}</Mnozstvo>\n`;
            xml += `        <Jednotka>${item.unit}</Jednotka>\n`;
            xml += `        <CenaBezDPH>${item.price_without_vat}</CenaBezDPH>\n`;
            xml += `        <CenaSDPH>${item.price_with_vat}</CenaSDPH>\n`;
            xml += `        <SadzbaDPH>${item.vat_rate}</SadzbaDPH>\n`;
            xml += `        <RezimDPH>${item.vat_mode}</RezimDPH>\n`;
            xml += `        <Spolu>${item.line_total}</Spolu>\n`;
            xml += `      </Polozka>\n`;
          }
          
          xml += `    </Polozky>\n`;
          xml += `    <Sumy>\n`;
          xml += `      <ZakladDane>${inv.subtotal}</ZakladDane>\n`;
          xml += `      <DPH>${inv.vat_total}</DPH>\n`;
          xml += `      <Doprava>${inv.shipping_cost}</Doprava>\n`;
          xml += `      <Zlava>${inv.discount_amount}</Zlava>\n`;
          xml += `      <Celkom>${inv.total}</Celkom>\n`;
          xml += `    </Sumy>\n`;
          xml += `    <SposobPlatby>${escapeXml(inv.payment_method)}</SposobPlatby>\n`;
          xml += `    <VariabilnySymbol>${inv.variable_symbol}</VariabilnySymbol>\n`;
          xml += `  </Faktura>\n`;
        }

        xml += `</Faktury>`;

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              xml,
              count: invoices.length,
              period: { from, to },
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

// Helper funkcia pre XML escape
function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
