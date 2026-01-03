import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary selection:text-primary-foreground">
      {/* Tech Noir Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-r border-border bg-background/95 backdrop-blur-xl">
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
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <div className="absolute inset-0 animate-pulse rounded bg-primary/20 blur-sm" />
                <div className="h-4 w-4 rounded-sm bg-primary" />
              </div>
              <span className="hidden font-display text-2xl font-bold tracking-wider md:inline-block">
                HD<span className="text-primary">MOBIL</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "text-sm font-medium uppercase tracking-widest transition-colors hover:text-primary cursor-pointer relative group",
                  location === item.href ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full",
                    location === item.href ? "w-full" : ""
                  )} />
                </span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <div className="absolute inset-x-0 top-0 z-50 flex h-16 items-center bg-background px-4 animate-in fade-in slide-in-from-top-2 md:static md:h-auto md:w-auto md:bg-transparent md:p-0">
                <div className="relative flex w-full items-center md:w-64">
                  <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Hľadať produkty..."
                    className="h-9 w-full rounded-none border-primary/50 bg-background pl-9 focus-visible:ring-1 focus-visible:ring-primary md:w-64"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 md:hidden"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-primary"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Hľadať</span>
              </Button>
            )}

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:text-primary">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px] animate-in zoom-in"
                  >
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Košík</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Tech Noir Footer */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <span className="font-display text-2xl font-bold tracking-wider">
                HD<span className="text-primary">MOBIL</span>
              </span>
              <p className="text-sm text-muted-foreground max-w-xs">
                Prémiová elektronika pre digitálnu dobu. Zažite budúcnosť technológií už dnes.
              </p>
            </div>
            
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground mb-4">Obchod</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/category/smartphones"><span className="hover:text-primary cursor-pointer transition-colors">Smartfóny</span></Link></li>
                <li><Link href="/category/tablets"><span className="hover:text-primary cursor-pointer transition-colors">Tablety</span></Link></li>
                <li><Link href="/category/laptops"><span className="hover:text-primary cursor-pointer transition-colors">Notebooky</span></Link></li>
                <li><Link href="/category/audio"><span className="hover:text-primary cursor-pointer transition-colors">Audio</span></Link></li>
                <li><Link href="/category/spare-parts"><span className="hover:text-primary cursor-pointer transition-colors">Náhradné diely</span></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground mb-4">Podpora</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Kontaktujte nás</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Časté otázky</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Doprava a vrátenie</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Záruka</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground mb-4">Novinky</h3>
              <div className="flex flex-col gap-2">
                <Input 
                  placeholder="Zadajte váš email" 
                  className="bg-background/50 border-primary/20 focus-visible:border-primary"
                />
                <Button className="w-full font-display tracking-wide">ODOBERAŤ</Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground">
            <p>&copy; 2024 HDmobil. Všetky práva vyhradené. Dizajnované s filozofiou Tech Noir.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
