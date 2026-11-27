"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/* Deep-linked overlays for T-11. The open overlay lives in the URL
   (?o=…&id=…&t=…&n=…), so a reload restores it and the browser back button closes it.
   `n` is a fresh nonce per open so each overlay remounts with clean state.
   Reads window.location through useSyncExternalStore so the route can still be
   statically prerendered. */

export type FdOverlay =
  | "grant"
  | "apply"
  | "disburse"
  | "docs"
  | "comms"
  | "reconcile"
  | "export"
  | "donors"
  | "governance"
  | "audit"
  | "ledger"
  | "review"
  | "filters";

const CHANGE = "ny-fd-overlay";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
};

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

export function useOverlay() {
  const pathname = usePathname();
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const params = new URLSearchParams(search);
  const pushed = useRef(false);

  const key = (params.get("o") as FdOverlay | null) ?? null;
  const id = params.get("id");
  const t = params.get("t");
  const nonce = params.get("n");

  const open = useCallback(
    (next: FdOverlay, extra?: { id?: string; t?: string }) => {
      const q = new URLSearchParams();
      q.set("o", next);
      if (extra?.id) q.set("id", extra.id);
      if (extra?.t) q.set("t", extra.t);
      q.set("n", Date.now().toString(36));
      pushed.current = true;
      window.history.pushState(null, "", `${pathname}?${q.toString()}`);
      window.dispatchEvent(new Event(CHANGE));
    },
    [pathname],
  );

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", pathname);
      window.dispatchEvent(new Event(CHANGE));
    }
  }, [pathname]);

  return { key, id, t, nonce, open, close };
}
