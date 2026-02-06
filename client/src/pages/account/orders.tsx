import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Package, ChevronRight, Search } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCustomerOrders } from '@/hooks/useOrders';
import type { Order } from '@/services/orders';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function OrdersPage() {
  const { user, isAuthenticated, loading: isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  useDocumentTitle('Moje objednávky');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders({
    customerId: user?.id,
    page: 1,
    limit: 50,
  });
  const orders = ordersData?.orders ?? [];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/prihlasenie');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Čakajúca', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Spracováva sa', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Odoslaná', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Doručená', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Zrušená', color: 'bg-red-100 text-red-800' },
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/moj-ucet"><span className="hover:text-primary cursor-pointer">Môj účet</span></Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Moje objednávky</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Moje objednávky</h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Hľadať objednávku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">Všetky stavy</option>
              <option value="pending">Čakajúce</option>
              <option value="processing">Spracovávané</option>
              <option value="shipped">Odoslané</option>
              <option value="delivered">Doručené</option>
              <option value="cancelled">Zrušené</option>
            </select>
          </div>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold mb-2">Žiadne objednávky</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Nenašli sa žiadne objednávky zodpovedajúce vášmu filtru.'
                : 'Zatiaľ ste nevytvorili žiadnu objednávku.'}
            </p>
            <Link href="/">
              <Button>Začať nakupovať</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Vytvorená: {new Date(order.created_at).toLocaleDateString('sk-SK')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${statusLabels[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[order.status]?.label || order.status}
                      </span>
                      <p className="text-xl font-bold">{order.total.toFixed(2)} €</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="mt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      {order.shipping_method_name && (
                        <span className="mr-4">Doprava: {order.shipping_method_name}</span>
                      )}
                      {order.payment_method_name && (
                        <span>Platba: {order.payment_method_name}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.tracking_number && (
                        <Button variant="outline" size="sm">
                          Sledovať zásielku
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Stiahnuť faktúru
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
