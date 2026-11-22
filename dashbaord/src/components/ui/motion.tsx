"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn, groupDigits } from "@/lib/format";

/** Fade + rise on scroll into view (runs once). */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Count-up on first view (tabular numerals). Snaps under reduced motion. */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.2,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) {
      setShown(value);
      return;
    }
    setShown(0);
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(value * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduced]);

  const text = decimals > 0 ? shown.toFixed(decimals) : groupDigits(shown);
  return (
    <span ref={ref} className={cn("ny-num", className)}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

/** Pointer-driven 3D tilt (≤ max degrees). Disabled under reduced motion. */
export function TiltCard({ children, className, max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (reduced || !el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translate3d(0, -2px, 0)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("transform-3d transition-transform duration-300 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}
