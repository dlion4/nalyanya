import { useEffect, useState } from "react";

/* ── Elder Mode — html[data-ny-mode="elder"], persisted, broadcast to tabs */

export const ELDER_KEY = "ny-elder-mode";

export function readElderMode(): boolean {
  try {
    return localStorage.getItem(ELDER_KEY) === "1";
  } catch {
    return false;
  }
}

export function applyElderMode(mode: boolean) {
  const root = document.documentElement;
  if (mode) root.setAttribute("data-ny-mode", "elder");
  else root.removeAttribute("data-ny-mode");
  try { localStorage.setItem(ELDER_KEY, mode ? "1" : "0"); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent("ny-elder-mode", { detail: { mode } }));
}

export function useElderMode() {
  const [mode, setMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return readElderMode();
  });

  useEffect(() => {
    const sync = (next: boolean) => {
      setMode(next);
      const root = document.documentElement;
      if (next) root.setAttribute("data-ny-mode", "elder");
      else root.removeAttribute("data-ny-mode");
    };
    sync(readElderMode());
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<{ mode?: boolean }>).detail?.mode ?? readElderMode();
      sync(next);
    };
    window.addEventListener("ny-elder-mode", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ny-elder-mode", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = () => setMode((m) => { const next = !m; applyElderMode(next); return next; });

  return { mode, setMode: (next: boolean) => { applyElderMode(next); setMode(next); }, toggle };
}

/* ── Reduced motion + in-view helpers ────────────────────────────────────── */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useInView<T extends Element>(threshold = 0.3) {
  const [ref, setRef] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(ref);
    return () => io.disconnect();
  }, [ref, threshold]);
  return { ref: setRef, inView };
}

export function useCountUp(target: number, opts: { duration?: number; decimals?: number; start?: boolean } = {}) {
  const { duration = 1500, decimals = 0, start = true } = opts;
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!start) return;
    if (reduced) { setValue(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(2, -10 * t); // easeOutExpo
      setValue(target * (t >= 1 ? 1 : eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start, reduced]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-KE");
}
