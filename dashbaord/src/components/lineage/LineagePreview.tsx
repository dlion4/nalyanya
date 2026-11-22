import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Box,
  Crosshair,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { stratify, tree } from "d3-hierarchy";
import { members } from "@/data/dashboard/command-center";
import { useWorkspace } from "@/state/Workspace";
import type { TreeApi, TreeNode } from "@/graphics/lineage-scene";
import "./lineage.css";

const parents = [-1, 0, 1, 1, 0, 4, 4, 2, 4, 3, 5, 9];
function nodesFor(branch?: string): TreeNode[] {
  const keep = new Set<number>([0]);
  members.forEach((m, i) => {
    if (!branch || m.branch === branch) {
      let p = i;
      while (p >= 0) {
        keep.add(p);
        p = parents[p];
      }
    }
  });
  const rows = members
    .map((m, i) => ({
      ...m,
      parent: parents[i] < 0 ? undefined : members[parents[i]].id,
      idx: i,
    }))
    .filter((m) => keep.has(m.idx));
  const hierarchy = stratify<(typeof rows)[number]>()
    .id((d) => d.id)
    .parentId((d) => d.parent)(rows);
  const layout = tree<(typeof rows)[number]>().size([8.8, 4.4])(hierarchy);
  return layout
    .descendants()
    .map((n) => ({
      id: n.data.id,
      label: n.data.short,
      parent: n.parent?.data.id,
      x: n.x - 4.4,
      y: 2.2 - n.y,
      z: n.depth === 0 ? 0 : Math.sin(n.data.idx * 1.2) * 0.7,
      depth: n.depth,
      image:
        n.data.idx === 2
          ? "/images/brian.webp"
          : n.data.idx === 3
            ? "/images/faith.webp"
            : n.data.idx === 1
              ? "/images/grace.webp"
              : undefined,
    }));
}
export function LineagePreview({ large = false }: { large?: boolean }) {
  const w = useWorkspace();
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<TreeApi | null>(null);
  const [visible, setVisible] = useState(false);
  const [preferFlat, setPreferFlat] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [focused, setFocused] = useState("");
  const nodes = useMemo(() => nodesFor(w.branch?.id), [w.branch?.id]);
  const onSelect = useRef((id: string) => w.open("member", id));
  onSelect.current = (id: string) => w.open("member", id);
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    if (!visible || w.reduced || preferFlat || !mount.current) return;
    const el = mount.current;
    async function load() {
      try {
        const path = "/scene/lineage.mjs";
        const module = (await import(
          /* @vite-ignore */ path
        )) as typeof import("@/graphics/lineage-scene");
        if (cancelled) return;
        const scene = module.mountTree(el, nodes, (id) => onSelect.current(id));
        api.current = scene;
        setLoaded(true);
      } catch {
        if (!cancelled) setLoaded(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, [nodes, visible, w.reduced, preferFlat]);
  const locate = () => {
    const id = members[2].id;
    if (!nodes.some((n) => n.id === id)) {
      w.open("member", id);
      return;
    }
    setFocused(id);
    api.current?.focus(id);
  };
  const position = (n: TreeNode) => [(n.x + 5) * 43 + 8, (2.6 - n.y) * 31 + 12];
  return (
    <section className={`ny-tree-preview ${large ? "is-large" : ""}`}>
      <div className="ny-tree-heading">
        <div>
          <p className="ny-eyebrow">OUR LINEAGE</p>
          <h2>The living family tree</h2>
          <p>Rooted in Mzee Victor Nalyanya.</p>
        </div>
        <button
          aria-label={`${loaded ? "3D" : "2D"} view: toggle flat family tree`}
          aria-pressed={preferFlat || w.reduced}
          onClick={() => setPreferFlat(!preferFlat)}
        >
          <Box size={13} />
          {loaded ? "3D" : "2D"} view
        </button>
      </div>
      <div
        className="ny-tree-stage"
        ref={mount}
        role="group"
        aria-label="Interactive lineage preview. Select a member to read their profile."
      >
        {!loaded && (
          <svg
            className="ny-tree-fallback"
            viewBox="0 0 450 173"
            role="group"
            aria-label="Family tree, accessible two-dimensional view"
          >
            {nodes
              .filter((n) => n.parent)
              .map((n) => {
                const p = nodes.find((a) => a.id === n.parent)!;
                const [x, y] = position(n),
                  [px, py] = position(p);
                return (
                  <path
                    key={n.id}
                    d={`M${px},${py} C${px},${(py + y) / 2} ${x},${(py + y) / 2} ${x},${y}`}
                    fill="none"
                    stroke={n.depth < 2 ? "#bfa677" : "#779b78"}
                    strokeWidth="1.3"
                  />
                );
              })}
            {nodes.map((n) => {
              const [x, y] = position(n);
              return (
                <g
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${n.label}`}
                  onClick={() => w.open("member", n.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      w.open("member", n.id);
                    }
                  }}
                  transform={`translate(${x} ${y})`}
                >
                  <circle
                    r={n.depth === 0 ? 10 : 7}
                    fill={
                      n.id === focused
                        ? "#f1d68a"
                        : n.depth === 0
                          ? "#c4aa70"
                          : "#5b795d"
                    }
                    stroke={n.depth === 0 ? "#dfc68d" : "#a3b397"}
                    strokeWidth="1.5"
                  />
                  <circle r="2" fill="#f7edcd" />
                  <text
                    y="19"
                    fontSize="7.5"
                    textAnchor="middle"
                    fill="#d8e2ce"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <div className="ny-tree-bottom">
        <button onClick={locate}>
          <Crosshair size={13} />
          {focused ? "Brian highlighted" : "Where am I?"}
        </button>
        {large ? (
          <div className="ny-tree-zoom">
            <button
              aria-label="Zoom out of tree"
              onClick={() => api.current?.zoom(-1)}
              disabled={!loaded}
            >
              <Minus size={14} />
            </button>
            <button
              aria-label="Reset tree view"
              onClick={() => {
                api.current?.reset();
                setFocused("");
              }}
            >
              <RotateCcw size={13} />
            </button>
            <button
              aria-label="Zoom in to tree"
              onClick={() => api.current?.zoom(1)}
              disabled={!loaded}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => w.go("/dashboard/lineage")}>
            Explore tree
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>
      {loaded && (
        <div className="sr-only">
          {nodes.map((n) => (
            <button key={n.id} onClick={() => w.open("member", n.id)}>
              {n.label} profile
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
