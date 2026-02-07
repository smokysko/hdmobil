import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

const STATUS_COLORS: Record<string, string> = {
  pending: "#fbbf24",
  confirmed: "#3b82f6",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  returned: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Cakajuce",
  confirmed: "Potvrdene",
  processing: "Spracovane",
  shipped: "Odoslane",
  delivered: "Dorucene",
  cancelled: "Zrusene",
  returned: "Vratene",
};

const STATUS_BADGE_MAP: Record<
  string,
  { bg: string; text: string; label: string; dot: string }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Cakajuca",
    dot: "bg-amber-500",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Potvrdena",
    dot: "bg-blue-500",
  },
  processing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Spracovava sa",
    dot: "bg-blue-500",
  },
  shipped: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    label: "Odoslana",
    dot: "bg-teal-500",
  },
  delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Dorucena",
    dot: "bg-green-500",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Zrusena",
    dot: "bg-red-500",
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE_MAP[status] || STATUS_BADGE_MAP.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

interface Props {
  stats: DashboardStats;
}

export function DashboardOrders({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Stav objednavok</h3>
        <div className="space-y-3">
          {stats.ordersByStatus.map((status, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[status.status] || "#9ca3af",
                  }}
                />
                <span className="text-sm text-gray-600">
                  {STATUS_LABELS[status.status] || status.status}
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {status.count}
              </span>
            </div>
          ))}
          {stats.ordersByStatus.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Ziadne objednavky
            </p>
          )}
        </div>
      </div>

      <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200/80">
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">
              Posledne objednavky
            </h3>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Zobrazit vsetky
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objednavka
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zakaznik
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Polozky
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suma
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders?id=${order.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {order.items_count} ks
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                    {order.total.toLocaleString()} EUR
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("sk-SK")}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    Ziadne objednavky
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
