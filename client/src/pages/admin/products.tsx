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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  ChevronDown,
  ImageIcon,
  X,
} from 'lucide-react';

export default function AdminProducts() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

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

  const products = [
    { id: 1, name: 'iPhone 15 Pro Max', sku: 'IPH-15PM-256', price: 1299, stock: 45, category: 'Smartfóny', status: 'active' },
    { id: 2, name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-256', price: 1199, stock: 32, category: 'Smartfóny', status: 'active' },
    { id: 3, name: 'iPad Pro 12.9"', sku: 'IPD-PRO-129', price: 1099, stock: 18, category: 'Tablety', status: 'active' },
    { id: 4, name: 'MacBook Air M3', sku: 'MBK-AIR-M3', price: 1299, stock: 0, category: 'Notebooky', status: 'inactive' },
    { id: 5, name: 'AirPods Pro 2', sku: 'APD-PRO-2', price: 279, stock: 156, category: 'Audio', status: 'active' },
    { id: 6, name: 'Apple Watch Ultra 2', sku: 'AWU-2-49', price: 899, stock: 23, category: 'Príslušenstvo', status: 'active' },
  ];

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Prehľad' },
    { href: '/admin/products', icon: Package, label: 'Produkty' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Objednávky' },
    { href: '/admin/customers', icon: Users, label: 'Zákazníci' },
    { href: '/admin/discounts', icon: Tag, label: 'Zľavy' },
    { href: '/admin/settings', icon: Settings, label: 'Nastavenia' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
                <h2 className="text-2xl font-semibold text-gray-900">Produkty</h2>
                <p className="text-gray-500 text-sm mt-1">Spravujte produkty vo vašom obchode</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-5 h-5" />
                Nový produkt
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hľadať podľa názvu alebo SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                    >
                      <option value="all">Všetky stavy</option>
                      <option value="active">Aktívne</option>
                      <option value="inactive">Neaktívne</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                    >
                      <option value="all">Všetky kategórie</option>
                      <option value="Smartfóny">Smartfóny</option>
                      <option value="Tablety">Tablety</option>
                      <option value="Notebooky">Notebooky</option>
                      <option value="Audio">Audio</option>
                      <option value="Príslušenstvo">Príslušenstvo</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produkt</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategória</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sklad</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 font-mono">{product.sku}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">{product.price.toLocaleString()} €</td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `${product.stock} ks` : 'Vypredané'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                            {product.status === 'active' ? 'Aktívny' : 'Neaktívny'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
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
                  Zobrazených <span className="font-medium text-gray-700">{filteredProducts.length}</span> z <span className="font-medium text-gray-700">{products.length}</span> produktov
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Predchádzajúca</button>
                  <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg">1</button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">2</button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">3</button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Ďalšia</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nový produkt</h2>
                <p className="text-sm text-gray-500 mt-1">Vyplňte údaje o novom produkte</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Názov produktu</label>
                  <input 
                    type="text" 
                    placeholder="napr. iPhone 15 Pro"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input 
                    type="text" 
                    placeholder="napr. IPH-15P-256"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cena (€)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Počet na sklade</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategória</label>
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white">
                    <option>Vyberte kategóriu</option>
                    <option>Smartfóny</option>
                    <option>Tablety</option>
                    <option>Notebooky</option>
                    <option>Audio</option>
                    <option>Príslušenstvo</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                <textarea 
                  rows={4} 
                  placeholder="Zadajte popis produktu..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obrázky</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                  <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Kliknite alebo pretiahnite obrázky sem</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG do 5MB</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              >
                Zrušiť
              </button>
              <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-lg shadow-emerald-500/20">
                Vytvoriť produkt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
