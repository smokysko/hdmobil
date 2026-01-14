import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Skip auth initialization if Supabase is not configured
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - auth disabled');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to get session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    try {
      // Check admin_users table for is_admin field
      const { data: profile, error } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.warn('Could not fetch profile:', error.message);
        // Fallback: check if email ends with @hdmobil.sk
        setIsAdmin(user.email?.endsWith('@hdmobil.sk') || false);
        return;
      }
      
      setIsAdmin(profile?.is_admin || false);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    // If signup successful, add user to app_users table
    if (data.user && !error) {
      try {
        await supabase.from('admin_users').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: metadata?.full_name || null,
          phone: metadata?.phone || null,
          is_admin: false,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (insertError) {
        console.warn('Could not add user to app_users table:', insertError);
      }
    }
    
    // Check if email confirmation is required
    const needsConfirmation = data.user && !data.session;
    
    return { error: error as Error | null, needsConfirmation };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!user;
  const logout = signOut;

  return (
    <AuthContext.Provider value={{ user, session, loading, isAuthenticated, signIn, signUp, signOut, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
