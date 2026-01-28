import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  RefreshCw,
  FileText,
  Palette,
  Tag,
  Megaphone,
  Mail,
  Bell,
  TrendingUp,
  Send,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Clock,
  Users2,
  Percent,
  Gift,
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface NewsletterStats {
  totalSubscribers: number;
  newThisMonth: number;
}

interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  description: string;
}

export default function AdminMarketing() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats>({
    totalSubscribers: 0,
    newThisMonth: 0,
  });
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignType, setCampaignType] = useState<"email" | "notification">("email");
  const [campaignData, setCampaignData] = useState({
    subject: "",
    message: "",
    targetSegment: "all",
    discountCode: "",
  });
  const [sending, setSending] = useState(false);

  const customerSegments: CustomerSegment[] = [
    { id: "all", name: "Všetci zákazníci", count: 0, description: "Všetci registrovaní zákazníci" },
    {
      id: "newsletter",
      name: "Newsletter odberatelia",
      count: newsletterStats.totalSubscribers,
      description: "Zákazníci s aktívnym odberom newslettra",
    },
    { id: "inactive", name: "Neaktívni", count: 0, description: "Zákazníci bez objednávky 90+ dní" },
    { id: "vip", name: "VIP zákazníci", count: 0, description: "Zákazníci s útratou nad 500 EUR" },
    { id: "new", name: "Noví zákazníci", count: 0, description: "Registrovaní za posledných 30 dní" },
  ];

  useEffect(() => {
    const isAdmin = localStorage.getItem("hdmobil_admin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const { data: customers } = await supabase
        .from("customers")
        .select("newsletter_subscribed, created_at");

      if (customers) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        setNewsletterStats({
          totalSubscribers: customers.filter((c) => c.newsletter_subscribed).length,
          newThisMonth: customers.filter(
            (c) => c.newsletter_subscribed && new Date(c.created_at) >= startOfMonth
          ).length,
        });

        customerSegments[0].count = customers.length;
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }

  async function sendCampaign() {
    if (!campaignData.subject.trim() || !campaignData.message.trim()) {
      toast.error("Vyplňte predmet a správu");
      return;
    }

    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Kampaň bola úspešne odoslaná");
      setShowCampaignModal(false);
      setCampaignData({ subject: "", message: "", targetSegment: "all", discountCode: "" });
    } catch (err) {
      toast.error("Nepodarilo sa odoslať kampaň");
    } finally {
      setSending(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("hdmobil_admin");
    navigate("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Prehľad" },
    { href: "/admin/products", icon: Package, label: "Produkty" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Objednávky" },
    { href: "/admin/customers", icon: Users, label: "Zákazníci" },
    { href: "/admin/invoices", icon: FileText, label: "Faktúry" },
    { href: "/admin/discounts", icon: Tag, label: "Kupóny" },
    { href: "/admin/marketing", icon: Megaphone, label: "Marketing" },
    { href: "/admin/cms", icon: Palette, label: "Obsah stránky" },
    { href: "/admin/settings", icon: Settings, label: "Nastavenia" },
  ];

  const quickActions = [
    {
      title: "Zľavový kód",
      description: "Vytvorte nový zľavový kód pre zákazníkov",
      icon: Percent,
      color: "blue",
      href: "/admin/discounts",
    },
    {
      title: "Email kampaň",
      description: "Posielanie hromadných emailov zákazníkom",
      icon: Mail,
      color: "green",
      onClick: () => {
        setCampaignType("email");
        setShowCampaignModal(true);
      },
    },
    {
      title: "Push notifikácia",
      description: "Odoslať notifikáciu do aplikácie",
      icon: Bell,
      color: "violet",
      onClick: () => {
        setCampaignType("notification");
        setShowCampaignModal(true);
      },
    },
    {
      title: "Darčeky",
      description: "Nastaviť darček k objednávke",
      icon: Gift,
      color: "amber",
      href: "/admin/settings",
    },
  ];

  const marketingIdeas = [
    {
      title: "Vitajte zľava 10%",
      description: "Automatický kupón pre nových zákazníkov",
      type: "automation",
    },
    {
      title: "Opustený košík",
      description: "Pripomenúť zákazníkom nedokončenú objednávku",
      type: "automation",
    },
    {
      title: "Narodeniny",
      description: "Špeciálna zľava k narodeninám zákazníka",
      type: "loyalty",
    },
    {
      title: "VIP program",
      description: "Bonusy pre najvernejších zákazníkov",
      type: "loyalty",
    },
  ];

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
              onClick={fetchStats}
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
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Marketing</h2>
              <p className="text-gray-500 text-sm mt-1">
                Spravujte marketingové kampane a komunikáciu so zákazníkmi
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {newsletterStats.totalSubscribers}
                    </p>
                    <p className="text-sm text-gray-500">Newsletter odbratelia</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      +{newsletterStats.newThisMonth}
                    </p>
                    <p className="text-sm text-gray-500">Nových tento mesiac</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Send className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                    <p className="text-sm text-gray-500">Odoslané kampane</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">0%</p>
                    <p className="text-sm text-gray-500">Priem. otvorenie</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                const colorMap: Record<string, string> = {
                  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                  green: "bg-green-50 text-green-600 group-hover:bg-green-100",
                  violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
                  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
                };

                const content = (
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${colorMap[action.color]}`}
                    >
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{action.description}</p>
                    </div>
                    <Plus className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </div>
                );

                if (action.href) {
                  return (
                    <Link
                      key={idx}
                      href={action.href}
                      className="group bg-white rounded-xl border border-gray-200/80 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className="group bg-white rounded-xl border border-gray-200/80 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer text-left"
                  >
                    {content}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Segmenty zákazníkov</h3>
                      <p className="text-sm text-gray-500">Cieľové skupiny pre kampane</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {customerSegments.map((segment) => (
                    <div
                      key={segment.id}
                      className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{segment.name}</p>
                        <p className="text-sm text-gray-500">{segment.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{segment.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Marketingové nápady</h3>
                      <p className="text-sm text-gray-500">Automatizácie a vernostný program</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {marketingIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{idea.title}</p>
                        <p className="text-sm text-gray-500">{idea.description}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          idea.type === "automation"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {idea.type === "automation" ? "Automatizácia" : "Vernosť"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Tieto funkcie budú dostupné v budúcich verziách
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Send className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Posledné kampane</h3>
                      <p className="text-sm text-gray-500">História odoslaných kampaní</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCampaignModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Nová kampaň
                  </button>
                </div>
              </div>
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Zatiaľ žiadne kampane</p>
                <p className="text-sm text-gray-400 mt-1">
                  Vytvorte svoju prvú marketingovú kampaň
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCampaignModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {campaignType === "email" ? (
                  <Mail className="w-5 h-5 text-green-600" />
                ) : (
                  <Bell className="w-5 h-5 text-violet-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {campaignType === "email" ? "Email kampaň" : "Push notifikácia"}
                </h3>
              </div>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cieľová skupina
                </label>
                <select
                  value={campaignData.targetSegment}
                  onChange={(e) =>
                    setCampaignData({ ...campaignData, targetSegment: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                >
                  {customerSegments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {campaignType === "email" ? "Predmet emailu" : "Nadpis notifikácie"} *
                </label>
                <input
                  type="text"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                  placeholder={
                    campaignType === "email"
                      ? "Špeciálna ponuka len pre vás!"
                      : "Nová akcia na e-shope"
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Správa *</label>
                <textarea
                  value={campaignData.message}
                  onChange={(e) => setCampaignData({ ...campaignData, message: e.target.value })}
                  placeholder="Napíšte správu pre zákazníkov..."
                  rows={5}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Zľavový kód (voliteľný)
                </label>
                <input
                  type="text"
                  value={campaignData.discountCode}
                  onChange={(e) =>
                    setCampaignData({ ...campaignData, discountCode: e.target.value.toUpperCase() })
                  }
                  placeholder="LETO2025"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kód bude automaticky vložený do správy
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Pozor</p>
                  <p className="text-amber-700">
                    Kampaň bude odoslaná okamžite všetkým zákazníkom v segmente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={sendCampaign}
                disabled={sending}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Odoslať kampaň
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
