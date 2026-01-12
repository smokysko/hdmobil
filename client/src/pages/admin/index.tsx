import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AdminDashboard() {
  const { t } = useI18n();
  const [location] = useLocation();

  // Mock data - will be replaced with real data from Supabase
  const dashboardStats = [
    { label: t.admin.totalOrders, value: '1,234', change: '+12%', color: 'bg-blue-500', icon: '📦' },
    { label: t.admin.revenue + ' (EUR)', value: '45,320', change: '+8%', color: 'bg-green-500', icon: '💰' },
    { label: t.admin.newCustomers, value: '89', change: '+5%', color: 'bg-purple-500', icon: '👥' },
    { label: t.admin.pendingPayments, value: '12', change: '-2%', color: 'bg-orange-500', icon: '⏳' },
  ];

  const recentOrders = [
    { id: 'OBJ000001', customer: 'Ján Novák', amount: 1299, status: 'pending', date: '2025-01-12' },
    { id: 'OBJ000002', customer: 'Mária Svobodová', amount: 2599, status: 'shipped', date: '2025-01-11' },
    { id: 'OBJ000003', customer: 'Peter Kučera', amount: 899, status: 'delivered', date: '2025-01-10' },
    { id: 'OBJ000004', customer: 'Anna Čermáková', amount: 3499, status: 'pending', date: '2025-01-09' },
    { id: 'OBJ000005', customer: 'Tomáš Horák', amount: 1599, status: 'processing', date: '2025-01-08' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t.admin.orderStatus.pending },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: t.admin.orderStatus.processing },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: t.admin.orderStatus.shipped },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: t.admin.orderStatus.delivered },
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const navItems = [
    { href: '/admin/dashboard', icon: '📊', label: t.admin.dashboard },
    { href: '/admin/products', icon: '📦', label: t.admin.products },
    { href: '/admin/orders', icon: '📋', label: t.admin.orders },
    { href: '/admin/customers', icon: '👥', label: t.admin.customers },
    { href: '/admin/discounts', icon: '🏷️', label: t.admin.discounts },
    { href: '/admin/settings', icon: '⚙️', label: t.admin.settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">HD</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">HDmobil Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button className="text-gray-600 hover:text-gray-900 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
              ← {t.nav.home}
            </Link>
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline">Admin</span>
            </button>
          </div>
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
                  location === item.href || (item.href === '/admin/dashboard' && location === '/admin')
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <Link
              href="/admin/login"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span>{t.nav.logout}</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl opacity-90`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className={`text-sm font-medium mt-4 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} {t.admin.comparedToLastMonth}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">{t.admin.recentOrders}</h2>
                  <Link href="/admin/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    {t.admin.viewAll} →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t.admin.orderNumber}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t.admin.customer}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t.admin.amount}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t.admin.status}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t.admin.date}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          <Link href={`/admin/orders/${order.id}`}>{order.id}</Link>
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
