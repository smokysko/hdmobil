import { CreditCard, Truck, Users } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

const COUNTRY_NAMES: Record<string, string> = {
  SK: "Slovensko",
  CZ: "Cesko",
  PL: "Polsko",
  HU: "Madarsko",
  AT: "Rakusko",
};

interface Props {
  stats: DashboardStats;
}

function ProgressBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardMethodStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <CreditCard
              className="w-5 h-5 text-blue-600"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Platobne metody</h3>
            <p className="text-sm text-gray-500">Rozdelenie platieb</p>
          </div>
        </div>
        <div className="space-y-3">
          {stats.paymentMethodStats.map((method, idx) => (
            <ProgressBar
              key={idx}
              label={method.name}
              count={method.count}
              total={stats.totalOrders}
              color="bg-blue-500"
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <Truck className="w-5 h-5 text-teal-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Dopravne metody</h3>
            <p className="text-sm text-gray-500">Rozdelenie dopravy</p>
          </div>
        </div>
        <div className="space-y-3">
          {stats.shippingMethodStats.map((method, idx) => (
            <ProgressBar
              key={idx}
              label={method.name}
              count={method.count}
              total={stats.totalOrders}
              color="bg-teal-500"
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Objednavky podla krajiny
            </h3>
            <p className="text-sm text-gray-500">Geograficke rozlozenie</p>
          </div>
        </div>
        <div className="space-y-3">
          {stats.customersByCountry.map((item, idx) => (
            <ProgressBar
              key={idx}
              label={COUNTRY_NAMES[item.country] || item.country}
              count={item.count}
              total={stats.totalOrders}
              color="bg-green-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
