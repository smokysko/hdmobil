import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Mail,
  Bell,
  TrendingUp,
  Send,
  Plus,
  X,
  Loader2,
  Clock,
  Users2,
  Percent,
  Gift,
  Sparkles,
  Target,
  Download,
  Check,
  XCircle,
  Ticket,
  SettingsIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  newThisMonth: number;
  usedDiscounts: number;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  language: string;
  discount_code: string | null;
  discount_used: boolean;
  discount_expires_at: string | null;
  is_active: boolean;
  subscribed_at: string;
  created_at: string;
}

interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  description: string;
}

export default function AdminMarketing() {
  const [loading, setLoading] = useState(true);
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    newThisMonth: 0,
    usedDiscounts: 0,
  });
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignType, setCampaignType] = useState<"email" | "notification">("email");
  const [campaignData, setCampaignData] = useState({
    subject: "",
    message: "",
    targetSegment: "all",
    discountCode: "",
  });
  const [sending, setSending] = useState(false);
  const [newsletterPopupEnabled, setNewsletterPopupEnabled] = useState(true);
  const [newsletterDiscount, setNewsletterDiscount] = useState(10);
  const [newsletterExpirationDays, setNewsletterExpirationDays] = useState(7);
  const [settingsLoading, setSettingsLoading] = useState(true);

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
    fetchStats();
    loadNewsletterSettings();
  }, []);

  async function loadNewsletterSettings() {
    setSettingsLoading(true);
    try {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["newsletter_popup_enabled", "newsletter_discount", "newsletter_expiration_days"]);

      if (data) {
        data.forEach((setting) => {
          if (setting.key === "newsletter_popup_enabled") {
            setNewsletterPopupEnabled(setting.value === true);
          } else if (setting.key === "newsletter_discount") {
            setNewsletterDiscount(Number(setting.value) || 10);
          } else if (setting.key === "newsletter_expiration_days") {
            setNewsletterExpirationDays(Number(setting.value) || 7);
          }
        });
      }
    } catch (err) {
      console.error("Error loading newsletter settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleNewsletterToggle(enabled: boolean) {
    setNewsletterPopupEnabled(enabled);
    await supabase
      .from("settings")
      .upsert({ key: "newsletter_popup_enabled", value: enabled, updated_at: new Date().toISOString() });
    toast.success(enabled ? "Newsletter popup zapnutý" : "Newsletter popup vypnutý");
  }

  async function handleDiscountChange(value: number) {
    setNewsletterDiscount(value);
    await supabase
      .from("settings")
      .upsert({ key: "newsletter_discount", value: value, updated_at: new Date().toISOString() });
  }

  async function handleExpirationChange(value: number) {
    setNewsletterExpirationDays(value);
    await supabase
      .from("settings")
      .upsert({ key: "newsletter_expiration_days", value: value, updated_at: new Date().toISOString() });
  }

  async function fetchStats() {
    setLoading(true);
    try {
      const { data: newsletterData } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (newsletterData) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        setSubscribers(newsletterData);
        setNewsletterStats({
          totalSubscribers: newsletterData.length,
          activeSubscribers: newsletterData.filter((s) => s.is_active).length,
          newThisMonth: newsletterData.filter(
            (s) => new Date(s.created_at) >= startOfMonth
          ).length,
          usedDiscounts: newsletterData.filter((s) => s.discount_used).length,
        });
      }

      const { data: customers } = await supabase
        .from("customers")
        .select("id", { count: "exact" });

      if (customers) {
        customerSegments[0].count = customers.length;
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (subscribers.length === 0) {
      toast.error("Žiadni odberatelia na export");
      return;
    }

    const headers = ["Email", "Jazyk", "Zľavový kód", "Kód použitý", "Aktívny", "Dátum prihlásenia"];
    const rows = subscribers.map((s) => [
      s.email,
      s.language,
      s.discount_code || "",
      s.discount_used ? "Áno" : "Nie",
      s.is_active ? "Áno" : "Nie",
      new Date(s.subscribed_at || s.created_at).toLocaleDateString("sk-SK"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter_odberatelia_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export úspešný");
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
    <AdminLayout>
      <>
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
                    <p className="text-sm text-gray-500">Celkom odberateľov</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {newsletterStats.activeSubscribers}
                    </p>
                    <p className="text-sm text-gray-500">Aktívnych</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
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
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {newsletterStats.usedDiscounts}
                    </p>
                    <p className="text-sm text-gray-500">Použitých kódov</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nastavenia newslettera</h3>
                    <p className="text-sm text-gray-500">Konfigurácia popup okna a zľavových kódov</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Newsletter popup</p>
                      <p className="text-sm text-gray-500">Zobrazovať popup pre odber newslettera novým návštevníkom</p>
                    </div>
                  </div>
                  <Switch
                    checked={newsletterPopupEnabled}
                    onCheckedChange={handleNewsletterToggle}
                    disabled={settingsLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Výška zľavy (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newsletterDiscount}
                      onChange={(e) => handleDiscountChange(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Zľava pre nových odberateľov</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platnosť kódu (dni)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newsletterExpirationDays}
                      onChange={(e) => handleExpirationChange(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Počet dní do vypršania zľavy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Newsletter odberatelia</h3>
                      <p className="text-sm text-gray-500">Zoznam všetkých prihlásených emailov</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => setShowSubscribers(!showSubscribers)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {showSubscribers ? "Skryť zoznam" : "Zobraziť zoznam"}
                    </button>
                  </div>
                </div>
              </div>

              {showSubscribers && (
                <div className="overflow-x-auto">
                  {subscribers.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Zatiaľ žiadni odberatelia</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Jazyk
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Zľavový kód
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Stav kódu
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Datum
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-4 text-sm text-gray-900">{subscriber.email}</td>
                            <td className="px-5 py-4 text-sm text-gray-600 uppercase">
                              {subscriber.language}
                            </td>
                            <td className="px-5 py-4">
                              {subscriber.discount_code ? (
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  {subscriber.discount_code}
                                </code>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {subscriber.discount_used ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                  <Check className="w-3 h-3" />
                                  Použitý
                                </span>
                              ) : subscriber.discount_expires_at &&
                                new Date(subscriber.discount_expires_at) < new Date() ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  Expirovaný
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                  <Clock className="w-3 h-3" />
                                  Aktívny
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {subscriber.is_active ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                  <Check className="w-3 h-3" />
                                  Aktívny
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                  <XCircle className="w-3 h-3" />
                                  Odhlásený
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600">
                              {new Date(subscriber.subscribed_at || subscriber.created_at).toLocaleDateString("sk-SK")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
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
      </>
    </AdminLayout>
  );
}
