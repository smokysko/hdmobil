import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { Menu, Search, ShoppingBag, Smartphone, X, Phone, Mail, User, Heart, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import SearchBar from "./SearchBar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import CollapsibleMenu from "./CollapsibleMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import UserProfileDropdown from "./UserProfileDropdown";
// import Logo from "./Logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const [location] = useLocation();

  const navItems = [
    {
      name: "Smartfóny",
      href: "/category/smartfony",
      subcategories: [
        { name: "Apple iPhone", href: "/category/smartfony?brand=apple" },
        { name: "Samsung Galaxy", href: "/category/smartfony?brand=samsung" },
        { name: "Xiaomi", href: "/category/smartfony?brand=xiaomi" },
        { name: "Google Pixel", href: "/category/smartfony?brand=google" },
        { name: "Odolné telefóny", href: "/category/smartfony?type=rugged" },
      ]
    },
    {
      name: "Tablety",
      href: "/category/tablety",
      subcategories: [
        { name: "iPad", href: "/category/tablety?brand=apple" },
        { name: "Android tablety", href: "/category/tablety?os=android" },
        { name: "Grafické tablety", href: "/category/tablety?type=graphic" },
      ]
    },
    {
      name: "Notebooky",
      href: "/category/notebooky",
      subcategories: [
        { name: "MacBook", href: "/category/notebooky?brand=apple" },
        { name: "Herné notebooky", href: "/category/notebooky?type=gaming" },
        { name: "Kancelárske", href: "/category/notebooky?type=office" },
        { name: "Ultrabooky", href: "/category/notebooky?type=ultrabook" },
      ]
    },
    {
      name: "Audio",
      href: "/category/audio",
      subcategories: [
        { name: "Bezdrôtové slúchadlá", href: "/category/audio?type=wireless" },
        { name: "Bluetooth reproduktory", href: "/category/audio?type=speakers" },
        { name: "Soundbary", href: "/category/audio?type=soundbar" },
      ]
    },
    {
      name: "Príslušenstvo",
      href: "/category/prislusenstvo",
      subcategories: [
        { name: "Puzdra a kryty", href: "/category/prislusenstvo?type=cases" },
        { name: "Ochranné sklá", href: "/category/prislusenstvo?type=glass" },
        { name: "Nabíjačky a káble", href: "/category/prislusenstvo?type=chargers" },
        { name: "Powerbanky", href: "/category/prislusenstvo?type=powerbanks" },
        { name: "Držiaky do auta", href: "/category/prislusenstvo?type=car-holders" }
      ]
    },
    {
      name: "Náhradné diely",
      href: "/category/nahradne-diely",
      subcategories: [
        { name: "Displeje", href: "/category/nahradne-diely?type=displays" },
        { name: "Batérie", href: "/category/nahradne-diely?type=batteries" },
        { name: "Konektory", href: "/category/nahradne-diely?type=connectors" },
        { name: "Kamery", href: "/category/nahradne-diely?type=cameras" },
      ]
    },
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
            <LanguageSwitcher />
            <UserProfileDropdown />
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
              <SheetContent side="left" className="w-[300px] border-r border-border bg-background overflow-y-auto">
                <div className="flex flex-col gap-8 py-8">
                  <Link href="/">
                    <div className="pl-2 pt-2 pb-4">
                      <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil Logo" className="h-10 w-auto object-contain" />
                    </div>
                  </Link>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <CollapsibleMenu key={item.href} item={item} />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer shrink-0 h-12 pl-2">
                <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil Logo" className="h-12 w-auto object-contain" />
              </div>
            </Link>

            {/* Central Search Bar - Prominent & Functional */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
              <SearchBar variant="desktop" />
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

          {/* Mega Menu - Desktop Only */}
          <div className="hidden lg:block mt-4 pt-1 border-t border-border/40">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuTrigger 
                      className={cn(
                        "bg-transparent hover:bg-secondary/50 text-sm font-bold uppercase tracking-wide h-10 px-4 rounded-md transition-colors",
                        location.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Link href={item.href}>{item.name}</Link>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.subcategories.map((sub) => (
                          <li key={sub.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={sub.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                              >
                                <div className="text-sm font-bold leading-none group-hover:text-primary flex items-center gap-2">
                                  {sub.name}
                                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                        <li className="col-span-2 mt-2 pt-2 border-t border-border/50">
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="flex items-center justify-center w-full p-2 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                            >
                              Zobraziť všetko z kategórie {item.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                
                {/* Special Links */}
                <NavigationMenuItem className="ml-auto">
                  <Link href="/category/akcia">
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-secondary/50 px-4 py-2 rounded-md text-sm font-bold text-primary uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      Výpredaj
                    </div>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/category/novinky">
                    <div className="cursor-pointer hover:bg-secondary/50 px-4 py-2 rounded-md text-sm font-bold text-primary uppercase tracking-wide">
                      Novinky
                    </div>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        
        {/* Mobile Search - Visible only on mobile below header */}
        <div className="md:hidden p-4 border-t border-border bg-background">
          <SearchBar variant="mobile" />
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
                <li><Link href="/category/smartfony"><span className="hover:text-primary cursor-pointer transition-colors">Smartfóny</span></Link></li>
                <li><Link href="/category/tablety"><span className="hover:text-primary cursor-pointer transition-colors">Tablety</span></Link></li>
                <li><Link href="/category/notebooky"><span className="hover:text-primary cursor-pointer transition-colors">Notebooky</span></Link></li>
                <li><Link href="/category/nahradne-diely"><span className="hover:text-primary cursor-pointer transition-colors">Náhradné diely</span></Link></li>
                <li><Link href="/category/akcia"><span className="hover:text-primary cursor-pointer transition-colors">Výpredaj</span></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-background">Zákaznícky servis</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary cursor-pointer transition-colors">Môj účet</a></li>
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
