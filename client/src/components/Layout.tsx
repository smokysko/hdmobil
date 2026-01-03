import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { Menu, Search, ShoppingBag, Smartphone, X, Phone, Mail, User, Heart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const [location] = useLocation();

  const navItems = [
    { name: "Smartfóny", href: "/category/smartphones" },
    { name: "Tablety", href: "/category/tablets" },
    { name: "Notebooky", href: "/category/laptops" },
    { name: "Audio", href: "/category/audio" },
    { name: "Príslušenstvo", href: "/category/accessories" },
    { name: "Náhradné diely", href: "/category/spare-parts" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/30 selection:text-foreground">
      {/* Top Bar - Tech E-shop Standard */}
      <div className="bg-foreground text-background py-2 text-xs font-medium">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+421900000000" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-3 w-3" />
              <span>+421 900 000 000</span>
            </a>
            <a href="mailto:info@hdmobil.sk" className="flex items-center gap-2 hover:text-primary transition-colors hidden sm:flex">
              <Mail className="h-3 w-3" />
              <span>info@hdmobil.sk</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Sledovať objednávku</a>
            <a href="#" className="hover:text-primary transition-colors">Kontakt</a>
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              <User className="h-3 w-3" />
              <span>Prihlásiť</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Tech Style */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
        <div className="container py-4">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] border-r border-border bg-background">
                <div className="flex flex-col gap-8 py-8">
                  <Link href="/">
                    <span className="font-display text-2xl font-bold tracking-wider text-primary cursor-pointer">
                      HD<span className="text-foreground">MOBIL</span>
                    </span>
                  </Link>
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <span className={cn(
                          "text-lg font-medium transition-colors hover:text-primary cursor-pointer",
                          location === item.href ? "text-primary" : "text-muted-foreground"
                        )}>
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer shrink-0 h-12">
                <img 
                  src="/images/logo_nordic.png" 
                  alt="HDmobil Logo" 
                  className="h-full w-auto object-contain max-h-12"
                />
              </div>
            </Link>

            {/* Central Search Bar - Prominent & Functional */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-auto relative">
              <div className="relative w-full flex">
                <Input
                  type="search"
                  placeholder="Čo hľadáte? (napr. iPhone 15, slúchadlá...)"
                  className="h-11 w-full rounded-l-md border-border bg-secondary/30 pl-4 pr-12 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
                />
                <Button className="h-11 rounded-l-none rounded-r-md px-6 font-bold tracking-wide">
                  <Search className="h-5 w-5 mr-2" />
                  Hľadať
                </Button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-primary">
                <Heart className="h-6 w-6" />
                <span className="sr-only">Obľúbené</span>
              </Button>
              
              <Link href="/cart">
                <Button variant="ghost" className="relative flex items-center gap-2 hover:bg-secondary/50 px-2 sm:px-4 h-11 rounded-md">
                  <div className="relative">
                    <ShoppingBag className="h-6 w-6" />
                    {cartCount > 0 && (
                      <Badge
                        variant="default"
                        className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full bg-primary p-0 text-[10px] font-bold text-primary-foreground border-2 border-background"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col items-start text-xs">
                    <span className="text-muted-foreground">Váš košík</span>
                    <span className="font-bold text-sm">
                      {/* Placeholder for total price if available in context, otherwise just text */}
                      Prejsť
                    </span>
                  </div>
                </Button>
              </Link>
            </div>
          </div>

          {/* Secondary Navigation - Desktop Only */}
          <nav className="hidden lg:flex items-center gap-8 mt-4 pt-4 border-t border-border/40">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "text-sm font-bold uppercase tracking-wide transition-all hover:text-primary cursor-pointer relative py-2",
                  location === item.href ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-4 text-sm font-medium text-primary">
              <Link href="/category/sale">
                <span className="flex items-center gap-1 cursor-pointer hover:underline">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Výpredaj
                </span>
              </Link>
              <Link href="/category/new">
                <span className="cursor-pointer hover:underline">Novinky</span>
              </Link>
            </div>
          </nav>
        </div>
        
        {/* Mobile Search - Visible only on mobile below header */}
        <div className="md:hidden p-4 border-t border-border bg-background">
          <div className="relative w-full flex">
            <Input
              type="search"
              placeholder="Hľadať produkty..."
              className="h-10 w-full rounded-l-md border-border bg-secondary/30 pl-4"
            />
            <Button size="icon" className="h-10 w-12 rounded-l-none rounded-r-md">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-secondary/10">
        {children}
      </main>

      {/* Footer - Tech Style */}
      <footer className="bg-foreground text-background pt-16 pb-8">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-background">
                  HD<span className="text-primary">MOBIL</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Váš špecialista na mobilnú elektroniku. Ponúkame najnovšie smartfóny, príslušenstvo a náhradné diely s expresným doručením.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Placeholders */}
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                  <span className="font-bold text-xs">FB</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                  <span className="font-bold text-xs">IG</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-background">Nakupovanie</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/category/smartphones"><span className="hover:text-primary cursor-pointer transition-colors">Smartfóny</span></Link></li>
                <li><Link href="/category/tablets"><span className="hover:text-primary cursor-pointer transition-colors">Tablety</span></Link></li>
                <li><Link href="/category/laptops"><span className="hover:text-primary cursor-pointer transition-colors">Notebooky</span></Link></li>
                <li><Link href="/category/spare-parts"><span className="hover:text-primary cursor-pointer transition-colors">Náhradné diely</span></Link></li>
                <li><Link href="/category/sale"><span className="hover:text-primary cursor-pointer transition-colors">Výpredaj</span></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-background">Zákaznícky servis</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Môj účet</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Stav objednávky</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Reklamácie a vrátenie</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Doprava a platba</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Obchodné podmienky</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-background">Kontakt</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-background">+421 900 000 000</p>
                    <p className="text-xs">Po-Pia: 8:00 - 17:00</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <a href="mailto:info@hdmobil.sk" className="hover:text-primary transition-colors">info@hdmobil.sk</a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 text-primary shrink-0 flex items-center justify-center font-bold text-xs border border-primary rounded-full">?</div>
                  <a href="#" className="hover:text-primary transition-colors">Online chat</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; 2026 HDmobil. Všetky práva vyhradené.</p>
            <div className="flex gap-4">
              <span>Ochrana súkromia</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
