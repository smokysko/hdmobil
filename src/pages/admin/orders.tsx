import React, { useState } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([
    {
      id: 'OBJ000001',
      customer: 'Jan Novák',
      email: 'jan@example.com',
      amount: 1299,
      status: 'pending',
      payment: 'unpaid',
      date: '2025-01-12 14:30',
      items: 3,
    },
    {
      id: 'OBJ000002',
      customer: 'Marie Svobodová',
      email: 'marie@example.com',
      amount: 2599,
      status: 'shipped',
      payment: 'paid',
      date: '2025-01-11 09:15',
      items: 5,
    },
    {
      id: 'OBJ000003',
      customer: 'Petr Kučera',
      email: 'petr@example.com',
      amount: 899,
      status: 'delivered',
      payment: 'paid',
      date: '2025-01-10 16:45',
      items: 2,
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  const filteredOrders = orders.filter(
    (o) =>
      (filterStatus === 'all' || o.status === filterStatus) &&
      (filterPayment === 'all' || o.payment === filterPayment)
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Čekající' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Zpracování' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Odesláno' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Doručeno' },
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const getPaymentBadge = (payment: string) => {
    return payment === 'paid' ? (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Zaplaceno</span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Nezaplaceno</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Správa objednávek</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stav objednávky</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny stavy</option>
                <option value="pending">Čekající</option>
                <option value="processing">Zpracování</option>
                <option value="shipped">Odesláno</option>
                <option value="delivered">Doručeno</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stav platby</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny</option>
                <option value="paid">Zaplaceno</option>
                <option value="unpaid">Nezaplaceno</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hledat</label>
              <input
                type="text"
                placeholder="Číslo objednávky, jméno..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Číslo objednávky</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Zákazník</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Částka</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Položky</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stav</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Platba</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {order.id}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.amount} EUR</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items} položek</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm">{getPaymentBadge(order.payment)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">Upravit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detaily objednávky {selectedOrder}</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Fakturační údaje</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Jan Novák</p>
                  <p>Ulice 123</p>
                  <p>110 00 Praha</p>
                  <p>Česká republika</p>
                  <p>jan@example.com</p>
                  <p>+420 123 456 789</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Doručovací údaje</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Jan Novák</p>
                  <p>Ulice 123</p>
                  <p>110 00 Praha</p>
                  <p>Česká republika</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Položky</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Produkt</th>
                    <th className="px-4 py-2 text-right">Množství</th>
                    <th className="px-4 py-2 text-right">Cena</th>
                    <th className="px-4 py-2 text-right">Celkem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2">HDMI 2.1 kabel 2m</td>
                    <td className="px-4 py-2 text-right">2</td>
                    <td className="px-4 py-2 text-right">19.99 EUR</td>
                    <td className="px-4 py-2 text-right font-medium">39.98 EUR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Stáhnout fakturu
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Aktualizovat stav
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
