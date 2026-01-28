import { Product } from "@/lib/products";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    originalPrice: number | null;
    image: string;
    inStock: boolean;
    category: string;
    categorySlug: string;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  productIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => void;
  wishlistCount: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "hdmobil_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, session } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [localProductIds, setLocalProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        setLocalProductIds(parsed);
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localProductIds));
    }
  }, [localProductIds, isAuthenticated]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) return;

    setIsLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/wishlist/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (result.success) {
        setItems(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  const productIds = isAuthenticated
    ? items.map((item) => item.productId)
    : localProductIds;

  const isInWishlist = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const addToWishlist = useCallback(
    async (product: Product) => {
      if (isInWishlist(product.id)) return;

      if (!isAuthenticated) {
        setLocalProductIds((prev) => [...prev, product.id]);
        toast.success("Produkt bol pridaný do obľúbených");
        return;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/wishlist/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ productId: product.id }),
        });

        const result = await response.json();
        if (result.success) {
          toast.success("Produkt bol pridaný do obľúbených");
          fetchWishlist();
        } else {
          toast.error(result.error || "Nepodarilo sa pridať do obľúbených");
        }
      } catch (error) {
        toast.error("Nepodarilo sa pridať do obľúbených");
      }
    },
    [isAuthenticated, isInWishlist, session?.access_token, fetchWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        setLocalProductIds((prev) => prev.filter((id) => id !== productId));
        toast.info("Produkt bol odstránený z obľúbených");
        return;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/wishlist/remove`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ productId }),
        });

        const result = await response.json();
        if (result.success) {
          toast.info("Produkt bol odstránený z obľúbených");
          fetchWishlist();
        } else {
          toast.error(result.error || "Nepodarilo sa odstrániť z obľúbených");
        }
      } catch (error) {
        toast.error("Nepodarilo sa odstrániť z obľúbených");
      }
    },
    [isAuthenticated, session?.access_token, fetchWishlist]
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    setLocalProductIds([]);
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  }, []);

  const wishlistCount = productIds.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        productIds,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
