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
  Plus,
  Percent,
  Euro,
  Calendar,
  Copy,
  Trash2,
  Edit,
  X,
  Check,
  Loader2,
  FileText,
  Palette,
  Tag,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface Discount {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  value: number;
  min_order_value: number | null;
  max_uses: number | null;
  max_uses_per_customer: number;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  applies_to_categories: string[] | null;
  applies_to_products: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface DiscountStats {
  total: number;
  active: number;
  expired: number;
  totalUsed: number;
}

const emptyDiscount: Omit<Discount, "id" | "current_uses" | "created_at"> = {
  code: "",
  discount_type: "percentage",
  value: 10,
  min_order_value: null,
  max_uses: null,
  max_uses_per_customer: 1,
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: null,
  applies_to_categories: null,
  applies_to_products: null,
  is_active: true,
};

export default function AdminDiscounts() {
  const [location, navigate] = useLocation();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [stats, setStats] = useState<DiscountStats>({
    total: 0,
    active: 0,
    expired: 0,
    totalUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState(emptyDiscount);
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
    fetchDiscounts();
  }, [page]);

  async function fetchDiscounts() {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const { data, count, error } = await supabase
        .from("discounts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      setDiscounts(data || []);
      setTotalCount(count || 0);

      const allRes = await supabase.from("discounts").select("is_active, valid_until, current_uses");

      if (allRes.data) {
        const now = new Date();
        setStats({
          total: allRes.data.length,
          active: allRes.data.filter(
            (d) => d.is_active && (!d.valid_until || new Date(d.valid_until) > now)
          ).length,
          expired: allRes.data.filter((d) => d.valid_until && new Date(d.valid_until) <= now).length,
          totalUsed: allRes.data.reduce((sum, d) => sum + (d.current_uses || 0), 0),
        });
      }
    } catch (err) {
      console.error("Error fetching discounts:", err);
      toast.error("Nepodarilo sa načítať kupóny");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.code.trim()) {
      toast.error("Kód kupónu je povinný");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        value: formData.value,
        min_order_value: formData.min_order_value || null,
        max_uses: formData.max_uses || null,
        max_uses_per_customer: formData.max_uses_per_customer || 1,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        applies_to_categories: formData.applies_to_categories,
        applies_to_products: formData.applies_to_products,
        is_active: formData.is_active,
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from("discounts")
          .update(payload)
          .eq("id", editingDiscount.id);

        if (error) throw error;
        toast.success("Kupón bol aktualizovaný");
      } else {
        const { error } = await supabase.from("discounts").insert(payload);

        if (error) {
          if (error.code === "23505") {
            toast.error("Kupón s týmto kódom už existuje");
            return;
          }
          throw error;
        }
        toast.success("Kupón bol vytvorený");
      }

      setShowModal(false);
      setEditingDiscount(null);
      setFormData(emptyDiscount);
      fetchDiscounts();
    } catch (err) {
      console.error("Error saving discount:", err);
      toast.error("Nepodarilo sa uložiť kupón");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(discount: Discount) {
    try {
      const { error } = await supabase
        .from("discounts")
        .update({ is_active: !discount.is_active })
        .eq("id", discount.id);

      if (error) throw error;
      toast.success(discount.is_active ? "Kupón deaktivovaný" : "Kupón aktivovaný");
      fetchDiscounts();
    } catch (err) {
      console.error("Error toggling discount:", err);
      toast.error("Nepodarilo sa zmeniť stav kupónu");
    }
  }

  async function deleteDiscount(id: string) {
    if (!confirm("Naozaj chcete zmazať tento kupón?")) return;

    try {
      const { error } = await supabase.from("discounts").delete().eq("id", id);

      if (error) throw error;
      toast.success("Kupón bol zmazaný");
      fetchDiscounts();
    } catch (err) {
      console.error("Error deleting discount:", err);
      toast.error("Nepodarilo sa zmazať kupón");
    }
  }

  function openEditModal(discount: Discount) {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      discount_type: discount.discount_type,
      value: discount.value,
      min_order_value: discount.min_order_value,
      max_uses: discount.max_uses,
      max_uses_per_customer: discount.max_uses_per_customer,
      valid_from: discount.valid_from?.split("T")[0] || "",
      valid_until: discount.valid_until?.split("T")[0] || null,
      applies_to_categories: discount.applies_to_categories,
      applies_to_products: discount.applies_to_products,
      is_active: discount.is_active,
    });
    setShowModal(true);
  }

  function openCreateModal() {
    setEditingDiscount(null);
    setFormData(emptyDiscount);
    setShowModal(true);
  }

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Kód skopírovaný do schránky");
  }

  const handleLogout = () => {
    localStorage.removeItem("hdmobil_admin");
    navigate("/admin/login");
  };

  const filteredDiscounts = discounts.filter((d) => {
    if (!searchQuery) return true;
    return d.code.toLowerCase().includes(searchQuery.toLowerCase());
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

  const totalPages = Math.ceil(totalCount / pageSize);

  const isExpired = (d: Discount) => d.valid_until && new Date(d.valid_until) < new Date();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <img
                src="/images/hdmobil_logo_blue.jpg"
                alt="HDmobil Logo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">HDmobil</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiscounts}
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
                <h2 className="text-2xl font-semibold text-gray-900">Kupóny a zľavy</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Spravujte zľavové kupóny pre zákazníkov ({totalCount} celkom)
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Nový kupón
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Celkom</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                    <p className="text-sm text-gray-500">Aktívne</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.expired}</p>
                    <p className="text-sm text-gray-500">Expirované</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsed}</p>
                    <p className="text-sm text-gray-500">Použití celkom</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hľadať podľa kódu kupónu..."
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
                          Kód
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zľava
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Min. objednávka
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Použitie
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platnosť
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
                      {filteredDiscounts.map((discount) => (
                        <tr key={discount.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <code className="px-2.5 py-1 bg-gray-100 rounded text-sm font-mono font-medium text-gray-900">
                                {discount.code}
                              </code>
                              <button
                                onClick={() => copyCode(discount.code)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              {discount.discount_type === "percentage" ? (
                                <>
                                  <Percent className="w-4 h-4 text-blue-500" />
                                  <span className="font-medium text-gray-900">{discount.value}%</span>
                                </>
                              ) : (
                                <>
                                  <Euro className="w-4 h-4 text-green-500" />
                                  <span className="font-medium text-gray-900">{discount.value} EUR</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {discount.min_order_value ? `${discount.min_order_value} EUR` : "-"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-900">
                              {discount.current_uses}
                              {discount.max_uses ? ` / ${discount.max_uses}` : ""}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm">
                            <div className="text-gray-600">
                              <p>Od: {new Date(discount.valid_from).toLocaleDateString("sk-SK")}</p>
                              {discount.valid_until && (
                                <p className={isExpired(discount) ? "text-red-500" : ""}>
                                  Do: {new Date(discount.valid_until).toLocaleDateString("sk-SK")}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => toggleActive(discount)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                discount.is_active && !isExpired(discount)
                                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {discount.is_active && !isExpired(discount) ? (
                                <>
                                  <ToggleRight className="w-3.5 h-3.5" />
                                  Aktívny
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-3.5 h-3.5" />
                                  {isExpired(discount) ? "Expirovaný" : "Neaktívny"}
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(discount)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteDiscount(discount.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredDiscounts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                            Žiadne kupóny
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
                  <span className="font-medium text-gray-700">{filteredDiscounts.length}</span> z{" "}
                  <span className="font-medium text-gray-700">{totalCount}</span> kupónov
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
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDiscount ? "Upraviť kupón" : "Nový kupón"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kód kupónu *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="LETO2025"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                  >
                    Generovať
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Typ zľavy</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  >
                    <option value="percentage">Percentuálna (%)</option>
                    <option value="fixed">Fixná suma (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hodnota {formData.discount_type === "percentage" ? "(%)" : "(EUR)"}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    min={0}
                    max={formData.discount_type === "percentage" ? 100 : undefined}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Minimálna hodnota objednávky (EUR)
                </label>
                <input
                  type="number"
                  value={formData.min_order_value || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_order_value: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Bez obmedzenia"
                  min={0}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max. použití celkom
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_uses: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Neobmedzené"
                    min={1}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max. na zákazníka
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses_per_customer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_uses_per_customer: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Platný od *
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Platný do
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_until: e.target.value || null })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Kupón je aktívny
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingDiscount ? "Uložiť zmeny" : "Vytvoriť kupón"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
