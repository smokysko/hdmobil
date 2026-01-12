import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';

export default function AdminOrders() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const isAdmin = localStorage.getItem('hdmobil_admin');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const [orders] = useState([
    { id: 'OBJ000001', customer: 'Ján Novák', email: 'jan@example.com', amount: 1299, status: 'pending', payment: 'unpaid', date: '2025-01-12 14:30', items: 3 },
    { id: 'OBJ000002', customer: 'Mária Svobodová', email: 'maria@example.com', amount: 2599, status: 'shipped', payment: 'paid', date: '2025-01-11 09:15', items: 5 },
    { id: 'OBJ000003', customer: 'Peter Kučera', email: 'peter@example.com', amount: 899, status: 'delivered', payment: 'paid', date: '2025-01-10 16:45', items: 2 },
    { id: 'OBJ000004', customer: 'Anna Čermáková', email: 'anna@example.com', amount: 3499, status: 'pending', payment: 'unpaid', date: '2025-01-09 11:20', items: 1 },
    { id: 'OBJ000005', customer: 'Tomáš Horák', email: 'tomas@example.com', amount: 1599, status: 'processing', payment: 'paid', date: '2025-01-08 08:00', items: 4 },
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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Čakajúca' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Spracováva sa' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Odoslaná' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Doručená' },
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const getPaymentBadge = (payment: string) => {
    return payment === 'paid' ? (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Zaplatené</span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Nezaplatené</span>
    );
  };

  const navItems = [
    { href: '/admin/dashboard', icon: '📊', label: 'Prehľad' },
    { href: '/admin/products', icon: '📦', label: 'Produkty' },
    { href: '/admin/orders', icon: '📋', label: 'Objednávky' },
    { href: '/admin/settings', icon: '⚙️', label: 'Nastavenia' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">HD</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">HDmobil Admin</h1>
            </Link>
          </div>
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Späť na web
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.href === '/admin/orders'
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Správa objednávok</h2>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stav objednávky</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Všetky stavy</option>
                    <option value="pending">Čakajúca</option>
                    <option value="processing">Spracováva sa</option>
                    <option value="shipped">Odoslaná</option>
                    <option value="delivered">Doručená</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stav platby</label>
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Všetky</option>
                    <option value="paid">Zaplatené</option>
                    <option value="unpaid">Nezaplatené</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hľadať</label>
                  <input
                    type="text"
                    placeholder="Číslo objednávky, meno..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Číslo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Zákazník</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Suma</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Položky</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stav</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Platba</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Dátum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Akcie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                            className="font-medium text-green-600 hover:text-green-700"
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.amount} €</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.items} položiek</td>
                        <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 text-sm">{getPaymentBadge(order.payment)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-green-600 hover:text-green-700 font-medium">Detail</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detaily objednávky {selectedOrder}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Fakturačné údaje</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Ján Novák</p>
                      <p>Ulica 123</p>
                      <p>811 01 Bratislava</p>
                      <p>Slovensko</p>
                      <p>jan@example.com</p>
                      <p>+421 900 123 456</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Doručovacie údaje</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Ján Novák</p>
                      <p>Ulica 123</p>
                      <p>811 01 Bratislava</p>
                      <p>Slovensko</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Stiahnuť faktúru
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Aktualizovať stav
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
