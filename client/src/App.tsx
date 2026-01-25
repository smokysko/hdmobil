import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { I18nProvider } from "./i18n";
import Cart from "./pages/Cart";
import Category from "./pages/Category";
import Checkout from "./pages/Checkout";
import Home from "@/pages/Home";
import BannerExport from "@/pages/BannerExport";
import ProductDetail from "./pages/ProductDetail";
import Success from "./pages/Success";
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/orders";
import AdminSettings from "./pages/admin/settings";
import AdminCustomers from "./pages/admin/customers";
import AdminInvoices from "./pages/admin/invoices";
import CustomerLogin from "./pages/auth/login";
import CustomerRegister from "./pages/auth/register";
import AccountPage from "./pages/account/index";
import OrdersPage from "./pages/account/orders";
import Preloader from "./components/Preloader";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/banner-export" component={BannerExport} />
      <Route path="/category/:id" component={Category} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/success" component={Success} />
      {/* Customer auth routes */}
      <Route path="/auth/login" component={CustomerLogin} />
      <Route path="/auth/register" component={CustomerRegister} />
      <Route path="/prihlasenie" component={CustomerLogin} />
      <Route path="/registracia" component={CustomerRegister} />
      {/* Account routes */}
      <Route path="/moj-ucet" component={AccountPage} />
      <Route path="/moje-objednavky" component={OrdersPage} />
      {/* Admin routes */}
      <Route path="/admin">{() => { window.location.href = '/admin/login'; return null; }}</Route>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/invoices" component={AdminInvoices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Critical images to preload
  const criticalImages = [
    "/images/logo_new.png",
    "/images/hero_iphone17_v1.png",
    "/images/categories/cat_smartphone.png",
    "/images/categories/cat_tablet.png",
    "/images/categories/cat_laptop.png",
    "/images/categories/cat_audio.png",
    "/images/categories/cat_accessories.png",
    "/images/categories/cat_parts.png"
  ];

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Preloader 
                images={criticalImages} 
                onComplete={() => setIsPreloaded(true)} 
              />
              <div className={`transition-opacity duration-500 ${isPreloaded ? 'opacity-100' : 'opacity-0'}`}>
                <Router />
              </div>
            </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
