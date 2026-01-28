import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  TrendingDown,
  Euro,
  Clock,
  ChevronRight,
  ExternalLink,
  BarChart3,
  PieChartIcon,
  FileText,
  Loader2,
  RefreshCw,
  Palette,
  Megaphone,
  MessageSquare,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingPayments: number;
  ordersByStatus: { status: string; count: number }[];
  recentOrders: {
    id: string;
    order_number: string;
    customer_name: string;
    email: string;
    total: number;
    status: string;
    created_at: string;
    items_count: number;
  }[];
  revenueByMonth: { month: string; revenue: number }[];
  salesByCategory: { name: string; value: number; color: string }[];
}

const statusColors: Record<string, string> = {
  pending: "#fbbf24",
  confirmed: "#3b82f6",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  returned: "#f97316",
};

const statusLabels: Record<string, string> = {
  pending: "Čakajúce",
  confirmed: "Potvrdené",
  processing: "Spracované",
  shipped: "Odoslané",
  delivered: "Doručené",
  cancelled: "Zrušené",
  returned: "Vrátené",
};

const categoryColors = [
  "#22c55e",
  "#16a34a",
  "#15803d",
  "#166534",
  "#14532d",
  "#0d9488",
  "#0891b2",
];

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const hasCheckedAuth = useRef(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const isAdmin = localStorage.getItem("hdmobil_admin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    setLoading(true);
    try {
      const [ordersRes, customersRes, categoriesRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, order_number, status, total, payment_status, created_at, billing_first_name, billing_last_name, billing_email"),
        supabase.from("customers").select("id, created_at"),
        supabase.from("categories").select("id, name_sk"),
      ]);

      const orders = ordersRes.data || [];
      const customers = customersRes.data || [];
      const categories = categoriesRes.data || [];

      const orderItemsRes = await supabase
        .from("order_items")
        .select("order_id, product_id, line_total, products(category_id)");
      const orderItems = orderItemsRes.data || [];

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, o) => sum + (parseFloat(o.total) || 0),
        0
      );
      const totalCustomers = customers.length;
      const pendingPayments = orders.filter(
        (o) => o.payment_status === "pending"
      ).length;

      const statusCounts: Record<string, number> = {};
      orders.forEach((o) => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      const ordersByStatus = Object.entries(statusCounts).map(
        ([status, count]) => ({
          status,
          count,
        })
      );

      const recentOrders = orders
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5)
        .map((o) => {
          const itemsForOrder = orderItems.filter((i) => i.order_id === o.id);
          return {
            id: o.id,
            order_number: o.order_number,
            customer_name: `${o.billing_first_name || ""} ${o.billing_last_name || ""}`.trim() || "Neznamy",
            email: o.billing_email || "",
            total: parseFloat(o.total) || 0,
            status: o.status,
            created_at: o.created_at,
            items_count: itemsForOrder.length,
          };
        });

      const revenueByMonth: { month: string; revenue: number }[] = [];
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Maj",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dec",
      ];
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 12; i++) {
        const monthOrders = orders.filter((o) => {
          const d = new Date(o.created_at);
          return d.getFullYear() === currentYear && d.getMonth() === i;
        });
        const revenue = monthOrders.reduce(
          (sum, o) => sum + (parseFloat(o.total) || 0),
          0
        );
        revenueByMonth.push({ month: monthNames[i], revenue });
      }

      const categoryRevenue: Record<string, number> = {};
      orderItems.forEach((item) => {
        const products = item.products as unknown as { category_id: string } | null;
        const catId = products?.category_id;
        if (catId) {
          categoryRevenue[catId] =
            (categoryRevenue[catId] || 0) + (parseFloat(String(item.line_total)) || 0);
        }
      });

      const totalCategoryRevenue = Object.values(categoryRevenue).reduce(
        (a, b) => a + b,
        0
      );
      const salesByCategory = categories.map((cat, idx) => ({
        name: cat.name_sk,
        value:
          totalCategoryRevenue > 0
            ? Math.round(((categoryRevenue[cat.id] || 0) / totalCategoryRevenue) * 100)
            : 0,
        color: categoryColors[idx % categoryColors.length],
      })).filter(c => c.value > 0);

      if (salesByCategory.length === 0) {
        salesByCategory.push({ name: "Bez kategórií", value: 100, color: "#9ca3af" });
      }

      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers,
        pendingPayments,
        ordersByStatus,
        recentOrders,
        revenueByMonth,
        salesByCategory,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("hdmobil_admin");
    navigate("/admin/login");
  };

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
        bg: "bg-blue-50",
        text: "text-blue-700",
        label: "Doručená",
        dot: "bg-blue-500",
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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
        {s.label}
      </span>
    );
  };

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

  const maxRevenue = stats
    ? Math.max(...stats.revenueByMonth.map((d) => d.revenue), 1)
    : 1;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil Logo" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">HDmobil</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardStats}
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
                <h2 className="text-2xl font-semibold text-gray-900">Prehľad</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Vitajte späť! Tu je prehľad vášho obchodu.
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Posledná aktualizácia:{" "}
                <span className="font-medium text-gray-700">práve teraz</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm font-medium">
                          Celkové objednávky
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                          {stats.totalOrders}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <ShoppingCart
                          className="w-6 h-6 text-blue-600"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm font-medium">Tržby</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                          {stats.totalRevenue.toLocaleString("sk-SK", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          EUR
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Euro className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm font-medium">
                          Zákazníci
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                          {stats.totalCustomers}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm font-medium">
                          Čakajúce platby
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                          {stats.pendingPayments}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200/80 p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <BarChart3
                            className="w-5 h-5 text-blue-600"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Tržby za rok {new Date().getFullYear()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Mesačný prehľad tržieb
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end justify-between h-[240px] gap-2 px-2">
                      {stats.revenueByMonth.map((item, idx) => {
                        const height =
                          maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center flex-1 gap-2"
                          >
                            <div className="w-full flex flex-col items-center justify-end h-[200px]">
                              <div
                                className="w-full max-w-[40px] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all hover:from-blue-600 hover:to-blue-500"
                                style={{ height: `${Math.max(height, 2)}%` }}
                                title={`${item.revenue.toLocaleString()} EUR`}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{item.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <PieChartIcon
                          className="w-5 h-5 text-blue-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Predaj podľa kategórií
                        </h3>
                        <p className="text-sm text-gray-500">Rozdelenie tržieb</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <svg width={140} height={140} viewBox="0 0 140 140">
                        {(() => {
                          let cumulativePercent = 0;
                          const strokeWidth = 24;
                          const radius = (140 - strokeWidth) / 2;
                          const circumference = 2 * Math.PI * radius;
                          return stats.salesByCategory.map((item, idx) => {
                            const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
                            const strokeDashoffset =
                              (-cumulativePercent * circumference) / 100;
                            cumulativePercent += item.value;
                            return (
                              <circle
                                key={idx}
                                cx={70}
                                cy={70}
                                r={radius}
                                fill="none"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 70 70)"
                              />
                            );
                          });
                        })()}
                      </svg>
                    </div>
                    <div className="space-y-2 mt-6">
                      {stats.salesByCategory.map((cat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            ></div>
                            <span className="text-gray-600">{cat.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {cat.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Stav objednávok
                    </h3>
                    <div className="space-y-3">
                      {stats.ordersByStatus.map((status, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2 h-8 rounded-full"
                              style={{
                                backgroundColor:
                                  statusColors[status.status] || "#9ca3af",
                              }}
                            ></div>
                            <span className="text-sm text-gray-600">
                              {statusLabels[status.status] || status.status}
                            </span>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            {status.count}
                          </span>
                        </div>
                      ))}
                      {stats.ordersByStatus.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Žiadne objednávky
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200/80">
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">
                          Posledné objednávky
                        </h3>
                        <Link
                          href="/admin/orders"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Zobraziť všetky
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
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
                              Dátum
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {stats.recentOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-5 py-4">
                                <Link
                                  href={`/admin/orders?id=${order.id}`}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                  {order.order_number}
                                </Link>
                              </td>
                              <td className="px-5 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {order.customer_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {order.email}
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {order.items_count} ks
                              </td>
                              <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                {order.total.toLocaleString()} EUR
                              </td>
                              <td className="px-5 py-4">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString(
                                  "sk-SK"
                                )}
                              </td>
                            </tr>
                          ))}
                          {stats.recentOrders.length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-5 py-8 text-center text-gray-500"
                              >
                                Žiadne objednávky
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">
                Nepodarilo sa načítať dáta
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
