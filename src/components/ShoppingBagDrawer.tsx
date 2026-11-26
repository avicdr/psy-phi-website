"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/garments";
import { BRAND } from "@/lib/tokens";
import { useSmoothScroll } from "@/lib/lenis-provider";

export function ShoppingBagDrawer() {
  const {
    items,
    isOpen,
    totalCount,
    subtotal,
    checkoutUrl,
    closeBag,
    updateQuantity,
    removeItem,
    clearBag,
  } = useCart();
  const { setLocked } = useSmoothScroll();

  useEffect(() => {
    setLocked(isOpen);
    return () => setLocked(false);
  }, [isOpen, setLocked]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBag();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeBag]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={closeBag}
            className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Bag"
            initial={{ x: "100%" }}
            animate={{
              x: 0,
              transition: { duration: 0.42, ease: [0.32, 0.72, 0, 1] },
            }}
            exit={{
              x: "100%",
              transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
            }}
            className="fixed top-0 right-0 bottom-0 z-[90] flex w-full max-w-md flex-col border-l border-[#EDE7D9]/20 bg-[#0d0c0a] text-[#EDE7D9] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EDE7D9]/15 px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#B23A2E]">
                  PSY PHI // ACQUISITION BAG
                </p>
                <h2 className="mt-0.5 font-display text-xl font-extrabold uppercase">
                  BAG ({totalCount})
                </h2>
              </div>

              <button
                type="button"
                onClick={closeBag}
                aria-label="Close shopping bag"
                className="tactile-btn inline-flex h-10 w-10 items-center justify-center border border-[#EDE7D9]/25 text-[#EDE7D9] hover:border-[#B23A2E] hover:bg-[#B23A2E]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="font-heavy text-4xl text-[#B23A2E]">
                    {BRAND.symbol}
                  </span>
                  <p className="mt-4 font-display text-lg font-bold uppercase text-[#EDE7D9]">
                    Your bag is empty
                  </p>
                  <p className="mt-2 max-w-xs font-mono text-xs text-[#948E82]">
                    Explore Drop the Class or step into The Fitting Room to
                    examine and select a piece.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.key}
                      className="grid grid-cols-[84px_1fr] gap-4 border border-[#EDE7D9]/15 bg-[#141311] p-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-28 w-[84px] border border-[#EDE7D9]/15 object-cover"
                      />

                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-sm font-bold uppercase leading-snug text-[#EDE7D9]">
                              {item.shortTitle}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeItem(item.key)}
                              aria-label={`Remove ${item.shortTitle}`}
                              className="text-[#948E82] hover:text-[#B23A2E]"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#948E82]">
                            {item.colorwayName} · Size {item.size}
                          </p>
                          <p className="mt-1 font-mono text-xs text-[#EDE7D9]">
                            {formatINR(item.unitPrice)}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-[#EDE7D9]/25">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="flex h-8 w-8 items-center justify-center hover:bg-[#EDE7D9] hover:text-[#090807]"
                            >
                              <Minus className="h-3 w-3" aria-hidden="true" />
                            </button>
                            <span className="min-w-[28px] text-center font-mono text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                              className="flex h-8 w-8 items-center justify-center hover:bg-[#EDE7D9] hover:text-[#090807]"
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </div>

                          <span className="font-mono text-xs font-medium text-[#EDE7D9]">
                            {formatINR(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t border-[#EDE7D9]/15 bg-[#090807] px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#948E82]">
                    SUBTOTAL
                  </span>
                  <span className="font-mono text-xl font-semibold text-[#EDE7D9]">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-[#948E82]">
                  {BRAND.shippingNote} Founding 100 pricing applied. Checkout
                  processes directly via PSY PHI Shopify.
                </p>

                <div className="mt-4 flex flex-col gap-2.5">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="add"
                    className="tactile-btn inline-flex min-h-[48px] w-full items-center justify-center gap-2 border border-[#B23A2E] bg-[#B23A2E] px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#EDE7D9] hover:border-[#EDE7D9] hover:bg-[#EDE7D9] hover:text-[#090807]"
                  >
                    <span>Checkout on psyphi.art</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={clearBag}
                    className="py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#948E82] hover:text-[#EDE7D9]"
                  >
                    Clear Bag
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
