import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
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
  Loader2,
  Upload,
  FileText,
  Palette,
  Tag,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import {
  getAdminProducts,
  getAdminCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  uploadProductImage,
  AdminProduct,
  AdminCategory,
} from '@/lib/admin-products';
import { toast } from 'sonner';

type Language = 'sk' | 'cs' | 'pl';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

interface ProductFormData {
  id?: string;
  name_sk: string;
  name_cs: string;
  name_pl: string;
  sku: string;
  price_with_vat: string;
  original_price: string;
  stock_quantity: string;
  category_id: string;
  description_sk: string;
  description_cs: string;
  description_pl: string;
  main_image_url: string;
  is_active: boolean;
  is_new: boolean;
  is_featured: boolean;
}

const emptyFormData: ProductFormData = {
  name_sk: '',
  name_cs: '',
  name_pl: '',
  sku: '',
  price_with_vat: '',
  original_price: '',
  stock_quantity: '',
  category_id: '',
  description_sk: '',
  description_cs: '',
  description_pl: '',
  main_image_url: '',
  is_active: true,
  is_new: false,
  is_featured: false,
};

export default function AdminProducts() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [activeLanguage, setActiveLanguage] = useState<Language>('sk');

  useEffect(() => {
    const isAdmin = localStorage.getItem('hdmobil_admin');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [prods, cats] = await Promise.all([
      getAdminProducts(),
      getAdminCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setIsLoading(false);
  }

  const handleLogout = () => {
    localStorage.removeItem('hdmobil_admin');
    navigate('/admin/login');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vyberte obrazkovy subor');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Obrazok je prilis velky (max 5MB)');
      return;
    }

    setIsUploading(true);
    const result = await uploadProductImage(file);
    setIsUploading(false);

    if (result.success && result.url) {
      setFormData({ ...formData, main_image_url: result.url });
      toast.success('Obrazok bol nahratý');
    } else {
      toast.error(result.error || 'Chyba pri nahravani obrazka');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name_sk || !formData.price_with_vat) {
      toast.error('Vyplnte nazov a cenu produktu');
      return;
    }

    setIsSaving(true);

    if (editMode && formData.id) {
      const result = await updateProduct({
        id: formData.id,
        name_sk: formData.name_sk,
        name_cs: formData.name_cs || undefined,
        name_pl: formData.name_pl || undefined,
        sku: formData.sku || undefined,
        price_with_vat: parseFloat(formData.price_with_vat),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        category_id: formData.category_id || undefined,
        description_sk: formData.description_sk || undefined,
        description_cs: formData.description_cs || undefined,
        description_pl: formData.description_pl || undefined,
        main_image_url: formData.main_image_url || undefined,
        is_active: formData.is_active,
        is_new: formData.is_new,
        is_featured: formData.is_featured,
      });

      setIsSaving(false);

      if (result.success) {
        toast.success('Produkt bol aktualizovany');
        closeModal();
        loadData();
      } else {
        toast.error(result.error || 'Chyba pri ukladani produktu');
      }
    } else {
      const result = await createProduct({
        name_sk: formData.name_sk,
        name_cs: formData.name_cs || undefined,
        name_pl: formData.name_pl || undefined,
        sku: formData.sku || undefined,
        price_with_vat: parseFloat(formData.price_with_vat),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        category_id: formData.category_id || undefined,
        description_sk: formData.description_sk || undefined,
        description_cs: formData.description_cs || undefined,
        description_pl: formData.description_pl || undefined,
        main_image_url: formData.main_image_url || undefined,
        is_active: formData.is_active,
        is_new: formData.is_new,
        is_featured: formData.is_featured,
      });

      setIsSaving(false);

      if (result.success) {
        toast.success('Produkt bol vytvoreny');
        closeModal();
        loadData();
      } else {
        toast.error(result.error || 'Chyba pri vytvarani produktu');
      }
    }
  };

  const openCreateModal = () => {
    setFormData(emptyFormData);
    setEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setFormData({
      id: product.id,
      name_sk: product.name_sk,
      name_cs: (product as Record<string, unknown>).name_cs as string || '',
      name_pl: (product as Record<string, unknown>).name_pl as string || '',
      sku: product.sku || '',
      price_with_vat: String(product.price_with_vat),
      original_price: product.original_price ? String(product.original_price) : '',
      stock_quantity: String(product.stock_quantity),
      category_id: product.category_id || '',
      description_sk: product.description_sk || '',
      description_cs: (product as Record<string, unknown>).description_cs as string || '',
      description_pl: (product as Record<string, unknown>).description_pl as string || '',
      main_image_url: product.main_image_url || '',
      is_active: product.is_active,
      is_new: product.is_new,
      is_featured: product.is_featured,
    });
    setActiveLanguage('sk');
    setEditMode(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData(emptyFormData);
    setActiveLanguage('sk');
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Naozaj chcete vymazat produkt "${name}"?`)) {
      return;
    }

    const result = await deleteProduct(id);
    if (result.success) {
      toast.success('Produkt bol vymazany');
      loadData();
    } else {
      toast.error(result.error || 'Chyba pri mazani produktu');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleProductStatus(id, !currentStatus);
    if (result.success) {
      toast.success(
        currentStatus ? 'Produkt bol deaktivovany' : 'Produkt bol aktivovany'
      );
      loadData();
    } else {
      toast.error(result.error || 'Chyba pri zmene stavu');
    }
  };

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Prehľad' },
    { href: '/admin/products', icon: Package, label: 'Produkty' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Objednávky' },
    { href: '/admin/customers', icon: Users, label: 'Zákazníci' },
    { href: '/admin/reviews', icon: MessageSquare, label: 'Recenzie' },
    { href: '/admin/invoices', icon: FileText, label: 'Faktúry' },
    { href: '/admin/discounts', icon: Tag, label: 'Kupóny' },
    { href: '/admin/marketing', icon: Megaphone, label: 'Marketing' },
    { href: '/admin/cms', icon: Palette, label: 'Obsah stránky' },
    { href: '/admin/settings', icon: Settings, label: 'Nastavenia' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name_sk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active);
    const matchesCategory =
      categoryFilter === 'all' ||
      product.category?.name_sk === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil Logo" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">HDmobil</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Zobrazit web</span>
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Admin
              </span>
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
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                    strokeWidth={1.5}
                  />
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
                <h2 className="text-2xl font-semibold text-gray-900">
                  Produkty
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Spravujte produkty vo vasom obchode ({products.length}{' '}
                  produktov)
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-5 h-5" />
                Nový produkt
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hladat podla nazvu alebo SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="all">Vsetky stavy</option>
                      <option value="active">Aktivne</option>
                      <option value="inactive">Neaktivne</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="all">Vsetky kategorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name_sk}>
                          {cat.name_sk}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produkt
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategoria
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cena
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sklad
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stav
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.main_image_url ? (
                                  <img
                                    src={product.main_image_url}
                                    alt={product.name_sk}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900">
                                {product.name_sk}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500 font-mono">
                            {product.sku || '-'}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                              {product.category?.name_sk || 'Bez kategorie'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                            {Number(product.price_with_vat).toLocaleString()}{' '}
                            EUR
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-blue-600' : 'text-red-600'}`}
                            >
                              {product.stock_quantity > 0
                                ? `${product.stock_quantity} ks`
                                : 'Vypredane'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() =>
                                handleToggleStatus(product.id, product.is_active)
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                product.is_active
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-blue-500' : 'bg-gray-400'}`}
                              ></span>
                              {product.is_active ? 'Aktivny' : 'Neaktivny'}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/product/${product.id}`}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteProduct(product.id, product.name_sk)
                                }
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Zobrazenych{' '}
                  <span className="font-medium text-gray-700">
                    {filteredProducts.length}
                  </span>{' '}
                  z{' '}
                  <span className="font-medium text-gray-700">
                    {products.length}
                  </span>{' '}
                  produktov
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editMode ? 'Upravit produkt' : 'Nový produkt'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editMode ? 'Upravte údaje produktu' : 'Vyplňte údaje o novom produkte'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              <div className="flex gap-6">
                <div className="w-40 shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Obrázok
                  </label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {formData.main_image_url ? (
                      <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
                        <img
                          src={formData.main_image_url}
                          alt="Product"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setFormData({ ...formData, main_image_url: '' })}
                            className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                      >
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-xs text-gray-500">Nahrat</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        placeholder="napr. IPH-15P-256"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategória
                      </label>
                      <div className="relative">
                        <select
                          value={formData.category_id}
                          onChange={(e) =>
                            setFormData({ ...formData, category_id: e.target.value })
                          }
                          className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                        >
                          <option value="">Vyberte kategóriu</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name_sk}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cena s DPH (EUR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price_with_vat}
                    onChange={(e) =>
                      setFormData({ ...formData, price_with_vat: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pôvodná cena (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Počet na sklade
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_quantity: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLanguage(lang.code)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        activeLanguage === lang.code
                          ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-px'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Názov produktu {activeLanguage === 'sk' && '*'}
                      <span className="text-gray-400 font-normal ml-2">
                        ({LANGUAGES.find(l => l.code === activeLanguage)?.label})
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder={`napr. iPhone 15 Pro (${activeLanguage.toUpperCase()})`}
                      value={formData[`name_${activeLanguage}` as keyof ProductFormData] as string}
                      onChange={(e) =>
                        setFormData({ ...formData, [`name_${activeLanguage}`]: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popis
                      <span className="text-gray-400 font-normal ml-2">
                        ({LANGUAGES.find(l => l.code === activeLanguage)?.label})
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`Zadajte popis produktu (${activeLanguage.toUpperCase()})...`}
                      value={formData[`description_${activeLanguage}` as keyof ProductFormData] as string}
                      onChange={(e) =>
                        setFormData({ ...formData, [`description_${activeLanguage}`]: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Aktívny</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) =>
                      setFormData({ ...formData, is_new: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Novinka</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Odporúčaný</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editMode ? 'Uložiť zmeny' : 'Vytvoriť produkt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
