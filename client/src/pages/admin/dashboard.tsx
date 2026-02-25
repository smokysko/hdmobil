import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { DashboardAlerts } from "../../components/admin/DashboardAlerts";
import { DashboardStatCards } from "../../components/admin/DashboardStatCards";
import { DashboardCharts } from "../../components/admin/DashboardCharts";
import { DashboardProducts } from "../../components/admin/DashboardProducts";
import { DashboardMethodStats } from "../../components/admin/DashboardMethodStats";
import { DashboardOrders } from "../../components/admin/DashboardOrders";
import { fetchDashboardStats } from "../../services/admin-dashboard";
import type { DashboardStats } from "../../types/dashboard";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  function formatLastUpdated(date: Date) {
    return date.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Prehľad</h2>
            <p className="text-gray-500 text-sm mt-1">
              Vitajte späť! Tu je prehľad vášho obchodu.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Aktualizované:{" "}
              <span className="font-medium text-gray-700">
                {lastUpdated ? formatLastUpdated(lastUpdated) : "—"}
              </span>
            </span>
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Obnoviť
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : stats ? (
          <>
            <DashboardAlerts stats={stats} />
            <DashboardStatCards stats={stats} />
            <DashboardCharts stats={stats} />
            <DashboardProducts stats={stats} />
            <DashboardMethodStats stats={stats} />
            <DashboardOrders stats={stats} />
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Nepodarilo sa načítať dáta
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
