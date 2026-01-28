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
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Palette,
  Tag,
  Megaphone,
  Star,
  MessageSquare,
  Eye,
  Trash2,
  Filter,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    name_sk: string;
    slug: string;
    main_image_url: string;
  };
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  averageRating: number;
}

export default function AdminReviews() {
  const [location, navigate] = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    pending: 0,
    approved: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
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
    fetchReviews();
  }, [page, filterStatus]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;

      let query = supabase
        .from("product_reviews")
        .select(`
          *,
          product:products(name_sk, slug, main_image_url),
          customer:customers(first_name, last_name, email)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (filterStatus === "pending") {
        query = query.eq("is_approved", false);
      } else if (filterStatus === "approved") {
        query = query.eq("is_approved", true);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setReviews(data || []);
      setTotalCount(count || 0);

      const statsRes = await supabase
        .from("product_reviews")
        .select("is_approved, rating");

      if (statsRes.data) {
        const totalRating = statsRes.data.reduce((sum, r) => sum + r.rating, 0);
        setStats({
          total: statsRes.data.length,
          pending: statsRes.data.filter((r) => !r.is_approved).length,
          approved: statsRes.data.filter((r) => r.is_approved).length,
          averageRating: statsRes.data.length > 0 ? totalRating / statsRes.data.length : 0,
        });
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error("Nepodarilo sa nacitat recenzie");
    } finally {
      setLoading(false);
    }
  }

  async function approveReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Recenzia bola schvalena");
      fetchReviews();
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, is_approved: true });
      }
    } catch (err) {
      console.error("Error approving review:", err);
      toast.error("Nepodarilo sa schvalit recenziu");
    }
  }

  async function rejectReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({ is_approved: false, updated_at: new Date().toISOString() })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Recenzia bola zamiettnuta");
      fetchReviews();
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, is_approved: false });
      }
    } catch (err) {
      console.error("Error rejecting review:", err);
      toast.error("Nepodarilo sa zamietnut recenziu");
    }
  }

  async function deleteReview(reviewId: string) {
    if (!confirm("Naozaj chcete vymazat tuto recenziu?")) return;

    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Recenzia bola vymazana");
      setSelectedReview(null);
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Nepodarilo sa vymazat recenziu");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("hdmobil_admin");
    navigate("/admin/login");
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.content?.toLowerCase().includes(query) ||
      review.title?.toLowerCase().includes(query) ||
      review.product?.name_sk_sk?.toLowerCase().includes(query) ||
      `${review.customer?.first_name} ${review.customer?.last_name}`.toLowerCase().includes(query) ||
      review.customer?.email?.toLowerCase().includes(query)
    );
  });

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Prehlad" },
    { href: "/admin/products", icon: Package, label: "Produkty" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Objednavky" },
    { href: "/admin/customers", icon: Users, label: "Zakaznici" },
    { href: "/admin/reviews", icon: MessageSquare, label: "Recenzie" },
    { href: "/admin/invoices", icon: FileText, label: "Faktury" },
    { href: "/admin/discounts", icon: Tag, label: "Kupony" },
    { href: "/admin/marketing", icon: Megaphone, label: "Marketing" },
    { href: "/admin/cms", icon: Palette, label: "Obsah stranky" },
    { href: "/admin/settings", icon: Settings, label: "Nastavenia" },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
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
              onClick={fetchReviews}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Zobrazit web</span>
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
              <span>Odhlasit sa</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Recenzie</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Spravujte recenzie produktov ({totalCount} celkom)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
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
                    <MessageSquare className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.pending}
                    </p>
                    <p className="text-sm text-gray-500">Cakajucich</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.approved}
                    </p>
                    <p className="text-sm text-gray-500">Schvalenych</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">Priemerne hodnotenie</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hladat podla textu, produktu alebo zakaznika..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value as "all" | "pending" | "approved");
                      setPage(1);
                    }}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  >
                    <option value="all">Vsetky stavy</option>
                    <option value="pending">Cakajuce na schvalenie</option>
                    <option value="approved">Schvalene</option>
                  </select>
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
                          Produkt
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zakaznik
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hodnotenie
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recenzia
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stav
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredReviews.map((review) => (
                        <tr
                          key={review.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {review.product?.main_image_url && (
                                <img
                                  src={review.product.image}
                                  alt={review.product.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                />
                              )}
                              <div className="max-w-[200px]">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {review.product?.name_sk || "Neznamy produkt"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">
                                {review.customer?.first_name} {review.customer?.last_name}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {review.customer?.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {renderStars(review.rating)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="max-w-[250px]">
                              {review.title && (
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {review.title}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 truncate">
                                {review.content}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                review.is_approved
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {review.is_approved ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Schvalena
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="w-3 h-3" />
                                  Caka
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString("sk-SK")}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedReview(review)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Zobrazit detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!review.is_approved && (
                                <button
                                  onClick={() => approveReview(review.id)}
                                  className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Schvalit"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {review.is_approved && (
                                <button
                                  onClick={() => rejectReview(review.id)}
                                  className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Zrusit schvalenie"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Vymazat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReviews.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-12 text-center text-gray-500"
                          >
                            Ziadne recenzie
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Zobrazenych{" "}
                  <span className="font-medium text-gray-700">
                    {filteredReviews.length}
                  </span>{" "}
                  z{" "}
                  <span className="font-medium text-gray-700">{totalCount}</span>{" "}
                  recenzii
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

            {selectedReview && (
              <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detail recenzie
                  </h3>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Produkt
                    </h4>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      {selectedReview.product?.main_image_url && (
                        <img
                          src={selectedReview.product.image}
                          alt={selectedReview.product.name}
                          className="w-16 h-16 rounded-lg object-cover bg-white"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedReview.product?.name_sk}
                        </p>
                        <Link
                          href={`/product/${selectedReview.product?.slug}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Zobrazit produkt
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Zakaznik
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {selectedReview.customer?.first_name} {selectedReview.customer?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedReview.customer?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {selectedReview.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                            <Check className="w-3 h-3" />
                            Overeny nakup
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Hodnotenie a recenzia
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      {renderStars(selectedReview.rating)}
                      <span className="text-sm font-medium text-gray-700">
                        {selectedReview.rating}/5
                      </span>
                    </div>
                    {selectedReview.title && (
                      <p className="font-medium text-gray-900">
                        {selectedReview.title}
                      </p>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedReview.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vytvorena: {new Date(selectedReview.created_at).toLocaleString("sk-SK")}
                      {selectedReview.updated_at !== selectedReview.created_at && (
                        <> | Upravena: {new Date(selectedReview.updated_at).toLocaleString("sk-SK")}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        selectedReview.is_approved
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {selectedReview.is_approved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Schvalena
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Caka na schvalenie
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedReview.is_approved ? (
                      <button
                        onClick={() => approveReview(selectedReview.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Schvalit recenziu
                      </button>
                    ) : (
                      <button
                        onClick={() => rejectReview(selectedReview.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Zrusit schvalenie
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(selectedReview.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Vymazat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
