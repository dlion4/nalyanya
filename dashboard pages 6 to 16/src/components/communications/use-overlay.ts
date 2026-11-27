"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/* Deep-linked overlays for T-14. `?o=…` is the drawer-level overlay; `&u=…` is the stacked
   child on top, so a drawer stays open under a small confirm modal and back closes only the
   child. A reload restores both layers; each open carries a fresh nonce for clean remounts.
   useSyncExternalStore keeps the route statically prerenderable. */

export type CmOverlay =
  | "compose"
  | "broadcast"
  | "thread-picker"
  | "reveal"
  | "resend"
  | "thread"
  | "filters"
  | "test"
  | "template"
  | "template-edit"
  | "template-delete"
  | "cancel"
  | "duplicate"
  | "retry"
  | "schedule"
  | "budget"
  | "audience"
  | "channel-guide"
  | "proof"
  | "export"
  | "reply"
  | "audit"
  | "media";

const CHANGE = "ny-cm-overlay";

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

export type OverlayLayer = { key: CmOverlay | null; id: string | null; t: string | null; nonce: string | null };
const EMPTY: OverlayLayer = { key: null, id: null, t: null, nonce: null };

function readLayer(params: URLSearchParams, top: boolean): OverlayLayer {
  return {
    key: (params.get(top ? "u" : "o") as CmOverlay | null) ?? null,
    id: params.get(top ? "uid" : "id"),
    t: params.get(top ? "ut" : "t"),
    nonce: params.get(top ? "un" : "n"),
  };
}

function writeLayers(pathname: string, base: OverlayLayer, top: OverlayLayer) {
  const q = new URLSearchParams();
  if (base.key) q.set("o", base.key);
  if (base.id) q.set("id", base.id);
  if (base.t) q.set("t", base.t);
  q.set("n", base.nonce ?? Date.now().toString(36));
  if (top.key) {
    q.set("u", top.key);
    if (top.id) q.set("uid", top.id);
    if (top.t) q.set("ut", top.t);
    q.set("un", Date.now().toString(36));
  }
  window.history.pushState(null, "", `${pathname}?${q.toString()}`);
  window.dispatchEvent(new Event(CHANGE));
}

export function useOverlay() {
  const pathname = usePathname();
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const params = new URLSearchParams(search);
  const pushed = useRef(false);
  const base = readLayer(params, false);
  const top = readLayer(params, true);

  const open = useCallback(
    (key: CmOverlay, extra?: { id?: string; t?: string }) => {
      pushed.current = true;
      writeLayers(pathname, { key, id: extra?.id ?? null, t: extra?.t ?? null, nonce: null }, EMPTY);
    },
    [pathname],
  );

  const openTop = useCallback(
    (key: CmOverlay, extra?: { id?: string; t?: string }) => {
      pushed.current = true;
      writeLayers(pathname, base, { key, id: extra?.id ?? null, t: extra?.t ?? null, nonce: null });
    },
    [pathname, base.key, base.id, base.t],
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

  const closeTop = useCallback(() => {
    writeLayers(pathname, base, EMPTY);
  }, [pathname, base.key, base.id, base.t]);

  return {
    key: base.key,
    id: base.id,
    t: base.t,
    nonce: base.nonce,
    topKey: top.key,
    topId: top.id,
    topT: top.t,
    topNonce: top.nonce,
    open,
    openTop,
    close,
    closeTop,
  };
}
