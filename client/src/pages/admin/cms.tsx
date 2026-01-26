import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  FileText,
  Palette,
  Home,
  Image as ImageIcon,
  FolderOpen,
  Save,
  Loader2,
  Upload,
  Trash2,
  Plus,
  X,
  Edit,
  Eye,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface HomepageSection {
  id: string;
  section_key: string;
  section_type: string;
  title_sk: string | null;
  subtitle_sk: string | null;
  description_sk: string | null;
  badge_text: string | null;
  image_url: string | null;
  image_mobile_url: string | null;
  link_url: string | null;
  link_text: string | null;
  content: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
}

interface Banner {
  id: string;
  name: string;
  title_sk: string | null;
  subtitle_sk: string | null;
  image_url: string | null;
  image_mobile_url: string | null;
  link_url: string | null;
  placement: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
}

interface MediaItem {
  id: string;
  filename: string;
  storage_path: string;
  url: string;
  alt_text: string | null;
  mime_type: string | null;
  file_size: number | null;
  folder: string;
  created_at: string;
}

type TabType = 'homepage' | 'banners' | 'media';

export default function AdminCMS() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('homepage');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);

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
    try {
      const [sectionsRes, bannersRes, mediaRes] = await Promise.all([
        supabase.from('homepage_sections').select('*').order('sort_order'),
        supabase.from('banners').select('*').order('sort_order'),
        supabase.from('media_library').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (sectionsRes.data) setSections(sectionsRes.data);
      if (bannersRes.data) setBanners(bannersRes.data);
      if (mediaRes.data) setMediaItems(mediaRes.data);
    } catch (error) {
      console.error('Error loading CMS data:', error);
      toast.error('Chyba pri nacitavani dat');
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hdmobil_admin');
    navigate('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Prehlad' },
    { href: '/admin/products', icon: Package, label: 'Produkty' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Objednavky' },
    { href: '/admin/customers', icon: Users, label: 'Zakaznici' },
    { href: '/admin/invoices', icon: FileText, label: 'Faktury' },
    { href: '/admin/cms', icon: Palette, label: 'Obsah stranky' },
    { href: '/admin/settings', icon: Settings, label: 'Nastavenia' },
  ];

  const tabs = [
    { id: 'homepage' as TabType, label: 'Uvod stranky', icon: Home },
    { id: 'banners' as TabType, label: 'Bannery', icon: ImageIcon },
    { id: 'media' as TabType, label: 'Kniznica medii', icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
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
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}
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
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Obsah stranky</h2>
              <p className="text-gray-500 text-sm mt-1">
                Spravujte obsah homepage, bannery a obrazky
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80">
              <div className="border-b border-gray-200">
                <nav className="flex gap-0 px-4" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                          isActive
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <>
                    {activeTab === 'homepage' && (
                      <HomepageTab
                        sections={sections}
                        onUpdate={loadData}
                        editingSection={editingSection}
                        setEditingSection={setEditingSection}
                      />
                    )}
                    {activeTab === 'banners' && (
                      <BannersTab
                        banners={banners}
                        onUpdate={loadData}
                        editingBanner={editingBanner}
                        setEditingBanner={setEditingBanner}
                        showModal={showBannerModal}
                        setShowModal={setShowBannerModal}
                      />
                    )}
                    {activeTab === 'media' && (
                      <MediaTab mediaItems={mediaItems} onUpdate={loadData} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function HomepageTab({
  sections,
  onUpdate,
  editingSection,
  setEditingSection,
}: {
  sections: HomepageSection[];
  onUpdate: () => void;
  editingSection: HomepageSection | null;
  setEditingSection: (s: HomepageSection | null) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<HomepageSection>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingSection) {
      setFormData(editingSection);
    }
  }, [editingSection]);

  const handleSave = async () => {
    if (!editingSection) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({
          title_sk: formData.title_sk,
          subtitle_sk: formData.subtitle_sk,
          description_sk: formData.description_sk,
          badge_text: formData.badge_text,
          image_url: formData.image_url,
          link_url: formData.link_url,
          link_text: formData.link_text,
          content: formData.content,
          is_active: formData.is_active,
        })
        .eq('id', editingSection.id);

      if (error) throw error;
      toast.success('Sekcia bola ulozena');
      setEditingSection(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Chyba pri ukladani');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vyberte obrazkovy subor');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cms/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Obrazok bol nahraty');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahravani obrazka');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero sekcia (hlavny banner)',
      promo_banner: 'Promo banner',
    };
    return labels[key] || key;
  };

  if (editingSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Upravit: {getSectionLabel(editingSection.section_key)}
            </h3>
            <p className="text-sm text-gray-500">Upravte obsah tejto sekcie</p>
          </div>
          <button
            onClick={() => setEditingSection(null)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nadpis
              </label>
              <input
                type="text"
                value={formData.title_sk || ''}
                onChange={(e) => setFormData({ ...formData, title_sk: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Podnadpis
              </label>
              <input
                type="text"
                value={formData.subtitle_sk || ''}
                onChange={(e) => setFormData({ ...formData, subtitle_sk: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badge/Stitok
              </label>
              <input
                type="text"
                value={formData.badge_text || ''}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis
              </label>
              <textarea
                rows={3}
                value={formData.description_sk || ''}
                onChange={(e) => setFormData({ ...formData, description_sk: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Odkaz URL
                </label>
                <input
                  type="text"
                  value={formData.link_url || ''}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text tlacidla
                </label>
                <input
                  type="text"
                  value={formData.link_text || ''}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Aktivna sekcia</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obrazok
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {formData.image_url ? (
                <div className="relative group">
                  <img
                    src={formData.image_url}
                    alt="Section image"
                    className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, image_url: null })}
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
                  className="w-full h-48 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Nahrat obrazok</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {editingSection.section_key === 'hero' && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Dodatocne nastavenia Hero sekcie</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cena</label>
                    <input
                      type="number"
                      value={(formData.content as Record<string, unknown>)?.price as number || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content as Record<string, unknown>, price: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Povodna cena</label>
                    <input
                      type="number"
                      value={(formData.content as Record<string, unknown>)?.original_price as number || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content as Record<string, unknown>, original_price: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Text tlacidla kupit</label>
                  <input
                    type="text"
                    value={(formData.content as Record<string, unknown>)?.buy_button_text as string || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content as Record<string, unknown>, buy_button_text: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => setEditingSection(null)}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
          >
            Zrusit
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Ulozit zmeny
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Vyberte sekciu na upravu obsahu homepage
      </p>

      <div className="grid gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              {section.image_url && (
                <img
                  src={section.image_url}
                  alt=""
                  className="w-16 h-16 object-contain bg-white rounded-lg border"
                />
              )}
              <div>
                <h4 className="font-medium text-gray-900">
                  {getSectionLabel(section.section_key)}
                </h4>
                <p className="text-sm text-gray-500">
                  {section.title_sk || 'Bez nadpisu'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  section.is_active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {section.is_active ? 'Aktivna' : 'Neaktivna'}
              </span>
              <button
                onClick={() => setEditingSection(section)}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Ziadne sekcie na upravu
          </div>
        )}
      </div>
    </div>
  );
}

function BannersTab({
  banners,
  onUpdate,
  editingBanner,
  setEditingBanner,
  showModal,
  setShowModal,
}: {
  banners: Banner[];
  onUpdate: () => void;
  editingBanner: Banner | null;
  setEditingBanner: (b: Banner | null) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Banner>>({
    name: '',
    placement: 'homepage_hero',
    is_active: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingBanner) {
      setFormData(editingBanner);
      setShowModal(true);
    }
  }, [editingBanner]);

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Zadajte nazov bannera');
      return;
    }

    setIsSaving(true);
    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(formData)
          .eq('id', editingBanner.id);
        if (error) throw error;
        toast.success('Banner bol aktualizovany');
      } else {
        const { error } = await supabase.from('banners').insert(formData);
        if (error) throw error;
        toast.success('Banner bol vytvoreny');
      }
      closeModal();
      onUpdate();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Chyba pri ukladani');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Naozaj chcete vymazat banner "${name}"?`)) return;

    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Banner bol vymazany');
      onUpdate();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Chyba pri mazani');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banners/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Obrazok nahraty');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahravani');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({ name: '', placement: 'homepage_hero', is_active: true });
  };

  const placementOptions = [
    { value: 'homepage_hero', label: 'Homepage - Hero carousel' },
    { value: 'homepage_middle', label: 'Homepage - Stredna cast' },
    { value: 'category_top', label: 'Kategorie - Vrchny banner' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Spravujte reklamne bannery na stranke
        </p>
        <button
          onClick={() => {
            setEditingBanner(null);
            setFormData({ name: '', placement: 'homepage_hero', is_active: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Novy banner
        </button>
      </div>

      <div className="grid gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt=""
                  className="w-24 h-16 object-cover bg-white rounded-lg border"
                />
              ) : (
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{banner.name}</h4>
                <p className="text-sm text-gray-500">
                  {placementOptions.find(p => p.value === banner.placement)?.label || banner.placement}
                </p>
                {(banner.start_date || banner.end_date) && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {banner.start_date && new Date(banner.start_date).toLocaleDateString('sk-SK')}
                    {' - '}
                    {banner.end_date && new Date(banner.end_date).toLocaleDateString('sk-SK')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  banner.is_active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {banner.is_active ? 'Aktivny' : 'Neaktivny'}
              </span>
              <button
                onClick={() => setEditingBanner(banner)}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(banner.id, banner.name)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Ziadne bannery. Vytvorte prvy banner kliknutim na tlacidlo vyssie.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBanner ? 'Upravit banner' : 'Novy banner'}
                </h2>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nazov bannera *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  placeholder="napr. Vianocna akcia 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nadpis</label>
                  <input
                    type="text"
                    value={formData.title_sk || ''}
                    onChange={(e) => setFormData({ ...formData, title_sk: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Odkaz</label>
                  <input
                    type="text"
                    value={formData.link_url || ''}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="/category/akcia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Podnadpis</label>
                <textarea
                  rows={2}
                  value={formData.subtitle_sk || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle_sk: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Umiestnenie</label>
                <div className="relative">
                  <select
                    value={formData.placement || 'homepage_hero'}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm"
                  >
                    {placementOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obrazok bannera</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {formData.image_url ? (
                  <div className="relative group">
                    <img src={formData.image_url} alt="" className="w-full h-40 object-cover bg-gray-100 rounded-lg" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-lg">
                        <Upload className="w-4 h-4" />
                      </button>
                      <button onClick={() => setFormData({ ...formData, image_url: null })} className="p-2 bg-white rounded-lg text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50/50"
                  >
                    {isUploading ? <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /> : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Nahrat obrazok</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datum od</label>
                  <input
                    type="date"
                    value={formData.start_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? `${e.target.value}T00:00:00Z` : null })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datum do</label>
                  <input
                    type="date"
                    value={formData.end_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? `${e.target.value}T23:59:59Z` : null })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Aktivny banner</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={closeModal} className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">
                Zrusit
              </button>
              <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingBanner ? 'Ulozit zmeny' : 'Vytvorit banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaTab({
  mediaItems,
  onUpdate,
}: {
  mediaItems: MediaItem[];
  onUpdate: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = [
    { value: 'all', label: 'Vsetky' },
    { value: 'banners', label: 'Bannery' },
    { value: 'cms', label: 'Obsah' },
    { value: 'products', label: 'Produkty' },
    { value: 'general', label: 'Ostatne' },
  ];

  const filteredMedia = selectedFolder === 'all'
    ? mediaItems
    : mediaItems.filter(m => m.folder === selectedFolder);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `general/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, file, { cacheControl: '3600' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        await supabase.from('media_library').insert({
          filename: file.name,
          storage_path: fileName,
          url: publicUrl,
          mime_type: file.type,
          file_size: file.size,
          folder: 'general',
        });
      }
      toast.success('Subory boli nahrate');
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahravani');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Vymazat "${item.filename}"?`)) return;

    try {
      await supabase.storage.from('images').remove([item.storage_path]);
      await supabase.from('media_library').delete().eq('id', item.id);
      toast.success('Subor bol vymazany');
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Chyba pri mazani');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL skopirovana do schranky');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            Kniznica vsetkych obrazkov a suborov
          </p>
          <div className="relative">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {folders.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Nahrat subory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
          >
            <img
              src={item.url}
              alt={item.alt_text || item.filename}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <p className="text-white text-xs text-center truncate w-full">{item.filename}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="p-1.5 bg-white rounded text-gray-700 hover:bg-gray-100"
                  title="Kopirovat URL"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 bg-white rounded text-red-600 hover:bg-red-50"
                  title="Vymazat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Ziadne subory v tejto zlozke
          </div>
        )}
      </div>
    </div>
  );
}
