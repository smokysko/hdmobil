import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Package, ChevronRight, Search, Filter } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
  shipping_method: string;
  payment_method: string;
}

export default function OrdersPage() {
  const { user, isAuthenticated, loading: isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/prihlasenie');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Mock orders for demo
  useEffect(() => {
    if (isAuthenticated) {
      setOrders([
        {
          id: '1',
          order_number: 'OBJ-2025-001',
          status: 'delivered',
          total: 1299,
          created_at: '2025-01-10',
          shipping_method: 'DPD Express',
          payment_method: 'Kartou online',
          items: [
            { id: '1', name: 'iPhone 15 Pro 256GB', quantity: 1, price: 1199 },
            { id: '2', name: 'Ochranné sklo iPhone 15 Pro', quantity: 1, price: 29 },
            { id: '3', name: 'Silikónový kryt', quantity: 1, price: 19 },
          ],
        },
        {
          id: '2',
          order_number: 'OBJ-2025-002',
          status: 'shipped',
          total: 599,
          created_at: '2025-01-12',
          shipping_method: 'Packeta Z-BOX',
          payment_method: 'Dobierka',
          items: [
            { id: '4', name: 'AirPods Pro 2', quantity: 1, price: 299 },
            { id: '5', name: 'Samsung Galaxy Buds2 Pro', quantity: 1, price: 199 },
          ],
        },
        {
          id: '3',
          order_number: 'OBJ-2025-003',
          status: 'processing',
          total: 2499,
          created_at: '2025-01-13',
          shipping_method: 'Slovenská pošta',
          payment_method: 'Bankový prevod',
          items: [
            { id: '6', name: 'MacBook Air M3 13"', quantity: 1, price: 1299 },
            { id: '7', name: 'Magic Mouse', quantity: 1, price: 99 },
          ],
        },
      ]);
    }
  }, [isAuthenticated]);

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
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
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

        {filteredOrders.length === 0 ? (
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
                {/* Order Header */}
                <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Vytvorená: {order.created_at}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${statusLabels[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[order.status]?.label || order.status}
                      </span>
                      <p className="text-xl font-bold">{order.total} €</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Množstvo: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">{item.price} €</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="mr-4">Doprava: {order.shipping_method}</span>
                      <span>Platba: {order.payment_method}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Sledovať zásielku
                      </Button>
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
