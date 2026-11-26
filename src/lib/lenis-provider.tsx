"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollContextValue {
  scrollTo: (target: string | number) => void;
  setLocked: (locked: boolean) => void;
}

const ScrollContext = createContext<ScrollContextValue>({
  scrollTo: () => {},
  setLocked: () => {},
});

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = (target: string | number) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -64, duration: 1.2 });
      return;
    }
    if (typeof target === "string") {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  const setLocked = (locked: boolean) => {
    if (lenisRef.current) {
      if (locked) lenisRef.current.stop();
      else lenisRef.current.start();
    }
    document.documentElement.style.overflow = locked ? "hidden" : "";
  };

  return (
    <ScrollContext.Provider value={{ scrollTo, setLocked }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(ScrollContext);
}
