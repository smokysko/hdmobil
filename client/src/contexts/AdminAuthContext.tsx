import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await checkAdminRole(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        if (location.startsWith("/admin") && location !== "/admin/login") {
          navigate("/admin/login");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await checkAdminRole(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from("users")
        .select("is_admin, full_name")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
        if (authUser.email?.endsWith("@hdmobil.sk")) {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            full_name: null,
            role: "admin",
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
        email: authUser.email || "",
        full_name: profile.full_name,
        role: "admin",
      });
    } catch (error) {
      console.error("Error checking admin role:", error);
      setUser(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/admin/login");
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
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAdminAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Nacitavam...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
