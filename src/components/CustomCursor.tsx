"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CURSOR_LABEL_MAP: Record<string, string> = {
  explore: "EXPLORE",
  drag: "DRAG",
  rotate: "SWEEP",
  inspect: "INSPECT",
  flip: "FLIP",
  add: "I'M IN",
  view: "VIEW PIECE",
  zoom: "ZOOM",
};

function subscribePointerMedia(callback: () => void) {
  const m1 = window.matchMedia("(hover: hover) and (pointer: fine)");
  const m2 = window.matchMedia("(prefers-reduced-motion: reduce)");
  m1.addEventListener("change", callback);
  m2.addEventListener("change", callback);
  return () => {
    m1.removeEventListener("change", callback);
    m2.removeEventListener("change", callback);
  };
}

function getPointerSnapshot() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getServerPointerSnapshot() {
  return false;
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(
    subscribePointerMedia,
    getPointerSnapshot,
    getServerPointerSnapshot
  );
  const [label, setLabel] = useState<string>("");
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("has-custom-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);

      const targetEl = (e.target as HTMLElement | null)?.closest(
        "[data-cursor]"
      ) as HTMLElement | null;
      const rawKey = targetEl?.getAttribute("data-cursor") ?? "";
      if (rawKey) {
        setLabel(CURSOR_LABEL_MAP[rawKey] ?? rawKey.toUpperCase());
      } else {
        const interactive = (e.target as HTMLElement | null)?.closest(
          "a, button, input, textarea, [role='button']"
        );
        setLabel(interactive ? "SELECT" : "");
      }
    };

    const onPointerDown = () => setIsPressed(true);
    const onPointerUp = () => setIsPressed(false);
    const onMouseLeave = () => setIsVisible(false);

    const loop = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      rafId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  const hasLabel = Boolean(label);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[95] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex items-center justify-center border transition-[width,height,background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          hasLabel
            ? "h-7 min-w-[74px] border-[#EDE7D9]/70 bg-[#090807]/90 px-2.5 text-[#EDE7D9]"
            : "h-4 w-4 border-[#EDE7D9]/75 bg-transparent"
        } ${isPressed ? "scale-90 border-[#B23A2E]" : "scale-100"}`}
      >
        {hasLabel ? (
          <span className="font-mono text-[10px] font-medium tracking-[0.18em] whitespace-nowrap">
            {label}
          </span>
        ) : (
          <span className="h-1 w-1 bg-[#B23A2E]" />
        )}
      </div>
    </div>
  );
}
