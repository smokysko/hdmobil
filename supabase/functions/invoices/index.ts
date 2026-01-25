import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDatePdf(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatCurrencyPdf(amount: number): string {
  const formatted = (amount || 0).toFixed(2).replace(".", ",");
  const parts = formatted.split(",");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(",") + " EUR";
}

const ROBOTO_REGULAR_URL =
  "https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Regular.ttf";
const ROBOTO_BOLD_URL =
  "https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Bold.ttf";

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font: ${url}`);
  return response.arrayBuffer();
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

async function generateInvoicePdf(invoice: Invoice): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [robotoRegularBytes, robotoBoldBytes] = await Promise.all([
    fetchFont(ROBOTO_REGULAR_URL),
    fetchFont(ROBOTO_BOLD_URL),
  ]);

  const fontRegular = await pdfDoc.embedFont(robotoRegularBytes);
  const fontBold = await pdfDoc.embedFont(robotoBoldBytes);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const green = rgb(0.02, 0.59, 0.41);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.95, 0.95, 0.95);

  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: green,
  });

  page.drawText("HDmobil", {
    x: 40,
    y: height - 55,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const invoiceTitle =
    invoice.invoice_type === "proforma" ? "Proforma faktúra" : "Faktúra";
  page.drawText(invoiceTitle, {
    x: width - 200,
    y: height - 45,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(invoice.invoice_number, {
    x: width - 200,
    y: height - 70,
    size: 14,
    font: fontRegular,
    color: rgb(1, 1, 1, 0.9),
  });

  let y = height - 140;

  page.drawRectangle({
    x: 40,
    y: y - 100,
    width: 240,
    height: 110,
    color: lightGray,
  });
  page.drawText("DODÁVATEĽ", {
    x: 50,
    y: y - 15,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText(invoice.seller_name, {
    x: 50,
    y: y - 35,
    size: 12,
    font: fontBold,
    color: black,
  });
  page.drawText(invoice.seller_street, {
    x: 50,
    y: y - 52,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  page.drawText(`${invoice.seller_zip} ${invoice.seller_city}`, {
    x: 50,
    y: y - 66,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  if (invoice.seller_ico)
    page.drawText(`IČO: ${invoice.seller_ico}`, {
      x: 50,
      y: y - 80,
      size: 10,
      font: fontRegular,
      color: gray,
    });
  if (invoice.seller_dic)
    page.drawText(`DIČ: ${invoice.seller_dic}`, {
      x: 150,
      y: y - 80,
      size: 10,
      font: fontRegular,
      color: gray,
    });
  if (invoice.seller_ic_dph)
    page.drawText(`IČ DPH: ${invoice.seller_ic_dph}`, {
      x: 50,
      y: y - 94,
      size: 10,
      font: fontRegular,
      color: gray,
    });

  page.drawRectangle({
    x: 310,
    y: y - 100,
    width: 240,
    height: 110,
    color: lightGray,
  });
  page.drawText("ODBERATEĽ", {
    x: 320,
    y: y - 15,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText(invoice.buyer_name, {
    x: 320,
    y: y - 35,
    size: 12,
    font: fontBold,
    color: black,
  });
  page.drawText(invoice.buyer_street || "", {
    x: 320,
    y: y - 52,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  page.drawText(`${invoice.buyer_zip || ""} ${invoice.buyer_city || ""}`, {
    x: 320,
    y: y - 66,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  let buyerDetailY = y - 80;
  if (invoice.buyer_ico) {
    page.drawText(`IČO: ${invoice.buyer_ico}`, {
      x: 320,
      y: buyerDetailY,
      size: 10,
      font: fontRegular,
      color: gray,
    });
    buyerDetailY -= 14;
  }
  if (invoice.buyer_dic) {
    page.drawText(`DIČ: ${invoice.buyer_dic}`, {
      x: 320,
      y: buyerDetailY,
      size: 10,
      font: fontRegular,
      color: gray,
    });
    buyerDetailY -= 14;
  }
  if (invoice.buyer_ic_dph) {
    page.drawText(`IČ DPH: ${invoice.buyer_ic_dph}`, {
      x: 320,
      y: buyerDetailY,
      size: 10,
      font: fontRegular,
      color: gray,
    });
  }

  y = y - 130;

  const dateBoxWidth = 170;
  page.drawRectangle({
    x: 40,
    y: y - 45,
    width: dateBoxWidth,
    height: 50,
    color: rgb(0.94, 0.99, 0.96),
    borderColor: rgb(0.73, 0.97, 0.83),
    borderWidth: 1,
  });
  page.drawText("DÁTUM VYSTAVENIA", {
    x: 50,
    y: y - 15,
    size: 8,
    font: fontBold,
    color: green,
  });
  page.drawText(formatDatePdf(invoice.issue_date), {
    x: 50,
    y: y - 35,
    size: 11,
    font: fontBold,
    color: black,
  });

  page.drawRectangle({
    x: 220,
    y: y - 45,
    width: dateBoxWidth,
    height: 50,
    color: rgb(0.94, 0.99, 0.96),
    borderColor: rgb(0.73, 0.97, 0.83),
    borderWidth: 1,
  });
  page.drawText("DÁTUM SPLATNOSTI", {
    x: 230,
    y: y - 15,
    size: 8,
    font: fontBold,
    color: green,
  });
  page.drawText(formatDatePdf(invoice.due_date), {
    x: 230,
    y: y - 35,
    size: 11,
    font: fontBold,
    color: black,
  });

  page.drawRectangle({
    x: 400,
    y: y - 45,
    width: 150,
    height: 50,
    color: rgb(0.94, 0.99, 0.96),
    borderColor: rgb(0.73, 0.97, 0.83),
    borderWidth: 1,
  });
  page.drawText("DÁTUM DODANIA", {
    x: 410,
    y: y - 15,
    size: 8,
    font: fontBold,
    color: green,
  });
  page.drawText(formatDatePdf(invoice.delivery_date), {
    x: 410,
    y: y - 35,
    size: 11,
    font: fontBold,
    color: black,
  });

  y = y - 75;

  page.drawRectangle({
    x: 40,
    y: y - 20,
    width: width - 80,
    height: 20,
    color: lightGray,
  });
  page.drawText("#", {
    x: 50,
    y: y - 14,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText("POPIS", {
    x: 80,
    y: y - 14,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText("MN.", {
    x: 300,
    y: y - 14,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText("CENA/KS", {
    x: 350,
    y: y - 14,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText("DPH", {
    x: 430,
    y: y - 14,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText("SPOLU", {
    x: 480,
    y: y - 14,
    size: 9,
    font: fontBold,
    color: gray,
  });

  y = y - 25;
  const items = invoice.items || [];
  items.forEach((item, index) => {
    page.drawText(String(index + 1), {
      x: 50,
      y: y - 12,
      size: 10,
      font: fontRegular,
      color: black,
    });

    const productName = (item.product_name || "").substring(0, 35);
    page.drawText(productName, {
      x: 80,
      y: y - 10,
      size: 10,
      font: fontBold,
      color: black,
    });
    if (item.product_sku) {
      page.drawText(`SKU: ${item.product_sku}`, {
        x: 80,
        y: y - 22,
        size: 8,
        font: fontRegular,
        color: gray,
      });
    }

    page.drawText(`${item.quantity} ${item.unit || "ks"}`, {
      x: 300,
      y: y - 12,
      size: 10,
      font: fontRegular,
      color: black,
    });
    page.drawText(formatCurrencyPdf(item.price_with_vat), {
      x: 350,
      y: y - 12,
      size: 10,
      font: fontRegular,
      color: black,
    });
    page.drawText(`${item.vat_rate}%`, {
      x: 430,
      y: y - 12,
      size: 10,
      font: fontRegular,
      color: black,
    });
    page.drawText(formatCurrencyPdf(item.line_total), {
      x: 480,
      y: y - 12,
      size: 10,
      font: fontBold,
      color: black,
    });

    page.drawLine({
      start: { x: 40, y: y - 30 },
      end: { x: width - 40, y: y - 30 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });

    y = y - 35;
  });

  y = y - 20;
  const summaryX = 380;
  page.drawText("Základ dane:", {
    x: summaryX,
    y: y,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  page.drawText(formatCurrencyPdf(invoice.subtotal), {
    x: 480,
    y: y,
    size: 10,
    font: fontRegular,
    color: black,
  });

  y -= 18;
  page.drawText("DPH:", {
    x: summaryX,
    y: y,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  page.drawText(formatCurrencyPdf(invoice.vat_total), {
    x: 480,
    y: y,
    size: 10,
    font: fontRegular,
    color: black,
  });

  if (invoice.shipping_cost > 0) {
    y -= 18;
    page.drawText("Doprava:", {
      x: summaryX,
      y: y,
      size: 10,
      font: fontRegular,
      color: gray,
    });
    page.drawText(formatCurrencyPdf(invoice.shipping_cost), {
      x: 480,
      y: y,
      size: 10,
      font: fontRegular,
      color: black,
    });
  }

  if (invoice.discount_amount > 0) {
    y -= 18;
    page.drawText("Zľava:", {
      x: summaryX,
      y: y,
      size: 10,
      font: fontRegular,
      color: gray,
    });
    page.drawText(`-${formatCurrencyPdf(invoice.discount_amount)}`, {
      x: 480,
      y: y,
      size: 10,
      font: fontRegular,
      color: black,
    });
  }

  y -= 25;
  page.drawLine({
    start: { x: summaryX, y: y + 5 },
    end: { x: width - 40, y: y + 5 },
    thickness: 2,
    color: green,
  });
  page.drawText("CELKOM:", {
    x: summaryX,
    y: y - 15,
    size: 14,
    font: fontBold,
    color: green,
  });
  page.drawText(formatCurrencyPdf(invoice.total), {
    x: 480,
    y: y - 15,
    size: 14,
    font: fontBold,
    color: green,
  });

  y = y - 60;
  page.drawRectangle({
    x: 40,
    y: y - 80,
    width: width - 80,
    height: 90,
    color: lightGray,
  });
  page.drawText("PLATOBNÉ ÚDAJE", {
    x: 50,
    y: y - 15,
    size: 10,
    font: fontBold,
    color: black,
  });

  page.drawText("Spôsob platby:", {
    x: 50,
    y: y - 35,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(invoice.payment_method || "Neuvedený", {
    x: 130,
    y: y - 35,
    size: 9,
    font: fontBold,
    color: black,
  });

  page.drawText("Variabilný symbol:", {
    x: 300,
    y: y - 35,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(invoice.variable_symbol || "-", {
    x: 395,
    y: y - 35,
    size: 9,
    font: fontBold,
    color: black,
  });

  if (invoice.seller_bank_account) {
    page.drawText("Číslo účtu:", {
      x: 50,
      y: y - 55,
      size: 9,
      font: fontRegular,
      color: gray,
    });
    page.drawText(invoice.seller_bank_account, {
      x: 130,
      y: y - 55,
      size: 9,
      font: fontBold,
      color: black,
    });
  }

  if (invoice.seller_bank_name) {
    page.drawText("Banka:", {
      x: 300,
      y: y - 55,
      size: 9,
      font: fontRegular,
      color: gray,
    });
    page.drawText(invoice.seller_bank_name, {
      x: 395,
      y: y - 55,
      size: 9,
      font: fontBold,
      color: black,
    });
  }

  if (invoice.note) {
    y = y - 100;
    page.drawRectangle({
      x: 40,
      y: y - 40,
      width: width - 80,
      height: 45,
      color: rgb(1, 0.98, 0.92),
      borderColor: rgb(0.99, 0.83, 0.3),
      borderWidth: 1,
    });
    page.drawText(invoice.note, {
      x: 50,
      y: y - 25,
      size: 9,
      font: fontRegular,
      color: rgb(0.57, 0.25, 0.05),
    });
  }

  page.drawText("Ďakujeme za váš nákup!", {
    x: width / 2 - 60,
    y: 60,
    size: 10,
    font: fontRegular,
    color: gray,
  });
  page.drawText(`${SELLER_INFO.web} | ${SELLER_INFO.email} | ${SELLER_INFO.phone}`, {
    x: width / 2 - 120,
    y: 45,
    size: 9,
    font: fontRegular,
    color: gray,
  });

  return await pdfDoc.save();
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
          .select(
            "*, items:order_items(*), customer:customers(*), shipping_method:shipping_methods(*), payment_method:payment_methods(*)"
          )
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
            JSON.stringify({
              success: true,
              message: "Faktura uz existuje",
              data: existingInvoice,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        const deliveryDate = order.shipped_at
          ? new Date(order.shipped_at)
          : issueDate;

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
            buyer_name:
              order.billing_company_name ||
              `${order.billing_first_name} ${order.billing_last_name}`,
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
            note: order.billing_ic_dph
              ? "Dodanie tovaru je oslobodené od DPH podľa §43 zákona o DPH."
              : null,
          })
          .select()
          .single();

        if (invoiceError || !invoice)
          throw new Error("Nepodarilo sa vytvorit fakturu");

        const invoiceItems = order.items.map(
          (item: Record<string, unknown>) => ({
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
          })
        );

        if (order.shipping_cost > 0) {
          invoiceItems.push({
            invoice_id: invoice.id,
            product_name: `Doprava - ${order.shipping_method?.name_sk || "Standardna"}`,
            product_sku: "SHIPPING",
            quantity: 1,
            unit: "ks",
            price_without_vat:
              order.shipping_cost /
              (1 + (order.shipping_method?.vat_rate || 20) / 100),
            price_with_vat: order.shipping_cost,
            vat_rate: order.shipping_method?.vat_rate || 20,
            vat_mode: "standard",
            line_total: order.shipping_cost,
          });
        }

        await supabase.from("invoice_items").insert(invoiceItems);
        await supabase
          .from("orders")
          .update({ invoice_id: invoice.id })
          .eq("id", orderId);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Faktura bola uspesne vytvorena",
            data: { invoiceId: invoice.id, invoiceNumber: invoice.invoice_number },
          }),
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
          .select(
            "id, invoice_number, invoice_type, status, issue_date, due_date, total, buyer_name, order:orders(order_number)",
            { count: "exact" }
          );

        if (customerId) query = query.eq("customer_id", customerId);
        if (status) query = query.eq("status", status);
        if (from) query = query.gte("issue_date", from);
        if (to) query = query.lte("issue_date", to);

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
        if (!invoiceId) throw new Error("invoiceId je povinny");

        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({ status: "paid", paid_at: paidAt || new Date().toISOString() })
          .eq("id", invoiceId)
          .select()
          .single();

        if (error || !invoice)
          throw new Error("Nepodarilo sa aktualizovat fakturu");

        if (invoice.order_id) {
          await supabase
            .from("orders")
            .update({ payment_status: "paid" })
            .eq("id", invoice.order_id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Faktura bola oznacena ako zaplatena",
            data: invoice,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        const { invoiceId, reason } = body;
        if (!invoiceId) throw new Error("invoiceId je povinny");

        const { data: invoice, error } = await supabase
          .from("invoices")
          .update({
            status: "cancelled",
            note: reason ? `Storno: ${reason}` : "Stornovana faktura",
          })
          .eq("id", invoiceId)
          .select()
          .single();

        if (error || !invoice)
          throw new Error("Nepodarilo sa stornovat fakturu");

        return new Response(
          JSON.stringify({
            success: true,
            message: "Faktura bola stornovana",
            data: invoice,
          }),
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

        const pdfBytes = await generateInvoicePdf(invoice);

        return new Response(pdfBytes, {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="faktura-${invoice.invoice_number}.pdf"`,
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
            JSON.stringify({
              success: true,
              message: "Ziadne faktury na export",
              data: { xml: "", count: 0 },
            }),
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

          for (const item of inv.items as {
            product_name: string;
            product_sku: string;
            quantity: number;
            unit: string;
            price_without_vat: number;
            price_with_vat: number;
            vat_rate: number;
            vat_mode: string;
            line_total: number;
          }[]) {
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
            data: { xml, count: invoices.length, period: { from, to } },
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
