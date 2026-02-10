import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  avatar_url: string | null;
  discount_percentage: number;
  voucher_balance: number;
  loyalty_points: number;
  vip_level: string;
  referral_code: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { full_name?: string; phone?: string }
  ) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, email, full_name, phone, is_admin, avatar_url, discount_percentage, voucher_balance, loyalty_points, vip_level, referral_code"
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch user profile:", error.message);
        return null;
      }

      return data as UserProfile | null;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  };

  const checkAdminStatus = async (authUser: User | null) => {
    if (!authUser) {
      setIsAdmin(false);
      setProfile(null);
      return;
    }

    const userProfile = await fetchUserProfile(authUser.id);

    if (userProfile) {
      setProfile(userProfile);
      setIsAdmin(userProfile.is_admin);
    } else {
      setProfile(null);
      setIsAdmin(authUser.email?.endsWith("@hdmobil.sk") || false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await checkAdminStatus(user);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured - auth disabled");
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        await checkAdminStatus(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to get session:", error);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(true);
      (async () => {
        await checkAdminStatus(session?.user ?? null);
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; phone?: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    const needsConfirmation = data.user && !data.session ? true : undefined;

    return { error: error as Error | null, needsConfirmation };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  };

  const isAuthenticated = !!user;
  const logout = signOut;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        logout,
        isAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
