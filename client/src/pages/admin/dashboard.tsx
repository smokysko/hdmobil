import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Prehlad</h2>
            <p className="text-gray-500 text-sm mt-1">
              Vitajte spat! Tu je prehlad vasho obchodu.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Posledna aktualizacia:{" "}
            <span className="font-medium text-gray-700">prave teraz</span>
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
            Nepodarilo sa nacitat data
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
