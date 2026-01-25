import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SELLER_INFO = {
  name: "HDmobil s.r.o.",
  ico: "12345678",
  dic: "2012345678",
  icDph: "SK2012345678",
  street: "Hlavna 123",
  city: "Bratislava",
  zip: "81101",
  country: "SK",
  bankAccount: "SK12 1234 5678 9012 3456 7890",
  bankName: "Slovenska sporitelna",
  email: "faktury@hdmobil.sk",
  phone: "+421 900 123 456",
  web: "www.hdmobil.sk",
};

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("sk-SK", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(amount || 0);
}

interface InvoiceItem {
  product_name: string;
  product_sku: string;
  quantity: number;
  unit: string;
  price_without_vat: number;
  price_with_vat: number;
  vat_rate: number;
  vat_mode: string;
  line_total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  issue_date: string;
  due_date: string;
  delivery_date: string;
  seller_name: string;
  seller_ico: string;
  seller_dic: string;
  seller_ic_dph: string;
  seller_street: string;
  seller_city: string;
  seller_zip: string;
  seller_country: string;
  seller_bank_account: string;
  seller_bank_name: string;
  buyer_name: string;
  buyer_ico: string;
  buyer_dic: string;
  buyer_ic_dph: string;
  buyer_street: string;
  buyer_city: string;
  buyer_zip: string;
  buyer_country: string;
  subtotal: number;
  vat_total: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  currency: string;
  payment_method: string;
  variable_symbol: string;
  note: string;
  items: InvoiceItem[];
}

function generateInvoiceHtml(invoice: Invoice): string {
  const items = invoice.items || [];

  let itemsHtml = "";
  items.forEach((item, index) => {
    itemsHtml += `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
          <strong>${escapeHtml(item.product_name)}</strong>
          ${item.product_sku ? `<br><small style="color: #6b7280;">SKU: ${escapeHtml(item.product_sku)}</small>` : ""}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity} ${item.unit || "ks"}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price_with_vat)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.vat_rate}%</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.line_total)}</td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faktura ${escapeHtml(invoice.invoice_number)}</title>
  <style>
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; color: #111827; font-size: 14px; line-height: 1.5; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 600; }
    .invoice-number { font-size: 18px; opacity: 0.9; }
    .content { padding: 32px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .party { padding: 20px; border-radius: 8px; background: #f9fafb; }
    .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 12px; font-weight: 600; }
    .party-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .party-details { color: #4b5563; font-size: 13px; }
    .party-details div { margin-bottom: 4px; }
    .dates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; }
    .date-item { text-align: center; }
    .date-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #059669; margin-bottom: 4px; font-weight: 600; }
    .date-value { font-size: 15px; font-weight: 600; color: #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f3f4f6; padding: 12px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 600; }
    th:nth-child(3), th:nth-child(4), th:nth-child(5), th:nth-child(6) { text-align: center; }
    th:last-child { text-align: right; }
    .summary { display: flex; justify-content: flex-end; }
    .summary-table { width: 280px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .summary-row.total { border-bottom: none; border-top: 2px solid #059669; margin-top: 8px; padding-top: 16px; font-size: 18px; font-weight: 700; color: #059669; }
    .payment-info { margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .payment-title { font-weight: 600; margin-bottom: 12px; color: #111827; }
    .payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .payment-item { display: flex; gap: 8px; }
    .payment-label { color: #6b7280; }
    .payment-value { font-weight: 600; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .note { margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d; color: #92400e; font-size: 13px; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #059669; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .print-btn:hover { background: #047857; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo">HDmobil</div>
      <div class="invoice-title">
        <h1>${invoice.invoice_type === "proforma" ? "Proforma faktura" : "Faktura"}</h1>
        <div class="invoice-number">${escapeHtml(invoice.invoice_number)}</div>
      </div>
    </div>

    <div class="content">
      <div class="parties">
        <div class="party">
          <div class="party-label">Dodavatel</div>
          <div class="party-name">${escapeHtml(invoice.seller_name)}</div>
          <div class="party-details">
            <div>${escapeHtml(invoice.seller_street)}</div>
            <div>${escapeHtml(invoice.seller_zip)} ${escapeHtml(invoice.seller_city)}</div>
            ${invoice.seller_ico ? `<div>ICO: ${escapeHtml(invoice.seller_ico)}</div>` : ""}
            ${invoice.seller_dic ? `<div>DIC: ${escapeHtml(invoice.seller_dic)}</div>` : ""}
            ${invoice.seller_ic_dph ? `<div>IC DPH: ${escapeHtml(invoice.seller_ic_dph)}</div>` : ""}
          </div>
        </div>

        <div class="party">
          <div class="party-label">Odberatel</div>
          <div class="party-name">${escapeHtml(invoice.buyer_name)}</div>
          <div class="party-details">
            <div>${escapeHtml(invoice.buyer_street)}</div>
            <div>${escapeHtml(invoice.buyer_zip)} ${escapeHtml(invoice.buyer_city)}</div>
            ${invoice.buyer_ico ? `<div>ICO: ${escapeHtml(invoice.buyer_ico)}</div>` : ""}
            ${invoice.buyer_dic ? `<div>DIC: ${escapeHtml(invoice.buyer_dic)}</div>` : ""}
            ${invoice.buyer_ic_dph ? `<div>IC DPH: ${escapeHtml(invoice.buyer_ic_dph)}</div>` : ""}
          </div>
        </div>
      </div>

      <div class="dates">
        <div class="date-item">
          <div class="date-label">Datum vystavenia</div>
          <div class="date-value">${formatDate(invoice.issue_date)}</div>
        </div>
        <div class="date-item">
          <div class="date-label">Datum splatnosti</div>
          <div class="date-value">${formatDate(invoice.due_date)}</div>
        </div>
        <div class="date-item">
          <div class="date-label">Datum dodania</div>
          <div class="date-value">${formatDate(invoice.delivery_date)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Popis</th>
            <th style="width: 80px;">Mnozstvo</th>
            <th style="width: 100px;">Cena/ks</th>
            <th style="width: 60px;">DPH</th>
            <th style="width: 110px;">Spolu</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-table">
          <div class="summary-row">
            <span>Zaklad dane</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>DPH</span>
            <span>${formatCurrency(invoice.vat_total)}</span>
          </div>
          ${invoice.shipping_cost > 0 ? `
          <div class="summary-row">
            <span>Doprava</span>
            <span>${formatCurrency(invoice.shipping_cost)}</span>
          </div>
          ` : ""}
          ${invoice.discount_amount > 0 ? `
          <div class="summary-row">
            <span>Zlava</span>
            <span>-${formatCurrency(invoice.discount_amount)}</span>
          </div>
          ` : ""}
          <div class="summary-row total">
            <span>Celkom</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      <div class="payment-info">
        <div class="payment-title">Platobne udaje</div>
        <div class="payment-grid">
          <div class="payment-item">
            <span class="payment-label">Sposob platby:</span>
            <span class="payment-value">${escapeHtml(invoice.payment_method || "Neuvedeny")}</span>
          </div>
          <div class="payment-item">
            <span class="payment-label">Variabilny symbol:</span>
            <span class="payment-value">${escapeHtml(invoice.variable_symbol || "-")}</span>
          </div>
          ${invoice.seller_bank_account ? `
          <div class="payment-item">
            <span class="payment-label">Cislo uctu:</span>
            <span class="payment-value">${escapeHtml(invoice.seller_bank_account)}</span>
          </div>
          ` : ""}
          ${invoice.seller_bank_name ? `
          <div class="payment-item">
            <span class="payment-label">Banka:</span>
            <span class="payment-value">${escapeHtml(invoice.seller_bank_name)}</span>
          </div>
          ` : ""}
        </div>
      </div>

      ${invoice.note ? `<div class="note">${escapeHtml(invoice.note)}</div>` : ""}

      <div class="footer">
        <p>Dakujeme za vas nakup!</p>
        <p>${escapeHtml(SELLER_INFO.web)} | ${escapeHtml(SELLER_INFO.email)} | ${escapeHtml(SELLER_INFO.phone)}</p>
      </div>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">Tlacit / Ulozit PDF</button>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = req.method !== "GET" ? await req.json() : {};

    switch (action) {
      case "generate": {
        const { orderId } = body;
        if (!orderId) throw new Error("orderId je povinny");

        const { data: order } = await supabase
          .from("orders")
          .select("*, items:order_items(*), customer:customers(*), shipping_method:shipping_methods(*), payment_method:payment_methods(*)")
          .eq("id", orderId)
          .single();

        if (!order) throw new Error("Objednavka nebola najdena");

        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("id, invoice_number")
          .eq("order_id", orderId)
          .single();

        if (existingInvoice) {
          return new Response(
            JSON.stringify({ success: true, message: "Faktura uz existuje", data: existingInvoice }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        const deliveryDate = order.shipped_at ? new Date(order.shipped_at) : issueDate;

        const { data: invoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            order_id: orderId,
            customer_id: order.customer_id,
            invoice_type: "invoice",
            status: "issued",
            issue_date: issueDate.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
            delivery_date: deliveryDate.toISOString().split("T")[0],
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
            buyer_name: order.billing_company_name || `${order.billing_first_name} ${order.billing_last_name}`,
            buyer_ico: order.billing_ico,
            buyer_dic: order.billing_dic,
            buyer_ic_dph: order.billing_ic_dph,
            buyer_street: order.billing_street,
            buyer_city: order.billing_city,
            buyer_zip: order.billing_zip,
            buyer_country: order.billing_country,
            subtotal: order.subtotal,
            vat_total: order.vat_total,
            shipping_cost: order.shipping_cost,
            discount_amount: order.discount_amount,
            total: order.total,
            currency: order.currency,
            payment_method: order.payment_method?.name_sk || "Neznamy",
            variable_symbol: order.order_number.replace(/\D/g, ""),
            note: order.billing_ic_dph ? "Dodanie tovaru je oslobodene od DPH podla 43 zakona o DPH." : null,
          })
          .select()
          .single();

        if (invoiceError || !invoice) throw new Error("Nepodarilo sa vytvorit fakturu");

        const invoiceItems = order.items.map((item: Record<string, unknown>) => ({
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

        if (order.shipping_cost > 0) {
          invoiceItems.push({
            invoice_id: invoice.id,
            product_name: `Doprava - ${order.shipping_method?.name_sk || "Standardna"}`,
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

        await supabase.from("invoice_items").insert(invoiceItems);
        await supabase.from("orders").update({ invoice_id: invoice.id }).eq("id", orderId);

        return new Response(
          JSON.stringify({ success: true, message: "Faktura bola uspesne vytvorena", data: { invoiceId: invoice.id, invoiceNumber: invoice.invoice_number } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get": {
        const { invoiceId, orderId } = body;
        let query = supabase.from("invoices").select("*, items:invoice_items(*)");
        if (invoiceId) query = query.eq("id", invoiceId);
        else if (orderId) query = query.eq("order_id", orderId);
        else throw new Error("invoiceId alebo orderId je povinny");

        const { data: invoice } = await query.single();
        if (!invoice) throw new Error("Faktura nebola najdena");

        return new Response(JSON.stringify({ success: true, data: invoice }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list": {
        const { customerId, status, from, to, page = 1, limit = 20 } = body;
        let query = supabase
          .from("invoices")
          .select("id, invoice_number, invoice_type, status, issue_date, due_date, total, buyer_name, order:orders(order_number)", { count: "exact" });

        if (customerId) query = query.eq("customer_id", customerId);
        if (status) query = query.eq("status", status);
        if (from) query = query.gte("issue_date", from);
        if (to) query = query.lte("issue_date", to);

        const offset = (page - 1) * limit;
        query = query.order("issue_date", { ascending: false }).range(offset, offset + limit - 1);

        const { data: invoices, count } = await query;

        return new Response(
          JSON.stringify({
            success: true,
            data: invoices || [],
            pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark-paid": {
        const { invoiceId, paidAt } = body;
        if (!invoiceId) throw new Error("invoiceId je povinny");

        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({ status: "paid", paid_at: paidAt || new Date().toISOString() })
          .eq("id", invoiceId)
          .select()
          .single();

        if (error || !invoice) throw new Error("Nepodarilo sa aktualizovat fakturu");

        if (invoice.order_id) {
          await supabase.from("orders").update({ payment_status: "paid" }).eq("id", invoice.order_id);
        }

        return new Response(
          JSON.stringify({ success: true, message: "Faktura bola oznacena ako zaplatena", data: invoice }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        const { invoiceId, reason } = body;
        if (!invoiceId) throw new Error("invoiceId je povinny");

        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({ status: "cancelled", note: reason ? `Storno: ${reason}` : "Stornovana faktura" })
          .eq("id", invoiceId)
          .select()
          .single();

        if (error || !invoice) throw new Error("Nepodarilo sa stornovat fakturu");

        return new Response(
          JSON.stringify({ success: true, message: "Faktura bola stornovana", data: invoice }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "download": {
        const invoiceId = url.searchParams.get("id");
        const orderId = url.searchParams.get("orderId");

        let query = supabase.from("invoices").select("*, items:invoice_items(*)");
        if (invoiceId) query = query.eq("id", invoiceId);
        else if (orderId) query = query.eq("order_id", orderId);
        else throw new Error("id alebo orderId je povinny parameter");

        const { data: invoice } = await query.single();
        if (!invoice) throw new Error("Faktura nebola najdena");

        const html = generateInvoiceHtml(invoice);

        return new Response(html, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": `attachment; filename="faktura-${invoice.invoice_number}.html"`,
          },
        });
      }

      case "export-mksoft": {
        const { from, to } = body;
        if (!from || !to) throw new Error("from a to datumy su povinne");

        const { data: invoices } = await supabase
          .from("invoices")
          .select("*, items:invoice_items(*)")
          .gte("issue_date", from)
          .lte("issue_date", to)
          .eq("status", "paid");

        if (!invoices || invoices.length === 0) {
          return new Response(
            JSON.stringify({ success: true, message: "Ziadne faktury na export", data: { xml: "", count: 0 } }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Faktury>\n  <Export datum="${new Date().toISOString().split("T")[0]}" />\n`;

        for (const inv of invoices) {
          xml += `  <Faktura>\n`;
          xml += `    <CisloFaktury>${inv.invoice_number}</CisloFaktury>\n`;
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

          for (const item of inv.items as { product_name: string; product_sku: string; quantity: number; unit: string; price_without_vat: number; price_with_vat: number; vat_rate: number; vat_mode: string; line_total: number }[]) {
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
          JSON.stringify({ success: true, data: { xml, count: invoices.length, period: { from, to } } }),
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
