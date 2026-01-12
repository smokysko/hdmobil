import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const dashboardStats = [
    { label: 'Celkové objednávky', value: '1,234', change: '+12%', color: 'bg-blue-500' },
    { label: 'Tržby (EUR)', value: '45,320', change: '+8%', color: 'bg-green-500' },
    { label: 'Nové zákazníci', value: '89', change: '+5%', color: 'bg-purple-500' },
    { label: 'Čekající platby', value: '12', change: '-2%', color: 'bg-orange-500' },
  ];

  const revenueData = [
    { month: 'Led', revenue: 4000, orders: 24 },
    { month: 'Úno', revenue: 3000, orders: 13 },
    { month: 'Bře', revenue: 2000, orders: 9 },
    { month: 'Dub', revenue: 2780, orders: 39 },
    { month: 'Kvě', revenue: 1890, orders: 28 },
    { month: 'Čer', revenue: 2390, orders: 35 },
  ];

  const recentOrders = [
    { id: 'OBJ000001', customer: 'Jan Novák', amount: 1299, status: 'pending', date: '2025-01-12' },
    { id: 'OBJ000002', customer: 'Marie Svobodová', amount: 2599, status: 'shipped', date: '2025-01-11' },
    { id: 'OBJ000003', customer: 'Petr Kučera', amount: 899, status: 'delivered', date: '2025-01-10' },
    { id: 'OBJ000004', customer: 'Anna Čermáková', amount: 3499, status: 'pending', date: '2025-01-09' },
    { id: 'OBJ000005', customer: 'Tomáš Horák', amount: 1599, status: 'processing', date: '2025-01-08' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Čekající' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Zpracování' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Odesláno' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Doručeno' },
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">HDmobil - Administrace</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            <NavLink href="/admin" icon="📊" label="Přehled" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavLink href="/admin/products" icon="📦" label="Produkty" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
            <NavLink href="/admin/orders" icon="📋" label="Objednávky" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
            <NavLink href="/admin/customers" icon="👥" label="Zákazníci" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
            <NavLink href="/admin/discounts" icon="🏷️" label="Slevy" active={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
            <NavLink href="/admin/settings" icon="⚙️" label="Nastavení" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} w-12 h-12 rounded-lg opacity-10`}></div>
                  </div>
                  <p className="text-green-600 text-sm font-medium mt-4">{stat.change} oproti minulému měsíci</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Tržby</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Orders Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Počet objednávek</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Poslední objednávky</h2>
                  <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Zobrazit vše →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Číslo objednávky</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Zákazník</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Částka</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stav</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          <Link to={`/admin/orders/${order.id}`}>{order.id}</Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.amount} EUR</td>
                        <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
