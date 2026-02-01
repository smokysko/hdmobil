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
  GripVertical,
  Layers,
  Grid3X3,
  Tag,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Language = 'sk' | 'cs' | 'pl';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

interface HeroSlide {
  id: string;
  product_id: string | null;
  title_sk: string;
  title_cs: string | null;
  title_pl: string | null;
  subtitle_sk: string | null;
  subtitle_cs: string | null;
  subtitle_pl: string | null;
  badge_text: string | null;
  image_url: string | null;
  image_mobile_url: string | null;
  price: number | null;
  original_price: number | null;
  features: Array<{ icon?: string; text: string }>;
  specs: Array<{ label: string; value: string }>;
  link_url: string | null;
  link_text: string | null;
  secondary_link_url: string | null;
  secondary_link_text: string | null;
  background_color: string | null;
  text_color: string | null;
  is_active: boolean;
  sort_order: number;
}

interface HomepageCategory {
  id: string;
  category_id: string | null;
  name_sk: string;
  name_cs: string | null;
  name_pl: string | null;
  image_url: string | null;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

interface HomepageSection {
  id: string;
  section_key: string;
  section_type: string;
  title_sk: string | null;
  subtitle_sk: string | null;
  description_sk: string | null;
  badge_text: string | null;
  image_url: string | null;
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
  carousel_group: string | null;
  carousel_interval: number | null;
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

type TabType = 'hero' | 'categories' | 'banners' | 'sections' | 'media';

export default function AdminCMS() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [isLoading, setIsLoading] = useState(true);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<HomepageCategory[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

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
      const [heroRes, categoriesRes, sectionsRes, bannersRes, mediaRes] = await Promise.all([
        supabase.from('hero_slides').select('*').order('sort_order'),
        supabase.from('homepage_categories').select('*').order('sort_order'),
        supabase.from('homepage_sections').select('*').order('sort_order'),
        supabase.from('banners').select('*').order('sort_order'),
        supabase
          .from('media_library')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (heroRes.data) setHeroSlides(heroRes.data);
      if (categoriesRes.data) setHomepageCategories(categoriesRes.data);
      if (sectionsRes.data) setSections(sectionsRes.data);
      if (bannersRes.data) setBanners(bannersRes.data);
      if (mediaRes.data) setMediaItems(mediaRes.data);
    } catch (error) {
      console.error('Error loading CMS data:', error);
      toast.error('Chyba pri načítavaní dát');
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hdmobil_admin');
    navigate('/admin/login');
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

  const tabs = [
    { id: 'hero' as TabType, label: 'Hero Carousel', icon: Layers },
    { id: 'categories' as TabType, label: 'Kategórie', icon: Grid3X3 },
    { id: 'banners' as TabType, label: 'Bannery', icon: ImageIcon },
    { id: 'sections' as TabType, label: 'Sekcie', icon: Home },
    { id: 'media' as TabType, label: 'Médiá', icon: FolderOpen },
  ];

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
              <span className="hidden sm:inline">Zobraziť web</span>
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200/80 h-[calc(100vh-57px)] hidden lg:block sticky top-[57px] overflow-y-auto">
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
              <span>Odhlásiť sa</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Obsah stránky</h2>
              <p className="text-gray-500 text-sm mt-1">
                Spravujte hero carousel, kategórie, bannery a obrázky
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80">
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex gap-0 px-4 min-w-max" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          isActive
                            ? 'border-blue-500 text-blue-600'
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
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {activeTab === 'hero' && (
                      <HeroSlidesTab slides={heroSlides} onUpdate={loadData} />
                    )}
                    {activeTab === 'categories' && (
                      <CategoriesTab categories={homepageCategories} onUpdate={loadData} />
                    )}
                    {activeTab === 'banners' && <BannersTab banners={banners} onUpdate={loadData} />}
                    {activeTab === 'sections' && (
                      <SectionsTab sections={sections} onUpdate={loadData} />
                    )}
                    {activeTab === 'media' && <MediaTab mediaItems={mediaItems} onUpdate={loadData} />}
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

function HeroSlidesTab({
  slides,
  onUpdate,
}: {
  slides: HeroSlide[];
  onUpdate: () => void;
}) {
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('sk');

  const [featuresText, setFeaturesText] = useState('');
  const [specsText, setSpecsText] = useState('');

  useEffect(() => {
    if (editingSlide) {
      setFormData(editingSlide);
      setFeaturesText(
        (editingSlide.features || []).map((f) => f.text).join('\n')
      );
      setSpecsText(
        (editingSlide.specs || []).map((s) => `${s.label}: ${s.value}`).join('\n')
      );
      setShowModal(true);
    }
  }, [editingSlide]);

  const openNewModal = () => {
    setEditingSlide(null);
    setFormData({
      title_sk: '',
      title_cs: '',
      title_pl: '',
      subtitle_sk: '',
      subtitle_cs: '',
      subtitle_pl: '',
      badge_text: '',
      image_url: '',
      price: null,
      original_price: null,
      link_url: '',
      link_text: '',
      secondary_link_url: '',
      secondary_link_text: '',
      is_active: true,
      sort_order: slides.length,
      features: [],
      specs: [],
    });
    setFeaturesText('');
    setSpecsText('');
    setActiveLanguage('sk');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setFormData({});
    setFeaturesText('');
    setSpecsText('');
    setActiveLanguage('sk');
  };

  const handleSave = async () => {
    if (!formData.title_sk) {
      toast.error('Zadajte nadpis');
      return;
    }

    setIsSaving(true);

    const features = featuresText
      .split('\n')
      .filter((line) => line.trim())
      .map((text) => ({ text: text.trim() }));

    const specs = specsText
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const [label, ...valueParts] = line.split(':');
        return { label: label.trim(), value: valueParts.join(':').trim() };
      });

    const dataToSave = {
      ...formData,
      features,
      specs,
    };

    try {
      if (editingSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update(dataToSave)
          .eq('id', editingSlide.id);
        if (error) throw error;
        toast.success('Slide bol aktualizovaný');
      } else {
        const { error } = await supabase.from('hero_slides').insert(dataToSave);
        if (error) throw error;
        toast.success('Slide bol vytvorený');
      }
      closeModal();
      onUpdate();
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Chyba pri ukladaní');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Naozaj chcete vymazať slide "${title}"?`)) return;

    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      toast.success('Slide bol vymazaný');
      onUpdate();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Chyba pri mazaní');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Obrázok nahratý');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahrávaní');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Spravujte slidy v hlavnom hero carouseli na homepage
        </p>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nový slide
        </button>
      </div>

      <div className="grid gap-4">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="text-gray-400 cursor-move">
                <GripVertical className="w-5 h-5" />
              </div>
              {slide.image_url ? (
                <img
                  src={slide.image_url}
                  alt=""
                  className="w-20 h-14 object-contain bg-white rounded-lg border"
                />
              ) : (
                <div className="w-20 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{slide.title_sk}</h4>
                {slide.subtitle_sk && (
                  <p className="text-sm text-gray-500">{slide.subtitle_sk}</p>
                )}
                {slide.price && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {slide.price.toLocaleString('sk-SK')} EUR
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  slide.is_active
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {slide.is_active ? 'Aktívny' : 'Neaktívny'}
              </span>
              <button
                onClick={() => setEditingSlide(slide)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(slide.id, slide.title_sk)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Žiadne slidy. Vytvorte prvý slide kliknutím na tlačidlo vyššie.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSlide ? 'Upraviť slide' : 'Nový slide'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nadpis {activeLanguage === 'sk' && '*'}
                        <span className="text-gray-400 font-normal ml-2">
                          ({LANGUAGES.find(l => l.code === activeLanguage)?.label})
                        </span>
                      </label>
                      <input
                        type="text"
                        value={(formData[`title_${activeLanguage}` as keyof typeof formData] as string) || ''}
                        onChange={(e) => setFormData({ ...formData, [`title_${activeLanguage}`]: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                        placeholder="iPhone 17 Pro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Podnadpis
                        <span className="text-gray-400 font-normal ml-2">
                          ({LANGUAGES.find(l => l.code === activeLanguage)?.label})
                        </span>
                      </label>
                      <input
                        type="text"
                        value={(formData[`subtitle_${activeLanguage}` as keyof typeof formData] as string) || ''}
                        onChange={(e) => setFormData({ ...formData, [`subtitle_${activeLanguage}`]: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                        placeholder="Titanium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge/Štítok
                  </label>
                  <input
                    type="text"
                    value={formData.badge_text || ''}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="NOVINKA 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cena</label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                      placeholder="1299"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pôvodná cena
                    </label>
                    <input
                      type="number"
                      value={formData.original_price || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_price: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                      placeholder="1399"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obrázok
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
                      alt=""
                      className="w-full h-40 object-contain bg-gray-100 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-lg"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, image_url: null })}
                        className="p-2 bg-white rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Nahrať obrázok</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features (každý riadok = jedna feature)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none"
                  placeholder="Čip A19 Bionic&#10;200MPx kamera&#10;Titánové telo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Špecifikácie (formát: Label: Value)
                </label>
                <textarea
                  rows={3}
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none"
                  placeholder="Procesor: A19 Bionic&#10;Kamera: 200 MPx"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hlavný odkaz URL
                  </label>
                  <input
                    type="text"
                    value={formData.link_url || ''}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="/product/xxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text hlavného tlačidla
                  </label>
                  <input
                    type="text"
                    value={formData.link_text || ''}
                    onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="Kúpiť teraz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sekundárny odkaz URL
                  </label>
                  <input
                    type="text"
                    value={formData.secondary_link_url || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_link_url: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="/category/smartfony"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text sekundárneho tlačidla
                  </label>
                  <input
                    type="text"
                    value={formData.secondary_link_text || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_link_text: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="Všetky smartfóny"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Aktívny slide</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingSlide ? 'Uložiť zmeny' : 'Vytvoriť slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesTab({
  categories,
  onUpdate,
}: {
  categories: HomepageCategory[];
  onUpdate: () => void;
}) {
  const [editingCategory, setEditingCategory] = useState<HomepageCategory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<HomepageCategory>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('sk');

  useEffect(() => {
    if (editingCategory) {
      setFormData(editingCategory);
      setShowModal(true);
    }
  }, [editingCategory]);

  const openNewModal = () => {
    setEditingCategory(null);
    setFormData({
      name_sk: '',
      name_cs: '',
      name_pl: '',
      image_url: '',
      link_url: '',
      is_active: true,
      sort_order: categories.length,
    });
    setActiveLanguage('sk');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({});
    setActiveLanguage('sk');
  };

  const handleSave = async () => {
    if (!formData.name_sk || !formData.link_url) {
      toast.error('Vyplňte názov a odkaz');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('homepage_categories')
          .update(formData)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Kategória bola aktualizovaná');
      } else {
        const { error } = await supabase.from('homepage_categories').insert(formData);
        if (error) throw error;
        toast.success('Kategória bola vytvorená');
      }
      closeModal();
      onUpdate();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Chyba pri ukladaní');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Naozaj chcete vymazať kategóriu "${name}"?`)) return;

    try {
      const { error } = await supabase.from('homepage_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Kategória bola vymazaná');
      onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Chyba pri mazaní');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `categories/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Obrázok nahratý');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahrávaní');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Spravujte kategórie zobrazené na homepage
        </p>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nová kategória
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative group bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name_sk}
                className="w-16 h-16 object-contain mx-auto mb-3"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Grid3X3 className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <h4 className="font-medium text-sm text-center text-gray-900 truncate">
              {cat.name_sk}
            </h4>
            <p className="text-xs text-gray-500 text-center truncate mt-1">{cat.link_url}</p>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => setEditingCategory(cat)}
                className="p-1.5 bg-white rounded text-gray-600 hover:text-blue-600 shadow-sm"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name_sk)}
                className="p-1.5 bg-white rounded text-gray-600 hover:text-red-600 shadow-sm"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {!cat.is_active && (
              <span className="absolute top-2 left-2 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                Skrytý
              </span>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Žiadne kategórie. Vytvorte prvú kategóriu.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Upraviť kategóriu' : 'Nová kategória'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                <div className="p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Názov {activeLanguage === 'sk' && '*'}
                    <span className="text-gray-400 font-normal ml-2">
                      ({LANGUAGES.find(l => l.code === activeLanguage)?.label})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={(formData[`name_${activeLanguage}` as keyof typeof formData] as string) || ''}
                    onChange={(e) => setFormData({ ...formData, [`name_${activeLanguage}`]: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="Smartfony"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Odkaz URL *</label>
                <input
                  type="text"
                  value={formData.link_url || ''}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                  placeholder="/category/smartfony"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obrázok</label>
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
                      alt=""
                      className="w-full h-32 object-contain bg-gray-100 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-lg"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, image_url: null })}
                        className="p-2 bg-white rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-500">Nahrať obrázok</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Aktívna kategória</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCategory ? 'Uložiť zmeny' : 'Vytvoriť'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BannersTab({
  banners,
  onUpdate,
}: {
  banners: Banner[];
  onUpdate: () => void;
}) {
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Banner>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingBanner) {
      setFormData(editingBanner);
      setShowModal(true);
    }
  }, [editingBanner]);

  const openNewModal = () => {
    setEditingBanner(null);
    setFormData({
      name: '',
      placement: 'homepage_hero',
      is_active: true,
      carousel_group: 'default',
      carousel_interval: 5000,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Zadajte názov bannera');
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
        toast.success('Banner bol aktualizovaný');
      } else {
        const { error } = await supabase.from('banners').insert(formData);
        if (error) throw error;
        toast.success('Banner bol vytvorený');
      }
      closeModal();
      onUpdate();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Chyba pri ukladaní');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Naozaj chcete vymazať banner "${name}"?`)) return;

    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Banner bol vymazaný');
      onUpdate();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Chyba pri mazaní');
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

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Obrázok nahratý');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahrávaní');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const placementOptions = [
    { value: 'homepage_hero', label: 'Homepage - Hero carousel' },
    { value: 'homepage_middle', label: 'Homepage - Stredná časť' },
    { value: 'category_top', label: 'Kategórie - Vrchný banner' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Spravujte reklamné bannery na stránke</p>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nový banner
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
                  {placementOptions.find((p) => p.value === banner.placement)?.label ||
                    banner.placement}
                </p>
                {banner.carousel_group && (
                  <p className="text-xs text-blue-600">Carousel: {banner.carousel_group}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  banner.is_active ? 'bg-blue-50 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {banner.is_active ? 'Aktívny' : 'Neaktívny'}
              </span>
              <button
                onClick={() => setEditingBanner(banner)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
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
            Žiadne bannery. Vytvorte prvý banner kliknutím na tlačidlo vyššie.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBanner ? 'Upraviť banner' : 'Nový banner'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Názov bannera *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                  placeholder="napr. Vianočná akcia 2026"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Umiestnenie</label>
                <div className="relative">
                  <select
                    value={formData.placement || 'homepage_hero'}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm"
                  >
                    {placementOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carousel skupina
                  </label>
                  <input
                    type="text"
                    value={formData.carousel_group || ''}
                    onChange={(e) => setFormData({ ...formData, carousel_group: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="default"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interval (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.carousel_interval || 5000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carousel_interval: parseInt(e.target.value) || 5000,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obrázok bannera
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
                      alt=""
                      className="w-full h-40 object-cover bg-gray-100 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-lg"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, image_url: null })}
                        className="p-2 bg-white rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Nahrať obrázok</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Aktívny banner</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingBanner ? 'Uložiť zmeny' : 'Vytvoriť banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionsTab({
  sections,
  onUpdate,
}: {
  sections: HomepageSection[];
  onUpdate: () => void;
}) {
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
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
          is_active: formData.is_active,
        })
        .eq('id', editingSection.id);

      if (error) throw error;
      toast.success('Sekcia bola uložená');
      setEditingSection(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Chyba pri ukladaní');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cms/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Obrázok nahratý');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahrávaní');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero sekcia (hlavný banner)',
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
              Upraviť: {getSectionLabel(editingSection.section_key)}
            </h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nadpis</label>
              <input
                type="text"
                value={formData.title_sk || ''}
                onChange={(e) => setFormData({ ...formData, title_sk: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Podnadpis</label>
              <input
                type="text"
                value={formData.subtitle_sk || ''}
                onChange={(e) => setFormData({ ...formData, subtitle_sk: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
              <input
                type="text"
                value={formData.badge_text || ''}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
              <textarea
                rows={3}
                value={formData.description_sk || ''}
                onChange={(e) => setFormData({ ...formData, description_sk: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Odkaz URL</label>
                <input
                  type="text"
                  value={formData.link_url || ''}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text tlačidla
                </label>
                <input
                  type="text"
                  value={formData.link_text || ''}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Aktívna sekcia</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Obrázok</label>
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
                  alt=""
                  className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white rounded-lg"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, image_url: null })}
                    className="p-2 bg-white rounded-lg text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-48 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50/50"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Nahrať obrázok</span>
                  </>
                )}
              </button>
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
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Uložiť zmeny
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Vyberte sekciu na úpravu obsahu</p>

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
                <p className="text-sm text-gray-500">{section.title_sk || 'Bez nadpisu'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  section.is_active ? 'bg-blue-50 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {section.is_active ? 'Aktívna' : 'Neaktívna'}
              </span>
              <button
                onClick={() => setEditingSection(section)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-500">Žiadne sekcie na úpravu</div>
        )}
      </div>
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
    { value: 'all', label: 'Všetky' },
    { value: 'banners', label: 'Bannery' },
    { value: 'cms', label: 'Obsah' },
    { value: 'products', label: 'Produkty' },
    { value: 'general', label: 'Ostatné' },
  ];

  const filteredMedia =
    selectedFolder === 'all' ? mediaItems : mediaItems.filter((m) => m.folder === selectedFolder);

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

        const {
          data: { publicUrl },
        } = supabase.storage.from('images').getPublicUrl(fileName);

        await supabase.from('media_library').insert({
          filename: file.name,
          storage_path: fileName,
          url: publicUrl,
          mime_type: file.type,
          file_size: file.size,
          folder: 'general',
        });
      }
      toast.success('Súbory boli nahraté');
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba pri nahrávaní');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Vymazať "${item.filename}"?`)) return;

    try {
      await supabase.storage.from('images').remove([item.storage_path]);
      await supabase.from('media_library').delete().eq('id', item.id);
      toast.success('Súbor bol vymazaný');
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Chyba pri mazaní');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL skopírovaná do schránky');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">Knižnica všetkých obrázkov a súborov</p>
          <div className="relative">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {folders.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Nahrať súbory
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
                  title="Kopírovať URL"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 bg-white rounded text-red-600 hover:bg-red-50"
                  title="Vymazať"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Žiadne súbory v tejto zložke
          </div>
        )}
      </div>
    </div>
  );
}
