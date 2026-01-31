import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { Menu, ShoppingBag, Phone, Mail, Heart, ChevronRight } from "lucide-react";
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
} from "@/components/ui/navigation-menu";
import CollapsibleMenu from "./CollapsibleMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import UserProfileDropdown from "./UserProfileDropdown";
import NewsletterPopup from "./NewsletterPopup";
import NewsletterFooter from "./NewsletterFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [location] = useLocation();
  const { t } = useI18n();

  const navItems = [
    {
      name: t.header.smartphones,
      href: "/category/smartfony",
      subcategories: [
        { name: t.header.appleIphone, href: "/category/smartfony?brand=apple" },
        { name: t.header.samsungGalaxy, href: "/category/smartfony?brand=samsung" },
        { name: t.header.xiaomi, href: "/category/smartfony?brand=xiaomi" },
        { name: t.header.googlePixel, href: "/category/smartfony?brand=google" },
        { name: t.header.ruggedPhones, href: "/category/smartfony?type=rugged" },
      ]
    },
    {
      name: t.header.tablets,
      href: "/category/tablety",
      subcategories: [
        { name: t.header.ipad, href: "/category/tablety?brand=apple" },
        { name: t.header.androidTablets, href: "/category/tablety?os=android" },
        { name: t.header.graphicTablets, href: "/category/tablety?type=graphic" },
      ]
    },
    {
      name: t.header.laptops,
      href: "/category/notebooky",
      subcategories: [
        { name: t.header.macbook, href: "/category/notebooky?brand=apple" },
        { name: t.header.gamingLaptops, href: "/category/notebooky?type=gaming" },
        { name: t.header.officeLaptops, href: "/category/notebooky?type=office" },
        { name: t.header.ultrabooks, href: "/category/notebooky?type=ultrabook" },
      ]
    },
    {
      name: t.header.audio,
      href: "/category/audio",
      subcategories: [
        { name: t.header.wirelessHeadphones, href: "/category/audio?type=wireless" },
        { name: t.header.bluetoothSpeakers, href: "/category/audio?type=speakers" },
        { name: t.header.soundbars, href: "/category/audio?type=soundbar" },
      ]
    },
    {
      name: t.header.accessories,
      href: "/category/prislusenstvo",
      subcategories: [
        { name: t.header.casesCovers, href: "/category/prislusenstvo?type=cases" },
        { name: t.header.screenProtectors, href: "/category/prislusenstvo?type=glass" },
        { name: t.header.chargersAndCables, href: "/category/prislusenstvo?type=chargers" },
        { name: t.header.powerbanks, href: "/category/prislusenstvo?type=powerbanks" },
        { name: t.header.carHolders, href: "/category/prislusenstvo?type=car-holders" }
      ]
    },
    {
      name: t.header.spareParts,
      href: "/category/nahradne-diely",
      subcategories: [
        { name: t.header.displays, href: "/category/nahradne-diely?type=displays" },
        { name: t.header.batteries, href: "/category/nahradne-diely?type=batteries" },
        { name: t.header.connectors, href: "/category/nahradne-diely?type=connectors" },
        { name: t.header.cameras, href: "/category/nahradne-diely?type=cameras" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/30 selection:text-foreground">
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
            <a href="#" className="hover:text-primary transition-colors">{t.nav.trackOrder}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.nav.contact}</a>
            <LanguageSwitcher />
            <UserProfileDropdown />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
        <div className="container py-4">
          <div className="flex items-center gap-4 lg:gap-8">
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

            <Link href="/">
              <div className="flex items-center cursor-pointer shrink-0 h-12 pl-2">
                <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil Logo" className="h-12 w-auto object-contain" />
              </div>
            </Link>

            <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
              <SearchBar variant="desktop" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/oblubene">
                <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-primary relative">
                  <Heart className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full bg-red-500 p-0 text-[10px] font-bold text-white border-2 border-background"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                  <span className="sr-only">{t.nav.wishlist}</span>
                </Button>
              </Link>

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
                    <span className="text-muted-foreground">{t.nav.yourCart}</span>
                    <span className="font-bold text-sm">
                      {t.nav.goToCart}
                    </span>
                  </div>
                </Button>
              </Link>
            </div>
          </div>

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
                              {t.header.viewAllCategory} {item.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem className="ml-auto">
                  <Link href="/category/akcia">
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-secondary/50 px-4 py-2 rounded-md text-sm font-bold text-primary uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      {t.header.sale}
                    </div>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/category/novinky">
                    <div className="cursor-pointer hover:bg-secondary/50 px-4 py-2 rounded-md text-sm font-bold text-primary uppercase tracking-wide">
                      {t.header.newArrivals}
                    </div>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="md:hidden p-4 border-t border-border bg-background">
          <SearchBar variant="mobile" />
        </div>
      </header>

      <main className="flex-1 bg-secondary/10">
        {children}
      </main>

      <footer className="bg-foreground text-background pt-16 pb-8">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-background">
                  HD<span className="text-primary">MOBIL</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t.footer.shopDescription}
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                  <span className="font-bold text-xs">FB</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                  <span className="font-bold text-xs">IG</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-background">{t.footer.shopping}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/category/smartfony"><span className="hover:text-primary cursor-pointer transition-colors">{t.header.smartphones}</span></Link></li>
                <li><Link href="/category/tablety"><span className="hover:text-primary cursor-pointer transition-colors">{t.header.tablets}</span></Link></li>
                <li><Link href="/category/notebooky"><span className="hover:text-primary cursor-pointer transition-colors">{t.header.laptops}</span></Link></li>
                <li><Link href="/category/nahradne-diely"><span className="hover:text-primary cursor-pointer transition-colors">{t.header.spareParts}</span></Link></li>
                <li><Link href="/category/akcia"><span className="hover:text-primary cursor-pointer transition-colors">{t.header.sale}</span></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-background">{t.footer.customerService}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary cursor-pointer transition-colors">{t.footer.myAccount}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t.footer.orderStatus}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t.footer.returns}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t.footer.shipping}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t.footer.terms}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-background">{t.nav.contact}</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-background">+421 900 000 000</p>
                    <p className="text-xs">{t.home.workingHours}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <a href="mailto:info@hdmobil.sk" className="hover:text-primary transition-colors">info@hdmobil.sk</a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 text-primary shrink-0 flex items-center justify-center font-bold text-xs border border-primary rounded-full">?</div>
                  <a href="#" className="hover:text-primary transition-colors">{t.footer.onlineChat}</a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <NewsletterFooter />
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; 2026 HDmobil. {t.footer.allRightsReserved}.</p>
            <div className="flex gap-4">
              <span>{t.footer.privacy}</span>
              <span>{t.footer.cookies}</span>
            </div>
          </div>
        </div>
      </footer>

      <NewsletterPopup />
    </div>
  );
}
