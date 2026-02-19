import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  ShoppingBag,
  Euro,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

interface Customer {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  customer_type: "individual" | "company";
  company_name: string;
  ico: string;
  dic: string;
  billing_street: string;
  billing_city: string;
  billing_zip: string;
  billing_country: string;
  created_at: string;
  is_active: boolean;
  orders_count?: number;
  total_spent?: number;
}

interface CustomerStats {
  total: number;
  individuals: number;
  companies: number;
  newThisMonth: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    individuals: 0,
    companies: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<
    { id: string; order_number: string; total: number; status: string; created_at: string }[]
  >([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const { data, count, error } = await supabase
        .from("customers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const ordersRes = await supabase
        .from("orders")
        .select("customer_id, total");

      const orderStats = (ordersRes.data || []).reduce(
        (acc, order) => {
          if (!order.customer_id) return acc;
          if (!acc[order.customer_id]) {
            acc[order.customer_id] = { count: 0, total: 0 };
          }
          acc[order.customer_id].count++;
          acc[order.customer_id].total += parseFloat(order.total) || 0;
          return acc;
        },
        {} as Record<string, { count: number; total: number }>
      );

      const customersWithStats = (data || []).map((c) => ({
        ...c,
        orders_count: orderStats[c.id]?.count || 0,
        total_spent: orderStats[c.id]?.total || 0,
      }));

      setCustomers(customersWithStats);
      setTotalCount(count || 0);

      const allCustomersRes = await supabase
        .from("customers")
        .select("customer_type, created_at");

      if (allCustomersRes.data) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        setStats({
          total: allCustomersRes.data.length,
          individuals: allCustomersRes.data.filter(
            (c) => c.customer_type === "individual"
          ).length,
          companies: allCustomersRes.data.filter(
            (c) => c.customer_type === "company"
          ).length,
          newThisMonth: allCustomersRes.data.filter(
            (c) => new Date(c.created_at) >= startOfMonth
          ).length,
        });
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Nepodarilo sa načítať zákazníkov");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomerOrders(customerId: string) {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, status, created_at")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.id);
  }

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.email?.toLowerCase().includes(query) ||
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.company_name?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Čakajúca" },
      confirmed: { bg: "bg-blue-50", text: "text-blue-700", label: "Potvrdená" },
      processing: { bg: "bg-blue-50", text: "text-blue-700", label: "Spracováva sa" },
      shipped: { bg: "bg-violet-50", text: "text-violet-700", label: "Odoslaná" },
      delivered: { bg: "bg-blue-50", text: "text-blue-700", label: "Doručená" },
      cancelled: { bg: "bg-red-50", text: "text-red-700", label: "Zrušená" },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Zákazníci</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Spravujte zákazníkov a ich objednávky ({totalCount} celkom)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
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
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.individuals}
                    </p>
                    <p className="text-sm text-gray-500">Fyzické osoby</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Building className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.companies}
                    </p>
                    <p className="text-sm text-gray-500">Firmy</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.newThisMonth}
                    </p>
                    <p className="text-sm text-gray-500">Noví tento mesiac</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hľadať podľa mena, emailu, telefónu alebo firmy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
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
                          Zákazník
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kontakt
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Typ
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Objednávky
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utratil
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registrácia
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                  customer.customer_type === "company"
                                    ? "bg-violet-500"
                                    : "bg-blue-500"
                                }`}
                              >
                                {customer.first_name?.charAt(0)?.toUpperCase() ||
                                  customer.email?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {customer.first_name} {customer.last_name}
                                </p>
                                {customer.company_name && (
                                  <p className="text-xs text-gray-500">
                                    {customer.company_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">{customer.email}</p>
                              {customer.phone && (
                                <p className="text-gray-500">{customer.phone}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                customer.customer_type === "company"
                                  ? "bg-violet-50 text-violet-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {customer.customer_type === "company" ? (
                                <>
                                  <Building className="w-3 h-3" />
                                  Firma
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3" />
                                  Osoba
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {customer.orders_count || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <Euro className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {(customer.total_spent || 0).toLocaleString()} EUR
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {new Date(customer.created_at).toLocaleDateString("sk-SK")}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => selectCustomer(customer)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-12 text-center text-gray-500"
                          >
                            Žiadni zákazníci
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
                    {filteredCustomers.length}
                  </span>{" "}
                  z{" "}
                  <span className="font-medium text-gray-700">{totalCount}</span>{" "}
                  zákazníkov
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

            {selectedCustomer && (
              <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        selectedCustomer.customer_type === "company"
                          ? "bg-violet-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {selectedCustomer.first_name?.charAt(0)?.toUpperCase() ||
                        selectedCustomer.email?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                      </h3>
                      {selectedCustomer.company_name && (
                        <p className="text-gray-500">{selectedCustomer.company_name}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Kontaktné údaje
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {selectedCustomer.email}
                        </span>
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {selectedCustomer.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Adresa
                    </h4>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-gray-900">
                        <p>{selectedCustomer.billing_street}</p>
                        <p>
                          {selectedCustomer.billing_zip} {selectedCustomer.billing_city}
                        </p>
                        <p>{selectedCustomer.billing_country}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Štatistiky
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedCustomer.orders_count || 0}
                        </p>
                        <p className="text-xs text-gray-500">Objednávok</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {(selectedCustomer.total_spent || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">EUR utratil</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCustomer.customer_type === "company" && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Firemné údaje
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
                      {selectedCustomer.ico && (
                        <div>
                          <p className="text-gray-500">ICO</p>
                          <p className="font-medium text-gray-900">
                            {selectedCustomer.ico}
                          </p>
                        </div>
                      )}
                      {selectedCustomer.dic && (
                        <div>
                          <p className="text-gray-500">DIC</p>
                          <p className="font-medium text-gray-900">
                            {selectedCustomer.dic}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Posledné objednávky
                  </h4>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : customerOrders.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Číslo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Dátum
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Stav
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Suma
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customerOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-4 py-3">
                                <Link
                                  href={`/admin/orders?id=${order.id}`}
                                  className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  {order.order_number}
                                </Link>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {new Date(order.created_at).toLocaleDateString(
                                  "sk-SK"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">
                                {parseFloat(String(order.total)).toLocaleString()} EUR
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                      Zákazník zatiaľ nemá žiadne objednávky
                    </p>
                  )}
                </div>
              </div>
            )}
      </div>
    </AdminLayout>
  );
}
