"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  ariaLabel?: string;
  cursorLabel?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ariaLabel,
  cursorLabel,
  strength = 0.24,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !ref.current) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    x.set(dx);
    y.set(dy);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      data-cursor={cursorLabel}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

const SCRAMBLE_CHARS = "ΨØ∆X0149/\\+-";

export function ScrambleText({
  text,
  trigger = true,
  className = "",
}: {
  text: string;
  trigger?: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const totalFrames = Math.min(20, Math.max(10, text.length));
    let rafId = 0;

    const update = () => {
      frame++;
      const progress = frame / totalFrames;
      const lockedCount = Math.floor(progress * text.length);

      const next = text
        .split("")
        .map((char, idx) => {
          if (char === " " || idx < lockedCount) return char;
          return SCRAMBLE_CHARS[(frame + idx * 3) % SCRAMBLE_CHARS.length];
        })
        .join("");

      setDisplay(next);
      if (frame < totalFrames) {
        rafId = window.requestAnimationFrame(update);
      } else {
        setDisplay(text);
      }
    };

    rafId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(rafId);
  }, [text, trigger]);

  return <span className={className}>{trigger ? display : text}</span>;
}

export function MaskedReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.1, y: 18 }}
      whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.72,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
