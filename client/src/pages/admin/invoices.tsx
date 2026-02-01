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
  RefreshCw,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Euro,
  Calendar,
  ChevronDown,
  Palette,
  Tag,
  Megaphone,
  MessageSquare,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  issue_date: string;
  due_date: string;
  delivery_date: string;
  buyer_name: string;
  buyer_ico: string;
  buyer_street: string;
  buyer_city: string;
  buyer_zip: string;
  subtotal: number;
  vat_total: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  currency: string;
  payment_method: string;
  variable_symbol: string;
  paid_at: string;
  created_at: string;
  order_id: string;
  order?: { order_number: string };
  items?: {
    id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    price_with_vat: number;
    vat_rate: number;
    line_total: number;
  }[];
}

interface InvoiceStats {
  total: number;
  issued: number;
  paid: number;
  overdue: number;
  totalRevenue: number;
}

export default function AdminInvoices() {
  const [location, navigate] = useLocation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    total: 0,
    issued: 0,
    paid: 0,
    overdue: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
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
    fetchInvoices();
  }, [page, filterStatus]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      let query = supabase
        .from("invoices")
        .select("*, order:orders!invoices_order_id_fkey(order_number)", { count: "exact" })
        .order("issue_date", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      query = query.range(offset, offset + pageSize - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      setInvoices(data || []);
      setTotalCount(count || 0);

      const allInvoicesRes = await supabase.from("invoices").select("status, total, due_date");

      if (allInvoicesRes.data) {
        const now = new Date();
        setStats({
          total: allInvoicesRes.data.length,
          issued: allInvoicesRes.data.filter((i) => i.status === "issued").length,
          paid: allInvoicesRes.data.filter((i) => i.status === "paid").length,
          overdue: allInvoicesRes.data.filter(
            (i) => i.status === "issued" && new Date(i.due_date) < now
          ).length,
          totalRevenue: allInvoicesRes.data
            .filter((i) => i.status === "paid")
            .reduce((sum, i) => sum + (parseFloat(String(i.total)) || 0), 0),
        });
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Nepodarilo sa načítať faktúry");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoiceItems(invoiceId: string) {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId);

      if (error) throw error;

      if (selectedInvoice) {
        setSelectedInvoice({ ...selectedInvoice, items: data || [] });
      }
    } catch (err) {
      console.error("Error fetching invoice items:", err);
    } finally {
      setLoadingItems(false);
    }
  }

  function selectInvoice(invoice: Invoice) {
    setSelectedInvoice(invoice);
    fetchInvoiceItems(invoice.id);
  }

  async function markAsPaid(invoiceId: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/mark-paid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ invoiceId }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Faktúra bola označená ako zaplatená");
        fetchInvoices();
        if (selectedInvoice?.id === invoiceId) {
          setSelectedInvoice({ ...selectedInvoice, status: "paid" });
        }
      } else {
        toast.error(result.error || "Nepodarilo sa aktualizovať faktúru");
      }
    } catch (err) {
      console.error("Error marking invoice as paid:", err);
      toast.error("Nepodarilo sa aktualizovať faktúru");
    }
  }

  function downloadInvoice(invoiceId: string) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/download?id=${invoiceId}`;
    window.open(url, "_blank");
  }

  const handleLogout = () => {
    localStorage.removeItem("hdmobil_admin");
    navigate("/admin/login");
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.buyer_name?.toLowerCase().includes(query) ||
      invoice.variable_symbol?.includes(query)
    );
  });

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Prehľad" },
    { href: "/admin/products", icon: Package, label: "Produkty" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Objednávky" },
    { href: "/admin/customers", icon: Users, label: "Zákazníci" },
    { href: "/admin/reviews", icon: MessageSquare, label: "Recenzie" },
    { href: "/admin/invoices", icon: FileText, label: "Faktúry" },
    { href: "/admin/discounts", icon: Tag, label: "Kupóny" },
    { href: "/admin/marketing", icon: Megaphone, label: "Marketing" },
    { href: "/admin/cms", icon: Palette, label: "Obsah stránky" },
    { href: "/admin/settings", icon: Settings, label: "Nastavenia" },
  ];

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status === "issued" && new Date(dueDate) < new Date();

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
          <XCircle className="w-3 h-3" />
          Po splatnosti
        </span>
      );
    }

    const statusMap: Record<
      string,
      { bg: string; text: string; label: string; icon: typeof Clock }
    > = {
      issued: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        label: "Vystavená",
        icon: Clock,
      },
      paid: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        label: "Zaplatená",
        icon: CheckCircle,
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        label: "Stornovaná",
        icon: XCircle,
      },
    };
    const s = statusMap[status] || statusMap.issued;
    const Icon = s.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
      >
        <Icon className="w-3 h-3" />
        {s.label}
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
              <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil Logo" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">HDmobil</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchInvoices}
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200/80 h-[calc(100vh-57px)] hidden lg:block sticky top-[57px] overflow-y-auto">
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
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
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
                <h2 className="text-2xl font-semibold text-gray-900">Faktúry</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Spravujte faktúry a sledujte platby ({totalCount} celkom)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.total}
                    </p>
                    <p className="text-sm text-gray-500">Celkom</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.issued}
                    </p>
                    <p className="text-sm text-gray-500">Vystavené</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <CheckCircle
                      className="w-5 h-5 text-blue-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.paid}
                    </p>
                    <p className="text-sm text-gray-500">Zaplatené</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.overdue}
                    </p>
                    <p className="text-sm text-gray-500">Po splatnosti</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Euro className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">
                      {stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">EUR tržby</p>
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
                    placeholder="Hľadať podľa čísla faktúry, odberateľa alebo VS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="all">Všetky stavy</option>
                    <option value="issued">Vystavené</option>
                    <option value="paid">Zaplatené</option>
                    <option value="cancelled">Stornované</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Číslo faktúry
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Odberateľ
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Objednávka
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dátum vystavenia
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Splatnosť
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Suma
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stav
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <button
                              onClick={() => selectInvoice(invoice)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {invoice.invoice_number}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {invoice.buyer_name}
                            </p>
                            {invoice.buyer_ico && (
                              <p className="text-xs text-gray-500">
                                ICO: {invoice.buyer_ico}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {invoice.order ? (
                              <Link
                                href={`/admin/orders?id=${invoice.order_id}`}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                {invoice.order.order_number}
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {new Date(invoice.issue_date).toLocaleDateString("sk-SK")}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {new Date(invoice.due_date).toLocaleDateString("sk-SK")}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                            {parseFloat(String(invoice.total)).toLocaleString()} EUR
                          </td>
                          <td className="px-5 py-4">
                            {getStatusBadge(invoice.status, invoice.due_date)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => selectInvoice(invoice)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => downloadInvoice(invoice.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredInvoices.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-5 py-12 text-center text-gray-500"
                          >
                            Žiadne faktúry
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
                    {filteredInvoices.length}
                  </span>{" "}
                  z{" "}
                  <span className="font-medium text-gray-700">{totalCount}</span>{" "}
                  faktúr
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

            {selectedInvoice && (
              <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Faktura {selectedInvoice.invoice_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      VS: {selectedInvoice.variable_symbol}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Odberateľ
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                      <p className="font-medium text-gray-900">
                        {selectedInvoice.buyer_name}
                      </p>
                      <p className="text-gray-600">{selectedInvoice.buyer_street}</p>
                      <p className="text-gray-600">
                        {selectedInvoice.buyer_zip} {selectedInvoice.buyer_city}
                      </p>
                      {selectedInvoice.buyer_ico && (
                        <p className="text-gray-600 mt-2">
                          ICO: {selectedInvoice.buyer_ico}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Dátumy
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dátum vystavenia:</span>
                        <span className="font-medium">
                          {new Date(selectedInvoice.issue_date).toLocaleDateString(
                            "sk-SK"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dátum splatnosti:</span>
                        <span className="font-medium">
                          {new Date(selectedInvoice.due_date).toLocaleDateString(
                            "sk-SK"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dátum dodania:</span>
                        <span className="font-medium">
                          {new Date(selectedInvoice.delivery_date).toLocaleDateString(
                            "sk-SK"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Platba
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spôsob platby:</span>
                        <span className="font-medium">
                          {selectedInvoice.payment_method}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stav:</span>
                        {getStatusBadge(
                          selectedInvoice.status,
                          selectedInvoice.due_date
                        )}
                      </div>
                      {selectedInvoice.paid_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Zaplatené:</span>
                          <span className="font-medium text-blue-600">
                            {new Date(selectedInvoice.paid_at).toLocaleDateString(
                              "sk-SK"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Položky faktúry
                  </h4>
                  {loadingItems ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Popis
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Cena/ks
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Mn.
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              DPH
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Spolu
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedInvoice.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">
                                  {item.product_name}
                                </p>
                                {item.product_sku && (
                                  <p className="text-xs text-gray-500">
                                    SKU: {item.product_sku}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {parseFloat(String(item.price_with_vat)).toLocaleString()}{" "}
                                EUR
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {item.vat_rate}%
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">
                                {parseFloat(String(item.line_total)).toLocaleString()}{" "}
                                EUR
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200">
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-2 text-right text-gray-600"
                            >
                              Základ dane:
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              {parseFloat(
                                String(selectedInvoice.subtotal)
                              ).toLocaleString()}{" "}
                              EUR
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-2 text-right text-gray-600"
                            >
                              DPH:
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              {parseFloat(
                                String(selectedInvoice.vat_total)
                              ).toLocaleString()}{" "}
                              EUR
                            </td>
                          </tr>
                          {parseFloat(String(selectedInvoice.shipping_cost)) > 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-2 text-right text-gray-600"
                              >
                                Doprava:
                              </td>
                              <td className="px-4 py-2 text-right font-medium">
                                {parseFloat(
                                  String(selectedInvoice.shipping_cost)
                                ).toLocaleString()}{" "}
                                EUR
                              </td>
                            </tr>
                          )}
                          <tr className="bg-gray-100">
                            <td
                              colSpan={4}
                              className="px-4 py-3 text-right font-semibold text-gray-900"
                            >
                              Celkom:
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-lg text-blue-600">
                              {parseFloat(
                                String(selectedInvoice.total)
                              ).toLocaleString()}{" "}
                              EUR
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 justify-end">
                  {selectedInvoice.status === "issued" && (
                    <button
                      onClick={() => markAsPaid(selectedInvoice.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Označiť ako zaplatenú
                    </button>
                  )}
                  <button
                    onClick={() => downloadInvoice(selectedInvoice.id)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Stiahnuť PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
