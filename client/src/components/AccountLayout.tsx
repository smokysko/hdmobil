import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Package, User, Heart, Star, Settings } from 'lucide-react';
import { Link } from 'wouter';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { user, isAuthenticated, loading: isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/prihlasenie');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Používateľ';
  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    { href: '/moj-ucet', icon: User, label: 'Prehľad' },
    { href: '/moje-objednavky', icon: Package, label: 'Moje objednávky' },
    { href: '/oblubene', icon: Heart, label: 'Obľúbené' },
    { href: '/vernostny-program', icon: Star, label: 'Vernostný program' },
    { href: '/nastavenia-uctu', icon: Settings, label: 'Nastavenia' },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  {userInitial}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{userName}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                  const active = location === href;
                  return (
                    <Link key={href} href={href}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}
