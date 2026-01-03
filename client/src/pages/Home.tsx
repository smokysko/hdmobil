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
      {/* Hero Section - Nordic Air Style */}
      <section className="relative overflow-hidden bg-background py-24 md:py-36">
        {/* Organic Background Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse duration-[10000ms]" />
          <div className="absolute top-[60%] -left-[10%] h-[500px] w-[500px] rounded-full bg-secondary/40 blur-[100px]" />
        </div>

        <div className="container relative z-10">
          <div className="grid gap-16 lg:grid-cols-12 items-center">
            {/* Text Content - Asymmetric Layout (7 cols) */}
            <div className="lg:col-span-7 space-y-10">
              <div className="inline-flex items-center space-x-2">
                <span className="h-px w-8 bg-primary"></span>
                <span className="text-sm font-medium tracking-widest text-primary uppercase">Technológia budúcnosti</span>
              </div>
              
              <h1 className="font-display text-6xl font-medium leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl">
                Objavte <br />
                <span className="italic text-muted-foreground font-light">čistú</span> eleganciu.
              </h1>
              
              <p className="max-w-xl text-xl text-muted-foreground leading-relaxed font-light">
                Zažite vrchol mobilných technológií v dokonalej harmónii s dizajnom. Prémiové zariadenia, ktoré definujú váš životný štýl.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Button size="lg" className="font-display tracking-wide text-base h-16 px-12 rounded-full shadow-xl shadow-primary/10 hover:shadow-2xl hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/category/smartphones">Preskúmať kolekciu</Link>
                </Button>
                <Button size="lg" variant="ghost" className="font-display tracking-wide text-base h-16 px-8 rounded-full hover:bg-secondary/50 text-foreground group" asChild>
                  <Link href="/category/accessories">
                    Príslušenstvo <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Image Content - Floating Effect (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-[400px] lg:max-w-full aspect-[4/5] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-transparent rounded-[3rem] -rotate-6 scale-90 opacity-50" />
                <img
                  src="/images/hero_nordic.png"
                  alt="Premium Smartphone"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transition-transform duration-1000 hover:-translate-y-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y border-border/40 bg-secondary/5 py-12 backdrop-blur-sm">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Expresná doprava zdarma</h3>
                <p className="text-sm text-muted-foreground">Pri objednávkach nad 500 €</p>
              </div>
            </div>
            <div className="flex items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">2-ročná záruka</h3>
                <p className="text-sm text-muted-foreground">Komplexná ochrana</p>
              </div>
            </div>
            <div className="flex items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Technická podpora</h3>
                <p className="text-sm text-muted-foreground">24/7 Odborná pomoc</p>
              </div>
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
