"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Box, Camera, Eye, RotateCw } from "lucide-react";
import {
  GARMENTS,
  Garment,
  GarmentSide,
  GarmentSize,
  formatINR,
} from "@/lib/garments";
import { BRAND } from "@/lib/tokens";
import { useCart } from "@/lib/cart-context";
import { MagneticButton } from "@/components/MotionPrimitives";

gsap.registerPlugin(ScrollTrigger);

const StudioStageCanvas = dynamic(
  () =>
    import("@/components/three/StudioStageCanvas").then(
      (mod) => mod.StudioStageCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0d0c0a]">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#B0A99D]">
          LOADING 3D CHAPTER SPECIMEN...
        </span>
      </div>
    ),
  }
);

interface DropTheClassProps {
  onInspectGarment: (slug: string, colorwayId?: string) => void;
  onOpenFittingRoom: (slug: string, colorwayId?: string) => void;
}

interface ChapterSlideProps {
  garment: Garment;
  isLive3DCandidate: boolean;
  onInspectGarment: (slug: string, colorwayId?: string) => void;
  onOpenFittingRoom: (slug: string, colorwayId?: string) => void;
}

function ChapterCard({
  garment,
  isLive3DCandidate,
  onInspectGarment,
  onOpenFittingRoom,
}: ChapterSlideProps) {
  const [colorIdx, setColorIdx] = useState(0);
  const [side, setSide] = useState<GarmentSide>("front");
  const [selectedSize, setSelectedSize] = useState<GarmentSize>("M");
  const [preferPhoto, setPreferPhoto] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 50, sy: 50 });
  const { addItem } = useCart();

  const colorway = garment.colorways[colorIdx] ?? garment.colorways[0];
  const activeImage =
    side === "back" ? colorway.backImage : colorway.frontImage;

  const showInteractive3D = isLive3DCandidate && !preferPhoto;

  return (
    <article
      aria-label={`Chapter ${garment.number}: ${garment.title}`}
      className="relative flex w-full shrink-0 flex-col justify-between border-b border-white/10 bg-[#090807] px-6 py-10 md:h-[calc(100vh-10.5rem)] md:w-[100vw] md:border-r md:border-b-0 md:px-14 md:py-8 lg:px-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-0.5 w-full md:h-full md:w-1"
        style={{ backgroundColor: garment.accentHex }}
      />

      <div className="mx-auto grid h-full w-full max-w-[1340px] grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-14">
        {/* Left: Spacious Interactive 3D Specimen or Tilted Lookbook */}
        <div className="relative flex flex-col gap-3 md:col-span-5 md:h-[65vh]">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#B0A99D]">
            <span>
              CHAPTER {garment.number} {"//"} {garment.chapterMood}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreferPhoto((p) => !p)}
                className="inline-flex items-center gap-1.5 border border-white/15 bg-[#12110f] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#F4EFE4] hover:border-[#C83E2E]"
              >
                {showInteractive3D ? (
                  <>
                    <Camera className="h-2.5 w-2.5 text-[#C83E2E]" />
                    <span>Lookbook</span>
                  </>
                ) : (
                  <>
                    <Box className="h-2.5 w-2.5 text-[#C83E2E]" />
                    <span>3D View</span>
                  </>
                )}
              </button>
              <span className="text-[#F4EFE4]/80">
                {side === "front" ? "FRONT" : "BACK"}
              </span>
            </div>
          </div>

          <div
            data-cursor={showInteractive3D ? "drag" : "flip"}
            onPointerMove={(e) => {
              if (showInteractive3D) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const nx = (e.clientX - rect.left) / rect.width;
              const ny = (e.clientY - rect.top) / rect.height;
              setTilt({
                rx: (0.5 - ny) * 8,
                ry: (nx - 0.5) * 10,
                sx: nx * 100,
                sy: ny * 100,
              });
            }}
            onPointerLeave={() =>
              setTilt({ rx: 0, ry: 0, sx: 50, sy: 50 })
            }
            onClick={() => {
              if (!showInteractive3D) {
                setSide((prev) => (prev === "front" ? "back" : "front"));
              }
            }}
            style={
              !showInteractive3D
                ? {
                    transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                    transition: "transform 240ms cubic-bezier(0.23,1,0.32,1)",
                  }
                : undefined
            }
            className="group relative flex-1 overflow-hidden border border-white/10 bg-[#12110f] aspect-[4/5] md:aspect-auto"
          >
            {showInteractive3D ? (
              <StudioStageCanvas
                garment={garment}
                colorwayId={colorway.id}
                side={side}
                viewMode={side}
                turntable
                lightingMood="gallery"
                compact
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={`${garment.title} (${colorway.name}) — ${side} look`}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(244,239,228,0.16) 0%, transparent 52%)`,
                  }}
                />
              </>
            )}

            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-4 right-5 font-display text-6xl font-bold tracking-tighter text-[#F4EFE4]/15 select-none sm:text-7xl"
            >
              {garment.number}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSide((prev) => (prev === "front" ? "back" : "front"));
              }}
              className="tactile-btn absolute right-3 bottom-3 z-20 flex items-center gap-2 border border-white/20 bg-[#090807]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F4EFE4] backdrop-blur-md hover:border-[#C83E2E] hover:bg-[#C83E2E]"
            >
              <RotateCw className="h-3 w-3 text-[#C83E2E]" aria-hidden="true" />
              <span>View {side === "front" ? "Back" : "Front"}</span>
            </button>
          </div>
        </div>

        {/* Right: Clean, Breathable Luxury Editorial Dossier */}
        <div className="flex flex-col justify-between gap-7 md:col-span-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
              <span
                className="px-2.5 py-1 text-[#F4EFE4]"
                style={{ backgroundColor: garment.accentHex }}
              >
                {garment.garmentType}
              </span>
              <span className="text-[#B0A99D]">{garment.accentName}</span>
            </div>

            <h3 className="font-display text-4xl leading-[0.95] font-bold uppercase tracking-[-0.03em] text-[#F4EFE4] sm:text-6xl">
              {garment.chapterTitle}
            </h3>

            <p className="max-w-xl font-sans text-sm leading-relaxed text-[#E2DDD2] sm:text-base">
              {garment.summary}
            </p>

            <blockquote className="max-w-xl border-l-2 border-[#C83E2E] pl-5 font-serif text-xl italic leading-snug text-[#F4EFE4]/90 sm:text-2xl">
              &ldquo;{garment.storyParagraphs[garment.storyParagraphs.length - 1]}&rdquo;
            </blockquote>
          </div>

          <div className="space-y-5 border-t border-white/12 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-2xl font-bold text-[#F4EFE4]">
                  {formatINR(garment.foundingPrice)}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C83E2E]">
                  FOUNDING 100
                </span>
                <span className="font-sans text-xs text-[#B0A99D]">
                  Full Release {formatINR(garment.releasePrice)} ·{" "}
                  {BRAND.shippingNote}
                </span>
              </div>

              {garment.colorways.length > 1 && (
                <div className="flex items-center gap-2">
                  {garment.colorways.map((cw, idx) => (
                    <button
                      key={cw.id}
                      type="button"
                      onClick={() => setColorIdx(idx)}
                      className={`tactile-btn inline-flex min-h-[34px] items-center gap-2 border px-3 py-1 font-sans text-xs font-medium transition-colors ${
                        idx === colorIdx
                          ? "border-[#F4EFE4] bg-[#F4EFE4] text-[#060605]"
                          : "border-white/20 text-[#F4EFE4]/80 hover:border-white/50"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 border border-white/40"
                        style={{ backgroundColor: cw.swatchHex }}
                      />
                      <span>{cw.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#B0A99D]">
                  SIZE
                </span>
                {garment.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`tactile-btn min-h-[38px] min-w-[44px] border px-3 py-1 font-mono text-xs transition-colors ${
                      selectedSize === size
                        ? "border-[#C83E2E] bg-[#C83E2E] text-[#F4EFE4]"
                        : "border-white/15 bg-transparent text-[#B0A99D] hover:border-white/45 hover:text-[#F4EFE4]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton
                  cursorLabel="add"
                  onClick={() =>
                    addItem({
                      garmentSlug: garment.slug,
                      colorwayId: colorway.id,
                      size: selectedSize,
                    })
                  }
                  className="tactile-btn inline-flex min-h-[44px] items-center gap-2 bg-[#C83E2E] px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#F4EFE4] hover:bg-[#F4EFE4] hover:text-[#060605]"
                >
                  <span>I&apos;m In — Add to Bag</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </MagneticButton>

                <button
                  type="button"
                  onClick={() => onInspectGarment(garment.slug, colorway.id)}
                  data-cursor="inspect"
                  className="tactile-btn inline-flex min-h-[44px] items-center gap-2 border border-white/20 px-4 py-2.5 font-sans text-xs font-medium text-[#F4EFE4] hover:border-[#F4EFE4]"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Inspect</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenFittingRoom(garment.slug, colorway.id)}
                  data-cursor="view"
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B0A99D] underline-offset-4 hover:text-[#F4EFE4] hover:underline"
                >
                  Studio →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DropTheClass({
  onInspectGarment,
  onOpenFittingRoom,
}: DropTheClassProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const totalSlides = GARMENTS.length;
      const tween = gsap.to(track, {
        xPercent: -((totalSlides - 1) / totalSlides) * 100,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top+=64",
          end: () => `+=${window.innerWidth * (totalSlides - 1)}`,
          pin: true,
          scrub: 0.85,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              totalSlides - 1,
              Math.round(self.progress * (totalSlides - 1))
            );
            setActiveChapter(idx);
          },
        },
      });

      scrollTriggerRef.current = tween.scrollTrigger ?? null;

      return () => {
        scrollTriggerRef.current = null;
        tween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  const jumpToChapter = (index: number) => {
    setActiveChapter(index);
    const st = scrollTriggerRef.current;
    if (!st) return;
    const progress = index / (GARMENTS.length - 1);
    const targetScroll = st.start + (st.end - st.start) * progress;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <section
      id="drop-the-class"
      ref={sectionRef}
      aria-label="Drop the Class — Four Chapters Collection Exhibition"
      className="relative w-full scroll-mt-16 overflow-hidden bg-[#080706] text-[#F4EFE4]"
    >
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-end justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C83E2E]">
            COLLECTION 01 // ARCHIVE GALLERY
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-[-0.03em] sm:text-4xl">
            DROP THE CLASS.
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="hidden font-serif text-base italic text-[#B0A99D] lg:inline">
            Four pieces. Four perspectives on class.
          </span>

          <div
            className="hidden items-center gap-1.5 md:flex"
            role="tablist"
            aria-label="Collection Chapters"
          >
            {GARMENTS.map((g, i) => (
              <button
                key={g.slug}
                type="button"
                role="tab"
                aria-selected={i === activeChapter}
                onClick={() => jumpToChapter(i)}
                className={`border px-3 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                  i === activeChapter
                    ? "border-[#F4EFE4] bg-[#F4EFE4] text-[#060605]"
                    : "border-white/15 bg-transparent text-[#B0A99D] hover:text-[#F4EFE4]"
                }`}
              >
                {g.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex flex-col md:w-[400vw] md:flex-row md:will-change-transform"
      >
        {GARMENTS.map((garment, idx) => (
          <ChapterCard
            key={garment.slug}
            garment={garment}
            isLive3DCandidate={idx === activeChapter}
            onInspectGarment={onInspectGarment}
            onOpenFittingRoom={onOpenFittingRoom}
          />
        ))}
      </div>
    </section>
  );
}
