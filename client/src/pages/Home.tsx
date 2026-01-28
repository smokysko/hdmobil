import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import HeroCarousel, { HeroSlide } from '@/components/HeroCarousel';
import { Button } from '@/components/ui/button';
import { getProducts, Product } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { useI18n, Language } from '@/i18n';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones, Zap, Monitor, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useRef, useState, useMemo } from 'react';

interface HomepageSection {
  id: string;
  section_key: string;
  title_sk: string | null;
  title_cs: string | null;
  title_pl: string | null;
  subtitle_sk: string | null;
  subtitle_cs: string | null;
  subtitle_pl: string | null;
  description_sk: string | null;
  description_cs: string | null;
  description_pl: string | null;
  badge_text_sk: string | null;
  badge_text_cs: string | null;
  badge_text_pl: string | null;
  link_text_sk: string | null;
  link_text_cs: string | null;
  link_text_pl: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
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

function getLocalizedText(
  item: Record<string, unknown>,
  field: string,
  lang: Language,
  fallback: string = ''
): string {
  const langField = `${field}_${lang}`;
  const skField = `${field}_sk`;
  const baseField = field;
  return (item[langField] as string) || (item[skField] as string) || (item[baseField] as string) || fallback;
}

interface ContentBlock {
  id: string;
  block_key: string;
  content: Record<string, unknown>;
}

interface TrustBarItem {
  icon: string;
  title: string;
  description: string;
}

const TRUST_BAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState<string>('auto');
  const { t, language } = useI18n();

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<HomepageCategory[]>([]);
  const [promoSection, setPromoSection] = useState<HomepageSection | null>(null);
  const [trustBarItems, setTrustBarItems] = useState<TrustBarItem[]>([]);

  const DEFAULT_TRUST_BAR = useMemo<TrustBarItem[]>(() => [
    { icon: 'Truck', title: t.home.delivery24h, description: t.home.orderBefore },
    { icon: 'ShieldCheck', title: t.home.authorizedSeller, description: t.home.originalProducts },
    { icon: 'RotateCcw', title: t.home.return14days, description: t.home.noReason },
    { icon: 'Headphones', title: t.home.expertSupport, description: t.home.workingHours },
  ], [t]);

  const DEFAULT_PROMO = useMemo(() => ({
    badge_text: t.home.tipForYou,
    title: t.home.productivityTitle,
    description: t.home.productivityDesc,
    image_url: '/images/categories/cat_laptop.png',
    link_url: '/category/notebooky',
    link_text: t.home.browseCollection,
  }), [t]);

  const PROMO_FEATURES = useMemo(() => [
    { icon: Zap, text: t.home.fastDelivery },
    { icon: Monitor, text: t.home.wideSelection },
    { icon: ShieldCheck, text: t.home.warrantyUp },
  ], [t]);

  const DEFAULT_CATEGORIES = useMemo(() => [
    { name: t.header.smartphones, href: '/category/smartfony', image: '/images/categories/cat_smartphone.png' },
    { name: t.header.tablets, href: '/category/tablety', image: '/images/categories/cat_tablet.png' },
    { name: t.header.laptops, href: '/category/notebooky', image: '/images/categories/cat_laptop.png' },
    { name: t.header.audio, href: '/category/audio', image: '/images/categories/cat_audio.png' },
    { name: t.header.accessories, href: '/category/prislusenstvo', image: '/images/categories/cat_accessories.png' },
    { name: t.header.spareParts, href: '/category/nahradne-diely', image: '/images/categories/cat_parts.png' },
  ], [t]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      const [featured, all, slidesRes, categoriesRes, sectionsRes, blocksRes] = await Promise.all([
        getProducts({ featured: true, limit: 4 }),
        getProducts({ limit: 8 }),
        supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('homepage_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase.from('homepage_sections').select('*').eq('is_active', true),
        supabase.from('content_blocks').select('*').eq('is_active', true),
      ]);

      setFeaturedProducts(featured.length > 0 ? featured : all.slice(0, 4));

      const sale = all.filter((p) => p.isSale);
      setSaleProducts(sale.length > 0 ? sale.slice(0, 4) : all.slice(0, 4));

      if (slidesRes.data && slidesRes.data.length > 0) {
        setHeroSlides(slidesRes.data);
      }

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setHomepageCategories(categoriesRes.data);
      }

      if (sectionsRes.data) {
        const promo = sectionsRes.data.find((s) => s.section_key === 'promo_banner');
        if (promo) setPromoSection(promo);
      }

      if (blocksRes.data) {
        const trustBar = blocksRes.data.find((b) => b.block_key === 'trust_bar');
        if (trustBar?.content?.items) {
          setTrustBarItems(trustBar.content.items as TrustBarItem[]);
        }
      }

      setIsLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    const calculateHeight = () => {
      const topBar = document.querySelector('.bg-foreground.text-background.py-2');
      const mainHeader = document.querySelector('header.sticky');

      const topBarHeight = topBar?.getBoundingClientRect().height || 32;
      const mainHeaderHeight = mainHeader?.getBoundingClientRect().height || 130;

      const totalHeaderHeight = topBarHeight + mainHeaderHeight;
      const viewportHeight = window.innerHeight;

      const wrapperHeight = viewportHeight - totalHeaderHeight;
      setHeroHeight(`${wrapperHeight}px`);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    const timeout = setTimeout(calculateHeight, 100);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      clearTimeout(timeout);
    };
  }, []);

  const trustItems = DEFAULT_TRUST_BAR;

  const promo = useMemo(() => {
    if (!promoSection) return DEFAULT_PROMO;
    return {
      badge_text: getLocalizedText(promoSection as unknown as Record<string, unknown>, 'badge_text', language, DEFAULT_PROMO.badge_text),
      title: getLocalizedText(promoSection as unknown as Record<string, unknown>, 'title', language, DEFAULT_PROMO.title),
      description: getLocalizedText(promoSection as unknown as Record<string, unknown>, 'description', language, DEFAULT_PROMO.description),
      image_url: promoSection.image_url || DEFAULT_PROMO.image_url,
      link_url: promoSection.link_url || DEFAULT_PROMO.link_url,
      link_text: getLocalizedText(promoSection as unknown as Record<string, unknown>, 'link_text', language, DEFAULT_PROMO.link_text),
    };
  }, [promoSection, language, DEFAULT_PROMO]);

  const categories = useMemo(() => {
    if (homepageCategories.length === 0) return DEFAULT_CATEGORIES;
    return homepageCategories.map((cat) => ({
      name: getLocalizedText(cat as unknown as Record<string, unknown>, 'name', language, cat.name_sk),
      href: cat.link_url,
      image: cat.image_url || '/images/categories/cat_smartphone.png',
    }));
  }, [homepageCategories, language, DEFAULT_CATEGORIES]);

  return (
    <Layout>
      <div ref={heroWrapperRef} className="flex flex-col" style={{ height: heroHeight }}>
        <section className="relative bg-background overflow-auto border-b border-border flex-1 min-h-0">
          {heroSlides.length > 0 ? (
            <HeroCarousel slides={heroSlides} autoRotateInterval={5000} height="100%" />
          ) : (
            <div className="container py-8 text-center text-muted-foreground">
              <p>{t.home.noHeroSlides}</p>
            </div>
          )}
        </section>

        <section className="bg-foreground text-background py-3 border-b border-border/10 shrink-0">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {trustItems.map((item, idx) => {
                const Icon = TRUST_BAR_ICONS[item.icon] || Truck;
                return (
                  <div key={idx} className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <section className="py-12 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">{t.home.popularCategories}</h2>
            <Link href="/category/all" className="text-sm font-medium text-primary hover:underline">
              {t.home.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <div className="group relative flex flex-col items-center justify-between p-4 h-40 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 relative z-10 flex items-center justify-center mt-2">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="relative z-10 font-bold text-sm text-center mt-2 group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {t.home.latestProducts}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t.home.freshlyStocked}</p>
            </div>
            <Button variant="outline" size="sm" className="hidden md:flex font-bold" asChild>
              <Link href="/category/all">
                {t.home.allProducts} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center md:hidden">
            <Button variant="outline" className="w-full font-bold" asChild>
              <Link href="/category/all">{t.home.viewAllProducts}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-12 md:px-12 lg:px-16 lg:py-16">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute top-10 left-10 w-2 h-2 bg-primary/30 rounded-full"></div>
                <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-16 left-1/4 w-1 h-1 bg-primary/40 rounded-full"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>{promo.badge_text}</span>
                </div>

                <div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                    {promo.title}
                  </h2>
                  <p className="text-slate-400 mt-4 text-base md:text-lg max-w-md leading-relaxed">
                    {promo.description}
                  </p>
                </div>

                <div className="space-y-3 py-2">
                  {PROMO_FEATURES.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button size="lg" className="font-semibold rounded-lg group" asChild>
                    <Link href={promo.link_url}>
                      {promo.link_text}
                      <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Link
                    href="/category/all"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {t.home.allProducts}
                  </Link>
                </div>
              </div>

              <div className="relative h-72 md:h-96 lg:h-[28rem] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-blue-500/10 rounded-full blur-3xl opacity-40 scale-90"></div>
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="relative z-10 w-full max-w-xl object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background border-t border-border">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t.home.bestSellers}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t.home.customerFavorites}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
