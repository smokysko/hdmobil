import { useEffect, useRef } from 'react';
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

const revenueData = [
  { name: 'Jan', revenue: 12400 },
  { name: 'Feb', revenue: 15200 },
  { name: 'Mar', revenue: 18900 },
  { name: 'Apr', revenue: 16800 },
  { name: 'Máj', revenue: 21500 },
  { name: 'Jún', revenue: 24800 },
  { name: 'Júl', revenue: 28900 },
  { name: 'Aug', revenue: 32100 },
  { name: 'Sep', revenue: 29800 },
  { name: 'Okt', revenue: 35200 },
  { name: 'Nov', revenue: 41200 },
  { name: 'Dec', revenue: 45320 },
];

const categoryData = [
  { name: 'Smartfony', value: 45, color: '#22c55e' },
  { name: 'Tablety', value: 20, color: '#16a34a' },
  { name: 'Notebooky', value: 18, color: '#15803d' },
  { name: 'Audio', value: 12, color: '#166534' },
  { name: 'Prislusenstvo', value: 5, color: '#14532d' },
];

const orderStatusData = [
  { name: 'Cakajuce', count: 24, color: '#fbbf24' },
  { name: 'Spracovane', count: 18, color: '#3b82f6' },
  { name: 'Odoslane', count: 45, color: '#8b5cf6' },
  { name: 'Dorucene', count: 156, color: '#22c55e' },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

function SimpleBarChart() {
  return (
    <div className="flex items-end justify-between h-[240px] gap-2 px-2">
      {revenueData.map((item, idx) => {
        const height = (item.revenue / maxRevenue) * 100;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 gap-2">
            <div className="w-full flex flex-col items-center justify-end h-[200px]">
              <div
                className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all hover:from-emerald-600 hover:to-emerald-500"
                style={{ height: `${height}%` }}
                title={`${item.revenue.toLocaleString()} EUR`}
              />
            </div>
            <span className="text-xs text-gray-500">{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}

function SimplePieChart() {
  let cumulativePercent = 0;
  const size = 140;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {categoryData.map((item, idx) => {
          const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference / 100;
          cumulativePercent += item.value;
          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const isAdmin = localStorage.getItem('hdmobil_admin');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hdmobil_admin');
    navigate('/admin/login');
  };

  const dashboardStats = [
    {
      label: 'Celkove objednavky',
      value: '1,234',
      change: '+12%',
      positive: true,
      icon: ShoppingCart,
      description: 'oproti minulemu mesiacu',
    },
    {
      label: 'Trzby',
      value: '45,320 EUR',
      change: '+8%',
      positive: true,
      icon: Euro,
      description: 'oproti minulemu mesiacu',
    },
    {
      label: 'Novi zakaznici',
      value: '89',
      change: '+5%',
      positive: true,
      icon: Users,
      description: 'oproti minulemu mesiacu',
    },
    {
      label: 'Cakajuce platby',
      value: '12',
      change: '-2%',
      positive: false,
      icon: Clock,
      description: 'oproti minulemu mesiacu',
    },
  ];

  const recentOrders = [
    { id: 'OBJ000001', customer: 'Jan Novak', email: 'jan.novak@email.sk', amount: 1299, status: 'pending', date: '2025-01-12', items: 2 },
    { id: 'OBJ000002', customer: 'Maria Svobodova', email: 'maria.s@email.sk', amount: 2599, status: 'shipped', date: '2025-01-11', items: 1 },
    { id: 'OBJ000003', customer: 'Peter Kucera', email: 'peter.k@email.sk', amount: 899, status: 'delivered', date: '2025-01-10', items: 3 },
    { id: 'OBJ000004', customer: 'Anna Cermakova', email: 'anna.c@email.sk', amount: 3499, status: 'pending', date: '2025-01-09', items: 1 },
    { id: 'OBJ000005', customer: 'Tomas Horak', email: 'tomas.h@email.sk', amount: 1599, status: 'processing', date: '2025-01-08', items: 4 },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string; dot: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Cakajuca', dot: 'bg-amber-500' },
      processing: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Spracovava sa', dot: 'bg-blue-500' },
      shipped: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Odoslana', dot: 'bg-violet-500' },
      delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Dorucena', dot: 'bg-emerald-500' },
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
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Prehlad' },
    { href: '/admin/products', icon: Package, label: 'Produkty' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Objednavky' },
    { href: '/admin/customers', icon: Users, label: 'Zakaznici' },
    { href: '/admin/discounts', icon: Tag, label: 'Zlavy' },
    { href: '/admin/settings', icon: Settings, label: 'Nastavenia' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
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
              <span className="hidden sm:inline">Zobrazit web</span>
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
                    isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
              <span>Odhlasit sa</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Prehlad</h2>
                <p className="text-gray-500 text-sm mt-1">Vitajte spat! Tu je prehlad vasho obchodu.</p>
              </div>
              <div className="text-sm text-gray-500">
                Posledna aktualizacia: <span className="font-medium text-gray-700">prave teraz</span>
              </div>
            </div>

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
                          {stat.positive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                          <span className={`text-sm font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>{stat.change}</span>
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200/80 p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Trzby za rok 2025</h3>
                      <p className="text-sm text-gray-500">Mesacny prehlad trzieb</p>
                    </div>
                  </div>
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <option>Tento rok</option>
                    <option>Minuly rok</option>
                  </select>
                </div>
                <SimpleBarChart />
              </div>

              <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <PieChartIcon className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Predaj podla kategorii</h3>
                    <p className="text-sm text-gray-500">Rozdelenie trzieb</p>
                  </div>
                </div>
                <SimplePieChart />
                <div className="space-y-2 mt-6">
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

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Stav objednavok</h3>
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

              <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200/80">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Posledne objednavky</h3>
                    <Link href="/admin/orders" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Zobrazit vsetky
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objednavka</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zakaznik</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Polozky</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suma</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
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
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">{order.amount.toLocaleString()} EUR</td>
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
