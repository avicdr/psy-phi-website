"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GARMENTS,
  GarmentSize,
  getShopifyCheckoutUrl,
  getVariantId,
} from "@/lib/garments";

export interface BagItem {
  key: string; // garmentSlug:colorwayId:size
  garmentSlug: string;
  title: string;
  shortTitle: string;
  garmentType: string;
  colorwayId: string;
  colorwayName: string;
  size: GarmentSize;
  unitPrice: number;
  releasePrice: number;
  quantity: number;
  image: string;
  variantId: number;
  shopifyProductUrl: string;
}

interface CartContextValue {
  items: BagItem[];
  isOpen: boolean;
  totalCount: number;
  subtotal: number;
  checkoutUrl: string;
  lastAddedNote: string | null;
  openBag: () => void;
  closeBag: () => void;
  toggleBag: () => void;
  addItem: (params: {
    garmentSlug: string;
    colorwayId: string;
    size: GarmentSize;
    quantity?: number;
  }) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearBag: () => void;
}

const STORAGE_KEY = "psyphi_exhibition_bag_v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lastAddedNote, setLastAddedNote] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch {
        // Ignore storage parsing errors
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items, hydrated]);

  const openBag = useCallback(() => setIsOpen(true), []);
  const closeBag = useCallback(() => setIsOpen(false), []);
  const toggleBag = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(
    ({
      garmentSlug,
      colorwayId,
      size,
      quantity = 1,
    }: {
      garmentSlug: string;
      colorwayId: string;
      size: GarmentSize;
      quantity?: number;
    }) => {
      const garment = GARMENTS.find((g) => g.slug === garmentSlug);
      if (!garment) return;

      const colorway =
        garment.colorways.find((c) => c.id === colorwayId) ??
        garment.colorways[0];
      const variantId = getVariantId(garment, colorway.id, size);
      if (!variantId) return;

      const key = `${garment.slug}:${colorway.id}:${size}`;
      setItems((prev) => {
        const existing = prev.find((item) => item.key === key);
        if (existing) {
          return prev.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
              : item
          );
        }
        return [
          ...prev,
          {
            key,
            garmentSlug: garment.slug,
            title: garment.title,
            shortTitle: garment.shortTitle,
            garmentType: garment.garmentType,
            colorwayId: colorway.id,
            colorwayName: colorway.name,
            size,
            unitPrice: garment.foundingPrice,
            releasePrice: garment.releasePrice,
            quantity,
            image: colorway.frontImage,
            variantId,
            shopifyProductUrl: garment.shopifyProductUrl,
          },
        ];
      });

      setLastAddedNote(
        `${garment.shortTitle} · ${colorway.name} · ${size} added to bag`
      );
      setIsOpen(true);
    },
    []
  );

  useEffect(() => {
    if (!lastAddedNote) return;
    const t = window.setTimeout(() => setLastAddedNote(null), 3200);
    return () => window.clearTimeout(t);
  }, [lastAddedNote]);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.min(10, Math.max(1, quantity)) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const clearBag = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const checkoutUrl = useMemo(
    () =>
      getShopifyCheckoutUrl(
        items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      ),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      totalCount,
      subtotal,
      checkoutUrl,
      lastAddedNote,
      openBag,
      closeBag,
      toggleBag,
      addItem,
      updateQuantity,
      removeItem,
      clearBag,
    }),
    [
      items,
      isOpen,
      totalCount,
      subtotal,
      checkoutUrl,
      lastAddedNote,
      openBag,
      closeBag,
      toggleBag,
      addItem,
      updateQuantity,
      removeItem,
      clearBag,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
