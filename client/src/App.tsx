import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { I18nProvider } from "./i18n";
import { lazy, Suspense } from "react";
import Home from "@/pages/Home";
import Cart from "./pages/Cart";
import Category from "./pages/Category";
import Checkout from "./pages/Checkout";
import BannerExport from "@/pages/BannerExport";
import ProductDetail from "./pages/ProductDetail";
import Success from "./pages/Success";
import CustomerLogin from "./pages/auth/login";
import CustomerRegister from "./pages/auth/register";
import AccountPage from "./pages/account/index";
import OrdersPage from "./pages/account/orders";
import Search from "./pages/Search";
import Wishlist from "./pages/Wishlist";
import Unsubscribe from "./pages/Unsubscribe";

const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const AdminLogin = lazy(() => import("./pages/admin/login"));
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/products"));
const AdminOrders = lazy(() => import("./pages/admin/orders"));
const AdminSettings = lazy(() => import("./pages/admin/settings"));
const AdminCustomers = lazy(() => import("./pages/admin/customers"));
const AdminInvoices = lazy(() => import("./pages/admin/invoices"));
const AdminCMS = lazy(() => import("./pages/admin/cms"));
const AdminDiscounts = lazy(() => import("./pages/admin/discounts"));
const AdminMarketing = lazy(() => import("./pages/admin/marketing"));
const AdminReviews = lazy(() => import("./pages/admin/reviews"));

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
      <RouteErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/banner-export" component={BannerExport} />
        <Route path="/category/:id" component={Category} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/success" component={Success} />
        <Route path="/vyhladavanie" component={Search} />
        <Route path="/oblubene" component={Wishlist} />
        <Route path="/unsubscribe" component={Unsubscribe} />
        <Route path="/odhlasit-newsletter" component={Unsubscribe} />
        <Route path="/auth/login" component={CustomerLogin} />
        <Route path="/auth/register" component={CustomerRegister} />
        <Route path="/prihlasenie" component={CustomerLogin} />
        <Route path="/registracia" component={CustomerRegister} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/moj-ucet" component={AccountPage} />
        <Route path="/moje-objednavky" component={OrdersPage} />
        <Route path="/admin">{() => { window.location.href = '/admin/login'; return null; }}</Route>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/invoices" component={AdminInvoices} />
        <Route path="/admin/cms" component={AdminCMS} />
        <Route path="/admin/discounts" component={AdminDiscounts} />
        <Route path="/admin/marketing" component={AdminMarketing} />
        <Route path="/admin/reviews" component={AdminReviews} />
        <Route component={NotFound} />
      </Switch>
      </RouteErrorBoundary>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
            <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
            </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
