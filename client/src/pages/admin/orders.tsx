import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  invoice_id: string;
  items: { id: string }[];
}

interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
}

const ORDER_STATUSES = [
  { value: "pending", label: "Čakajúca", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  { value: "confirmed", label: "Potvrdená", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  { value: "processing", label: "Spracováva sa", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  { value: "shipped", label: "Odoslaná", dot: "bg-teal-500", bg: "bg-teal-50", text: "text-teal-700" },
  { value: "delivered", label: "Doručená", dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
  { value: "cancelled", label: "Zrušená", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
];

const PAYMENT_STATUSES = [
  { value: "paid", label: "Zaplatené", icon: "check" },
  { value: "pending", label: "Nezaplatené", icon: "alert" },
];

function InlineStatusSelect({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: string;
  onUpdated: (id: string, newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = ORDER_STATUSES.find((s) => s.value === currentStatus) || ORDER_STATUSES[0];

  async function select(value: string) {
    if (value === currentStatus) { setOpen(false); return; }
    setUpdating(true);
    setOpen(false);
    const updates: Record<string, unknown> = { status: value };
    if (value === "shipped") updates.shipped_at = new Date().toISOString();
    if (value === "delivered") updates.delivered_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (!error) {
      onUpdated(orderId, value);
      toast.success("Stav objednávky aktualizovaný");
    } else {
      toast.error("Nepodarilo sa aktualizovať stav");
    }
    setUpdating(false);
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        disabled={updating}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 ${current.bg} ${current.text} disabled:opacity-60`}
      >
        {updating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        )}
        {current.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/60 py-1 min-w-[160px]">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => select(s.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                s.value === currentStatus ? "font-medium" : "text-gray-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {s.label}
              {s.value === currentStatus && (
                <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InlinePaymentSelect({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: string;
  onUpdated: (id: string, newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function select(value: string) {
    if (value === currentStatus) { setOpen(false); return; }
    setUpdating(true);
    setOpen(false);
    const { error } = await supabase.from("orders").update({ payment_status: value }).eq("id", orderId);
    if (!error) {
      onUpdated(orderId, value);
      toast.success("Stav platby aktualizovaný");
    } else {
      toast.error("Nepodarilo sa aktualizovať platbu");
    }
    setUpdating(false);
  }

  const isPaid = currentStatus === "paid";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        disabled={updating}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 disabled:opacity-60 ${
          isPaid
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {updating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isPaid ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
        {isPaid ? "Zaplatené" : "Nezaplatené"}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/60 py-1 min-w-[160px]">
          {PAYMENT_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => select(s.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                s.value === currentStatus ? "font-medium" : "text-gray-700"
              }`}
            >
              {s.value === "paid" ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              {s.label}
              {s.value === currentStatus && (
                <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ pending: 0, processing: 0, shipped: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterPayment, page]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total, created_at, billing_first_name, billing_last_name, billing_email, invoice_id, items:order_items(id)", { count: "exact" })
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") query = query.eq("status", filterStatus);
      if (filterPayment !== "all") query = query.eq("payment_status", filterPayment);

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      setOrders(data || []);
      setTotalCount(count || 0);

      const statsRes = await supabase.from("orders").select("status");
      if (statsRes.data) {
        const statusCounts = statsRes.data.reduce(
          (acc, o) => {
            if (o.status === "pending") acc.pending++;
            else if (o.status === "processing" || o.status === "confirmed") acc.processing++;
            else if (o.status === "shipped") acc.shipped++;
            else if (o.status === "delivered") acc.delivered++;
            return acc;
          },
          { pending: 0, processing: 0, shipped: 0, delivered: 0 }
        );
        setStats(statusCounts);
      }
    } catch {
      toast.error("Nepodarilo sa načítať objednávky");
    } finally {
      setLoading(false);
    }
  }

  function handleStatusUpdated(orderId: string, newStatus: string) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    const updated = orders.find((o) => o.id === orderId);
    if (updated) {
      setStats((prev) => {
        const next = { ...prev };
        if (updated.status === "pending") next.pending = Math.max(0, next.pending - 1);
        else if (updated.status === "processing" || updated.status === "confirmed") next.processing = Math.max(0, next.processing - 1);
        else if (updated.status === "shipped") next.shipped = Math.max(0, next.shipped - 1);
        else if (updated.status === "delivered") next.delivered = Math.max(0, next.delivered - 1);
        if (newStatus === "pending") next.pending++;
        else if (newStatus === "processing" || newStatus === "confirmed") next.processing++;
        else if (newStatus === "shipped") next.shipped++;
        else if (newStatus === "delivered") next.delivered++;
        return next;
      });
    }
  }

  function handlePaymentUpdated(orderId: string, newStatus: string) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o)));
  }

  async function generateInvoice(orderId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setGeneratingInvoice(orderId);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ orderId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Faktúra bola vytvorená");
        fetchOrders();
      } else {
        toast.error(result.error || "Nepodarilo sa vytvoriť faktúru");
      }
    } catch {
      toast.error("Nepodarilo sa vytvoriť faktúru");
    } finally {
      setGeneratingInvoice(null);
    }
  }

  function downloadInvoice(orderId: string, e: React.MouseEvent) {
    e.stopPropagation();
    window.open(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/download?orderId=${orderId}`, "_blank");
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(query) ||
      `${order.billing_first_name} ${order.billing_last_name}`.toLowerCase().includes(query) ||
      order.billing_email?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Objednávky</h2>
            <p className="text-gray-500 text-sm mt-1">
              Spravujte objednávky a sledujte ich stav ({totalCount} celkom)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200/80 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">Čakajúce</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.processing}</p>
                <p className="text-sm text-gray-500">Spracovávané</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-teal-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.shipped}</p>
                <p className="text-sm text-gray-500">Odoslané</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/80 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.delivered}</p>
                <p className="text-sm text-gray-500">Doručené</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hľadať podľa čísla objednávky alebo mena..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                >
                  <option value="all">Všetky stavy</option>
                  <option value="pending">Čakajúce</option>
                  <option value="confirmed">Potvrdené</option>
                  <option value="processing">Spracovávané</option>
                  <option value="shipped">Odoslané</option>
                  <option value="delivered">Doručené</option>
                  <option value="cancelled">Zrušené</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={filterPayment}
                  onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                >
                  <option value="all">Všetky platby</option>
                  <option value="paid">Zaplatené</option>
                  <option value="pending">Nezaplatené</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objednávka</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zákazník</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Položky</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suma</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platba</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dátum</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.billing_first_name} {order.billing_last_name}
                          </p>
                          <p className="text-xs text-gray-500">{order.billing_email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.items?.length || 0} ks
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        {parseFloat(String(order.total)).toLocaleString()} EUR
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <InlineStatusSelect
                          orderId={order.id}
                          currentStatus={order.status}
                          onUpdated={handleStatusUpdated}
                        />
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <InlinePaymentSelect
                          orderId={order.id}
                          currentStatus={order.payment_status}
                          onUpdated={handlePaymentUpdated}
                        />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("sk-SK")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {order.invoice_id ? (
                            <button
                              onClick={(e) => downloadInvoice(order.id, e)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Stiahnuť faktúru"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => generateInvoice(order.id, e)}
                              disabled={generatingInvoice === order.id}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Vytvoriť faktúru"
                            >
                              {generatingInvoice === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Zobraziť detail"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-500">
                        Žiadne objednávky
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Zobrazených <span className="font-medium text-gray-700">{filteredOrders.length}</span> z{" "}
              <span className="font-medium text-gray-700">{totalCount}</span> objednávok
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
