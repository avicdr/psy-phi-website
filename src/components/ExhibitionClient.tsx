"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { OpeningSequence } from "@/components/OpeningSequence";
import { CustomCursor } from "@/components/CustomCursor";
import { Navigation } from "@/components/Navigation";
import { HeroInstallation } from "@/components/HeroInstallation";
import { LedTicker } from "@/components/LedTicker";
import { DropTheClass } from "@/components/DropTheClass";
import { FittingRoom } from "@/components/FittingRoom";
import { BrandManifesto } from "@/components/BrandManifesto";
import { TheBoard } from "@/components/TheBoard";
import { Footer } from "@/components/Footer";
import { GarmentInspectorModal } from "@/components/GarmentInspectorModal";
import { ShoppingBagDrawer } from "@/components/ShoppingBagDrawer";
import { useCart } from "@/lib/cart-context";
import { useSmoothScroll } from "@/lib/lenis-provider";

const TRACKED_SECTIONS = [
  "hero",
  "drop-the-class",
  "fitting-room",
  "why-psy-phi",
  "observations",
  "the-board",
];

export function ExhibitionClient() {
  const [introReplayKey, setIntroReplayKey] = useState(0);
  const [forceIntro, setForceIntro] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const [fittingSlug, setFittingSlug] = useState("bambai-jersey");
  const [fittingColorwayId, setFittingColorwayId] = useState<
    string | undefined
  >(undefined);

  const [inspectSlug, setInspectSlug] = useState<string | null>(null);
  const [inspectColorwayId, setInspectColorwayId] = useState<
    string | undefined
  >(undefined);

  const { lastAddedNote } = useCart();
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { threshold: [0.15, 0.35, 0.6], rootMargin: "-64px 0px -25% 0px" }
    );

    TRACKED_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleInspectGarment = useCallback(
    (slug: string, colorwayId?: string) => {
      setInspectSlug(slug);
      setInspectColorwayId(colorwayId);
    },
    []
  );

  const handleOpenFittingRoom = useCallback(
    (slug: string, colorwayId?: string) => {
      setFittingSlug(slug);
      setFittingColorwayId(colorwayId);
      scrollTo("#fitting-room");
    },
    [scrollTo]
  );

  const handleReplayIntro = useCallback(() => {
    setForceIntro(true);
    setIntroReplayKey((k) => k + 1);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setForceIntro(false);
  }, []);

  return (
    <>
      {/* Subtle analog film grain across dark surfaces */}
      <div aria-hidden="true" className="film-grain-overlay" />

      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#B23A2E] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-[#EDE7D9]"
      >
        Skip to exhibition content
      </a>

      <CustomCursor />

      <OpeningSequence
        key={introReplayKey}
        forceOpen={forceIntro}
        onComplete={handleIntroComplete}
      />

      <Navigation
        activeSection={activeSection}
        onReplayIntro={handleReplayIntro}
      />

      <main id="main-content" className="relative z-10 w-full">
        <HeroInstallation onInspectGarment={handleInspectGarment} />
        <LedTicker />
        <DropTheClass
          onInspectGarment={handleInspectGarment}
          onOpenFittingRoom={handleOpenFittingRoom}
        />
        <FittingRoom
          selectedSlug={fittingSlug}
          selectedColorwayId={fittingColorwayId}
          onSelectPiece={(slug, colorwayId) => {
            setFittingSlug(slug);
            setFittingColorwayId(colorwayId);
          }}
          onInspectGarment={handleInspectGarment}
        />
        <BrandManifesto onInspectGarment={handleInspectGarment} />
        <TheBoard />
      </main>

      <Footer onReplayIntro={handleReplayIntro} />

      <GarmentInspectorModal
        slug={inspectSlug}
        initialColorwayId={inspectColorwayId}
        onClose={() => setInspectSlug(null)}
      />

      <ShoppingBagDrawer />

      {/* Toast Feedback */}
      <AnimatePresence>
        {lastAddedNote && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-20 right-4 z-[92] border border-[#EDE7D9]/35 bg-[#090807]/95 px-4 py-2.5 font-mono text-xs text-[#EDE7D9] shadow-xl backdrop-blur-sm sm:right-8"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 bg-[#B23A2E]" />
            {lastAddedNote}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
