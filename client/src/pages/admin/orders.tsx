import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Search,
  ExternalLink,
  ChevronDown,
  Eye,
  FileText,
  Truck,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Palette,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface Order {
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

interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
}

const ORDER_STATUSES = [
  { value: "pending", label: "Čakajúca", color: "amber" },
  { value: "confirmed", label: "Potvrdená", color: "blue" },
  { value: "processing", label: "Spracováva sa", color: "blue" },
  { value: "shipped", label: "Odoslaná", color: "violet" },
  { value: "delivered", label: "Doručená", color: "emerald" },
  { value: "cancelled", label: "Zrušená", color: "red" },
];

export default function AdminOrders() {
  const [location, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const isAdmin = localStorage.getItem("hdmobil_admin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterPayment, page]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(*)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }
      if (filterPayment !== "all") {
        query = query.eq("payment_status", filterPayment);
      }

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      setOrders(data || []);
      setTotalCount(count || 0);

      const statsRes = await supabase
        .from("orders")
        .select("status");

      if (statsRes.data) {
        const statusCounts = statsRes.data.reduce(
          (acc, o) => {
            if (o.status === "pending") acc.pending++;
            else if (o.status === "processing" || o.status === "confirmed")
              acc.processing++;
            else if (o.status === "shipped") acc.shipped++;
            else if (o.status === "delivered") acc.delivered++;
            return acc;
          },
          { pending: 0, processing: 0, shipped: 0, delivered: 0 }
        );
        setStats(statusCounts);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Nepodarilo sa načítať objednávky");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatus(true);
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === "shipped") {
        updates.shipped_at = new Date().toISOString();
      } else if (newStatus === "delivered") {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Stav objednávky bol aktualizovaný");
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Nepodarilo sa aktualizovať stav");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function generateInvoice(orderId: string) {
    setGeneratingInvoice(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Faktúra bola vytvorená");
        fetchOrders();
      } else {
        toast.error(result.error || "Nepodarilo sa vytvoriť faktúru");
      }
    } catch (err) {
      console.error("Error generating invoice:", err);
      toast.error("Nepodarilo sa vytvoriť faktúru");
    } finally {
      setGeneratingInvoice(false);
    }
  }

  async function downloadInvoice(orderId: string) {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/download?orderId=${orderId}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error("Nepodarilo sa stiahnuť faktúru");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("hdmobil_admin");
    navigate("/admin/login");
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(query) ||
      `${order.billing_first_name} ${order.billing_last_name}`
        .toLowerCase()
        .includes(query) ||
      order.billing_email?.toLowerCase().includes(query)
    );
  });

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Prehľad" },
    { href: "/admin/products", icon: Package, label: "Produkty" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Objednávky" },
    { href: "/admin/customers", icon: Users, label: "Zákazníci" },
    { href: "/admin/invoices", icon: FileText, label: "Faktúry" },
    { href: "/admin/cms", icon: Palette, label: "Obsah stránky" },
    { href: "/admin/settings", icon: Settings, label: "Nastavenia" },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string; dot: string }
    > = {
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        label: "Čakajúca",
        dot: "bg-amber-500",
      },
      confirmed: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        label: "Potvrdená",
        dot: "bg-blue-500",
      },
      processing: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        label: "Spracováva sa",
        dot: "bg-blue-500",
      },
      shipped: {
        bg: "bg-violet-50",
        text: "text-violet-700",
        label: "Odoslaná",
        dot: "bg-violet-500",
      },
      delivered: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        label: "Doručená",
        dot: "bg-emerald-500",
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        label: "Zrušená",
        dot: "bg-red-500",
      },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
        {s.label}
      </span>
    );
  };

  const getPaymentBadge = (payment: string) => {
    return payment === "paid" ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        <CheckCircle className="w-3 h-3" />
        Zaplatené
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <AlertCircle className="w-3 h-3" />
        Nezaplatené
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-sm">HD</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">HDmobil</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Zobraziť web</span>
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200/80 min-h-[calc(100vh-57px)] hidden lg:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`}
                    strokeWidth={1.5}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span>Odhlásiť sa</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Objednávky
                </h2>
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
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.pending}
                    </p>
                    <p className="text-sm text-gray-500">Čakajúce</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <AlertCircle
                      className="w-5 h-5 text-blue-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.processing}
                    </p>
                    <p className="text-sm text-gray-500">Spracovávané</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.shipped}
                    </p>
                    <p className="text-sm text-gray-500">Odoslané</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle
                      className="w-5 h-5 text-emerald-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.delivered}
                    </p>
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
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
                      onChange={(e) => {
                        setFilterPayment(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
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
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Objednávka
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zákazník
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Položky
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Suma
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stav
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platba
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dátum
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                            >
                              {order.order_number}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.billing_first_name} {order.billing_last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.billing_email}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {order.items?.length || 0} ks
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                            {parseFloat(String(order.total)).toLocaleString()} EUR
                          </td>
                          <td className="px-5 py-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-5 py-4">
                            {getPaymentBadge(order.payment_status)}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("sk-SK")}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.invoice_id ? (
                                <button
                                  onClick={() => downloadInvoice(order.id)}
                                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => generateInvoice(order.id)}
                                  disabled={generatingInvoice}
                                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-5 py-12 text-center text-gray-500"
                          >
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
                  Zobrazených{" "}
                  <span className="font-medium text-gray-700">
                    {filteredOrders.length}
                  </span>{" "}
                  z{" "}
                  <span className="font-medium text-gray-700">{totalCount}</span>{" "}
                  objednávok
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
                    <span className="text-sm text-gray-600">
                      {page} / {totalPages}
                    </span>
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

            {selectedOrder && (
              <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Detail objednávky {selectedOrder.order_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Vytvorená{" "}
                      {new Date(selectedOrder.created_at).toLocaleString("sk-SK")}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Fakturačné údaje
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                      <p className="font-medium text-gray-900">
                        {selectedOrder.billing_first_name}{" "}
                        {selectedOrder.billing_last_name}
                      </p>
                      {selectedOrder.billing_company_name && (
                        <p className="text-gray-600">
                          {selectedOrder.billing_company_name}
                        </p>
                      )}
                      <p className="text-gray-600">{selectedOrder.billing_street}</p>
                      <p className="text-gray-600">
                        {selectedOrder.billing_zip} {selectedOrder.billing_city}
                      </p>
                      <p className="text-gray-600">{selectedOrder.billing_country}</p>
                      <p className="text-gray-600 mt-2">
                        {selectedOrder.billing_email}
                      </p>
                      {selectedOrder.billing_phone && (
                        <p className="text-gray-600">
                          {selectedOrder.billing_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Doručovacie údaje
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                      <p className="font-medium text-gray-900">
                        {selectedOrder.shipping_first_name}{" "}
                        {selectedOrder.shipping_last_name}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shipping_street}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shipping_zip} {selectedOrder.shipping_city}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shipping_country}
                      </p>
                      <p className="text-emerald-600 mt-2 font-medium">
                        {selectedOrder.shipping_method_name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Platba a stav
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spôsob platby:</span>
                        <span className="font-medium">
                          {selectedOrder.payment_method_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stav platby:</span>
                        {getPaymentBadge(selectedOrder.payment_status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stav objednávky:</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      {selectedOrder.tracking_number && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sledovacie číslo:</span>
                          <span className="font-medium">
                            {selectedOrder.tracking_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Položky objednávky
                  </h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Produkt
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Cena
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Množstvo
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Spolu
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.product_image_url && (
                                  <img
                                    src={item.product_image_url}
                                    alt={item.product_name}
                                    className="w-10 h-10 object-contain rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.product_name}
                                  </p>
                                  {item.product_sku && (
                                    <p className="text-xs text-gray-500">
                                      SKU: {item.product_sku}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              {parseFloat(String(item.price_with_vat)).toLocaleString()}{" "}
                              EUR
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              {item.quantity}x
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              {parseFloat(String(item.line_total)).toLocaleString()} EUR
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-gray-200">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-gray-600">
                            Medzisúčet:
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {parseFloat(String(selectedOrder.subtotal)).toLocaleString()}{" "}
                            EUR
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-gray-600">
                            DPH:
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {parseFloat(String(selectedOrder.vat_total)).toLocaleString()}{" "}
                            EUR
                          </td>
                        </tr>
                        {parseFloat(String(selectedOrder.shipping_cost)) > 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-2 text-right text-gray-600"
                            >
                              Doprava:
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              {parseFloat(
                                String(selectedOrder.shipping_cost)
                              ).toLocaleString()}{" "}
                              EUR
                            </td>
                          </tr>
                        )}
                        {parseFloat(String(selectedOrder.discount_amount)) > 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-2 text-right text-gray-600"
                            >
                              Zľava:
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-red-600">
                              -
                              {parseFloat(
                                String(selectedOrder.discount_amount)
                              ).toLocaleString()}{" "}
                              EUR
                            </td>
                          </tr>
                        )}
                        <tr className="bg-gray-100">
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-right font-semibold text-gray-900"
                          >
                            Celkom:
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-lg text-emerald-600">
                            {parseFloat(String(selectedOrder.total)).toLocaleString()}{" "}
                            EUR
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selectedOrder.customer_note && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Poznámka zákazníka
                    </h4>
                    <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
                      {selectedOrder.customer_note}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 justify-end">
                  <div className="relative">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        updateOrderStatus(selectedOrder.id, e.target.value)
                      }
                      disabled={updatingStatus}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {selectedOrder.invoice_id ? (
                    <button
                      onClick={() => downloadInvoice(selectedOrder.id)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Stiahnuť faktúru
                    </button>
                  ) : (
                    <button
                      onClick={() => generateInvoice(selectedOrder.id)}
                      disabled={generatingInvoice}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                    >
                      {generatingInvoice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      Vytvoriť faktúru
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
