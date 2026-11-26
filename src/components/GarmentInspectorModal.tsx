"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import {
  Box,
  Camera,
  RotateCw,
  ShoppingBag,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  GARMENTS,
  Garment,
  GarmentHotspot,
  GarmentSide,
  GarmentSize,
  formatINR,
} from "@/lib/garments";
import { BRAND } from "@/lib/tokens";
import { useCart } from "@/lib/cart-context";
import { useSmoothScroll } from "@/lib/lenis-provider";
import { MagneticButton } from "@/components/MotionPrimitives";
import type { StudioViewMode } from "@/components/three/StudioStageCanvas";

const StudioStageCanvas = dynamic(
  () =>
    import("@/components/three/StudioStageCanvas").then(
      (mod) => mod.StudioStageCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0d0c0a]">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#948E82]">
          CALIBRATING 3D SPECIMEN...
        </span>
      </div>
    ),
  }
);

interface GarmentInspectorModalProps {
  slug: string | null;
  initialColorwayId?: string;
  onClose: () => void;
}

function GarmentInspectorBody({
  garment,
  initialColorwayId,
  onClose,
}: {
  garment: Garment;
  initialColorwayId?: string;
  onClose: () => void;
}) {
  const validCw = garment.colorways.find((c) => c.id === initialColorwayId);

  const [colorwayId, setColorwayId] = useState<string>(
    validCw ? validCw.id : garment.colorways[0].id
  );
  const [inspectMode, setInspectMode] = useState<"3d" | "loupe">("3d");
  const [side, setSide] = useState<GarmentSide>("front");
  const [viewMode3D, setViewMode3D] = useState<StudioViewMode>("full");
  const [galleryMode, setGalleryMode] = useState<
    "front" | "back" | "detail" | "ambient"
  >("front");
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 3>(1);
  const [panOrigin, setPanOrigin] = useState({ x: 50, y: 50 });
  const [activeHotspot, setActiveHotspot] = useState<GarmentHotspot | null>(
    garment.hotspots[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<GarmentSize>("M");
  const viewportRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCart();

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (inspectMode !== "loupe" || zoomLevel === 1 || !viewportRef.current)
      return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)
    );
    const y = Math.min(
      100,
      Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)
    );
    setPanOrigin({ x, y });
  };

  const selectHotspot = (spot: GarmentHotspot) => {
    setActiveHotspot(spot);
    setSide(spot.side);
    setGalleryMode(spot.side);
    setViewMode3D("detail");
    setPanOrigin({ x: spot.x, y: spot.y });
  };

  const activeColorway =
    garment.colorways.find((c) => c.id === colorwayId) ?? garment.colorways[0];

  const currentSrc =
    galleryMode === "back"
      ? activeColorway.backImage
      : galleryMode === "detail"
        ? activeColorway.detailImage
        : galleryMode === "ambient" && activeColorway.ambientImage
          ? activeColorway.ambientImage
          : activeColorway.frontImage;

  const currentHotspots = garment.hotspots.filter(
    (h) =>
      (galleryMode === "front" && h.side === "front") ||
      (galleryMode === "back" && h.side === "back")
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col justify-between p-4 sm:p-8">
      {/* Top Exhibit Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDE7D9]/15 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#EDE7D9]"
            style={{ backgroundColor: garment.accentHex }}
          >
            SPECIMEN {garment.number}
          </span>
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight sm:text-2xl">
            {garment.title}
          </h2>
          <div className="flex items-center border border-[#EDE7D9]/25 bg-[#131210] p-0.5">
            <button
              type="button"
              onClick={() => setInspectMode("3d")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                inspectMode === "3d"
                  ? "bg-[#B23A2E] text-[#EDE7D9]"
                  : "text-[#948E82] hover:text-[#EDE7D9]"
              }`}
            >
              <Box className="h-3 w-3" aria-hidden="true" />
              <span>360° 3D Model</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectMode("loupe")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                inspectMode === "loupe"
                  ? "bg-[#B23A2E] text-[#EDE7D9]"
                  : "text-[#948E82] hover:text-[#EDE7D9]"
              }`}
            >
              <Camera className="h-3 w-3" aria-hidden="true" />
              <span>Archival Photo Loupe</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close garment inspection"
          data-cursor="explore"
          className="tactile-btn inline-flex min-h-[42px] items-center gap-2 border border-[#EDE7D9]/30 bg-[#131210] px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[#EDE7D9] hover:border-[#B23A2E] hover:bg-[#B23A2E]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span>Exit Exhibit</span>
        </button>
      </div>

      {/* Main Museum Inspection Workspace */}
      <div className="my-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Live 360° 3D Model Stage OR High-Res Photo Loupe */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          {inspectMode === "3d" ? (
            <>
              <div className="relative aspect-[4/5] max-h-[72vh] w-full overflow-hidden border border-[#EDE7D9]/20 bg-[#0d0c0a]">
                <StudioStageCanvas
                  garment={garment}
                  colorwayId={activeColorway.id}
                  side={side}
                  viewMode={viewMode3D}
                  enableZoom
                  hotspots={garment.hotspots}
                  activeHotspotId={activeHotspot?.id ?? null}
                  onSelectHotspot={selectHotspot}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "full", label: "Full Look" },
                      { id: "front", label: "Front" },
                      { id: "back", label: "Back" },
                      { id: "detail", label: "Detail Zoom" },
                      { id: "fabric", label: "Fabric Normal" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setViewMode3D(m.id);
                        if (m.id === "back") setSide("back");
                        else if (m.id === "front" || m.id === "full")
                          setSide("front");
                      }}
                      className={`tactile-btn min-h-[36px] border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                        viewMode3D === m.id
                          ? "border-[#EDE7D9] bg-[#EDE7D9] text-[#090807]"
                          : "border-[#EDE7D9]/20 bg-[#131210] text-[#948E82] hover:text-[#EDE7D9]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = side === "front" ? "back" : "front";
                    setSide(next);
                    setViewMode3D(next);
                  }}
                  className="inline-flex min-h-[36px] items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#EDE7D9]/80 hover:text-[#B23A2E]"
                >
                  <RotateCw className="h-3 w-3" aria-hidden="true" />
                  <span>Orbit {side === "front" ? "Back" : "Front"}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                ref={viewportRef}
                onPointerMove={handlePointerMove}
                data-cursor={zoomLevel > 1 ? "zoom" : "inspect"}
                className="relative flex aspect-[4/5] max-h-[72vh] w-full items-center justify-center overflow-hidden border border-[#EDE7D9]/20 bg-[#0d0c0a]"
              >
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`,
                  }}
                  className="relative h-full aspect-[9/16] max-w-full transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentSrc}
                    alt={`${garment.title} (${activeColorway.name}) — ${galleryMode} inspection`}
                    className="h-full w-full object-cover"
                  />

                  {zoomLevel === 1 &&
                    activeHotspot &&
                    currentHotspots.some((h) => h.id === activeHotspot.id) && (
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 h-full w-full"
                      >
                        <line
                          x1={activeHotspot.x}
                          y1={activeHotspot.y}
                          x2={activeHotspot.x > 50 ? 82 : 18}
                          y2={Math.max(12, activeHotspot.y - 12)}
                          stroke="#EDE7D9"
                          strokeWidth="0.4"
                          strokeDasharray="1.1 0.8"
                        />
                        <circle
                          cx={activeHotspot.x}
                          cy={activeHotspot.y}
                          r="1.4"
                          fill="#B23A2E"
                          stroke="#EDE7D9"
                          strokeWidth="0.4"
                        />
                      </svg>
                    )}

                  {zoomLevel === 1 &&
                    currentHotspots.map((spot) => {
                      const isSelected = activeHotspot?.id === spot.id;
                      return (
                        <button
                          key={spot.id}
                          type="button"
                          onClick={() => selectHotspot(spot)}
                          aria-label={`Select specimen annotation ${spot.title}`}
                          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] transition-transform hover:scale-110 ${
                            isSelected
                              ? "border-[#EDE7D9] bg-[#B23A2E] text-[#EDE7D9]"
                              : "border-[#EDE7D9]/70 bg-[#090807]/85 text-[#EDE7D9]"
                          }`}
                        >
                          {spot.code}
                        </button>
                      );
                    })}
                </div>

                <div className="pointer-events-none absolute top-3 left-3 border border-[#EDE7D9]/15 bg-[#090807]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#EDE7D9]/80">
                  {zoomLevel}X OPTICAL VIEW{" "}
                  {zoomLevel > 1 ? "· MOVE POINTER TO PAN" : ""}
                </div>

                <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) => (z === 1 ? 1 : z === 2 ? 1 : 2))
                    }
                    disabled={zoomLevel === 1}
                    aria-label="Zoom out"
                    className="tactile-btn inline-flex h-9 w-9 items-center justify-center border border-[#EDE7D9]/30 bg-[#090807]/90 text-[#EDE7D9] disabled:opacity-35"
                  >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {([1, 2, 3] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setZoomLevel(level)}
                      className={`tactile-btn h-9 border px-2.5 font-mono text-[10px] ${
                        zoomLevel === level
                          ? "border-[#B23A2E] bg-[#B23A2E] text-[#EDE7D9]"
                          : "border-[#EDE7D9]/30 bg-[#090807]/90 text-[#EDE7D9]"
                      }`}
                    >
                      {level}X
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) => (z === 3 ? 3 : z === 1 ? 2 : 3))
                    }
                    disabled={zoomLevel === 3}
                    aria-label="Zoom in"
                    className="tactile-btn inline-flex h-9 w-9 items-center justify-center border border-[#EDE7D9]/30 bg-[#090807]/90 text-[#EDE7D9] disabled:opacity-35"
                  >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "front" as const, label: "Front Plate" },
                    { id: "back" as const, label: "Back Plate" },
                    { id: "detail" as const, label: "Editorial Detail" },
                    ...(activeColorway.ambientImage
                      ? [{ id: "ambient" as const, label: "Context Study" }]
                      : []),
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setGalleryMode(tab.id);
                        if (tab.id === "front" || tab.id === "back") {
                          setSide(tab.id);
                        }
                        setZoomLevel(1);
                      }}
                      className={`tactile-btn min-h-[36px] border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                        galleryMode === tab.id
                          ? "border-[#EDE7D9] bg-[#EDE7D9] text-[#090807]"
                          : "border-[#EDE7D9]/20 bg-[#131210] text-[#948E82] hover:border-[#EDE7D9]/55 hover:text-[#EDE7D9]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = side === "front" ? "back" : "front";
                    setSide(next);
                    setGalleryMode(next);
                    setZoomLevel(1);
                  }}
                  className="inline-flex min-h-[36px] items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#EDE7D9]/80 hover:text-[#B23A2E]"
                >
                  <RotateCw className="h-3 w-3" aria-hidden="true" />
                  <span>Switch Front / Back</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: Museum Annotation Dossier & Purchase */}
        <div className="flex flex-col justify-between gap-6 border border-[#EDE7D9]/15 bg-[#11100e] p-6 lg:col-span-5">
          <div className="space-y-5">
            {activeHotspot && (
              <div className="border border-[#B23A2E]/60 bg-[#090807] p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#B23A2E]">
                  <span>
                    ANNOTATION {activeHotspot.code} {"//"}{" "}
                    {activeHotspot.category}
                  </span>
                  <span>{activeHotspot.side.toUpperCase()}</span>
                </div>
                <h3 className="mt-1.5 font-display text-lg font-bold uppercase text-[#EDE7D9]">
                  {activeHotspot.title}
                </h3>
                <p className="mt-1.5 font-mono text-xs leading-relaxed text-[#EDE7D9]/85">
                  {activeHotspot.commentary}
                </p>
              </div>
            )}

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#948E82]">
                CURATORIAL ANNOTATIONS
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {garment.hotspots.map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => selectHotspot(spot)}
                    className={`border px-3 py-2 text-left font-mono text-[11px] transition-colors ${
                      activeHotspot?.id === spot.id
                        ? "border-[#EDE7D9] bg-[#EDE7D9] text-[#090807]"
                        : "border-[#EDE7D9]/15 bg-[#090807] text-[#EDE7D9]/80 hover:border-[#EDE7D9]/45"
                    }`}
                  >
                    <span className="block text-[9px] opacity-65">
                      {spot.code} · {spot.side.toUpperCase()}
                    </span>
                    <span className="font-medium">{spot.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#B0A99D]">
                EXHIBITION ESSAY
              </p>
              {garment.storyParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="font-sans text-sm leading-relaxed text-[#E2DDD2]"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-[#EDE7D9]/15 pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-mono text-xl font-bold text-[#EDE7D9]">
                  {formatINR(garment.foundingPrice)}
                </span>
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#B23A2E]">
                  Founding 100
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#948E82]">
                Full Release {formatINR(garment.releasePrice)} ·{" "}
                {BRAND.shippingNote}
              </span>
            </div>

            {garment.colorways.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {garment.colorways.map((cw) => (
                  <button
                    key={cw.id}
                    type="button"
                    onClick={() => setColorwayId(cw.id)}
                    className={`tactile-btn inline-flex min-h-[38px] items-center gap-2 border px-3 py-1 font-mono text-[11px] ${
                      cw.id === activeColorway.id
                        ? "border-[#EDE7D9] bg-[#EDE7D9] text-[#090807]"
                        : "border-[#EDE7D9]/20 bg-[#090807] text-[#EDE7D9]"
                    }`}
                  >
                    <span
                      className="h-3 w-3 border border-[#EDE7D9]/40"
                      style={{ backgroundColor: cw.swatchHex }}
                    />
                    <span>{cw.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {garment.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`tactile-btn min-h-[42px] border font-mono text-xs ${
                    selectedSize === size
                      ? "border-[#B23A2E] bg-[#B23A2E] text-[#EDE7D9]"
                      : "border-[#EDE7D9]/20 bg-[#090807] text-[#EDE7D9]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <MagneticButton
              cursorLabel="add"
              onClick={() => {
                addItem({
                  garmentSlug: garment.slug,
                  colorwayId: activeColorway.id,
                  size: selectedSize,
                });
                onClose();
              }}
              className="tactile-btn flex min-h-[48px] w-full items-center justify-center gap-2 border border-[#B23A2E] bg-[#B23A2E] px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#EDE7D9] hover:border-[#EDE7D9] hover:bg-[#EDE7D9] hover:text-[#090807]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span>Add to Bag — {formatINR(garment.foundingPrice)}</span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GarmentInspectorModal({
  slug,
  initialColorwayId,
  onClose,
}: GarmentInspectorModalProps) {
  const { setLocked } = useSmoothScroll();

  const garment = slug
    ? GARMENTS.find((g) => g.slug === slug) ?? null
    : null;

  useEffect(() => {
    if (!garment) return;
    setLocked(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      setLocked(false);
    };
  }, [garment, onClose, setLocked]);

  return (
    <AnimatePresence>
      {garment && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Museum Inspection of ${garment.title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[95] overflow-y-auto bg-[#090807]/98 text-[#EDE7D9] backdrop-blur-md"
        >
          <GarmentInspectorBody
            key={`${garment.slug}-${initialColorwayId ?? "default"}`}
            garment={garment}
            initialColorwayId={initialColorwayId}
            onClose={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
