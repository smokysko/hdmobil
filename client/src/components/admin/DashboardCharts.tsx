import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

const CATEGORY_COLORS = [
  "#22c55e", "#16a34a", "#15803d", "#166534",
  "#14532d", "#0d9488", "#0891b2",
];

interface Props {
  stats: DashboardStats;
}

export function DashboardCharts({ stats }: Props) {
  const maxRevenue = Math.max(
    ...stats.revenueByMonth.map((d) => d.revenue),
    1
  );

  const categoriesWithColor = stats.salesByCategory.length > 0
    ? stats.salesByCategory.map((cat, idx) => ({
        ...cat,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
    : [{ name: "Bez kategórií", value: 100, color: "#9ca3af" }];

  return (
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
            const isCurrentMonth = idx === new Date().getMonth();
            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 gap-2"
              >
                <div className="w-full flex flex-col items-center justify-end h-[200px]">
                  <div
                    className={`w-full max-w-[40px] rounded-t-md transition-all ${
                      isCurrentMonth
                        ? "bg-gradient-to-t from-blue-600 to-blue-500"
                        : "bg-gradient-to-t from-blue-400 to-blue-300 hover:from-blue-500 hover:to-blue-400"
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${item.revenue.toLocaleString()} EUR`}
                  />
                </div>
                <span
                  className={`text-xs ${isCurrentMonth ? "text-blue-600 font-medium" : "text-gray-500"}`}
                >
                  {item.month}
                </span>
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
              return categoriesWithColor.map((item, idx) => {
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
          {categoriesWithColor.map((cat, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-gray-600">{cat.name}</span>
              </div>
              <span className="font-medium text-gray-900">{cat.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
