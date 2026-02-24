import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n';
import AccountLayout from '@/components/AccountLayout';
import { Package, CreditCard } from 'lucide-react';
import { Link } from 'wouter';
import { useCustomerOrders } from '@/hooks/useOrders';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AccountPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  useDocumentTitle('Môj účet');
  const { data: ordersData } = useCustomerOrders({
    customerId: user?.id,
    page: 1,
    limit: 5,
  });
  const orders = ordersData?.orders ?? [];

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Používateľ';

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Čakajúca', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Spracováva sa', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Odoslaná', color: 'bg-blue-100 text-blue-800' },
    delivered: { label: 'Doručená', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Zrušená', color: 'bg-red-100 text-red-800' },
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Vitajte späť, {userName}!</h1>
          <p className="opacity-90">Tu nájdete prehľad vašich objednávok a nastavení účtu.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ordersData?.total ?? 0}</p>
                <p className="text-sm text-muted-foreground">Objednávky</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} €</p>
                <p className="text-sm text-muted-foreground">Celkové nákupy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Posledné objednávky</h2>
              <Link href="/moje-objednavky">
                <span className="text-sm text-primary hover:underline cursor-pointer">Zobraziť všetky</span>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Zatiaľ nemáte žiadne objednávky</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('sk-SK')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.total.toFixed(2)} €</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusLabels[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
