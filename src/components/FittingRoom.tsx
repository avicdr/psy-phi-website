"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Eye,
  Maximize2,
  Pause,
  Play,
  RotateCw,
  ShoppingBag,
  Sun,
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
import { MagneticButton } from "@/components/MotionPrimitives";
import type {
  LightingMood,
  StudioViewMode,
} from "@/components/three/StudioStageCanvas";

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
          INITIALIZING 3D FITTING STUDIO...
        </span>
      </div>
    ),
  }
);

interface FittingRoomProps {
  selectedSlug: string;
  selectedColorwayId?: string;
  onSelectPiece: (slug: string, colorwayId?: string) => void;
  onInspectGarment: (slug: string, colorwayId?: string) => void;
}

const VIEW_MODES: { id: StudioViewMode; label: string }[] = [
  { id: "full", label: "Full Look" },
  { id: "front", label: "Front View" },
  { id: "back", label: "Back View" },
  { id: "detail", label: "Detail" },
  { id: "fabric", label: "Fabric Weave" },
];

const LIGHTING_MOODS: { id: LightingMood; label: string }[] = [
  { id: "gallery", label: "Gallery Key" },
  { id: "darkroom", label: "Darkroom" },
  { id: "oxblood", label: "Oxblood" },
];

function FittingRoomConsole({
  garment,
  initialColorwayId,
  onInspectGarment,
}: {
  garment: Garment;
  initialColorwayId?: string;
  onInspectGarment: (slug: string, colorwayId?: string) => void;
}) {
  const validColorway = garment.colorways.find(
    (c) => c.id === initialColorwayId
  );

  const [colorwayId, setColorwayId] = useState(
    validColorway ? validColorway.id : garment.colorways[0].id
  );
  const [size, setSize] = useState<GarmentSize>("M");
  const [viewMode, setViewMode] = useState<StudioViewMode>("full");
  const [side, setSide] = useState<GarmentSide>("front");
  const [turntable, setTurntable] = useState(false);
  const [lightingMood, setLightingMood] = useState<LightingMood>("gallery");
  const [activeHotspot, setActiveHotspot] = useState<GarmentHotspot | null>(
    null
  );

  const { addItem } = useCart();

  const activeColorway =
    garment.colorways.find((c) => c.id === colorwayId) ?? garment.colorways[0];

  const handleViewMode = (mode: StudioViewMode) => {
    setViewMode(mode);
    if (mode === "back") {
      setSide("back");
    } else if (mode === "front" || mode === "full") {
      setSide("front");
    }
    setActiveHotspot(null);
  };

  const handleSelectHotspot = (spot: GarmentHotspot) => {
    setActiveHotspot((prev) => (prev?.id === spot.id ? null : spot));
    setSide(spot.side);
    setViewMode("detail");
    setTurntable(false);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Left: Spacious Virtual Studio Stage */}
      <div className="flex flex-col gap-4 lg:col-span-7">
        <div className="relative h-[520px] w-full overflow-hidden border border-white/10 bg-[#12110f] sm:h-[640px]">
          <StudioStageCanvas
            garment={garment}
            colorwayId={activeColorway.id}
            side={side}
            viewMode={viewMode}
            turntable={turntable}
            lightingMood={lightingMood}
            enableZoom
            hotspots={garment.hotspots}
            activeHotspotId={activeHotspot?.id ?? null}
            onSelectHotspot={handleSelectHotspot}
            onUserInteract={() => setTurntable(false)}
          />

          {/* Compact Minimal Lighting Switcher */}
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1 bg-[#090807]/75 p-1 backdrop-blur-md">
            <Sun className="mx-1.5 h-3 w-3 text-[#B0A99D]" aria-hidden="true" />
            {LIGHTING_MOODS.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setLightingMood(mood.id)}
                className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] transition-colors ${
                  lightingMood === mood.id
                    ? "bg-[#F4EFE4] font-semibold text-[#060605]"
                    : "text-[#B0A99D] hover:text-[#F4EFE4]"
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>

          {activeHotspot && (
            <div className="absolute right-4 bottom-16 left-4 z-30 border border-white/20 bg-[#090807]/95 p-5 backdrop-blur-md sm:left-auto sm:max-w-sm">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#C83E2E]">
                <span>
                  {activeHotspot.code} {"//"} {activeHotspot.category}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveHotspot(null)}
                  className="text-[#B0A99D] hover:text-[#F4EFE4]"
                >
                  Close
                </button>
              </div>
              <h4 className="mt-1.5 font-display text-lg font-bold tracking-tight text-[#F4EFE4]">
                {activeHotspot.title}
              </h4>
              <p className="mt-1.5 font-sans text-xs leading-relaxed text-[#D8D1C4]">
                {activeHotspot.commentary}
              </p>
            </div>
          )}

          {/* Clean Floating Bottom Studio Controls */}
          <div className="absolute right-3.5 bottom-3.5 left-3.5 z-20 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = side === "front" ? "back" : "front";
                  setSide(next);
                  setViewMode(next);
                }}
                data-cursor="flip"
                className="tactile-btn inline-flex min-h-[36px] items-center gap-1.5 bg-[#090807]/85 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F4EFE4] backdrop-blur-md hover:bg-[#C83E2E]"
              >
                <RotateCw className="h-3 w-3" aria-hidden="true" />
                <span>Orbit {side === "front" ? "Back" : "Front"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTurntable((prev) => !prev)}
                aria-pressed={turntable}
                data-cursor="rotate"
                className={`tactile-btn inline-flex min-h-[36px] items-center gap-1.5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur-md ${
                  turntable
                    ? "bg-[#C83E2E] text-[#F4EFE4]"
                    : "bg-[#090807]/85 text-[#F4EFE4] hover:bg-white/15"
                }`}
              >
                {turntable ? (
                  <Pause className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Play className="h-3 w-3" aria-hidden="true" />
                )}
                <span>Turntable</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                onInspectGarment(garment.slug, activeColorway.id)
              }
              data-cursor="inspect"
              className="tactile-btn inline-flex min-h-[36px] items-center gap-1.5 bg-[#090807]/85 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F4EFE4] backdrop-blur-md hover:bg-[#F4EFE4] hover:text-[#060605]"
            >
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
              <span>3D / Photo Loupe</span>
            </button>
          </div>
        </div>

        {/* Minimal Viewing Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEW_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleViewMode(m.id)}
              className={`tactile-btn min-h-[34px] px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                viewMode === m.id
                  ? "bg-[#F4EFE4] font-semibold text-[#060605]"
                  : "border border-white/12 bg-transparent text-[#B0A99D] hover:border-white/35 hover:text-[#F4EFE4]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: De-congested, Un-boxed Luxury Atelier Specification Sheet */}
      <div className="flex flex-col justify-between space-y-7 pt-1 lg:col-span-5">
        <div className="space-y-6">
          {/* Concise Garment Title & Category */}
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[#B0A99D]">
              <span>
                SPECIMEN {garment.number} {"//"} {garment.garmentType}
              </span>
              <span style={{ color: garment.accentHex }}>
                {garment.accentName}
              </span>
            </div>
            <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-[-0.03em] text-[#F4EFE4] sm:text-5xl">
              {garment.shortTitle}
            </h3>
            <p className="mt-1 font-serif text-lg italic text-[#B0A99D]">
              {garment.title}
            </p>
          </div>

          {/* Open Pricing Row (no dark border box) */}
          <div className="border-y border-white/10 py-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-[#F4EFE4]">
                {formatINR(garment.foundingPrice)}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C83E2E]">
                FOUNDING 100
              </span>
              <span className="font-sans text-xs text-[#B0A99D]">
                Full release {formatINR(garment.releasePrice)} ·{" "}
                {BRAND.shippingNote}
              </span>
            </div>
          </div>

          {/* Breathable Editorial Prose */}
          <p className="font-sans text-[15px] leading-relaxed text-[#E2DDD2]">
            {garment.storyParagraphs[0]} {garment.storyParagraphs[1]}
          </p>

          {/* Clean Hairline Spec Rows */}
          <dl className="divide-y divide-white/10 border-y border-white/10 font-sans text-xs">
            <div className="grid grid-cols-3 gap-3 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B0A99D]">
                Material
              </dt>
              <dd className="col-span-2 text-[#F4EFE4]/90">
                {garment.fabricSpec}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-3 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B0A99D]">
                Technique
              </dt>
              <dd className="col-span-2 text-[#F4EFE4]/90">
                {garment.constructionSpec}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-3 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B0A99D]">
                Fit
              </dt>
              <dd className="col-span-2 text-[#F4EFE4]/90">
                {garment.fitSpec}
              </dd>
            </div>
          </dl>

          {/* Colorway Selection */}
          {garment.colorways.length > 1 && (
            <div>
              <span className="mb-2.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#B0A99D]">
                COLORWAY — {activeColorway.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {garment.colorways.map((cw) => (
                  <button
                    key={cw.id}
                    type="button"
                    onClick={() => setColorwayId(cw.id)}
                    className={`tactile-btn inline-flex min-h-[38px] items-center gap-2 border px-4 py-1.5 font-sans text-xs font-medium transition-colors ${
                      cw.id === activeColorway.id
                        ? "border-[#F4EFE4] bg-[#F4EFE4] text-[#060605]"
                        : "border-white/15 bg-transparent text-[#F4EFE4] hover:border-white/45"
                    }`}
                  >
                    <span
                      className="h-3 w-3 border border-white/40"
                      style={{ backgroundColor: cw.swatchHex }}
                    />
                    <span>{cw.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div>
            <span className="mb-2.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#B0A99D]">
              SIZE (CROPPED UNISEX)
            </span>
            <div className="grid grid-cols-4 gap-2">
              {garment.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`tactile-btn min-h-[44px] border font-mono text-xs transition-colors ${
                    size === s
                      ? "border-[#C83E2E] bg-[#C83E2E] font-semibold text-[#F4EFE4]"
                      : "border-white/15 bg-transparent text-[#B0A99D] hover:border-white/50 hover:text-[#F4EFE4]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Annotation Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#B0A99D]">
              PINS:
            </span>
            {garment.hotspots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => handleSelectHotspot(spot)}
                data-cursor="inspect"
                className={`font-mono text-[10px] uppercase tracking-[0.12em] underline-offset-4 transition-colors ${
                  activeHotspot?.id === spot.id
                    ? "font-semibold text-[#C83E2E] underline"
                    : "text-[#B0A99D] hover:text-[#F4EFE4] hover:underline"
                }`}
              >
                {spot.code}
              </button>
            ))}
          </div>
        </div>

        {/* Clean High-Contrast CTA Pair */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <MagneticButton
            cursorLabel="add"
            onClick={() =>
              addItem({
                garmentSlug: garment.slug,
                colorwayId: activeColorway.id,
                size,
              })
            }
            className="tactile-btn inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 bg-[#C83E2E] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#F4EFE4] hover:bg-[#F4EFE4] hover:text-[#060605]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>I&apos;m In — {formatINR(garment.foundingPrice)}</span>
          </MagneticButton>

          <button
            type="button"
            onClick={() => onInspectGarment(garment.slug, activeColorway.id)}
            data-cursor="inspect"
            className="tactile-btn inline-flex min-h-[50px] items-center justify-center gap-2 border border-white/20 px-5 py-3 font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#F4EFE4] hover:border-[#F4EFE4]"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            <span>Full Specimen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function FittingRoom({
  selectedSlug,
  selectedColorwayId,
  onSelectPiece,
  onInspectGarment,
}: FittingRoomProps) {
  const garment =
    GARMENTS.find((g) => g.slug === selectedSlug) ?? GARMENTS[0];

  return (
    <section
      id="fitting-room"
      aria-label="The Fitting Room — 3D Mannequin Styling Studio"
      className="relative scroll-mt-16 border-t border-white/10 bg-[#0b0a09] py-24 text-[#F4EFE4] sm:py-32"
    >
      <div className="mx-auto max-w-[1380px] px-6 sm:px-10">
        <div className="mb-12 flex flex-col justify-between gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C83E2E]">
              ATELIER SHOWROOM // 360° 3D INSPECTION
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-[-0.03em] sm:text-6xl">
              THE FITTING ROOM
            </h2>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[#B0A99D]">
              Sculpted bust form dressed in actual tailored Drop 01 silhouettes.
              Orbit 360°, shift lighting rigs, swap colorways, and inspect
              construction directly on the 3D garment.
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            role="tablist"
            aria-label="Fitting Room Garment Selector"
          >
            {GARMENTS.map((item) => {
              const active = item.slug === garment.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    onSelectPiece(item.slug, item.colorways[0].id)
                  }
                  data-cursor="view"
                  className={`tactile-btn flex min-h-[54px] flex-col items-start justify-center border px-4 py-2 text-left transition-colors ${
                    active
                      ? "border-[#F4EFE4] bg-[#F4EFE4] text-[#060605]"
                      : "border-white/12 bg-transparent text-[#B0A99D] hover:border-white/40 hover:text-[#F4EFE4]"
                  }`}
                >
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-75">
                    {item.number} · {formatINR(item.foundingPrice)}
                  </span>
                  <span className="font-display text-sm font-bold tracking-tight">
                    {item.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <FittingRoomConsole
          key={`${garment.slug}-${selectedColorwayId ?? "default"}`}
          garment={garment}
          initialColorwayId={selectedColorwayId}
          onInspectGarment={onInspectGarment}
        />
      </div>
    </section>
  );
}
