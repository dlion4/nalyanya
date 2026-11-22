"use client";

import { MotionConfig, useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface PrefsApi {
  elder: boolean;
  setElder: (value: boolean) => void;
  /** True when motion should be calmed: Elder Mode or the OS asks for reduced motion. */
  calmMotion: boolean;
  branchContext: string;
  setBranchContext: (id: string) => void;
}

const PrefsContext = createContext<PrefsApi | null>(null);

/** Elder Mode + family/branch context, persisted locally and mirrored onto <html data-ny-mode>. */
export function PrefsProvider({ children }: { children: ReactNode }) {
  const [elder, setElderState] = useState(false);
  const [branchContext, setBranchState] = useState("all");
  const [hydrated, setHydrated] = useState(false);
  const osReduced = useReducedMotion();

  useEffect(() => {
    try {
      setElderState(window.localStorage.getItem("ny-elder") === "1");
      setBranchState(window.localStorage.getItem("ny-branch") ?? "all");
    } catch {
      /* storage unavailable: keep defaults */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (elder) root.setAttribute("data-ny-mode", "elder");
    else root.removeAttribute("data-ny-mode");
    try {
      window.localStorage.setItem("ny-elder", elder ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [elder, hydrated]);

  const setElder = useCallback((value: boolean) => setElderState(value), []);

  const setBranchContext = useCallback((id: string) => {
    setBranchState(id);
    try {
      window.localStorage.setItem("ny-branch", id);
    } catch {
      /* ignore */
    }
  }, []);

  /* Calm motion is only applied after mount so server and first client render match. */
  const api = useMemo<PrefsApi>(
    () => ({
      elder,
      setElder,
      calmMotion: hydrated && (elder || Boolean(osReduced)),
      branchContext,
      setBranchContext,
    }),
    [elder, setElder, osReduced, hydrated, branchContext, setBranchContext],
  );

  return (
    <PrefsContext.Provider value={api}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </PrefsContext.Provider>
  );
}

export function usePrefs(): PrefsApi {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside <PrefsProvider>");
  return ctx;
}
