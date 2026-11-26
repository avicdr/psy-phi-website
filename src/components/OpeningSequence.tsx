"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";

const INTRO_SEEN_KEY = "psyphi_exhibition_intro_seen_v2";
const INTRO_AUTO_SKIP_KEY = "psyphi_exhibition_autoskip_v2";

function subscribeNoop() {
  return () => {};
}

function getReturningSnapshot(): boolean {
  try {
    return Boolean(window.localStorage.getItem(INTRO_SEEN_KEY));
  } catch {
    return false;
  }
}

function getAutoSkipSnapshot(): boolean {
  try {
    return window.localStorage.getItem(INTRO_AUTO_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

interface OpeningSequenceProps {
  forceOpen?: boolean;
  onComplete?: () => void;
}

export function OpeningSequence({
  forceOpen = false,
  onComplete,
}: OpeningSequenceProps) {
  const isReturning = useSyncExternalStore(
    subscribeNoop,
    getReturningSnapshot,
    () => false
  );
  const autoSkipOptIn = useSyncExternalStore(
    subscribeNoop,
    getAutoSkipSnapshot,
    () => false
  );

  const [visible, setVisible] = useState(() => !autoSkipOptIn || forceOpen);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const dismiss = useCallback(() => {
    markSeen();
    setVisible(false);
    onCompleteRef.current?.();
  }, [markSeen]);

  const handleRememberAutoSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      window.localStorage.setItem(INTRO_AUTO_SKIP_KEY, "1");
    } catch {
      // Ignore storage errors
    }
    dismiss();
  };

  // Start 3-beat opening film sequence once document is interactive/loaded so chunks/fonts don't consume the film time
  useEffect(() => {
    if (!visible) return;

    let started = false;
    let t1 = 0;
    let t2 = 0;
    let tEnd = 0;
    let fallbackId = 0;

    const beginSequence = () => {
      if (started) return;
      started = true;
      t1 = window.setTimeout(() => setStage(1), 950);
      t2 = window.setTimeout(() => setStage(2), 1950);
      tEnd = window.setTimeout(() => {
        markSeen();
        setVisible(false);
        onCompleteRef.current?.();
      }, 3250);
    };

    if (document.readyState === "complete") {
      beginSequence();
    } else {
      window.addEventListener("load", beginSequence, { once: true });
      // Generous dead-man fallback so heavy assets on slow networks don't cut off before load completes,
      // while click/ESC skip works immediately at any time from frame 0.
      fallbackId = window.setTimeout(beginSequence, 4500);
    }

    return () => {
      window.removeEventListener("load", beginSequence);
      window.clearTimeout(fallbackId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tEnd);
    };
  }, [visible, markSeen]);

  // Optical radial aperture canvas behind the ΨØ opening emblem
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
      if (!reduced) time += 0.024;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = "#060605";
      ctx.fillRect(0, 0, w, h);

      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;

      const beam = ctx.createRadialGradient(
        px,
        py,
        32,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.65
      );
      beam.addColorStop(
        0,
        stage === 0
          ? "rgba(200, 62, 46, 0.28)"
          : stage === 1
            ? "rgba(244, 239, 228, 0.20)"
            : "rgba(244, 239, 228, 0.26)"
      );
      beam.addColorStop(0.42, "rgba(200, 62, 46, 0.08)");
      beam.addColorStop(1, "rgba(6, 6, 5, 0)");
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const radius =
          64 + i * 38 + (reduced ? 0 : Math.sin(time + i * 0.35) * 8);
        const alpha = Math.max(0.03, 0.12 - i * 0.0045);
        ctx.strokeStyle =
          i % 4 === 0
            ? `rgba(200, 62, 46, ${alpha * 1.35})`
            : `rgba(244, 239, 228, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(
          w * 0.5 + (px - w * 0.5) * 0.05,
          h * 0.5 + (py - h * 0.5) * 0.05,
          radius * 1.18,
          radius * 0.58,
          reduced ? 0 : Math.sin(time * 0.32) * 0.07,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      if (!reduced) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [visible, stage]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
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
          id="psyphi-opening-film"
          role="dialog"
          aria-modal="true"
          aria-label="PSY PHI Exhibition Opening Film"
          onClick={dismiss}
          onPointerMove={(e) => {
            pointerRef.current = {
              x: e.clientX / Math.max(1, window.innerWidth),
              y: e.clientY / Math.max(1, window.innerHeight),
            };
          }}
          initial={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          exit={{
            clipPath: "inset(0% 0% 100% 0%)",
            opacity: 0.99,
            transition: { duration: 0.85, ease: [0.77, 0, 0.175, 1] },
          }}
          className="fixed inset-0 z-[90] flex cursor-pointer flex-col justify-between bg-[#060605] p-6 text-[#F4EFE4] sm:p-10"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* Top exhibition film bar */}
          <div className="relative z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-[#B0A99D]">
            <span>PSY PHI {"//"} OPENING EXHIBITION</span>
            <div className="flex items-center gap-3">
              {isReturning && !forceOpen && (
                <button
                  type="button"
                  onClick={handleRememberAutoSkip}
                  className="hidden text-[9px] tracking-[0.18em] text-[#B0A99D] underline-offset-4 hover:text-[#F4EFE4] hover:underline sm:inline-block"
                >
                  Always Skip
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss();
                }}
                data-cursor="explore"
                className="border border-white/20 bg-[#11100f]/85 px-3.5 py-1.5 text-[10px] tracking-[0.2em] text-[#F4EFE4] transition-colors hover:border-[#C83E2E] hover:bg-[#C83E2E] focus-visible:outline-2"
              >
                {forceOpen
                  ? "CLOSE FILM"
                  : isReturning
                    ? "SKIP [ESC] / CLICK"
                    : "SKIP FILM [ESC]"}
              </button>
            </div>
          </div>

          {/* Center Typographic ΨØ Transformation */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center">
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="pointer-events-none absolute h-px w-[280px] bg-white/35 sm:w-[480px]"
              />
              <motion.span
                aria-hidden="true"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.4 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="pointer-events-none absolute h-[140px] w-px bg-white/35 sm:h-[180px]"
              />

              <motion.div
                animate={{
                  letterSpacing:
                    stage === 0 ? "0.18em" : stage === 1 ? "0.02em" : "-0.03em",
                  scale: stage === 2 ? 1.06 : 1,
                }}
                transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
                className="relative flex items-baseline gap-2 sm:gap-5"
              >
                <motion.span
                  initial={{ x: -38, opacity: 0, filter: "blur(10px)" }}
                  animate={{
                    x: stage >= 1 ? 0 : -12,
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
                  className="font-display text-7xl font-bold text-[#F4EFE4] sm:text-9xl"
                >
                  Ψ
                </motion.span>
                <motion.span
                  initial={{ x: 38, opacity: 0, filter: "blur(10px)" }}
                  animate={{
                    x: stage >= 1 ? 0 : 12,
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
                  className="font-display text-7xl font-bold text-[#C83E2E] sm:text-9xl"
                >
                  Ø
                </motion.span>
              </motion.div>
            </div>

            <div className="mt-7 h-10 overflow-hidden">
              <motion.div
                animate={{
                  y: stage === 0 ? 0 : stage === 1 ? -40 : -80,
                }}
                transition={{ duration: 0.62, ease: [0.77, 0, 0.175, 1] }}
                className="flex flex-col items-center"
              >
                <span className="flex h-10 items-center font-mono text-xs uppercase tracking-[0.28em] text-[#B0A99D]">
                  PSI · MIND &nbsp;/&nbsp; PHI · INQUIRY
                </span>
                <span className="flex h-10 items-center font-serif text-2xl italic tracking-tight text-[#F4EFE4] sm:text-3xl">
                  Clothes get read before you speak.
                </span>
                <span className="flex h-10 items-center font-display text-sm font-semibold uppercase tracking-[0.26em] text-[#C83E2E]">
                  NOTHING IS FIXED — DROP THE CLASS
                </span>
              </motion.div>
            </div>
          </div>

          {/* Bottom architectural coordinates */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#B0A99D]">
            <span>MUMBAI {"//"} EXHIBITION ROOM 00</span>
            <span>साई फाई — NOTICE EVERYTHING</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
