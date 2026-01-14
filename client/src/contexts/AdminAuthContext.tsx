import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkAdminRole(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkAdminRole(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async (authUser: User) => {
    try {
      // Check admin_users table for is_admin field
      const { data: profile, error } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.warn('Could not fetch profile:', error.message);
        // Fallback: check if email ends with @hdmobil.sk
        if (authUser.email?.endsWith('@hdmobil.sk')) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            role: 'admin',
          });
        } else {
          setUser(null);
        }
        return;
      }

      if (!profile?.is_admin) {
        setUser(null);
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        role: 'admin',
      });
    } catch (error) {
      console.error('Error checking admin role:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { state: { from: location }, replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
