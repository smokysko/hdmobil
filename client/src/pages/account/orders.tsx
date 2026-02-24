import { useAuth } from '@/contexts/AuthContext';
import AccountLayout from '@/components/AccountLayout';
import { useState } from 'react';
import { Package, ChevronRight, Search, RotateCcw, Download, X } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCustomerOrders } from '@/hooks/useOrders';
import type { Order } from '@/services/orders';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  useDocumentTitle('Moje objednávky');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundModal, setRefundModal] = useState<{ orderId: string; orderNumber: string; total: number } | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders({
    customerId: user?.id,
    page: 1,
    limit: 50,
  });
  const orders = ordersData?.orders ?? [];

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Čakajúca', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Spracováva sa', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Odoslaná', color: 'bg-blue-100 text-blue-800' },
    delivered: { label: 'Doručená', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Zrušená', color: 'bg-red-100 text-red-800' },
  };

  async function handleRefundSubmit() {
    if (!refundModal || !user) return;
    if (!refundReason.trim()) {
      toast.error('Zadajte dôvod vrátenia');
      return;
    }
    setSubmittingRefund(true);
    const { error } = await supabase.from('refunds').insert({
      order_id: refundModal.orderId,
      requested_by: user.id,
      amount: refundModal.total,
      reason: refundReason,
      status: 'requested',
    });
    setSubmittingRefund(false);
    if (!error) {
      toast.success('Žiadosť o vrátenie bola odoslaná');
      setRefundModal(null);
      setRefundReason('');
    } else {
      toast.error('Nepodarilo sa odoslať žiadosť');
    }
  }

  function handleDownloadInvoice(orderId: string) {
    window.open(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoices/download?orderId=${orderId}`,
      '_blank'
    );
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AccountLayout>
      <div>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      {order.shipping_method_name && (
                        <span className="mr-4">Doprava: {order.shipping_method_name}</span>
                      )}
                      {order.payment_method_name && (
                        <span>Platba: {order.payment_method_name}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.tracking_number && (
                        <Button variant="outline" size="sm">
                          Sledovať zásielku
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order.id)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Faktúra
                      </Button>
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRefundModal({ orderId: order.id, orderNumber: order.order_number, total: order.total })}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Vrátiť
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {refundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Žiadosť o vrátenie</h2>
              <button
                onClick={() => { setRefundModal(null); setRefundReason(''); }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Objednávka <span className="font-semibold">{refundModal.orderNumber}</span> – {refundModal.total.toFixed(2)} €
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dôvod vrátenia *
              </label>
              <textarea
                rows={4}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Opíšte dôvod vrátenia tovaru..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setRefundModal(null); setRefundReason(''); }}
              >
                Zrušiť
              </Button>
              <Button
                className="flex-1"
                onClick={handleRefundSubmit}
                disabled={submittingRefund}
              >
                {submittingRefund ? 'Odosiela sa...' : 'Odoslať žiadosť'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
