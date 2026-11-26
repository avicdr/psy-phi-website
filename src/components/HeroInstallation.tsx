"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDownRight, Pause, Play, RotateCw, ZoomIn } from "lucide-react";
import { GARMENTS, GarmentSide, formatINR } from "@/lib/garments";
import { BRAND } from "@/lib/tokens";
import { MagneticButton, ScrambleText } from "@/components/MotionPrimitives";
import { useSmoothScroll } from "@/lib/lenis-provider";
import type { StudioViewMode } from "@/components/three/StudioStageCanvas";

const StudioStageCanvas = dynamic(
  () =>
    import("@/components/three/StudioStageCanvas").then(
      (mod) => mod.StudioStageCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-transparent">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B0A99D]">
          CALIBRATING STUDIO STAGE...
        </span>
      </div>
    ),
  }
);

interface HeroInstallationProps {
  onInspectGarment: (slug: string, colorwayId?: string) => void;
}

export function HeroInstallation({ onInspectGarment }: HeroInstallationProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [side, setSide] = useState<GarmentSide>("front");
  const [viewMode, setViewMode] = useState<StudioViewMode>("full");
  const [turntable, setTurntable] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(
        1,
        Math.max(0, window.scrollY / Math.max(1, window.innerHeight))
      );
      setScrollProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const garment = GARMENTS[activeIndex];
  const colorway = garment.colorways[0];

  const handleSelectStyle = (idx: number) => {
    setActiveIndex(idx);
    setSide("front");
    setViewMode("full");
  };

  const toggleFlip = () => {
    const next: GarmentSide = side === "front" ? "back" : "front";
    setSide(next);
    setViewMode(next);
  };

  const toggleZoom = () => {
    setViewMode((prev) => (prev === "detail" ? "full" : "detail"));
  };

  return (
    <section
      id="hero"
      aria-label="PSY PHI Interactive 3D Fashion Exhibition Hero"
      className="studio-spotlight-bg relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#060605] pt-20 pb-6 sm:pt-24 sm:pb-8"
    >
      {/* Subtle architectural documentary texture depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-luminosity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/garments/hero-camera-hands.jpg"
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060605] via-transparent to-[#060605]" />
      </div>

      {/* Top exhibition HUD row — sparse and airy */}
      <div className="relative z-30 mx-auto flex w-full max-w-[1380px] items-start justify-between px-6 sm:px-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#B0A99D]">
            <span className="h-1.5 w-1.5 bg-[#C83E2E]" />
            <span>
              COLLECTION 01 {"//"} {BRAND.collectionTitle}
            </span>
          </div>
          <p className="font-sans text-xs font-medium tracking-wide text-[#F4EFE4]/90">
            <span className="font-mono text-[10px] text-[#C83E2E]">
              {garment.number}/04
            </span>{" "}
            <span className="mx-1.5 text-white/25">—</span>
            <ScrambleText key={garment.slug} text={garment.shortTitle.toUpperCase()} />
          </p>
        </div>

        <div className="hidden text-right font-mono text-[10px] uppercase tracking-[0.22em] text-[#B0A99D] sm:block">
          <p className="text-[#F4EFE4]">
            FOUNDING 100 · {formatINR(garment.foundingPrice)}
          </p>
          <p className="mt-0.5 text-white/50">DRAG 360° TO ORBIT</p>
        </div>
      </div>

      {/* Spatial Typography + Interactive 3D Mannequin Stage */}
      <div className="relative mx-auto my-auto flex w-full max-w-[1380px] flex-1 flex-col items-center justify-center px-6 py-2 sm:px-10">
        {/* DEPTH LAYER 1 (BEHIND 3D MANNEQUIN): Controlled, unclipped editorial title */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-10 mb-1 flex w-full justify-center text-center sm:absolute sm:inset-x-0 sm:top-[7%] sm:mb-0"
        >
          <p className="font-display text-[clamp(2.1rem,5.4vw,5.15rem)] leading-[0.9] font-bold uppercase tracking-[-0.035em] text-[#F4EFE4]/92 select-none sm:whitespace-nowrap">
            CLOTHES GET READ
          </p>
        </div>

        {/* DEPTH LAYER 2 (CENTER): Interactive 360° 3D Mannequin */}
        <div className="relative z-20 h-[43vh] w-full sm:h-[58vh]">
          <StudioStageCanvas
            garment={garment}
            colorwayId={colorway.id}
            side={side}
            viewMode={viewMode}
            turntable={turntable}
            scrollProgress={scrollProgress}
            transparentBackground
            hideOverlayBadge
            onUserInteract={() => setTurntable(false)}
          />
        </div>

        {/* DEPTH LAYER 3 (FOREGROUND OVER PLINTH): Expressive Editorial Serif + Grotesk */}
        <div className="pointer-events-none relative z-30 -mt-5 flex w-full flex-col items-center text-center sm:absolute sm:inset-x-0 sm:bottom-[10%] sm:mt-0">
          <h1 className="sr-only">
            Clothes get read before you speak. PSY PHI — Drop the Class.
          </h1>
          <p
            aria-hidden="true"
            className="font-display text-[clamp(2.1rem,5.4vw,5.2rem)] leading-[0.9] font-bold uppercase tracking-[-0.03em] text-[#F4EFE4] drop-shadow-[0_14px_34px_rgba(6,6,5,0.98)] select-none sm:whitespace-nowrap"
          >
            <span className="mr-2 font-serif text-[1.16em] font-normal lowercase italic tracking-normal text-[#C83E2E]">
              before
            </span>
            YOU SPEAK.
          </p>
        </div>

        {/* Minimal Floating 3D Control Strip */}
        <div className="relative z-30 mt-4 inline-flex flex-wrap items-center justify-center divide-x divide-white/10 border border-white/15 bg-[#0e0d0c]/85 backdrop-blur-md">
          <button
            type="button"
            onClick={toggleFlip}
            data-cursor="flip"
            aria-label={`Orbit to ${side === "front" ? "back" : "front"} view`}
            className="tactile-btn inline-flex min-h-[36px] items-center gap-1.5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F4EFE4]/90 hover:bg-[#C83E2E] hover:text-[#F4EFE4]"
          >
            <RotateCw className="h-3 w-3" aria-hidden="true" />
            <span>{side === "front" ? "360° Back" : "360° Front"}</span>
          </button>

          <button
            type="button"
            onClick={() => setTurntable((prev) => !prev)}
            aria-pressed={turntable}
            data-cursor="rotate"
            className={`tactile-btn inline-flex min-h-[36px] items-center gap-1.5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
              turntable
                ? "bg-[#C83E2E] text-[#F4EFE4]"
                : "text-[#F4EFE4]/90 hover:bg-white/10"
            }`}
          >
            {turntable ? (
              <Pause className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Play className="h-3 w-3" aria-hidden="true" />
            )}
            <span>Spin</span>
          </button>

          <button
            type="button"
            onClick={toggleZoom}
            data-cursor="zoom"
            className={`tactile-btn inline-flex min-h-[36px] items-center gap-1.5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
              viewMode === "detail"
                ? "bg-[#F4EFE4] text-[#060605]"
                : "text-[#F4EFE4]/90 hover:bg-white/10"
            }`}
          >
            <ZoomIn className="h-3 w-3" aria-hidden="true" />
            <span>{viewMode === "detail" ? "Reset" : "Zoom"}</span>
          </button>

          <button
            type="button"
            onClick={() => onInspectGarment(garment.slug, colorway.id)}
            data-cursor="inspect"
            className="tactile-btn inline-flex min-h-[36px] items-center px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F4EFE4]/90 hover:bg-white/10"
          >
            Inspect
          </button>
        </div>
      </div>

      {/* Bottom Exhibition Dock — Clean gallery balance */}
      <div className="relative z-30 mx-auto grid w-full max-w-[1380px] grid-cols-1 items-center gap-4 border-t border-white/10 px-6 pt-4 sm:px-10 xl:grid-cols-12">
        <div className="flex flex-wrap items-center gap-2 xl:col-span-5">
          {GARMENTS.map((item, idx) => {
            const active = idx === activeIndex;
            const compactLabels: Record<string, string> = {
              "bambai-jersey": "Bambai",
              "skip-class": "Skip Class",
              "inherited-postures": "Postures",
              "education-pipeline": "Pipeline",
            };
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => handleSelectStyle(idx)}
                data-cursor="view"
                className={`tactile-btn min-h-[34px] whitespace-nowrap px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                  active
                    ? "bg-[#F4EFE4] font-semibold text-[#060605]"
                    : "border border-white/12 bg-transparent text-[#B0A99D] hover:border-white/35 hover:text-[#F4EFE4]"
                }`}
              >
                {item.number} · {compactLabels[item.slug] ?? item.shortTitle}
              </button>
            );
          })}
        </div>

        <p className="font-sans text-[13px] leading-relaxed text-[#B0A99D] xl:col-span-3">
          {BRAND.subheadline}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 xl:col-span-4 xl:flex-nowrap xl:justify-end">
          <MagneticButton
            onClick={() => scrollTo("#drop-the-class")}
            cursorLabel="explore"
            className="tactile-btn inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap bg-[#C83E2E] px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#F4EFE4] hover:bg-[#F4EFE4] hover:text-[#060605]"
          >
            <span>Explore Collection</span>
            <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
          </MagneticButton>

          <button
            type="button"
            onClick={() => scrollTo("#fitting-room")}
            data-cursor="inspect"
            className="tactile-btn inline-flex min-h-[40px] items-center whitespace-nowrap border border-white/20 px-4 py-2 font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#F4EFE4] hover:border-[#F4EFE4]"
          >
            Fitting Room
          </button>
        </div>
      </div>
    </section>
  );
}
