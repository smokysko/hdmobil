import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products } from "@/../../shared/data";
import { ArrowRight, ShieldCheck, Truck, Zap, CheckCircle2, RotateCcw, Headphones, Star } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const featuredProducts = products.filter(p => p.isNew || p.rating >= 4.8).slice(0, 4);
  const saleProducts = products.filter(p => p.isSale || p.price < 500).slice(0, 4);

  return (
    <Layout>
      {/* Tech Hero Section - Product Focused */}
      <section className="relative bg-background overflow-hidden border-b border-border">
        <div className="container relative z-10 py-8 lg:py-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content - Specs & CTA (5 cols) */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Star className="w-3 h-3 fill-primary" />
                Vlajková loď 2026
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                iPhone 17 Pro <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Titanium</span>
              </h1>
              
              <div className="flex flex-col gap-3 text-sm text-muted-foreground border-l-2 border-primary/30 pl-4 my-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Čip A19 Bionic s Neural Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>200MPx Fusion Camera System</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Ultra-odolné titánové telo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Výdrž batérie až 35 hodín</span>
                </div>
              </div>

              <div className="flex items-end gap-4 mb-4">
                <div className="text-3xl font-bold text-foreground">1 299 €</div>
                <div className="text-lg text-muted-foreground line-through mb-1">1 399 €</div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-12 px-8 font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" asChild>
                  <Link href="/product/1">Kúpiť teraz</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 font-medium border-2" asChild>
                  <Link href="/category/smartphones">Všetky smartfóny</Link>
                </Button>
              </div>
            </div>
            
            {/* Right Content - Hero Image (7 cols) */}
            <div className="lg:col-span-7 relative flex justify-center items-center order-1 lg:order-2 min-h-[300px] lg:min-h-[500px]">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-60 transform scale-75"></div>
              
              <div className="relative z-10 w-full max-w-[600px] aspect-square flex items-center justify-center">
                <img
                  src="/images/hero_iphone17_v1.png"
                  alt="iPhone 17 Pro Titanium"
                  className="w-full h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Spec Cards */}
                <div className="absolute top-10 right-10 bg-card/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-border hidden md:block animate-in fade-in zoom-in duration-700 delay-300">
                  <div className="text-xs text-muted-foreground uppercase font-bold">Procesor</div>
                  <div className="font-bold text-foreground">A19 Bionic</div>
                </div>
                
                <div className="absolute bottom-20 left-10 bg-card/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-border hidden md:block animate-in fade-in zoom-in duration-700 delay-500">
                  <div className="text-xs text-muted-foreground uppercase font-bold">Kamera</div>
                  <div className="font-bold text-foreground">200 MPx</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar - High Visibility */}
      <section className="bg-foreground text-background py-6 border-b border-border/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">Doprava do 24h</div>
                <div className="text-xs text-muted-foreground">Pri objednávke do 15:00</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">Autorizovaný predajca</div>
                <div className="text-xs text-muted-foreground">100% originálne produkty</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">Vrátenie do 14 dní</div>
                <div className="text-xs text-muted-foreground">Bez udania dôvodu</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">Odborná podpora</div>
                <div className="text-xs text-muted-foreground">Po-Pia 8:00 - 17:00</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories - Grid Layout */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Populárne kategórie</h2>
            <Link href="/category/all" className="text-sm font-medium text-primary hover:underline">Zobraziť všetky</Link>
          </div>
          
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
                <div className="group relative flex flex-col items-center justify-between p-4 h-40 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 relative z-10 flex items-center justify-center mt-2">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="relative z-10 font-bold text-sm text-center mt-2 group-hover:text-primary transition-colors">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Grid */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Najnovšie v ponuke
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Čerstvo naskladnené novinky</p>
            </div>
            <Button variant="outline" size="sm" className="hidden md:flex font-bold" asChild>
              <Link href="/category/all">
                Všetky produkty <ArrowRight className="ml-2 h-4 w-4" />
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
              <Link href="/category/all">Zobraziť všetky produkty</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promo Banner - Tech Style */}
      <section className="py-12">
        <div className="container">
          <div className="relative overflow-hidden rounded-xl bg-foreground text-background px-6 py-12 md:px-12 lg:py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <Badge className="mb-4 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-sm">VÝPREDAJ</Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Upgrade pre vašu <br />
                  <span className="text-primary">domácu kanceláriu</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Zvýšte svoju produktivitu s našou ponukou monitorov, dokovacích staníc a príslušenstva. Teraz so zľavou až 30%.
                </p>
                <Button size="lg" className="font-bold rounded-md" asChild>
                  <Link href="/category/laptops">Pozrieť ponuku</Link>
                </Button>
              </div>
              <div className="relative h-64 md:h-full min-h-[200px] flex items-center justify-center">
                 {/* Abstract tech shapes */}
                 <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl opacity-30"></div>
                 <img 
                    src="/images/categories/cat_laptop.png" 
                    alt="Laptop Setup" 
                    className="relative z-10 w-full max-w-sm object-contain drop-shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                 />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-background border-t border-border">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Najpredávanejšie
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Obľúbené produkty našich zákazníkov</p>
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
