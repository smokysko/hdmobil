import { Link } from "wouter";
import { TrendingUp, AlertTriangle, Package } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

interface Props {
  stats: DashboardStats;
}

export function DashboardProducts({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp
                className="w-5 h-5 text-green-600"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Top predavane produkty
              </h3>
              <p className="text-sm text-gray-500">Podla trzby</p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Zobrazit vsetky
          </Link>
        </div>
        <div className="space-y-3">
          {stats.topProducts.length > 0 ? (
            stats.topProducts.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-semibold text-sm">
                  {idx + 1}
                </div>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.quantity_sold} ks predanych
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {product.revenue.toLocaleString("sk-SK")} EUR
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Ziadne data o predajoch
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle
                className="w-5 h-5 text-red-600"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Nizky sklad</h3>
              <p className="text-sm text-gray-500">Produkty na doplnenie</p>
            </div>
          </div>
          <Link
            href="/admin/products?stock=low"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Zobrazit vsetky
          </Link>
        </div>
        <div className="space-y-3">
          {stats.lowStockProducts.length > 0 ? (
            stats.lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  {product.sku && (
                    <p className="text-xs text-gray-500">
                      SKU: {product.sku}
                    </p>
                  )}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock_quantity === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {product.stock_quantity} ks
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-gray-500">
                Vsetky produkty su na sklade
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
