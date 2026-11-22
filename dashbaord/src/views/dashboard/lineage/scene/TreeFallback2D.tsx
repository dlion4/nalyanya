"use client";

import { Maximize2, Minus, Plus } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import { GEN_HEX } from "@/components/ui/Primitives";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { BRANCH_BY_ID } from "@/data/family/branches";
import { LAYOUT, type FamilyGraph, type GraphNode } from "@/lib/family/graph";
import { cn } from "@/lib/format";

interface Props {
  graph: FamilyGraph;
  focusKey: string | null;
  visibleGens: number[] | null;
  visibleBranches: string[] | null;
  showWhere: boolean;
  onPick?: (memberId: string, branchId?: string) => void;
  mini?: boolean;
}

function isShown(node: GraphNode, gens: number[] | null, branches: string[] | null): boolean {
  return (!gens || gens.includes(node.generation)) && (!branches || branches.includes(node.branchId));
}

/** Static SVG version of the same radial tree: identical navigation, zero WebGL. */
export default function TreeFallback2D({ graph, focusKey, visibleGens, visibleBranches, showWhere, onPick, mini = false }: Props) {
  const [zoom, setZoom] = useState(1);

  const box = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of graph.nodes) {
      const x = n.pos[0];
      const y = -n.pos[1];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const pad = 1.6;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }, [graph]);

  const focusNode = focusKey ? graph.nodeByKey.get(focusKey) : undefined;
  const related = useMemo<Set<string> | null>(() => {
    if (!focusNode) return null;
    const set = new Set<string>([focusNode.id]);
    const parent = graph.parentOf.get(focusNode.id);
    if (parent) set.add(parent);
    for (const kid of graph.childrenOf.get(focusNode.id) ?? []) set.add(kid);
    const spouse = graph.memberById.get(focusNode.id)?.spouseId;
    if (spouse) set.add(spouse);
    return set;
  }, [graph, focusNode]);

  const pick = (node: GraphNode) => {
    if (!onPick) return;
    onPick(node.id, node.kind === "presence" ? node.branchId : undefined);
  };

  const onKey = (event: KeyboardEvent<SVGGElement>, node: GraphNode) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(node);
    }
  };

  return (
    <div className="absolute inset-0 overflow-auto ny-scroll">
      <svg
        viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
        role="group"
        aria-label="Family tree, 2D view. Select a person to open their profile."
        style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, minWidth: "100%", minHeight: "100%" }}
        preserveAspectRatio="xMidYMid meet"
        className="block"
      >
        {graph.edges.map((link) => {
          const a = graph.nodeByKey.get(link.fromKey);
          const b = graph.nodeByKey.get(link.toKey);
          if (!a || !b) return null;
          const shown = isShown(a, visibleGens, visibleBranches) && isShown(b, visibleGens, visibleBranches);
          if (!shown) return null;
          const linked = related ? related.has(link.fromKey) && related.has(link.toKey) : true;
          return (
            <line
              key={link.toKey}
              x1={link.from[0]}
              y1={-link.from[1]}
              x2={link.to[0]}
              y2={-link.to[1]}
              stroke={BRANCH_BY_ID[link.branchId]?.color ?? "#D4A437"}
              strokeWidth={0.07}
              strokeOpacity={related ? (linked ? 0.95 : 0.1) : 0.6}
            />
          );
        })}

        {graph.spouseLinks.map((link) => {
          const a = graph.nodeByKey.get(link.fromKey);
          const b = graph.nodeByKey.get(link.toKey);
          if (!a || !b || !isShown(a, visibleGens, visibleBranches) || !isShown(b, visibleGens, visibleBranches)) return null;
          return (
            <line
              key={`${link.fromKey}|${link.toKey}`}
              x1={link.from[0]}
              y1={-link.from[1]}
              x2={link.to[0]}
              y2={-link.to[1]}
              stroke="#F4A07A"
              strokeWidth={0.09}
              strokeDasharray="0.3 0.2"
              strokeOpacity={0.8}
            />
          );
        })}

        {showWhere &&
          graph.presenceLinks.map((link) => (
            <line
              key={link.toKey}
              x1={link.from[0]}
              y1={-link.from[1]}
              x2={link.to[0]}
              y2={-link.to[1]}
              stroke="#F4D27A"
              strokeWidth={0.1}
              strokeDasharray="0.4 0.25"
            />
          ))}

        {graph.nodes.map((node) => {
          const shown = isShown(node, visibleGens, visibleBranches);
          if (!shown) return null;
          const color = GEN_HEX[(node.generation - 1) % GEN_HEX.length];
          const focused = focusKey === node.key;
          const me = node.id === CURRENT_USER_ID;
          const dim = related !== null && !related.has(node.id);
          const label = node.kind === "presence" ? `Also: ${node.label}` : node.label;
          const showLabel = focused || me || node.id === LAYOUT.root || (showWhere && node.kind === "presence") || (mini && node.id === LAYOUT.root);
          const r = node.kind === "presence" ? 0.22 : node.radius * 1.15;
          return (
            <g
              key={node.key}
              role="button"
              tabIndex={0}
              aria-label={`${node.member.preferredName} ${node.member.lastName}, ${label}, generation ${node.generation}`}
              onClick={() => pick(node)}
              onKeyDown={(event) => onKey(event, node)}
              className="cursor-pointer focus:outline-none"
              opacity={dim ? 0.2 : 1}
            >
              <title>{`${node.member.preferredName} ${node.member.lastName} · ${label}`}</title>
              {(focused || me) && <circle cx={node.pos[0]} cy={-node.pos[1]} r={r * 1.9} fill="none" stroke="#F4D27A" strokeWidth={0.08} />}
              <circle
                cx={node.pos[0]}
                cy={-node.pos[1]}
                r={r}
                fill={node.kind === "presence" ? "#F4D27A" : color}
                stroke={focused ? "#ffffff" : "#0b1f17"}
                strokeWidth={focused ? 0.1 : 0.04}
              />
              {showLabel && (
                <text
                  x={node.pos[0]}
                  y={-node.pos[1] - r - 0.35}
                  textAnchor="middle"
                  fontSize={0.38}
                  fill="#fffdf7"
                  stroke="#0b1f17"
                  strokeWidth={0.12}
                  paintOrder="stroke"
                  fontWeight={600}
                >
                  {node.member.preferredName}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-auto absolute bottom-3 right-3 flex items-center gap-1.5 rounded-2xl border border-white/15 bg-brand-deep/70 p-1.5 backdrop-blur-md">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.2).toFixed(2))))}
          className={cn("ny-btn ny-btn-dark ny-btn-sm size-9 p-0", zoom <= 0.8 && "opacity-40")}
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.2).toFixed(2))))}
          className="ny-btn ny-btn-dark ny-btn-sm size-9 p-0"
        >
          <Plus className="size-4" />
        </button>
        <button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)} className="ny-btn ny-btn-dark ny-btn-sm size-9 p-0">
          <Maximize2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
