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
  Search,
  ExternalLink,
  ChevronDown,
  Eye,
  FileText,
  Truck,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function AdminOrders() {
  const [location, navigate] = useLocation();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

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

  const orders = [
    { id: 'OBJ000001', customer: 'Ján Novák', email: 'jan@example.com', amount: 1299, status: 'pending', payment: 'unpaid', date: '2025-01-12 14:30', items: 3 },
    { id: 'OBJ000002', customer: 'Mária Svobodová', email: 'maria@example.com', amount: 2599, status: 'shipped', payment: 'paid', date: '2025-01-11 09:15', items: 5 },
    { id: 'OBJ000003', customer: 'Peter Kučera', email: 'peter@example.com', amount: 899, status: 'delivered', payment: 'paid', date: '2025-01-10 16:45', items: 2 },
    { id: 'OBJ000004', customer: 'Anna Čermáková', email: 'anna@example.com', amount: 3499, status: 'pending', payment: 'unpaid', date: '2025-01-09 11:20', items: 1 },
    { id: 'OBJ000005', customer: 'Tomáš Horák', email: 'tomas@example.com', amount: 1599, status: 'processing', payment: 'paid', date: '2025-01-08 08:00', items: 4 },
  ];

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Prehľad' },
    { href: '/admin/products', icon: Package, label: 'Produkty' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Objednávky' },
    { href: '/admin/customers', icon: Users, label: 'Zákazníci' },
    { href: '/admin/discounts', icon: Tag, label: 'Zľavy' },
    { href: '/admin/settings', icon: Settings, label: 'Nastavenia' },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.payment === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string; dot: string; icon: typeof Clock }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Čakajúca', dot: 'bg-amber-500', icon: Clock },
      processing: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Spracováva sa', dot: 'bg-blue-500', icon: AlertCircle },
      shipped: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Odoslaná', dot: 'bg-violet-500', icon: Truck },
      delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Doručená', dot: 'bg-emerald-500', icon: CheckCircle },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
        {s.label}
      </span>
    );
  };

  const getPaymentBadge = (payment: string) => {
    return payment === 'paid' ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        <CheckCircle className="w-3 h-3" />
        Zaplatené
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <AlertCircle className="w-3 h-3" />
        Nezaplatené
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-sm">HD</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">HDmobil</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
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
                <h2 className="text-2xl font-semibold text-gray-900">Objednávky</h2>
                <p className="text-gray-500 text-sm mt-1">Spravujte objednávky a sledujte ich stav</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  <FileText className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                    <p className="text-sm text-gray-500">Čakajúce</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                    <p className="text-sm text-gray-500">Spracovávané</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">24</p>
                    <p className="text-sm text-gray-500">Odoslané</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">156</p>
                    <p className="text-sm text-gray-500">Doručené</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hľadať podľa čísla objednávky alebo mena..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                    >
                      <option value="all">Všetky stavy</option>
                      <option value="pending">Čakajúce</option>
                      <option value="processing">Spracovávané</option>
                      <option value="shipped">Odoslané</option>
                      <option value="delivered">Doručené</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={filterPayment}
                      onChange={(e) => setFilterPayment(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                    >
                      <option value="all">Všetky platby</option>
                      <option value="paid">Zaplatené</option>
                      <option value="unpaid">Nezaplatené</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objednávka</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zákazník</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Položky</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suma</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platba</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dátum</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <button 
                            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                          >
                            {order.id}
                          </button>
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
                        <td className="px-5 py-4">{getPaymentBadge(order.payment)}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{order.date}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Zobrazených <span className="font-medium text-gray-700">{filteredOrders.length}</span> z <span className="font-medium text-gray-700">{orders.length}</span> objednávok
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Predchádzajúca</button>
                  <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg">1</button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">2</button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Ďalšia</button>
                </div>
              </div>
            </div>

            {/* Order Detail Panel */}
            {selectedOrder && (
              <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Detail objednávky {selectedOrder}</h3>
                    <p className="text-sm text-gray-500">Vytvorená 12.1.2025 o 14:30</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Fakturačné údaje</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                      <p className="font-medium text-gray-900">Ján Novák</p>
                      <p className="text-gray-600">Ulica 123</p>
                      <p className="text-gray-600">811 01 Bratislava</p>
                      <p className="text-gray-600">Slovensko</p>
                      <p className="text-gray-600 mt-2">jan@example.com</p>
                      <p className="text-gray-600">+421 900 123 456</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Doručovacie údaje</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                      <p className="font-medium text-gray-900">Ján Novák</p>
                      <p className="text-gray-600">Ulica 123</p>
                      <p className="text-gray-600">811 01 Bratislava</p>
                      <p className="text-gray-600">Slovensko</p>
                      <p className="text-emerald-600 mt-2 font-medium">DPD Kuriér</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                    <FileText className="w-4 h-4" />
                    Stiahnuť faktúru
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-lg shadow-emerald-500/20">
                    <Truck className="w-4 h-4" />
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
