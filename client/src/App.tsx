import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
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
import CustomerLogin from "./pages/auth/login";
import CustomerRegister from "./pages/auth/register";
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
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/settings" component={AdminSettings} />
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
