import { Product } from "@/lib/products";
import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface CartItem extends Product {
  quantity: number;
  cart_item_id?: string;
}

export interface AppliedDiscount {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
  appliedDiscount: AppliedDiscount | null;
  discountAmount: number;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  isApplyingDiscount: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'hdmobil_cart';
const DISCOUNT_STORAGE_KEY = 'hdmobil_discount';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    const savedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (savedDiscount) {
      try {
        const parsedDiscount = JSON.parse(savedDiscount);
        setAppliedDiscount(parsedDiscount);
      } catch (e) {
        console.error('Failed to parse discount from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedDiscount) {
      localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(appliedDiscount));
    } else {
      localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    }
  }, [appliedDiscount]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success(`Množstvo aktualizované: ${product.name}`);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`Produkt bol pridaný do košíka: ${product.name}`);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
    toast.info("Položka odstránená z košíka");
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedDiscount(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(DISCOUNT_STORAGE_KEY);
  }, []);

  const cartTotal = items.reduce(
    (total, item) => total + (item.salePrice || item.price) * item.quantity,
    0
  );

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  const discountAmount = appliedDiscount
    ? appliedDiscount.discountType === "percentage"
      ? Math.round((cartTotal * appliedDiscount.value) / 100 * 100) / 100
      : Math.min(appliedDiscount.value, cartTotal)
    : 0;

  const applyDiscount = useCallback(async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      toast.error("Zadajte zlavovy kod");
      return false;
    }

    setIsApplyingDiscount(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const productIds = items.map((item) => item.id);
      const categoryIds = items.map((item) => item.categoryId).filter(Boolean);

      const response = await fetch(`${supabaseUrl}/functions/v1/orders/validate-discount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          code: code.trim(),
          cartTotal,
          productIds,
          categoryIds,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Neplatny zlavovy kod");
        return false;
      }

      setAppliedDiscount(result.data);
      toast.success(`Zlavovy kod "${result.data.code}" bol aplikovany`);
      return true;
    } catch (error) {
      toast.error("Nepodarilo sa overit zlavovy kod");
      return false;
    } finally {
      setIsApplyingDiscount(false);
    }
  }, [cartTotal, items]);

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null);
    toast.info("Zlavovy kod bol odstraneny");
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isLoading,
        appliedDiscount,
        discountAmount,
        applyDiscount,
        removeDiscount,
        isApplyingDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
