import { BRANCHES } from "@/data/family/branches";
import { MEMBERS } from "@/data/family/people";
import { PRESENCES } from "@/data/dashboard/lineage";
import type { Branch, Member } from "@/types/family";
import { hashString } from "@/lib/rng";

/* ───────────────────────────────────────────────────────────────────────
   Family graph + 3D radial layout (pure TypeScript — used by the R3F scene,
   the 2D SVG fallback, search, and every "where am I?" query).
   Root sits at the apex; each generation is a ring one level lower.
   Branch sectors are proportional to each subtree's leaf count.
   ─────────────────────────────────────────────────────────────────────── */

export type Vec3 = [number, number, number];

export const LAYOUT = {
  root: "NY-MBR-00001",
  ringStep: 2.6,
  levelStep: 2.1,
} as const;

export type NodeKind = "primary" | "spouse" | "presence";

export interface GraphNode {
  key: string;
  id: string;
  member: Member;
  branchId: string;
  generation: number;
  depth: number;
  pos: Vec3;
  angle: number;
  radius: number;
  descendants: number;
  kind: NodeKind;
  label: string;
}

export interface GraphLink {
  fromKey: string;
  toKey: string;
  from: Vec3;
  to: Vec3;
  branchId: string;
}

export interface BranchStat {
  count: number;
  minGen: number;
  maxGen: number;
  center: Vec3;
  radius: number;
}

export interface FamilyGraph {
  nodes: GraphNode[];
  members: Member[];
  memberById: Map<string, Member>;
  nodeByKey: Map<string, GraphNode>;
  nodeById: Map<string, GraphNode>;
  presenceNodes: GraphNode[];
  childrenOf: Map<string, string[]>;
  parentOf: Map<string, string | null>;
  siblingsOf: Map<string, string[]>;
  edges: GraphLink[];
  spouseLinks: GraphLink[];
  presenceLinks: GraphLink[];
  branches: Branch[];
  branchStats: Map<string, BranchStat>;
  generations: number[];
  generationCounts: Map<number, number>;
  bounds: { center: Vec3; radius: number };
  navOrder: string[];
}

function centroid(points: Vec3[]): Vec3 {
  const n = points.length || 1;
  let x = 0;
  let y = 0;
  let z = 0;
  for (const p of points) {
    x += p[0];
    y += p[1];
    z += p[2];
  }
  return [x / n, y / n, z / n];
}

function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function build(): FamilyGraph {
  const members = MEMBERS;
  const memberById = new Map<string, Member>(members.map((m) => [m.id, m]));

  const childrenOf = new Map<string, string[]>();
  for (const m of members) {
    if (!m.parentId) continue;
    const list = childrenOf.get(m.parentId) ?? [];
    list.push(m.id);
    childrenOf.set(m.parentId, list);
  }
  for (const list of Array.from(childrenOf.values())) {
    list.sort((a, b) => (memberById.get(a)?.birthYear ?? 0) - (memberById.get(b)?.birthYear ?? 0));
  }

  const leafMemo = new Map<string, number>();
  const leaves = (id: string): number => {
    const cached = leafMemo.get(id);
    if (cached !== undefined) return cached;
    const kids = childrenOf.get(id) ?? [];
    const value = kids.length === 0 ? 1 : kids.reduce((sum, kid) => sum + leaves(kid), 0);
    leafMemo.set(id, value);
    return value;
  };

  const descMemo = new Map<string, number>();
  const descendants = (id: string): number => {
    const cached = descMemo.get(id);
    if (cached !== undefined) return cached;
    const kids = childrenOf.get(id) ?? [];
    const value = kids.reduce((sum, kid) => sum + 1 + descendants(kid), 0);
    descMemo.set(id, value);
    return value;
  };

  const pos = new Map<string, Vec3>();
  const angle = new Map<string, number>();
  const depth = new Map<string, number>();

  const place = (id: string, level: number, a0: number, a1: number) => {
    const theta = (a0 + a1) / 2 + (hashString(`${id}:a`) - 0.5) * 0.05;
    const r = level * LAYOUT.ringStep;
    const y = -level * LAYOUT.levelStep + (hashString(`${id}:y`) - 0.5) * 0.3;
    depth.set(id, level);
    angle.set(id, theta);
    pos.set(id, [r * Math.cos(theta), y, r * Math.sin(theta)]);

    const kids = childrenOf.get(id) ?? [];
    if (kids.length === 0) return;
    const total = kids.reduce((sum, kid) => sum + leaves(kid), 0);
    let cursor = a0;
    for (const kid of kids) {
      const span = ((a1 - a0) * leaves(kid)) / total;
      place(kid, level + 1, cursor, cursor + span);
      cursor += span;
    }
  };
  place(LAYOUT.root, 0, 0, Math.PI * 2);

  // Spouses sit beside their partner on the same ring.
  for (const m of members) {
    if (!m.spouseId || !pos.has(m.id) || pos.has(m.spouseId)) continue;
    const level = depth.get(m.id) ?? 0;
    const base = angle.get(m.id) ?? 0;
    if (level === 0) {
      pos.set(m.spouseId, [-2.3, 0.6, 1.1]);
      angle.set(m.spouseId, base);
      depth.set(m.spouseId, 0);
    } else {
      const theta = base + 0.13;
      const r = level * LAYOUT.ringStep;
      pos.set(m.spouseId, [r * Math.cos(theta), pos.get(m.id)?.[1] ?? 0, r * Math.sin(theta)]);
      angle.set(m.spouseId, theta);
      depth.set(m.spouseId, level);
    }
  }

  // Anything unplaced falls back to its generation ring (defensive).
  for (const m of members) {
    if (pos.has(m.id)) continue;
    const level = Math.max(0, m.generation - 1);
    const theta = hashString(m.id) * Math.PI * 2;
    const r = level * LAYOUT.ringStep;
    depth.set(m.id, level);
    angle.set(m.id, theta);
    pos.set(m.id, [r * Math.cos(theta), -level * LAYOUT.levelStep, r * Math.sin(theta)]);
  }

  const nodes: GraphNode[] = [];
  const nodeByKey = new Map<string, GraphNode>();
  const nodeById = new Map<string, GraphNode>();

  for (const m of members) {
    const isRoot = m.id === LAYOUT.root;
    const isSpouse = m.parentId === null && !isRoot;
    const desc = descendants(m.id);
    const node: GraphNode = {
      key: m.id,
      id: m.id,
      member: m,
      branchId: m.branchId,
      generation: m.generation,
      depth: depth.get(m.id) ?? 0,
      pos: pos.get(m.id) ?? [0, 0, 0],
      angle: angle.get(m.id) ?? 0,
      radius: isRoot ? 0.62 : isSpouse ? 0.15 : Math.min(0.5, 0.14 + 0.05 * Math.sqrt(desc)),
      descendants: desc,
      kind: isSpouse ? "spouse" : "primary",
      label: m.role,
    };
    nodes.push(node);
    nodeByKey.set(node.key, node);
    nodeById.set(m.id, node);
  }

  // Multi-presence: the same person held in another branch, drawn as a ghost orb.
  const founderOf = new Map<string, string>(BRANCHES.map((b) => [b.id, b.founderId]));
  const presenceNodes: GraphNode[] = [];
  PRESENCES.forEach((p, index) => {
    const member = memberById.get(p.memberId);
    if (!member) return;
    const founder = founderOf.get(p.branchId) ?? LAYOUT.root;
    const level = Math.max(0, p.generation - 1);
    const theta = (angle.get(founder) ?? 0) + (index % 2 === 0 ? 0.24 : -0.24) + (index - 1) * 0.05;
    const r = level * LAYOUT.ringStep;
    const node: GraphNode = {
      key: `${p.memberId}@${p.branchId}`,
      id: p.memberId,
      member,
      branchId: p.branchId,
      generation: p.generation,
      depth: level,
      pos: [r * Math.cos(theta), -level * LAYOUT.levelStep - 0.35, r * Math.sin(theta)],
      angle: theta,
      radius: 0.2,
      descendants: 0,
      kind: "presence",
      label: p.role,
    };
    presenceNodes.push(node);
    nodes.push(node);
    nodeByKey.set(node.key, node);
  });

  const edges: GraphLink[] = [];
  for (const m of members) {
    if (!m.parentId) continue;
    const from = pos.get(m.parentId);
    const to = pos.get(m.id);
    if (!from || !to) continue;
    edges.push({ fromKey: m.parentId, toKey: m.id, from, to, branchId: m.branchId });
  }

  const spouseLinks: GraphLink[] = [];
  const seenPairs = new Set<string>();
  for (const m of members) {
    if (!m.spouseId) continue;
    const pair = [m.id, m.spouseId].sort().join("|");
    if (seenPairs.has(pair)) continue;
    seenPairs.add(pair);
    const from = pos.get(m.id);
    const to = pos.get(m.spouseId);
    if (!from || !to) continue;
    spouseLinks.push({ fromKey: m.id, toKey: m.spouseId, from, to, branchId: m.branchId });
  }

  const presenceLinks: GraphLink[] = presenceNodes.map((g) => ({
    fromKey: g.id,
    toKey: g.key,
    from: pos.get(g.id) ?? [0, 0, 0],
    to: g.pos,
    branchId: g.branchId,
  }));

  const parentOf = new Map<string, string | null>(members.map((m) => [m.id, m.parentId]));
  const siblingsOf = new Map<string, string[]>();
  for (const m of members) {
    if (!m.parentId) continue;
    const siblings = (childrenOf.get(m.parentId) ?? []).filter((id) => id !== m.id);
    siblingsOf.set(m.id, siblings);
  }

  const primary = nodes.filter((n) => n.kind !== "presence");
  const branchStats = new Map<string, BranchStat>();
  for (const branch of BRANCHES) {
    const group = primary.filter((n) => n.branchId === branch.id);
    if (group.length === 0) continue;
    const center = centroid(group.map((n) => n.pos));
    const radius = Math.max(...group.map((n) => dist(n.pos, center))) + 0.9;
    const gens = group.map((n) => n.generation);
    branchStats.set(branch.id, {
      count: group.length,
      minGen: Math.min(...gens),
      maxGen: Math.max(...gens),
      center,
      radius,
    });
  }

  const boundsCenter = centroid(primary.map((n) => n.pos));
  const boundsRadius = Math.max(...primary.map((n) => dist(n.pos, boundsCenter))) + 1.2;

  const generations = Array.from(new Set(members.map((m) => m.generation))).sort((a, b) => a - b);
  const generationCounts = new Map<number, number>();
  for (const m of members) generationCounts.set(m.generation, (generationCounts.get(m.generation) ?? 0) + 1);

  const navOrder = primary
    .slice()
    .sort((a, b) => a.generation - b.generation || a.angle - b.angle)
    .map((n) => n.id);

  return {
    nodes,
    members,
    memberById,
    nodeByKey,
    nodeById,
    presenceNodes,
    childrenOf,
    parentOf,
    siblingsOf,
    edges,
    spouseLinks,
    presenceLinks,
    branches: BRANCHES,
    branchStats,
    generations,
    generationCounts,
    bounds: { center: boundsCenter, radius: boundsRadius },
    navOrder,
  };
}

let cached: FamilyGraph | null = null;

/** Built once per session; identical on server and client. */
export function getFamilyGraph(): FamilyGraph {
  if (!cached) cached = build();
  return cached;
}

/** Fuzzy search over names, nicknames and NY-MBR IDs. */
export function searchMembers(graph: FamilyGraph, query: string, limit = 8): Member[] {
  const q = query.trim().toLowerCase();
  if (!q) return graph.members.slice(0, limit);
  return graph.members
    .map((m) => {
      const name = `${m.firstName} ${m.middleName ?? ""} ${m.lastName} ${m.preferredName}`.toLowerCase();
      const id = m.id.toLowerCase();
      let score = 0;
      if (id === q) score = 100;
      else if (id.includes(q)) score = 70;
      else if (name.startsWith(q)) score = 60;
      else if (name.split(" ").some((part) => part.startsWith(q))) score = 50;
      else if (name.includes(q)) score = 30;
      return { m, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.m.generation - b.m.generation)
    .slice(0, limit)
    .map((item) => item.m);
}

export function relativesOf(graph: FamilyGraph, id: string) {
  const member = graph.memberById.get(id);
  const parentId = graph.parentOf.get(id) ?? null;
  const spouseId = member?.spouseId ?? null;
  const pick = (ids: string[]) =>
    ids.map((x) => graph.memberById.get(x)).filter((m): m is Member => Boolean(m));
  return {
    parent: parentId ? graph.memberById.get(parentId) ?? null : null,
    spouse: spouseId ? graph.memberById.get(spouseId) ?? null : null,
    children: pick(graph.childrenOf.get(id) ?? []),
    siblings: pick(graph.siblingsOf.get(id) ?? []),
  };
}

export function branchNameOf(branchId: string): string {
  return BRANCHES.find((b) => b.id === branchId)?.name ?? branchId;
}
