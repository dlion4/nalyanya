"use client";

import { Billboard, CameraControls, Float, Html, Line, QuadraticBezierLine, Sparkles, useTexture } from "@react-three/drei";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GEN_HEX } from "@/components/ui/Primitives";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { BRANCH_BY_ID } from "@/data/family/branches";
import { LAYOUT, type FamilyGraph, type GraphLink, type GraphNode, type Vec3 } from "@/lib/family/graph";

export type SceneCommand = { kind: "family" | "branch" | "reset"; branchId?: string; nonce: number } | null;

export interface LineageSceneProps {
  graph: FamilyGraph;
  focusKey: string | null;
  visibleGens: number[] | null;
  visibleBranches: string[] | null;
  showWhere: boolean;
  autoRotate: boolean;
  calm: boolean;
  mini?: boolean;
  command: SceneCommand;
  onPick?: (memberId: string, branchId?: string) => void;
  onReady?: () => void;
}

const palette = (generation: number) => GEN_HEX[(generation - 1) % GEN_HEX.length];

function isShown(node: GraphNode, gens: number[] | null, branches: string[] | null): boolean {
  return (!gens || gens.includes(node.generation)) && (!branches || branches.includes(node.branchId));
}

/* ─── Camera rig: dolly to focus, fit family/branch, idle orbit ─────────── */

/** 0.5 rpm idle orbit (≈ 2 minutes per turn), paused while the user interacts. */
function IdleOrbit({ controlsRef, enabled }: { controlsRef: React.RefObject<CameraControlsImpl | null>; enabled: boolean }) {
  useFrame((_, dt) => {
    const c = controlsRef.current;
    if (!enabled || !c) return;
    void c.rotate(((Math.PI * 2) / 120) * Math.min(dt, 0.05), 0, false);
  });
  return null;
}

function CameraRig({
  controlsRef,
  graph,
  focusKey,
  command,
  autoRotate,
  mini,
}: {
  controlsRef: React.RefObject<CameraControlsImpl | null>;
  graph: FamilyGraph;
  focusKey: string | null;
  command: SceneCommand;
  autoRotate: boolean;
  mini: boolean;
}) {
  const [interacting, setInteracting] = useState(false);
  const idle = useRef<number | null>(null);

  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    const onStart = () => {
      setInteracting(true);
      if (idle.current !== null) window.clearTimeout(idle.current);
    };
    const onEnd = () => {
      if (idle.current !== null) window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => setInteracting(false), 8000);
    };
    c.addEventListener("controlstart", onStart);
    c.addEventListener("controlend", onEnd);
    return () => {
      c.removeEventListener("controlstart", onStart);
      c.removeEventListener("controlend", onEnd);
      if (idle.current !== null) window.clearTimeout(idle.current);
    };
  }, [controlsRef]);

  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    if (!focusKey) {
      void c.setLookAt(0, 3, mini ? 22 : 31, 0, -3.6, 0, false);
      return;
    }
    const node = graph.nodeByKey.get(focusKey);
    if (!node) return;
    const target = new THREE.Vector3(...node.pos);
    const dir = new THREE.Vector3(0.42, 0.3, 1).normalize();
    const distance = node.depth === 0 ? (mini ? 13 : 16) : mini ? 7 : 9.5;
    const cam = target.clone().addScaledVector(dir, distance);
    void c.setLookAt(cam.x, cam.y, cam.z, target.x, target.y, target.z, true);
  }, [focusKey, graph, controlsRef, mini]);

  useEffect(() => {
    const c = controlsRef.current;
    if (!c || !command) return;
    if (command.kind === "family") {
      void c.fitToSphere(new THREE.Sphere(new THREE.Vector3(...graph.bounds.center), graph.bounds.radius), true);
    } else if (command.kind === "branch") {
      const stat = command.branchId ? graph.branchStats.get(command.branchId) : undefined;
      if (stat) void c.fitToSphere(new THREE.Sphere(new THREE.Vector3(...stat.center), stat.radius), true);
    } else {
      void c.setLookAt(0, 3, mini ? 22 : 31, 0, -3.6, 0, true);
    }
  }, [command, graph, controlsRef, mini]);

  return (
    <>
      <CameraControls
        ref={controlsRef}
        makeDefault
        minDistance={mini ? 4 : 6}
        maxDistance={mini ? 34 : 70}
        smoothTime={0.45}
        dampingFactor={0.08}
        draggingDampingFactor={0.2}
        dollyToCursor
      />
      <IdleOrbit controlsRef={controlsRef} enabled={autoRotate && !interacting} />
    </>
  );
}

/* ─── Structure: generation rings, tubes, spouse lines, presence arcs ───── */

function GenerationRings({ generations }: { generations: number[] }) {
  return (
    <group>
      {generations
        .filter((g) => g > 1)
        .map((g) => {
          const level = g - 1;
          const r = level * LAYOUT.ringStep;
          return (
            <mesh key={g} rotation={[-Math.PI / 2, 0, 0]} position={[0, -level * LAYOUT.levelStep, 0]}>
              <ringGeometry args={[Math.max(0.01, r - 0.012), r + 0.012, 180]} />
              <meshBasicMaterial color={palette(g)} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
}

const TreeEdge = memo(function TreeEdge({ link, visible, opacity, color }: { link: GraphLink; visible: boolean; opacity: number; color: string }) {
  const start = useMemo(() => new THREE.Vector3(...link.from), [link.from]);
  const end = useMemo(() => new THREE.Vector3(...link.to), [link.to]);
  const mid = useMemo(
    () =>
      new THREE.Vector3(
        (link.from[0] + link.to[0]) / 2,
        (link.from[1] + link.to[1]) / 2 + 0.7,
        (link.from[2] + link.to[2]) / 2,
      ),
    [link.from, link.to],
  );
  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={1.25}
      transparent
      opacity={opacity}
      visible={visible}
    />
  );
});

function PresenceArc({ link }: { link: GraphLink }) {
  const start = useMemo(() => new THREE.Vector3(...link.from), [link.from]);
  const end = useMemo(() => new THREE.Vector3(...link.to), [link.to]);
  const mid = useMemo(
    () => new THREE.Vector3((link.from[0] + link.to[0]) / 2, Math.max(link.from[1], link.to[1]) + 2.6, (link.from[2] + link.to[2]) / 2),
    [link.from, link.to],
  );
  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color="#F4D27A"
      lineWidth={1.6}
      dashed
      dashSize={0.3}
      gapSize={0.18}
      transparent
      opacity={0.95}
    />
  );
}

/* ─── Nodes ─────────────────────────────────────────────────────────────── */

interface OrbProps {
  node: GraphNode;
  visible: boolean;
  dimmed: boolean;
  focused: boolean;
  mini: boolean;
  onPick?: (memberId: string, branchId?: string) => void;
}

const TreeOrb = memo(function TreeOrb({ node, visible, dimmed, focused, mini, onPick }: OrbProps) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const [hover, setHover] = useState(false);
  const color = palette(node.generation);
  const isRoot = node.id === LAYOUT.root;
  const isMe = node.id === CURRENT_USER_ID;

  useFrame((_, dt) => {
    const g = group.current;
    if (g) {
      const target = focused ? 1.5 : hover ? 1.25 : isMe ? 1.12 : 1;
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 8, dt));
    }
    const m = mat.current;
    if (m) m.opacity = THREE.MathUtils.damp(m.opacity, dimmed ? 0.16 : 1, 6, dt);
  });

  const showLabel = visible && (focused || hover || (isRoot && !mini) || (isMe && !mini && node.kind === "primary"));

  return (
    <group
      ref={group}
      position={node.pos}
      visible={visible}
      onPointerOver={(event) => {
        event.stopPropagation();
        if (!visible) return;
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (visible && onPick && !mini) onPick(node.id, undefined);
      }}
    >
      <mesh>
        <sphereGeometry args={[node.radius, 28, 28]} />
        <meshStandardMaterial
          ref={mat}
          color={color}
          emissive={color}
          emissiveIntensity={focused ? 1.1 : isMe ? 0.85 : 0.42}
          roughness={0.35}
          metalness={0.05}
          transparent
          opacity={1}
        />
      </mesh>
      {isMe && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[node.radius * 1.9, 0.03, 10, 48]} />
          <meshBasicMaterial color="#F4D27A" transparent opacity={0.95} />
        </mesh>
      )}
      {node.member.deathYear !== undefined && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[node.radius * 1.55, 0.022, 8, 40]} />
          <meshBasicMaterial color="#c9d1c4" transparent opacity={0.6} />
        </mesh>
      )}
      {node.member.adopted && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[node.radius * 2.2, 0.024, 8, 40]} />
          <meshBasicMaterial color="#A284DC" transparent opacity={0.85} />
        </mesh>
      )}
      {showLabel && (
        <Html center distanceFactor={isRoot ? 22 : 13} zIndexRange={[30, 0]} position={[0, node.radius + 0.6, 0]} style={{ pointerEvents: "none" }}>
          <div className="ny-node-label">
            <span className="block">{node.member.preferredName}</span>
            <span className="block text-[10px] font-medium opacity-75">
              {node.label} · {node.member.homeTown}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
});

const GhostOrb = memo(function GhostOrb({ node, visible, dimmed, showLabel, onPick }: { node: GraphNode; visible: boolean; dimmed: boolean; showLabel: boolean; onPick?: (memberId: string, branchId?: string) => void }) {
  const ring = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.y = clock.getElapsedTime() * 0.6;
  });
  return (
    <group
      position={node.pos}
      visible={visible}
      onClick={(event) => {
        event.stopPropagation();
        if (visible && onPick) onPick(node.id, node.branchId);
      }}
      onPointerOver={() => {
        if (visible) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <sphereGeometry args={[node.radius, 20, 20]} />
        <meshStandardMaterial color="#F4D27A" emissive="#F4D27A" emissiveIntensity={dimmed ? 0.2 : 0.75} transparent opacity={dimmed ? 0.35 : 0.9} />
      </mesh>
      <group ref={ring}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.028, 8, 44]} />
          <meshBasicMaterial color="#F4D27A" transparent opacity={0.85} />
        </mesh>
      </group>
      {showLabel && visible && (
        <Html center distanceFactor={13} zIndexRange={[25, 0]} position={[0, 0.85, 0]} style={{ pointerEvents: "none" }}>
          <div className="ny-node-label ny-node-label-ghost">
            <span className="block">Also: {node.label}</span>
            <span className="block text-[10px] font-medium opacity-75">{BRANCH_BY_ID[node.branchId]?.shortName ?? node.branchId}</span>
          </div>
        </Html>
      )}
    </group>
  );
});

/* ─── Floating photo planes (real family photos) ───────────────────────── */

function PhotoDisc({ url, position, size }: { url: string; position: Vec3; size: number }) {
  const texture = useTexture(url);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(1, 0.6667);
    texture.offset.set(0, 0.16665);
    texture.needsUpdate = true;
  }, [texture]);
  return (
    <Billboard position={position} follow>
      <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.06, 0.06]}>
        <mesh>
          <circleGeometry args={[size, 64]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[size, size + 0.06, 64]} />
          <meshBasicMaterial color="#F4D27A" />
        </mesh>
      </Float>
    </Billboard>
  );
}

/* ─── Scene assembly ───────────────────────────────────────────────────── */

function TreeWorld(props: LineageSceneProps) {
  const { graph, focusKey, visibleGens, visibleBranches, showWhere, autoRotate, calm, mini = false, command, onPick } = props;
  const controlsRef = useRef<CameraControlsImpl | null>(null);

  const related = useMemo<Set<string> | null>(() => {
    if (!focusKey) return null;
    const node = graph.nodeByKey.get(focusKey);
    if (!node) return null;
    const set = new Set<string>([node.id]);
    const parent = graph.parentOf.get(node.id);
    if (parent) set.add(parent);
    for (const kid of graph.childrenOf.get(node.id) ?? []) set.add(kid);
    const spouse = graph.memberById.get(node.id)?.spouseId;
    if (spouse) set.add(spouse);
    return set;
  }, [graph, focusKey]);

  const edgeItems = useMemo(
    () =>
      graph.edges.map((link) => {
        const a = graph.nodeByKey.get(link.fromKey);
        const b = graph.nodeByKey.get(link.toKey);
        const visible = Boolean(a && b && isShown(a, visibleGens, visibleBranches) && isShown(b, visibleGens, visibleBranches));
        const linked = related ? related.has(link.fromKey) && related.has(link.toKey) : true;
        return {
          link,
          visible,
          opacity: related ? (linked ? 0.95 : 0.08) : 0.66,
          color: BRANCH_BY_ID[link.branchId]?.color ?? "#D4A437",
        };
      }),
    [graph, visibleGens, visibleBranches, related],
  );

  const spouseItems = useMemo(
    () =>
      graph.spouseLinks.map((link) => {
        const a = graph.nodeByKey.get(link.fromKey);
        const b = graph.nodeByKey.get(link.toKey);
        const visible = Boolean(a && b && isShown(a, visibleGens, visibleBranches) && isShown(b, visibleGens, visibleBranches));
        const linked = related ? related.has(link.fromKey) && related.has(link.toKey) : true;
        return { link, visible, opacity: related ? (linked ? 0.9 : 0.08) : 0.5 };
      }),
    [graph, visibleGens, visibleBranches, related],
  );

  const photoNodes = useMemo(
    () => graph.nodes.filter((n) => n.kind !== "presence" && n.member.photo && (!mini || n.id === LAYOUT.root)),
    [graph, mini],
  );

  const onPickStable = useCallback((memberId: string, branchId?: string) => onPick?.(memberId, branchId), [onPick]);

  return (
    <>
      <fog attach="fog" args={["#17382b", 34, 84]} />
      <ambientLight intensity={0.95} />
      <hemisphereLight args={["#fff3da", "#0b1f17", 0.85]} />
      <directionalLight position={[10, 18, 12]} intensity={1.05} color="#fff4dc" />
      <pointLight position={[0, 3, 4]} intensity={1.3} color="#D4A437" distance={30} />

      <CameraRig controlsRef={controlsRef} graph={graph} focusKey={focusKey} command={command} autoRotate={autoRotate && !calm} mini={mini} />

      <GenerationRings generations={graph.generations} />

      {edgeItems.map(({ link, visible, opacity, color }) => (
        <TreeEdge key={link.toKey} link={link} visible={visible} opacity={opacity} color={color} />
      ))}

      {spouseItems.map(({ link, visible, opacity }) => (
        <Line
          key={`${link.fromKey}|${link.toKey}`}
          points={[link.from, link.to]}
          color="#F4A07A"
          lineWidth={1.4}
          transparent
          opacity={opacity}
          visible={visible}
        />
      ))}

      {graph.nodes
        .filter((n) => n.kind !== "presence")
        .map((node) => {
          const visible = isShown(node, visibleGens, visibleBranches);
          return (
            <TreeOrb
              key={node.key}
              node={node}
              visible={visible}
              dimmed={Boolean(related && !related.has(node.id))}
              focused={focusKey === node.key}
              mini={mini}
              onPick={onPickStable}
            />
          );
        })}

      {graph.presenceNodes.map((node) => {
        const visible = isShown(node, visibleGens, visibleBranches);
        return (
          <GhostOrb
            key={node.key}
            node={node}
            visible={visible}
            dimmed={Boolean(related && !related.has(node.id))}
            showLabel={showWhere && !mini}
            onPick={onPickStable}
          />
        );
      })}

      {showWhere &&
        graph.presenceLinks.map((link) => <PresenceArc key={link.toKey} link={link} />)}

      <Suspense fallback={null}>
        {photoNodes.map((node) => (
          <PhotoDisc
            key={node.key}
            url={node.member.photo ?? ""}
            position={[node.pos[0], node.pos[1] + (node.id === LAYOUT.root ? 2.5 : 1.45), node.pos[2]]}
            size={node.id === LAYOUT.root ? 0.9 : 0.5}
          />
        ))}
      </Suspense>

      {!calm && !mini && <Sparkles count={60} scale={[30, 16, 30]} size={2.4} speed={0.2} color="#F4D27A" opacity={0.55} />}
    </>
  );
}

export default function LineageScene(props: LineageSceneProps) {
  const { mini = false, onReady } = props;
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: mini ? [0, 2.5, 22] : [0, 3, 31], fov: 42, near: 0.1, far: 400 }}
        onCreated={() => onReady?.()}
      >
        <TreeWorld {...props} />
      </Canvas>
    </div>
  );
}
