'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Product, ProductVariant } from '@/types/catalog';

export interface CartItem {
  key: string; // `${productId}__${variantId || 'default'}`
  productId: string;
  variantId?: string;
  variantNameUz?: string;
  variantNameRu?: string;
  colorHex?: string;
  product: Product;
  packsCount: number; // Wholesale quantities are ordered in packs (korobka/blok/paket)
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant | null, packsCount?: number) => void;
  removeItem: (key: string) => void;
  updatePacks: (key: string, delta: number) => void;
  setPacks: (key: string, packs: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, variantId?: string | null) => number;
  totalUniqueItems: number;
  totalPacksCount: number;
  totalUnitsCount: number;
  totalSum: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'ecatalog_cart_items_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, mounted]);

  const makeKey = (productId: string, variantId?: string | null) =>
    `${productId}__${variantId || 'default'}`;

  const addItem = (
    product: Product,
    variant?: ProductVariant | null,
    packsCount: number = 1
  ) => {
    const key = makeKey(product.id, variant?.id);
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.key === key);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newCount = updated[existingIdx].packsCount + packsCount;
        // Cap at stockPacks if in stock
        const maxStock = product.stockPacks > 0 ? product.stockPacks : 9999;
        updated[existingIdx].packsCount = Math.min(newCount, maxStock);
        return updated;
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          variantId: variant?.id,
          variantNameUz: variant?.nameUz,
          variantNameRu: variant?.nameRu,
          colorHex: variant?.colorHex,
          product,
          packsCount: Math.max(1, packsCount),
        },
      ];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updatePacks = (key: string, delta: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (!existing) return prev;
      const newCount = existing.packsCount + delta;
      if (newCount <= 0) {
        return prev.filter((i) => i.key !== key);
      }
      const maxStock = existing.product.stockPacks > 0 ? existing.product.stockPacks : 9999;
      return prev.map((i) =>
        i.key === key ? { ...i, packsCount: Math.min(newCount, maxStock) } : i
      );
    });
  };

  const setPacks = (key: string, packs: number) => {
    if (packs <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const maxStock = i.product.stockPacks > 0 ? i.product.stockPacks : 9999;
        return { ...i, packsCount: Math.min(packs, maxStock) };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string, variantId?: string | null) => {
    const key = makeKey(productId, variantId);
    const item = items.find((i) => i.key === key);
    if (item) return item.packsCount;
    // If no variant specified, sum all variants for this product
    if (!variantId) {
      return items
        .filter((i) => i.productId === productId)
        .reduce((sum, i) => sum + i.packsCount, 0);
    }
    return 0;
  };

  const totalUniqueItems = items.length;

  const totalPacksCount = useMemo(
    () => items.reduce((sum, i) => sum + i.packsCount, 0),
    [items]
  );

  const totalUnitsCount = useMemo(
    () => items.reduce((sum, i) => sum + i.packsCount * i.product.packQuantity, 0),
    [items]
  );

  const totalSum = useMemo(
    () => items.reduce((sum, i) => sum + i.packsCount * i.product.packPrice, 0),
    [items]
  );

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updatePacks,
        setPacks,
        clearCart,
        getItemQuantity,
        totalUniqueItems,
        totalPacksCount,
        totalUnitsCount,
        totalSum,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
