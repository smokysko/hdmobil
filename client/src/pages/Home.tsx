import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products } from "@/../../shared/data";
import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const featuredProducts = products.filter(p => p.isNew || p.rating >= 4.8).slice(0, 4);
  const saleProducts = products.filter(p => p.isSale || p.price < 500).slice(0, 4);

  return (
    <Layout>
      {/* Compact Hero Section - E-commerce Focus */}
      <section className="relative overflow-hidden bg-secondary/10 py-12">
        <div className="container relative z-10">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Text Content - Direct & Sales Focused (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1 text-sm rounded-full">NOVÁ KOLEKCIA 2024</Badge>
              
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Všetko pre váš <br />
                <span className="text-primary">mobilný svet.</span>
              </h1>
              
              <p className="max-w-lg text-lg text-muted-foreground">
                Najnovšie smartfóny, tablety a príslušenstvo skladom. Objednajte do 15:00 a tovar máte zajtra doma.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" className="font-bold h-12 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link href="/category/smartphones">Kúpiť Smartfón</Link>
                </Button>
                <Button size="lg" variant="outline" className="font-bold h-12 px-8 rounded-lg border-2 hover:bg-secondary/50" asChild>
                  <Link href="/category/spare-parts">Náhradné diely</Link>
                </Button>
              </div>
            </div>
            
            {/* Image Content - Compact & Clean (5 cols) */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                <img
                  src="/images/hero_nordic_transparent.png"
                  alt="Premium Smartphone Ecosystem"
                  className="relative z-10 w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories - Instant Navigation */}
      <section className="py-10 border-b border-border/40">
        <div className="container">
          <h2 className="text-xl font-bold mb-6">Nakupovať podľa kategórie</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Smartfóny", href: "/category/smartphones", image: "/images/categories/cat_smartphone.png" },
              { name: "Tablety", href: "/category/tablets", image: "/images/categories/cat_tablet.png" },
              { name: "Notebooky", href: "/category/laptops", image: "/images/categories/cat_laptop.png" },
              { name: "Audio", href: "/category/audio", image: "/images/categories/cat_audio.png" },
              { name: "Príslušenstvo", href: "/category/accessories", image: "/images/categories/cat_accessories.png" },
              { name: "Náhradné diely", href: "/category/spare-parts", image: "/images/categories/cat_parts.png" },
            ].map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer group h-full">
                  <div className="w-16 h-16 mb-3 relative flex items-center justify-center">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="font-medium text-sm text-center group-hover:text-primary transition-colors">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals - Compact Bar */}
      <section className="bg-secondary/20 py-4 border-b border-border/40">
        <div className="container">
          <div className="flex flex-wrap justify-center md:justify-between gap-4 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span>Doprava zdarma nad 500 €</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Autorizovaný predajca</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Expresné doručenie do 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Vybrané <span className="text-primary">Novinky</span>
              </h2>
              <p className="mt-2 text-muted-foreground">To najnovšie a najlepšie z mobilných technológií.</p>
            </div>
            <Button variant="ghost" className="hidden md:flex group" asChild>
              <Link href="/category/all">
                Zobraziť všetko <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/category/all">Zobraziť všetky produkty</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-10">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-secondary/30 px-6 py-16 md:px-12 lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <Badge className="mb-6 bg-primary text-primary-foreground font-display tracking-wide px-4 py-1.5 rounded-full text-sm">ČASOVO OBMEDZENÁ PONUKA</Badge>
              <h2 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl mb-6 leading-tight">
                VYLEPŠITE SVOJ <br />
                <span className="text-primary italic">DIGITÁLNY ŽIVOT</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                Získajte zľavu až 20% na vybrané prémiové balíčky. Zahŕňa predĺženú záruku a prioritnú podporu.
              </p>
              <Button size="lg" className="font-display tracking-wide h-14 px-10 rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/category/all">PRESKÚMAŤ PONUKY</Link>
              </Button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-10 lg:opacity-100 lg:translate-x-0 pointer-events-none">
              <div className="h-[500px] w-[500px] rounded-full bg-white blur-[80px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Trending / Sale */}
      <section className="py-20 bg-secondary/5">
        <div className="container">
          <div className="mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Práve <span className="text-primary">Letí</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Najlepšie hodnotené produkty obľúbené našou komunitou.</p>
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
