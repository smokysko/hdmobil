import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";

export type User = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const authHeader = opts.req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (supabaseUser && !error) {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("is_admin")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        const isAdmin = adminData?.is_admin || supabaseUser.email?.endsWith("@hdmobil.sk") || false;

        user = {
          id: supabaseUser.id,
          email: supabaseUser.email || null,
          role: isAdmin ? "admin" : "user",
        };
      }
    } catch (error) {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
