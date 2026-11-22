"use client";

import dynamic from "next/dynamic";
import { Crosshair, Maximize2, RotateCcw, Share2 } from "lucide-react";
import { Component, useEffect, useState, type ErrorInfo, type KeyboardEvent, type ReactNode } from "react";
import type { FamilyGraph } from "@/lib/family/graph";
import type { SceneCommand } from "@/views/dashboard/lineage/scene/LineageScene";
import TreeFallback2D from "@/views/dashboard/lineage/scene/TreeFallback2D";
import { cn } from "@/lib/format";

/* The 3D scene is code-split and never rendered on the server (WebGL only). */
const LineageScene = dynamic(() => import("@/views/dashboard/lineage/scene/LineageScene"), {
  ssr: false,
  loading: () => <SceneLoader />,
});

function SceneLoader() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-white/80">
        <div className="relative size-14 overflow-hidden rounded-full border border-white/25">
          <span className="ny-loader-bar absolute inset-x-0 top-0 h-px bg-brand-accent" />
        </div>
        <p className="text-sm font-medium">Rooting the tree…</p>
      </div>
    </div>
  );
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* WebGL context lost or unavailable: the 2D tree takes over with the same navigation. */
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export interface CanvasStageProps {
  graph: FamilyGraph;
  focusKey: string | null;
  visibleGens: number[] | null;
  visibleBranches: string[] | null;
  showWhere: boolean;
  rotateOn: boolean;
  use2d: boolean;
  calm: boolean;
  command: SceneCommand;
  inspector: ReactNode;
  onPick: (memberId: string, branchId?: string) => void;
  onNavigate: (memberId: string) => void;
  onCommand: (kind: "family" | "branch" | "reset") => void;
  onToggleWhere: () => void;
  onHelp: () => void;
}

/** S3 — the 3D canvas stage with glass HUD, keyboard control and the iris intro. */
export function CanvasStage(props: CanvasStageProps) {
  const {
    graph,
    focusKey,
    visibleGens,
    visibleBranches,
    showWhere,
    rotateOn,
    use2d,
    calm,
    command,
    inspector,
    onPick,
    onNavigate,
    onCommand,
    onToggleWhere,
    onHelp,
  } = props;

  const [hovering, setHovering] = useState(false);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  const fallback = use2d || calm || webgl === false;
  const focusedLabel = focusKey ? graph.nodeByKey.get(focusKey)?.member.preferredName : null;

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const order = graph.navOrder;
    const current = focusKey ? focusKey.split("@")[0] : null;
    const idx = current ? order.indexOf(current) : -1;
    const key = event.key.toLowerCase();

    if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && order.length > 0) {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = idx < 0 ? (step > 0 ? 0 : order.length - 1) : (idx + step + order.length) % order.length;
      onNavigate(order[next]);
    } else if (event.key === "ArrowUp" && current) {
      event.preventDefault();
      const parent = graph.parentOf.get(current);
      if (parent) onNavigate(parent);
    } else if (event.key === "ArrowDown" && current) {
      event.preventDefault();
      const kid = graph.childrenOf.get(current)?.[0];
      if (kid) onNavigate(kid);
    } else if (key === "f") {
      onCommand("family");
    } else if (key === "b") {
      onCommand("branch");
    } else if (key === "r") {
      onCommand("reset");
    } else if (key === "w") {
      onToggleWhere();
    } else if (event.key === "?") {
      onHelp();
    }
  };

  const scene = (
    <SceneBoundary
      fallback={
        <TreeFallback2D
          graph={graph}
          focusKey={focusKey}
          visibleGens={visibleGens}
          visibleBranches={visibleBranches}
          showWhere={showWhere}
          onPick={onPick}
        />
      }
    >
      <LineageScene
        graph={graph}
        focusKey={focusKey}
        visibleGens={visibleGens}
        visibleBranches={visibleBranches}
        showWhere={showWhere}
        autoRotate={rotateOn && !hovering && !calm}
        calm={calm}
        command={command}
        onPick={onPick}
        onReady={() => setReady(true)}
      />
    </SceneBoundary>
  );

  return (
    <div className="ny-iris-in relative h-[62vh] overflow-hidden rounded-[30px] border border-white/10 bg-[#17382b] shadow-lift lg:h-[78vh]">
      <div
        role="application"
        tabIndex={0}
        aria-label="3D family tree. Arrow keys move between family members, F fits the family, B fits a branch, R resets the camera, question mark lists every key."
        onKeyDown={handleKey}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        className="ny-tree-stage absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent"
      >
        {fallback ? (
          <TreeFallback2D
            graph={graph}
            focusKey={focusKey}
            visibleGens={visibleGens}
            visibleBranches={visibleBranches}
            showWhere={showWhere}
            onPick={onPick}
          />
        ) : (
          scene
        )}
      </div>

      {!ready && !fallback && (
        <div className="pointer-events-none absolute inset-0 bg-[#17382b]" aria-hidden />
      )}

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-4">
        <div className="ny-hud pointer-events-auto flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-semibold">
          <span className="size-2 animate-ny-pulse rounded-full bg-[#7be3a6]" aria-hidden />
          <span className="ny-num">{graph.members.length}</span> people · <span className="ny-num">{graph.branches.length}</span> branches
          {focusedLabel && <span className="hidden text-white/65 sm:inline">· focus: {focusedLabel}</span>}
        </div>
        <div className="ny-hud pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-2xl p-1.5">
          <button
            type="button"
            onClick={onToggleWhere}
            aria-pressed={showWhere}
            className={cn("ny-btn ny-btn-dark ny-btn-sm", showWhere && "!bg-brand-accent !text-brand-deep !border-transparent")}
          >
            <Crosshair className="size-4" aria-hidden />
            Where am I?
          </button>
          <button type="button" onClick={() => onCommand("family")} className="ny-btn ny-btn-dark ny-btn-sm">
            <Maximize2 className="size-4" aria-hidden />
            Fit family
          </button>
          <button type="button" onClick={() => onCommand("branch")} className="ny-btn ny-btn-dark ny-btn-sm">
            <Share2 className="size-4" aria-hidden />
            Fit branch
          </button>
          <button type="button" onClick={() => onCommand("reset")} aria-label="Reset camera" className="ny-btn ny-btn-dark ny-btn-sm size-9 p-0">
            <RotateCcw className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-3 sm:p-4">
        <div className="ny-hud pointer-events-auto hidden items-center gap-1.5 rounded-2xl px-3 py-2 text-[11px] sm:flex">
          <span className="ny-kbd">←</span>
          <span className="ny-kbd">→</span>
          <span className="text-white/75">people</span>
          <span className="ny-kbd">↑</span>
          <span className="ny-kbd">↓</span>
          <span className="text-white/75">family</span>
          <span className="ny-kbd">F</span>
          <span className="text-white/75">fit</span>
          <span className="ny-kbd">?</span>
          <span className="text-white/75">keys</span>
        </div>
        <p className="ny-hud pointer-events-auto rounded-2xl px-3 py-2 text-[11px] text-white/80">
          {calm ? "Calm view: orbit and 3D are paused in Elder Mode" : fallback ? "2D view · same navigation, no WebGL needed" : "Drag to orbit · scroll to zoom · click a person"}
        </p>
      </div>

      {inspector}
    </div>
  );
}
