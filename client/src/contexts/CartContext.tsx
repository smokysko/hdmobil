import { Product } from "@/../../shared/data";
import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface CartItem extends Product {
  quantity: number;
  cart_item_id?: string; // Supabase cart item ID
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'hdmobil_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load cart from localStorage on mount
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
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Sync cart with Supabase when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      syncCartWithSupabase();
    }
  }, [isAuthenticated, user]);

  const syncCartWithSupabase = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // First, get the user's cart from Supabase
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('customer_id', user.id)
        .single();

      let cartId = cartData?.id;

      // If no cart exists, create one
      if (!cartId) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ customer_id: user.id })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating cart:', createError);
          return;
        }
        cartId = newCart?.id;
      }

      if (!cartId) return;

      // Get existing cart items from Supabase
      const { data: existingItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId);

      if (itemsError) {
        console.error('Error fetching cart items:', itemsError);
        return;
      }

      // Merge local cart with Supabase cart
      const localItems = [...items];
      const mergedItems: CartItem[] = [];

      // Add existing Supabase items
      if (existingItems) {
        for (const item of existingItems) {
          const localItem = localItems.find(li => li.id === item.product_id);
          if (localItem) {
            // Item exists in both - use higher quantity
            mergedItems.push({
              ...localItem,
              quantity: Math.max(item.quantity, localItem.quantity),
              cart_item_id: item.id,
            });
            // Remove from local items to track what's left
            const idx = localItems.findIndex(li => li.id === item.product_id);
            if (idx > -1) localItems.splice(idx, 1);
          } else {
            // Item only in Supabase - we'd need product data
            // For now, skip items that don't have local data
          }
        }
      }

      // Add remaining local items to Supabase
      for (const localItem of localItems) {
        const { data: newItem, error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: localItem.id,
            quantity: localItem.quantity,
            price: localItem.salePrice || localItem.price,
          })
          .select('id')
          .single();

        if (!insertError && newItem) {
          mergedItems.push({
            ...localItem,
            cart_item_id: newItem.id,
          });
        }
      }

      setItems(mergedItems);
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = useCallback(async (product: Product) => {
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
      toast.success(`Pridané do košíka: ${product.name}`);
      return [...prev, { ...product, quantity: 1 }];
    });

    // Sync with Supabase if logged in
    if (isAuthenticated && user) {
      try {
        const { data: cartData } = await supabase
          .from('carts')
          .select('id')
          .eq('customer_id', user.id)
          .single();

        if (cartData?.id) {
          // Check if item exists
          const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cartData.id)
            .eq('product_id', product.id)
            .single();

          if (existingItem) {
            // Update quantity
            await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + 1 })
              .eq('id', existingItem.id);
          } else {
            // Insert new item
            await supabase
              .from('cart_items')
              .insert({
                cart_id: cartData.id,
                product_id: product.id,
                quantity: 1,
                price: product.salePrice || product.price,
              });
          }
        }
      } catch (error) {
        console.error('Error syncing add to cart:', error);
      }
    }
  }, [isAuthenticated, user]);

  const removeFromCart = useCallback(async (productId: number) => {
    const item = items.find(i => i.id === productId);
    
    setItems((prev) => prev.filter((item) => item.id !== productId));
    toast.info("Položka odstránená z košíka");

    // Sync with Supabase if logged in
    if (isAuthenticated && user && item?.cart_item_id) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('id', item.cart_item_id);
      } catch (error) {
        console.error('Error syncing remove from cart:', error);
      }
    }
  }, [isAuthenticated, user, items]);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const item = items.find(i => i.id === productId);
    
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );

    // Sync with Supabase if logged in
    if (isAuthenticated && user && item?.cart_item_id) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', item.cart_item_id);
      } catch (error) {
        console.error('Error syncing quantity update:', error);
      }
    }
  }, [isAuthenticated, user, items, removeFromCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);

    // Clear Supabase cart if logged in
    if (isAuthenticated && user) {
      try {
        const { data: cartData } = await supabase
          .from('carts')
          .select('id')
          .eq('customer_id', user.id)
          .single();

        if (cartData?.id) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cartData.id);
        }
      } catch (error) {
        console.error('Error clearing Supabase cart:', error);
      }
    }
  }, [isAuthenticated, user]);

  const cartTotal = items.reduce(
    (total, item) => total + (item.salePrice || item.price) * item.quantity,
    0
  );

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

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
