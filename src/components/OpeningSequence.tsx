"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const INTRO_SEEN_KEY = "psyphi_exhibition_intro_seen_v1";

interface OpeningSequenceProps {
  forceOpen?: boolean;
  onComplete?: () => void;
}

export function OpeningSequence({
  forceOpen = false,
  onComplete,
}: OpeningSequenceProps) {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Ignore storage errors
    }
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const timers: number[] = [];

    const startId = window.setTimeout(() => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced && !forceOpen) {
        onComplete?.();
        return;
      }

      const seenBefore = (() => {
        try {
          return Boolean(window.localStorage.getItem(INTRO_SEEN_KEY));
        } catch {
          return false;
        }
      })();

      if (seenBefore && !forceOpen) {
        onComplete?.();
        return;
      }

      setVisible(true);
      setStage(0);

      timers.push(window.setTimeout(() => setStage(1), 650));
      timers.push(window.setTimeout(() => setStage(2), 1450));
      timers.push(
        window.setTimeout(() => {
          try {
            window.localStorage.setItem(INTRO_SEEN_KEY, "1");
          } catch {
            // Ignore storage errors
          }
          setVisible(false);
          onComplete?.();
        }, 2250)
      );
    }, 0);

    return () => {
      window.clearTimeout(startId);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [forceOpen, onComplete]);

  // Optical slit-scan wave field behind the ΨØ opening
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      time += 0.025;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = "#070605";
      ctx.fillRect(0, 0, w, h);

      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;

      // Sculptural optical field rings & grid scanlines
      const grad = ctx.createRadialGradient(px, py, 24, px, py, Math.max(w, h) * 0.55);
      grad.addColorStop(0, stage === 0 ? "rgba(178,58,46,0.22)" : "rgba(237,231,217,0.14)");
      grad.addColorStop(0.45, "rgba(178,58,46,0.06)");
      grad.addColorStop(1, "rgba(7,6,5,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(237,231,217,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const radius = 65 + i * 38 + Math.sin(time + i * 0.4) * 6;
        ctx.beginPath();
        ctx.ellipse(w * 0.5 + (px - w * 0.5) * 0.04, h * 0.5 + (py - h * 0.5) * 0.04, radius * 1.15, radius * 0.62, Math.sin(time * 0.3) * 0.06, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [visible, stage]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        dismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="PSY PHI Exhibition Opening Sequence"
          onPointerMove={(e) => {
            pointerRef.current = {
              x: e.clientX / Math.max(1, window.innerWidth),
              y: e.clientY / Math.max(1, window.innerHeight),
            };
          }}
          initial={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          exit={{
            clipPath: "inset(0% 0% 100% 0%)",
            opacity: 0.98,
            transition: { duration: 0.78, ease: [0.77, 0, 0.175, 1] },
          }}
          className="fixed inset-0 z-[90] flex flex-col justify-between bg-[#070605] p-6 text-[#EDE7D9] sm:p-10"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          <div className="relative z-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-[#948E82]">
            <span>PSY PHI {"//"} DROP 01</span>
            <button
              type="button"
              onClick={dismiss}
              data-cursor="explore"
              className="border border-[#EDE7D9]/25 bg-[#131210]/80 px-3 py-1.5 text-[10px] tracking-[0.2em] text-[#EDE7D9] transition-colors hover:border-[#B23A2E] hover:bg-[#B23A2E] focus-visible:outline-2"
            >
              {forceOpen ? "CLOSE FILM" : "SKIP SEQUENCE"} [ESC]
            </button>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center">
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="pointer-events-none absolute h-px w-[280px] bg-[#EDE7D9]/45 sm:w-[440px]"
              />
              <motion.span
                aria-hidden="true"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.4 }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="pointer-events-none absolute h-[140px] w-px bg-[#EDE7D9]/45"
              />

              <div className="relative flex items-baseline gap-2 sm:gap-4">
                <motion.span
                  initial={{ x: -34, opacity: 0, filter: "blur(6px)" }}
                  animate={{
                    x: stage >= 1 ? 0 : -10,
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
                  className="font-display text-7xl font-extrabold tracking-tight text-[#EDE7D9] sm:text-9xl"
                >
                  Ψ
                </motion.span>
                <motion.span
                  initial={{ x: 34, opacity: 0, filter: "blur(6px)" }}
                  animate={{
                    x: stage >= 1 ? 0 : 10,
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
                  className="font-display text-7xl font-extrabold tracking-tight text-[#B23A2E] sm:text-9xl"
                >
                  Ø
                </motion.span>
              </div>
            </div>

            <div className="mt-6 h-8 overflow-hidden">
              <motion.div
                animate={{
                  y: stage === 0 ? 0 : stage === 1 ? -32 : -64,
                }}
                transition={{ duration: 0.52, ease: [0.77, 0, 0.175, 1] }}
                className="flex flex-col items-center font-mono text-xs uppercase tracking-[0.28em]"
              >
                <span className="flex h-8 items-center text-[#948E82]">
                  PSI · MIND &nbsp;/&nbsp; PHI · INQUIRY
                </span>
                <span className="flex h-8 items-center text-[#EDE7D9]">
                  CLOTHES GET READ BEFORE YOU SPEAK
                </span>
                <span className="flex h-8 items-center text-[#B23A2E]">
                  NOTHING IS FIXED — DROP THE CLASS
                </span>
              </motion.div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-[#EDE7D9]/12 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#948E82]">
            <span>MUMBAI {"//"} ARCHIVE ROOM 00</span>
            <span>साई फाई — NOTICE EVERYTHING</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
