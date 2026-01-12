import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  TrendingDown,
  Euro,
  Clock,
  ChevronRight,
  ExternalLink,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Revenue data for chart
const revenueData = [
  { name: 'Jan', revenue: 12400, orders: 145 },
  { name: 'Feb', revenue: 15200, orders: 178 },
  { name: 'Mar', revenue: 18900, orders: 210 },
  { name: 'Apr', revenue: 16800, orders: 195 },
  { name: 'Máj', revenue: 21500, orders: 245 },
  { name: 'Jún', revenue: 24800, orders: 289 },
  { name: 'Júl', revenue: 28900, orders: 312 },
  { name: 'Aug', revenue: 32100, orders: 356 },
  { name: 'Sep', revenue: 29800, orders: 334 },
  { name: 'Okt', revenue: 35200, orders: 398 },
  { name: 'Nov', revenue: 41200, orders: 456 },
  { name: 'Dec', revenue: 45320, orders: 512 },
];

// Category distribution data
const categoryData = [
  { name: 'Smartfóny', value: 45, color: '#22c55e' },
  { name: 'Tablety', value: 20, color: '#16a34a' },
  { name: 'Notebooky', value: 18, color: '#15803d' },
  { name: 'Audio', value: 12, color: '#166534' },
  { name: 'Príslušenstvo', value: 5, color: '#14532d' },
];

// Orders by status
const orderStatusData = [
  { name: 'Čakajúce', count: 24, color: '#fbbf24' },
  { name: 'Spracované', count: 18, color: '#3b82f6' },
  { name: 'Odoslané', count: 45, color: '#8b5cf6' },
  { name: 'Doručené', count: 156, color: '#22c55e' },
];

export default function AdminDashboard() {
  const [location, navigate] = useLocation();

  useEffect(() => {
    const isAdmin = localStorage.getItem('hdmobil_admin');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('hdmobil_admin');
    navigate('/admin/login');
  };

  const dashboardStats = [
    { 
      label: 'Celkové objednávky', 
      value: '1,234', 
      change: '+12%', 
      positive: true,
      icon: ShoppingCart,
      description: 'oproti minulému mesiacu'
    },
    { 
      label: 'Tržby', 
      value: '45,320 €', 
      change: '+8%', 
      positive: true,
      icon: Euro,
      description: 'oproti minulému mesiacu'
    },
    { 
      label: 'Noví zákazníci', 
      value: '89', 
      change: '+5%', 
      positive: true,
      icon: Users,
      description: 'oproti minulému mesiacu'
    },
    { 
      label: 'Čakajúce platby', 
      value: '12', 
      change: '-2%', 
      positive: false,
      icon: Clock,
      description: 'oproti minulému mesiacu'
    },
  ];

  const recentOrders = [
    { id: 'OBJ000001', customer: 'Ján Novák', email: 'jan.novak@email.sk', amount: 1299, status: 'pending', date: '2025-01-12', items: 2 },
    { id: 'OBJ000002', customer: 'Mária Svobodová', email: 'maria.s@email.sk', amount: 2599, status: 'shipped', date: '2025-01-11', items: 1 },
    { id: 'OBJ000003', customer: 'Peter Kučera', email: 'peter.k@email.sk', amount: 899, status: 'delivered', date: '2025-01-10', items: 3 },
    { id: 'OBJ000004', customer: 'Anna Čermáková', email: 'anna.c@email.sk', amount: 3499, status: 'pending', date: '2025-01-09', items: 1 },
    { id: 'OBJ000005', customer: 'Tomáš Horák', email: 'tomas.h@email.sk', amount: 1599, status: 'processing', date: '2025-01-08', items: 4 },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string; dot: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Čakajúca', dot: 'bg-amber-500' },
      processing: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Spracováva sa', dot: 'bg-blue-500' },
      shipped: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Odoslaná', dot: 'bg-violet-500' },
      delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Doručená', dot: 'bg-emerald-500' },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
        {s.label}
      </span>
    );
  };

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Prehľad' },
    { href: '/admin/products', icon: Package, label: 'Produkty' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Objednávky' },
    { href: '/admin/customers', icon: Users, label: 'Zákazníci' },
    { href: '/admin/discounts', icon: Tag, label: 'Zľavy' },
    { href: '/admin/settings', icon: Settings, label: 'Nastavenia' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-sm">HD</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">HDmobil</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Zobraziť web</span>
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200/80 min-h-[calc(100vh-57px)] hidden lg:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-100 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span>Odhlásiť sa</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Prehľad</h2>
                <p className="text-gray-500 text-sm mt-1">Vitajte späť! Tu je prehľad vášho obchodu.</p>
              </div>
              <div className="text-sm text-gray-500">
                Posledná aktualizácia: <span className="font-medium text-gray-700">práve teraz</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {dashboardStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                        <div className="flex items-center gap-1.5 mt-3">
                          {stat.positive ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                          <span className="text-gray-400 text-sm">{stat.description}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Revenue Chart */}
              <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200/80 p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Tržby za rok 2025</h3>
                      <p className="text-sm text-gray-500">Mesačný prehľad tržieb</p>
                    </div>
                  </div>
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <option>Tento rok</option>
                    <option>Minulý rok</option>
                  </select>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value/1000}k €`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()} €`, 'Tržby']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <PieChartIcon className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Predaj podľa kategórií</h3>
                    <p className="text-sm text-gray-500">Rozdelenie tržieb</p>
                  </div>
                </div>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Podiel']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-gray-600">{cat.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders Status + Recent Orders */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {/* Order Status Cards */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Stav objednávok</h3>
                <div className="space-y-3">
                  {orderStatusData.map((status, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: status.color }}></div>
                        <span className="text-sm text-gray-600">{status.name}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200/80">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Posledné objednávky</h3>
                    <Link href="/admin/orders" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Zobraziť všetky
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objednávka</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zákazník</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Položky</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suma</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dátum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                              {order.id}
                            </Link>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                              <p className="text-xs text-gray-500">{order.email}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{order.items} ks</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">{order.amount.toLocaleString()} €</td>
                          <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
