"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { NAV_ITEMS, BRAND } from "@/lib/tokens";
import { GARMENTS, formatINR } from "@/lib/garments";
import { useCart } from "@/lib/cart-context";
import { useSmoothScroll } from "@/lib/lenis-provider";

interface NavigationProps {
  activeSection: string;
  onReplayIntro: () => void;
}

export function Navigation({ activeSection, onReplayIntro }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { totalCount, openBag } = useCart();
  const { scrollTo, setLocked } = useSmoothScroll();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setLocked(menuOpen);
    return () => setLocked(false);
  }, [menuOpen, setLocked]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleNavigate = (sectionId: string) => {
    setMenuOpen(false);
    window.setTimeout(() => {
      scrollTo(`#${sectionId}`);
    }, 120);
  };

  const activeNav =
    NAV_ITEMS.find((n) => n.id === activeSection) ?? NAV_ITEMS[0];

  const previewGarment =
    GARMENTS[
      Math.max(
        0,
        NAV_ITEMS.findIndex((n) => n.id === hoveredId) % GARMENTS.length
      )
    ];

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-[#EDE7D9]/15 bg-[#090807]/88 backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-[#090807]/80 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between px-6 sm:px-10">
          {/* Left: Menu Trigger + Active Room */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="psyphi-full-menu"
              data-cursor="explore"
              className="tactile-btn inline-flex min-h-[38px] items-center gap-2.5 border border-white/15 bg-[#11100f]/80 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#F4EFE4] backdrop-blur-md transition-colors hover:border-[#F4EFE4] hover:bg-[#F4EFE4] hover:text-[#060605]"
            >
              <span className="flex w-3.5 flex-col gap-1" aria-hidden="true">
                <span className="block h-[1.5px] w-full bg-current" />
                <span className="block h-[1.5px] w-2/3 bg-current" />
              </span>
              <span>Menu</span>
            </button>

            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[#B0A99D] md:inline-block">
              {activeNav.index} {"//"} {activeNav.label}
            </span>
          </div>

          {/* Center: Brand Mark */}
          <button
            type="button"
            onClick={() => scrollTo("#hero")}
            data-cursor="explore"
            className="group inline-flex items-center gap-2.5 text-[#F4EFE4] focus-visible:outline-2"
            aria-label="PSY PHI — Return to Exhibition Entrance"
          >
            <span className="font-display text-lg font-bold tracking-tight text-[#C83E2E] transition-transform duration-200 group-hover:scale-105">
              {BRAND.symbol}
            </span>
            <span className="font-display text-sm font-bold tracking-[0.22em] uppercase sm:text-base">
              {BRAND.name}
            </span>
          </button>

          {/* Right: Quick Studio Jump + Bag */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => scrollTo("#fitting-room")}
              data-cursor="inspect"
              className="hidden border border-white/12 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F4EFE4]/85 transition-colors hover:border-[#C83E2E] hover:text-[#F4EFE4] lg:inline-flex"
            >
              Fitting Room
            </button>

            <button
              type="button"
              onClick={openBag}
              aria-label={`Open shopping bag (${totalCount} items)`}
              data-cursor="add"
              className="tactile-btn inline-flex min-h-[38px] items-center gap-2 border border-white/15 bg-[#11100f]/85 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F4EFE4] backdrop-blur-md transition-colors hover:border-[#C83E2E] hover:bg-[#C83E2E]"
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Bag</span>
              <span className="inline-flex min-w-[20px] items-center justify-center bg-[#C83E2E] px-1 py-0.5 text-[10px] font-semibold text-[#F4EFE4]">
                {totalCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Exhibition Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="psyphi-full-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site Navigation"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{
              clipPath: "inset(0% 0% 0% 0%)",
              transition: { duration: 0.56, ease: [0.32, 0.72, 0, 1] },
            }}
            exit={{
              clipPath: "inset(0% 0% 100% 0%)",
              transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
            }}
            className="fixed inset-0 z-[80] overflow-y-auto bg-[#090807] text-[#EDE7D9]"
          >
            <div className="architectural-grid mx-auto flex min-h-screen max-w-[1440px] flex-col justify-between px-6 py-6 sm:px-10 sm:py-8">
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-[#EDE7D9]/15 pb-5">
                <div className="flex items-center gap-3">
                  <span className="font-heavy text-xl text-[#B23A2E]">
                    {BRAND.symbol}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#948E82]">
                    EXHIBITION INDEX — DROP 01
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  data-cursor="explore"
                  className="tactile-btn inline-flex min-h-[44px] items-center gap-2 border border-[#EDE7D9]/30 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[#EDE7D9] hover:border-[#B23A2E] hover:bg-[#B23A2E]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span>Close</span>
                </button>
              </div>

              {/* Main Navigation Links & Right Preview */}
              <div className="my-auto grid grid-cols-1 gap-10 py-10 lg:grid-cols-12 lg:items-center">
                <nav aria-label="Primary Exhibition Navigation" className="lg:col-span-7">
                  <ul className="space-y-2 sm:space-y-3">
                    {NAV_ITEMS.map((item, idx) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.42,
                          delay: 0.08 + idx * 0.045,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      >
                        <button
                          type="button"
                          onMouseEnter={() => setHoveredId(item.id)}
                          onFocus={() => setHoveredId(item.id)}
                          onClick={() => handleNavigate(item.id)}
                          data-cursor="explore"
                          className="group flex w-full items-baseline justify-between gap-4 border-b border-[#EDE7D9]/10 py-2.5 text-left transition-colors hover:border-[#B23A2E]"
                        >
                          <div className="flex min-w-0 items-baseline gap-4 sm:gap-5">
                            <span className="shrink-0 font-mono text-xs text-[#B23A2E]">
                              {item.index}
                            </span>
                            <span className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#EDE7D9] transition-transform duration-300 group-hover:translate-x-2 sm:text-3xl xl:text-4xl">
                              {item.label}
                            </span>
                          </div>
                          <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[#948E82] group-hover:text-[#EDE7D9] sm:inline-block">
                            {item.subtitle}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                    <motion.li
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.42,
                        delay: 0.08 + NAV_ITEMS.length * 0.045,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          openBag();
                        }}
                        data-cursor="add"
                        className="group flex w-full items-baseline justify-between gap-4 border-b border-[#EDE7D9]/10 py-2.5 text-left transition-colors hover:border-[#B23A2E]"
                      >
                        <div className="flex min-w-0 items-baseline gap-4 sm:gap-5">
                          <span className="shrink-0 font-mono text-xs text-[#B23A2E]">
                            06
                          </span>
                          <span className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#EDE7D9] transition-transform duration-300 group-hover:translate-x-2 sm:text-3xl xl:text-4xl">
                            Shopping Bag ({totalCount})
                          </span>
                        </div>
                        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[#948E82] sm:inline-block">
                          Shopify Direct Checkout
                        </span>
                      </button>
                    </motion.li>
                  </ul>
                </nav>

                {/* Right Editorial Card */}
                <div className="hidden lg:col-span-5 lg:block">
                  <div className="border border-[#EDE7D9]/15 bg-[#131210] p-4">
                    <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#948E82]">
                      <span>EXHIBITION SPECIMEN {previewGarment.number}</span>
                      <span className="text-[#B23A2E]">
                        FOUNDING 100 · {formatINR(previewGarment.foundingPrice)}
                      </span>
                    </div>
                    <div className="relative h-[52vh] max-h-[460px] w-full overflow-hidden border border-[#EDE7D9]/10 bg-[#090807]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewGarment.colorways[0].frontImage}
                        alt={previewGarment.title}
                        className="h-full w-full object-cover transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#090807] via-[#090807]/70 to-transparent p-4">
                        <p className="font-display text-lg font-bold uppercase tracking-tight text-[#EDE7D9]">
                          {previewGarment.shortTitle}
                        </p>
                        <p className="font-mono text-[11px] text-[#948E82]">
                          {previewGarment.garmentType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EDE7D9]/15 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#948E82]">
                <div className="flex flex-wrap items-center gap-6">
                  <span>{BRAND.shippingNote}</span>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="text-[#EDE7D9] underline-offset-4 hover:text-[#B23A2E] hover:underline"
                  >
                    {BRAND.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onReplayIntro();
                  }}
                  className="text-[#EDE7D9]/70 transition-colors hover:text-[#B23A2E]"
                >
                  Replay Opening Film
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
