'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Product, Size } from '@/lib/types';

interface CartItem {
  product: Product;
  size: Size;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, size: Size) => void;
  removeFromCart: (productId: string, size: Size) => void;
  updateQuantity: (product: Product, size: Size, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'leenas-cart';

// ⏱ 2-day TTL in ms
const CART_TTL_MS = 2 * 24 * 60 * 60 * 1000;

type StoredCart =
  | CartItem[] // old format (backward compat)
  | {
      items: CartItem[];
      savedAt: number;
    };

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage with 2-day expiry
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed: StoredCart = JSON.parse(stored);

      // Old format: just an array of items
      if (Array.isArray(parsed)) {
        setItems(parsed);
        return;
      }

      // New format: { items, savedAt }
      if (
        parsed &&
        Array.isArray(parsed.items) &&
        typeof parsed.savedAt === 'number'
      ) {
        const age = Date.now() - parsed.savedAt;
        if (age <= CART_TTL_MS) {
          setItems(parsed.items);
        } else {
          // expired
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  // Save to localStorage with timestamp
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      items,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [items]);

  const addToCart = (product: Product, size: Size) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.product.id === product.id && i.size === size
      );
      if (existing) {
        return prev.map(i =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, size: Size) => {
    setItems(prev =>
      prev.filter(i => !(i.product.id === productId && i.size === size))
    );
  };

  const updateQuantity = (product: Product, size: Size, quantity: number) => {
    const safeQty =
      Number.isFinite(quantity) && !Number.isNaN(quantity)
        ? Math.max(0, Math.floor(quantity))
        : 0;

    setItems(prev => {
      // If 0 or less → remove this line
      if (safeQty <= 0) {
        return prev.filter(
          i => !(i.product.id === product.id && i.size === size)
        );
      }

      const existing = prev.find(
        i => i.product.id === product.id && i.size === size
      );

      // If not in cart yet → create it with that quantity
      if (!existing) {
        return [...prev, { product, size, quantity: safeQty }];
      }

      // Otherwise update the quantity
      return prev.map(i =>
        i === existing ? { ...i, quantity: safeQty } : i
      );
    });
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
