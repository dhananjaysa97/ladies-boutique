'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Product, Size } from '@/lib/types';

export interface CartItem {
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
const CART_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

interface StoredCartPayload {
  items: CartItem[];
  savedAt: number;
}

function loadInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredCartPayload | CartItem[];

    // backward compatibility if we ever stored just an array
    if (Array.isArray(parsed)) return parsed;

    if (!parsed.items || typeof parsed.savedAt !== 'number') return [];

    const age = Date.now() - parsed.savedAt;
    if (age > CART_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed.items;
  } catch (err) {
    console.error('Failed to read cart from localStorage', err);
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const initial = loadInitialCart();
    if (initial.length) {
      setItems(initial);
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload: StoredCartPayload = {
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
      prev.filter(
        i => !(i.product.id === productId && i.size === size)
      )
    );
  };

  const updateQuantity = (
    product: Product,
    size: Size,
    quantity: number
  ) => {
    const safeQty = Math.max(1, quantity || 1);
    setItems(prev =>
      prev.map(i =>
        i.product.id === product.id && i.size === size
          ? { ...i, quantity: safeQty }
          : i
      )
    );
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
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
