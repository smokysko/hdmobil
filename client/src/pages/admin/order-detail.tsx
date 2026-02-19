import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Truck,
  MapPin,
  CreditCard,
  Package,
  User,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  vat_total: number;
  shipping_cost: number;
  discount_amount: number;
  created_at: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_street: string;
  billing_city: string;
  billing_zip: string;
  billing_country: string;
  billing_company_name: string;
  billing_ico: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_method_name: string;
  payment_method_name: string;
  customer_note: string;
  admin_note: string;
  tracking_number: string;
  invoice_id: string;
  items: {
    id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    price_with_vat: number;
    line_total: number;
    product_image_url: string;
  }[];
}

const ORDER_STATUSES = [
  { value: "pending", label: "Čakajúca", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  { value: "confirmed", label: "Potvrdená", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  { value: "processing", label: "Spracováva sa", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  { value: "shipped", label: "Odoslaná", dot: "bg-teal-500", bg: "bg-teal-50", text: "text-teal-700" },
  { value: "delivered", label: "Doručená", dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
  { value: "cancelled", label: "Zrušená", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
];

export default function AdminOrderDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (params.id) fetchOrder(params.id);
  }, [params.id]);

  async function fetchOrder(id: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Objednávka sa nenašla");
      navigate("/admin/orders");
      return;
    }
    setOrder(data);
    setAdminNote(data.admin_note || "");
    setTrackingNumber(data.tracking_number || "");
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setUpdatingStatus(true);
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "shipped") updates.shipped_at = new Date().toISOString();
    if (newStatus === "delivered") updates.delivered_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(updates).eq("id", order.id);
    if (!error) {
      setOrder({ ...order, status: newStatus });
      toast.success("Stav objednávky aktualizovaný");
    } else {
      toast.error("Nepodarilo sa aktualizovať stav");
    }
    setUpdatingStatus(false);
  }

  async function updatePayment(newStatus: string) {
    if (!order) return;
    setUpdatingPayment(true);
    const { error } = await supabase.from("orders").update({ payment_status: newStatus }).eq("id", order.id);
    if (!error) {
      setOrder({ ...order, payment_status: newStatus });
      toast.success("Stav platby aktualizovaný");
    } else {
      toast.error("Nepodarilo sa aktualizovať platbu");
    }
    setUpdatingPayment(false);
  }

  async function saveAdminNote() {
    if (!order) return;
    setSavingNote(true);
    const { error } = await supabase.from("orders").update({ admin_note: adminNote, tracking_number: trackingNumber }).eq("id", order.id);
    if (!error) {
      setOrder({ ...order, admin_note: adminNote, tracking_number: trackingNumber });
      toast.success("Poznámka uložená");
    } else {
      toast.error("Nepodarilo sa uložiť");
    }
    setSavingNote(false);
  }

  async function generateInvoice() {
    if (!order) return;
    setGeneratingInvoice(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ orderId: order.id }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Faktúra bola vytvorená");
        fetchOrder(order.id);
      } else {
        toast.error(result.error || "Nepodarilo sa vytvoriť faktúru");
      }
    } catch {
      toast.error("Nepodarilo sa vytvoriť faktúru");
    } finally {
      setGeneratingInvoice(false);
    }
  }

  function downloadInvoice() {
    if (!order) return;
    window.open(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/download?orderId=${order.id}`, "_blank");
  }

  const currentStatus = ORDER_STATUSES.find((s) => s.value === order?.status) || ORDER_STATUSES[0];
  const isPaid = order?.payment_status === "paid";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) return null;

  return (
    <AdminLayout>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Späť na objednávky
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <h2 className="text-xl font-semibold text-gray-900">{order.order_number}</h2>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
            {currentStatus.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isPaid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {isPaid ? "Zaplatené" : "Nezaplatené"}
          </span>
          <p className="text-sm text-gray-400 ml-auto">
            {new Date(order.created_at).toLocaleString("sk-SK")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Položky objednávky</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produkt</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cena</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mn.</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spolu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.product_image_url && (
                            <img src={item.product_image_url} alt={item.product_name} className="w-10 h-10 object-contain rounded-lg bg-gray-50" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                            {item.product_sku && <p className="text-xs text-gray-400">SKU: {item.product_sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-600">
                        {parseFloat(String(item.price_with_vat)).toLocaleString()} EUR
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-600">{item.quantity}×</td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                        {parseFloat(String(item.line_total)).toLocaleString()} EUR
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-100">
                  <tr>
                    <td colSpan={3} className="px-5 py-2 text-right text-sm text-gray-500">Medzisúčet:</td>
                    <td className="px-5 py-2 text-right text-sm font-medium">{parseFloat(String(order.subtotal)).toLocaleString()} EUR</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-5 py-2 text-right text-sm text-gray-500">DPH:</td>
                    <td className="px-5 py-2 text-right text-sm font-medium">{parseFloat(String(order.vat_total)).toLocaleString()} EUR</td>
                  </tr>
                  {parseFloat(String(order.shipping_cost)) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right text-sm text-gray-500">Doprava:</td>
                      <td className="px-5 py-2 text-right text-sm font-medium">{parseFloat(String(order.shipping_cost)).toLocaleString()} EUR</td>
                    </tr>
                  )}
                  {parseFloat(String(order.discount_amount)) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right text-sm text-gray-500">Zľava:</td>
                      <td className="px-5 py-2 text-right text-sm font-medium text-red-600">
                        -{parseFloat(String(order.discount_amount)).toLocaleString()} EUR
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-50/70">
                    <td colSpan={3} className="px-5 py-3 text-right font-semibold text-gray-900">Celkom:</td>
                    <td className="px-5 py-3 text-right font-bold text-lg text-blue-600">
                      {parseFloat(String(order.total)).toLocaleString()} EUR
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Fakturačné údaje</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{order.billing_first_name} {order.billing_last_name}</p>
                  {order.billing_company_name && <p>{order.billing_company_name}</p>}
                  {order.billing_ico && <p className="text-gray-400">IČO: {order.billing_ico}</p>}
                  <p className="pt-1">{order.billing_street}</p>
                  <p>{order.billing_zip} {order.billing_city}</p>
                  <p>{order.billing_country}</p>
                  <p className="pt-2 text-blue-600">{order.billing_email}</p>
                  {order.billing_phone && <p>{order.billing_phone}</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Doručovacie údaje</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{order.shipping_first_name} {order.shipping_last_name}</p>
                  <p className="pt-1">{order.shipping_street}</p>
                  <p>{order.shipping_zip} {order.shipping_city}</p>
                  <p>{order.shipping_country}</p>
                  <p className="pt-2 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-teal-500" />
                    <span className="font-medium text-gray-700">{order.shipping_method_name}</span>
                  </p>
                </div>
              </div>
            </div>

            {order.customer_note && (
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Poznámka zákazníka</p>
                <p className="text-sm text-amber-800">{order.customer_note}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200/80 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Interná poznámka & sledovanie</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Sledovacie číslo zásielky</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="napr. SK123456789"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Interná poznámka (vidí len admin)</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    placeholder="Pridajte internú poznámku..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
                <button
                  onClick={saveAdminNote}
                  disabled={savingNote}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {savingNote ? "Ukladám..." : "Uložiť"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200/80 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Platba</h3>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Spôsob:</span>
                  <span className="font-medium text-gray-800">{order.payment_method_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Stav:</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPaid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {isPaid ? "Zaplatené" : "Nezaplatené"}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Zmeniť stav platby</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePayment("paid")}
                    disabled={updatingPayment || isPaid}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 ${isPaid ? "bg-green-100 text-green-700 cursor-default" : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"}`}
                  >
                    {updatingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : "Zaplatené"}
                  </button>
                  <button
                    onClick={() => updatePayment("pending")}
                    disabled={updatingPayment || !isPaid}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 ${!isPaid ? "bg-red-100 text-red-700 cursor-default" : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700"}`}
                  >
                    Nezaplatené
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Stav objednávky</h3>
              <div className="space-y-1.5">
                {ORDER_STATUSES.map((s) => {
                  const isActive = order.status === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(s.value)}
                      disabled={updatingStatus || isActive}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? `${s.bg} ${s.text} font-medium cursor-default`
                          : "hover:bg-gray-50 text-gray-600"
                      } disabled:opacity-60`}
                    >
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      {s.label}
                      {isActive && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                      {updatingStatus && isActive && <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Faktúra</h3>
              {order.invoice_id ? (
                <button
                  onClick={downloadInvoice}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  Stiahnuť faktúru
                </button>
              ) : (
                <button
                  onClick={generateInvoice}
                  disabled={generatingInvoice}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  {generatingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Vytvoriť faktúru
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
