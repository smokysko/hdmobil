import {
  ShoppingCart,
  Euro,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Mail,
  Star,
} from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

interface Props {
  stats: DashboardStats;
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconBg,
  trend,
}: {
  label: string;
  value: string;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; label: string } | null;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
          {trend != null && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
          {subtitle && !trend && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return (
    value.toLocaleString("sk-SK", { minimumFractionDigits: 2 }) + " EUR"
  );
}

export function DashboardStatCards({ stats }: Props) {
  const weeklyChange =
    stats.ordersLastWeek > 0
      ? Math.round(
          ((stats.ordersThisWeek - stats.ordersLastWeek) /
            stats.ordersLastWeek) *
            100
        )
      : stats.ordersThisWeek
        ? 100
        : 0;

  const dailyRevenueChange =
    stats.revenueYesterday > 0
      ? Math.round(
          ((stats.revenueToday - stats.revenueYesterday) /
            stats.revenueYesterday) *
            100
        )
      : stats.revenueToday
        ? 100
        : 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Celkove objednavky"
          value={String(stats.totalOrders)}
          icon={
            <ShoppingCart
              className="w-6 h-6 text-blue-600"
              strokeWidth={1.5}
            />
          }
          iconBg="bg-blue-50"
          trend={{ value: weeklyChange, label: "tento tyzden" }}
        />
        <StatCard
          label="Trzby celkom"
          value={formatCurrency(stats.totalRevenue)}
          icon={
            <Euro className="w-6 h-6 text-green-600" strokeWidth={1.5} />
          }
          iconBg="bg-green-50"
          trend={{ value: dailyRevenueChange, label: "dnes vs vcera" }}
        />
        <StatCard
          label="Priemerna objednavka"
          value={stats.averageOrderValue.toLocaleString("sk-SK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) + " EUR"}
          subtitle="AOV (Average Order Value)"
          icon={
            <Award className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
          }
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Trzby dnes"
          value={formatCurrency(stats.revenueToday)}
          subtitle={`Vcera: ${stats.revenueYesterday.toLocaleString("sk-SK")} EUR`}
          icon={
            <TrendingUp
              className="w-6 h-6 text-teal-600"
              strokeWidth={1.5}
            />
          }
          iconBg="bg-teal-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Zakaznici"
          value={String(stats.totalCustomers)}
          icon={
            <Users className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
          }
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Cakajuce platby"
          value={String(stats.pendingPayments)}
          icon={
            <Clock className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
          }
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Newsletter odberatelia"
          value={String(stats.newsletterStats.total)}
          subtitle={`+${stats.newsletterStats.thisMonth} tento mesiac`}
          icon={
            <Mail className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
          }
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Priemerne hodnotenie"
          value={stats.reviewStats.averageRating.toFixed(1)}
          subtitle={`z ${stats.reviewStats.totalReviews} recenzii`}
          icon={
            <Star className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
          }
          iconBg="bg-amber-50"
        />
      </div>
    </>
  );
}
