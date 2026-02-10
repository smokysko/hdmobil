import { Link } from "wouter";
import {
  AlertTriangle,
  Clock,
  PackageX,
  MessageSquare,
  CalendarClock,
} from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

interface Props {
  stats: DashboardStats;
}

export function DashboardAlerts({ stats }: Props) {
  const hasAlerts =
    stats.pendingOrdersOld > 0 ||
    stats.outOfStockCount > 0 ||
    stats.reviewStats.pending > 0 ||
    stats.discountStats.expiringSoon > 0;

  if (!hasAlerts) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-800">
            Upozornenia vyžadujúce pozornosť
          </h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-amber-700">
            {stats.pendingOrdersOld > 0 && (
              <Link
                href="/admin/orders?status=pending"
                className="flex items-center gap-1 hover:underline"
              >
                <Clock className="w-4 h-4" />
                {stats.pendingOrdersOld} objednávok čaká viac ako 24h
              </Link>
            )}
            {stats.outOfStockCount > 0 && (
              <Link
                href="/admin/products?stock=out"
                className="flex items-center gap-1 hover:underline"
              >
                <PackageX className="w-4 h-4" />
                {stats.outOfStockCount} produktov bez skladu
              </Link>
            )}
            {stats.reviewStats.pending > 0 && (
              <Link
                href="/admin/reviews"
                className="flex items-center gap-1 hover:underline"
              >
                <MessageSquare className="w-4 h-4" />
                {stats.reviewStats.pending} recenzií na schválenie
              </Link>
            )}
            {stats.discountStats.expiringSoon > 0 && (
              <Link
                href="/admin/discounts"
                className="flex items-center gap-1 hover:underline"
              >
                <CalendarClock className="w-4 h-4" />
                {stats.discountStats.expiringSoon} kupónov expiruje do 7 dní
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
