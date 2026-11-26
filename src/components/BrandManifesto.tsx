"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import {
  CURATED_OBSERVATIONS,
  MANIFESTO_PARAGRAPHS,
  MANIFESTO_SEQUENCE,
} from "@/lib/tokens";
import { MaskedReveal, MagneticButton } from "@/components/MotionPrimitives";
import { useSmoothScroll } from "@/lib/lenis-provider";

gsap.registerPlugin(ScrollTrigger);

interface BrandManifestoProps {
  onInspectGarment: (slug: string) => void;
}

export function BrandManifesto({ onInspectGarment }: BrandManifestoProps) {
  const manifestoRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const container = manifestoRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const beats = gsap.utils.toArray<HTMLElement>(".manifesto-beat");
      beats.forEach((beat) => {
        const term = beat.querySelector(".beat-term");
        const def = beat.querySelector(".beat-def");
        if (!term || !def) return;

        gsap.fromTo(
          term,
          { xPercent: -4, opacity: 0.35 },
          {
            xPercent: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: beat,
              start: "top 82%",
              end: "center 52%",
              scrub: 0.6,
            },
          }
        );

        gsap.fromTo(
          def,
          { xPercent: 4, opacity: 0.25 },
          {
            xPercent: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: beat,
              start: "top 82%",
              end: "center 52%",
              scrub: 0.6,
            },
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="why-psy-phi"
      ref={manifestoRef}
      aria-label="Why PSY PHI — Brand Manifesto and Observations"
      className="architectural-grid relative scroll-mt-16 bg-[#060605] text-[#F4EFE4]"
    >
      {/* Part A: Kinetic Manifesto in Obsidian Vault */}
      <div className="mx-auto max-w-[1380px] px-6 py-24 sm:px-10 sm:py-32">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C83E2E]">
              EXHIBITION WING 03 // PHILOSOPHY & ORIGIN
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-[-0.03em] sm:text-6xl">
              WHY PSY PHI
            </h2>
          </div>
          <span className="font-mono text-xs tracking-[0.2em] text-[#B0A99D]">
            ΨØ — NOTHING IS FIXED
          </span>
        </div>

        {/* Kinetic Four-Beat Sequence */}
        <div className="divide-y divide-white/10">
          {MANIFESTO_SEQUENCE.map((beat, idx) => (
            <div
              key={beat.term}
              className="manifesto-beat grid grid-cols-1 items-baseline gap-4 py-8 sm:grid-cols-12 sm:gap-8 sm:py-11"
            >
              <div className="flex min-w-0 items-baseline gap-4 sm:col-span-6">
                <span className="shrink-0 font-mono text-xs text-[#C83E2E]">
                  0{idx + 1} {"//"} {beat.symbol}
                </span>
                <span className="beat-term font-display text-[clamp(2rem,3.8vw,3.8rem)] leading-[0.95] font-bold uppercase tracking-[-0.03em] text-[#F4EFE4]">
                  {beat.term}
                </span>
              </div>

              <div className="min-w-0 sm:col-span-3">
                <span className="beat-def block font-serif text-[clamp(2rem,3.4vw,3.4rem)] leading-none italic tracking-tight text-[#F4EFE4]/90">
                  {beat.definition}
                </span>
              </div>

              <p className="font-sans text-sm leading-relaxed text-[#B0A99D] sm:col-span-3">
                {beat.note}
              </p>
            </div>
          ))}
        </div>

        {/* Editorial Founder Statement */}
        <div className="mt-20 grid grid-cols-1 gap-12 border-t border-white/10 pt-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <MaskedReveal>
              <p className="font-serif text-4xl leading-[1.08] italic text-[#F4EFE4] sm:text-5xl">
                &ldquo;We didn&apos;t start PSY PHI to sell shirts.&rdquo;
              </p>
            </MaskedReveal>
            <div className="mt-9">
              <MagneticButton
                cursorLabel="explore"
                onClick={() => scrollTo("#drop-the-class")}
                className="tactile-btn inline-flex min-h-[48px] items-center gap-2 bg-[#C83E2E] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#F4EFE4] hover:bg-[#F4EFE4] hover:text-[#060605]"
              >
                <span>View Drop 01</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </MagneticButton>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            {MANIFESTO_PARAGRAPHS.slice(1).map((paragraph, i) => (
              <MaskedReveal key={i} delay={i * 0.06}>
                <p className="max-w-2xl font-sans text-base leading-relaxed text-[#E2DDD2] sm:text-lg">
                  {paragraph}
                </p>
              </MaskedReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Part B: Contrast Shift — Luminous Warm Stone Observations Field Archive */}
      <div
        id="observations"
        className="scroll-mt-16 border-t border-[#141311]/15 bg-[#EFEAE0] py-24 text-[#11100E] sm:py-28"
      >
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-[#11100E]/15 pb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C83E2E]">
                EXHIBITION WING 04 // FIELD ARCHIVE
              </p>
              <h3 className="mt-2 font-display text-4xl font-bold uppercase tracking-[-0.03em] text-[#11100E] sm:text-5xl">
                OBSERVATIONS
              </h3>
            </div>
            <p className="font-sans text-sm text-[#11100E]/70">
              Documented construction & cultural field notes from Drop 01.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {CURATED_OBSERVATIONS.map((note) => (
              <article
                key={note.id}
                className="group flex flex-col justify-between border border-[#11100E]/15 bg-[#F8F5EE] p-8 transition-colors hover:border-[#C83E2E]"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#11100E]/60">
                    <span className="text-[#C83E2E]">{note.code}</span>
                    <span>{note.subject}</span>
                  </div>
                  <h4 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] text-[#11100E]">
                    {note.title}
                  </h4>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-[#11100E]/80">
                    {note.body}
                  </p>
                </div>

                {note.pieceHandle && (
                  <div className="mt-6 border-t border-[#11100E]/10 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const slugMap: Record<string, string> = {
                          "bambai-jersey": "bambai-jersey",
                          "skip-class-cropped-unisex-ringer-tee": "skip-class",
                          "education-pipeline-cropped-fit-unisex-t-shirt":
                            "education-pipeline",
                        };
                        const target =
                          slugMap[note.pieceHandle!] ?? "bambai-jersey";
                        onInspectGarment(target);
                      }}
                      data-cursor="inspect"
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#11100E] hover:text-[#C83E2E]"
                    >
                      <span>Examine Piece in 3D</span>
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
