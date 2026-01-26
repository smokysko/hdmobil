import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import HeroCarousel, { HeroSlide } from '@/components/HeroCarousel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProducts, Product } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useRef, useState } from 'react';

interface HomepageSection {
  id: string;
  section_key: string;
  title_sk: string | null;
  subtitle_sk: string | null;
  description_sk: string | null;
  badge_text: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
}

interface HomepageCategory {
  id: string;
  category_id: string | null;
  name_sk: string;
  image_url: string | null;
  link_url: string;
  is_active: boolean;
  sort_order: number;
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

const DEFAULT_PROMO = {
  badge_text: 'VYPREDAJ',
  title_sk: 'Upgrade pre vasu domacu kancelariu',
  description_sk:
    'Zvyste svoju produktivitu s nasou ponukou monitorov, dokovacich stanic a prislusenstva. Teraz so zlavou az 30%.',
  image_url: '/images/categories/cat_laptop.png',
  link_url: '/category/notebooky',
  link_text: 'Pozret ponuku',
};

const DEFAULT_TRUST_BAR: TrustBarItem[] = [
  { icon: 'Truck', title: 'Doprava do 24h', description: 'Pri objednavke do 15:00' },
  { icon: 'ShieldCheck', title: 'Autorizovany predajca', description: '100% originalne produkty' },
  { icon: 'RotateCcw', title: 'Vratenie do 14 dni', description: 'Bez udania dovodu' },
  { icon: 'Headphones', title: 'Odborna podpora', description: 'Po-Pia 8:00 - 17:00' },
];

const DEFAULT_CATEGORIES = [
  { name: 'Smartfony', href: '/category/smartfony', image: '/images/categories/cat_smartphone.png' },
  { name: 'Tablety', href: '/category/tablety', image: '/images/categories/cat_tablet.png' },
  { name: 'Notebooky', href: '/category/notebooky', image: '/images/categories/cat_laptop.png' },
  { name: 'Audio', href: '/category/audio', image: '/images/categories/cat_audio.png' },
  {
    name: 'Prislusenstvo',
    href: '/category/prislusenstvo',
    image: '/images/categories/cat_accessories.png',
  },
  {
    name: 'Nahradne diely',
    href: '/category/nahradne-diely',
    image: '/images/categories/cat_parts.png',
  },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState<string>('auto');

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<HomepageCategory[]>([]);
  const [promoSection, setPromoSection] = useState<HomepageSection | null>(null);
  const [trustBarItems, setTrustBarItems] = useState<TrustBarItem[]>(DEFAULT_TRUST_BAR);

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

  const promo = promoSection || DEFAULT_PROMO;

  const categories =
    homepageCategories.length > 0
      ? homepageCategories.map((cat) => ({
          name: cat.name_sk,
          href: cat.link_url,
          image: cat.image_url || '/images/categories/cat_smartphone.png',
        }))
      : DEFAULT_CATEGORIES;

  return (
    <Layout>
      <div ref={heroWrapperRef} className="flex flex-col" style={{ height: heroHeight }}>
        <section className="relative bg-background overflow-auto border-b border-border flex-1 min-h-0">
          {heroSlides.length > 0 ? (
            <HeroCarousel slides={heroSlides} autoRotateInterval={5000} height="100%" />
          ) : (
            <div className="container py-8 text-center text-muted-foreground">
              <p>Ziadne hero slidy</p>
            </div>
          )}
        </section>

        <section className="bg-foreground text-background py-3 border-b border-border/10 shrink-0">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {trustBarItems.map((item, idx) => {
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
            <h2 className="text-2xl font-bold tracking-tight">Popularne kategorie</h2>
            <Link href="/category/all" className="text-sm font-medium text-primary hover:underline">
              Zobrazit vsetky
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
                Najnovsie v ponuke
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Cerstvo naskladnene novinky</p>
            </div>
            <Button variant="outline" size="sm" className="hidden md:flex font-bold" asChild>
              <Link href="/category/all">
                Vsetky produkty <ArrowRight className="ml-2 h-4 w-4" />
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
              <Link href="/category/all">Zobrazit vsetky produkty</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="relative overflow-hidden rounded-xl bg-foreground text-background px-6 py-12 md:px-12 lg:py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <Badge className="mb-4 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-sm">
                  {promo.badge_text || DEFAULT_PROMO.badge_text}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  {(promo.title_sk || DEFAULT_PROMO.title_sk)?.split(' ').slice(0, 3).join(' ')}{' '}
                  <br />
                  <span className="text-primary">
                    {(promo.title_sk || DEFAULT_PROMO.title_sk)?.split(' ').slice(3).join(' ')}
                  </span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {promo.description_sk || DEFAULT_PROMO.description_sk}
                </p>
                <Button size="lg" className="font-bold rounded-md" asChild>
                  <Link href={promo.link_url || DEFAULT_PROMO.link_url}>
                    {promo.link_text || DEFAULT_PROMO.link_text}
                  </Link>
                </Button>
              </div>
              <div className="relative h-64 md:h-full min-h-[200px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl opacity-30"></div>
                <img
                  src={promo.image_url || DEFAULT_PROMO.image_url}
                  alt={promo.title_sk || DEFAULT_PROMO.title_sk || 'Promo'}
                  className="relative z-10 w-full max-w-sm object-contain drop-shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background border-t border-border">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Najpredavanejsie</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Oblubene produkty nasich zakaznikov
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
