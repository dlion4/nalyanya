"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/format";
import { ratioClass } from "@/views/dashboard/gallery/galleryUi";

/**
 * Lazy image that reserves its box before loading (no layout shift), fades in
 * on decode, and retries once on a fresh cache-busted URL before giving up.
 */
export function LazyPhoto({
  src,
  alt,
  ratio,
  className,
  imgClassName,
  eager,
  priority,
  onOpen,
  children,
}: {
  src: string;
  alt: string;
  ratio: number;
  className?: string;
  imgClassName?: string;
  /** Load immediately (above the fold, lightbox, reel). */
  eager?: boolean;
  /** Hint the browser to fetch early. */
  priority?: boolean;
  onOpen?: () => void;
  children?: React.ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const retried = useRef(false);

  const resolved = attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`;

  useEffect(() => {
    if (status !== "error" || retried.current) return;
    /* One quiet retry: the first request may simply have been dropped. */
    retried.current = true;
    const id = window.setTimeout(() => {
      setAttempt((n) => n + 1);
      setStatus("loading");
    }, 400);
    return () => window.clearTimeout(id);
  }, [status]);

  /* If the image was already in the browser cache it may never fire onLoad. */
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setStatus("ready");
  }, [resolved]);

  const onError = useCallback(() => {
    if (retried.current) setStatus("error");
    else setStatus("error");
  }, []);

  return (
    <div
      className={cn("relative overflow-hidden bg-surface-2", ratioClass(ratio), className)}
      style={{ "--photo-ratio": ratio } as CSSProperties}
    >
      {status === "error" ? (
        <div role="img" aria-label={`${alt} (photo could not be loaded)`} className="absolute inset-0 grid place-items-center bg-surface-2 p-3 text-center text-xs text-text-tertiary">
          Photo could not be loaded
        </div>
      ) : (
        <img
          ref={ref}
          src={resolved}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          draggable={false}
          onLoad={() => setStatus("ready")}
          onError={onError}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out", status === "ready" ? "opacity-100" : "opacity-0", imgClassName)}
        />
      )}
      {status !== "ready" && status !== "error" && (
        <div aria-hidden className="ny-shimmer absolute inset-0">
          <span className="ny-shutter-mark">
            <svg viewBox="0 0 40 40" className="size-8 text-brand-primary/40" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="20" cy="20" r="15" />
              <path d="M20 5v15l10.6 10.6M35 20H20M29.4 5.8 20 20M5.8 10.6 20 20M10.6 34.2 20 20" />
            </svg>
          </span>
        </div>
      )}
      {children}
      {onOpen && status === "ready" && (
        <button type="button" onClick={onOpen} aria-label={`Open ${alt}`} className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent" />
      )}
    </div>
  );
}
