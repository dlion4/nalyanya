/* ── H-1 hero 3D tree teaser — lazy-loaded react-three-fiber scene ─────────
   Root gold orb (Mzee Victor) → 3 branch tubes → branch orbs + grandchildren
   + floating photo planes — kept light: no post-processing, dpr capped,
   lazy mount, auto-rotate paused under reduced-motion.                       */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Float, OrbitControls, Sparkles, useTexture } from "@react-three/drei";
import { HERO_PHOTO } from "../../data/home/landing";
import savannaImg from "../../assets/images/savanna.jpg";
import traditionalGroupImg from "../../assets/images/traditional-group.jpg";

const BRANCHES = [
  { color: "#1F4D3A", emissive: "#2f6b4f", position: [-2.35, 0.52, 0.35] as const, name: "Lineage" },
  { color: "#B5532A", emissive: "#a04a26", position: [0, 0.9, -0.95] as const, name: "Finance" },
  { color: "#6A4C93", emissive: "#5a3e80", position: [2.35, 0.52, 0.35] as const, name: "Memories" },
];

const GRANDCHILDREN = [
  { parent: 0, color: "#1F4D3A", offset: [-0.85, -0.62, 0.35] as const },
  { parent: 0, color: "#4a7a5e", offset: [0.75, -0.58, -0.3] as const },
  { parent: 1, color: "#B5532A", offset: [0, -0.72, -0.55] as const },
  { parent: 1, color: "#d1774e", offset: [0.62, -0.6, 0.4] as const },
  { parent: 2, color: "#6A4C93", offset: [0.8, -0.62, 0.35] as const },
  { parent: 2, color: "#8f74b0", offset: [-0.78, -0.58, -0.3] as const },
];

function Tube({ from, to, color, radius = 0.055 }: {
  from: [number, number, number]; to: [number, number, number]; color: string; radius?: number;
}) {
  const geometry = useMemo(() => {
    const mid = new THREE.Vector3(
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + 0.55,
      (from[2] + to[2]) / 2
    );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      mid,
      new THREE.Vector3(...to),
    ]);
    return new THREE.TubeGeometry(curve, 36, radius, 10, false);
  }, [from[0], from[1], from[2], to[0], to[1], to[2], radius]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.38} metalness={0.18} emissive={color} emissiveIntensity={0.28} />
    </mesh>
  );
}

function Orb({ position, radius, color, emissive, spin = true }: {
  position: readonly [number, number, number] | [number, number, number];
  radius: number; color: string; emissive: string; spin?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current && spin) meshRef.current.rotation.y = state.clock.elapsedTime * 0.45;
  });
  return (
    <group position={position as [number, number, number]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.85} roughness={0.28} metalness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[radius * 1.55, radius * 0.075, 12, 64]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

function FloatingPhoto({ position, scale = 1, src, rotationY = 0 }: {
  position: [number, number, number]; scale?: number; src: string; rotationY?: number;
}) {
  const tex = useTexture(src);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
  }, [tex]);
  return (
    <Billboard position={position} follow={true}>
      <Float speed={1.6} rotationIntensity={0.22} floatIntensity={0.85}>
        <mesh position={[0, 0, -0.045]}>
          <planeGeometry args={[2.06 * scale, 1.5 * scale]} />
          <meshStandardMaterial color="#fffdf7" roughness={0.6} metalness={0} />
        </mesh>
        <mesh rotation={[0, rotationY, 0]}>
          <planeGeometry args={[1.9 * scale, 1.38 * scale]} />
          <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </Float>
    </Billboard>
  );
}

export default function TreeScene({ reduced = false }: { reduced?: boolean }) {
  const branchOrbs = useMemo(() => BRANCHES.map((b) => b.position as [number, number, number]), []);
  const tubes = useMemo(() => BRANCHES.map((b) => ({
    from: [0, 2.05, 0] as [number, number, number],
    to: b.position as [number, number, number],
    color: b.color,
  })), []);
  const granddaughters = useMemo(() => GRANDCHILDREN.map((g) => ({
    from: branchOrbs[g.parent],
    to: [
      branchOrbs[g.parent][0] + g.offset[0],
      branchOrbs[g.parent][1] + g.offset[1],
      branchOrbs[g.parent][2] + g.offset[2],
    ] as [number, number, number],
    color: g.color,
  })), [branchOrbs]);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0.1, 2.1, 8.9], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 9, 7]} intensity={1.35} color="#fff3d6" />
      <directionalLight position={[-7, 4, -5]} intensity={0.45} color="#c9dcc8" />

      {/* gold root — Mzee Victor */}
      <Orb position={[0, 2.62, 0]} radius={0.55} color="#D4A437" emissive="#E9C35A" />
      <mesh position={[0, 2.62, 0]} rotation={[Math.PI / 2.15, 0, 0]}>
        <torusGeometry args={[1.05, 0.035, 12, 96]} />
        <meshStandardMaterial color="#D4A437" emissive="#F3D488" emissiveIntensity={0.9} roughness={0.25} metalness={0.55} />
      </mesh>

      {/* branch tubes + orbs */}
      {tubes.map((t, i) => <Tube key={`tube-${i}`} from={t.from} to={t.to} color={t.color} />)}
      {BRANCHES.map((b, i) => (
        <Orb key={`orb-${i}`} position={b.position as unknown as [number, number, number]} radius={0.34} color={b.color} emissive={b.emissive} />
      ))}

      {/* grandchildren — tiny nodes */}
      {granddaughters.map((g, i) => (
        <group key={`g-${i}`}>
          <Tube from={g.from} to={g.to} color={g.color} radius={0.03} />
          <mesh position={g.to}>
            <sphereGeometry args={[0.13, 28, 28]} />
            <meshStandardMaterial color={g.color} emissive={g.color} emissiveIntensity={0.75} roughness={0.3} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* floating photos — three memories riding the tree */}
      <FloatingPhoto position={[-3.35, 2.8, -1.7]} scale={0.72} src={HERO_PHOTO} />
      <FloatingPhoto position={[3.35, 2.35, -1.9]} scale={0.72} src={savannaImg} />
      <FloatingPhoto position={[0.2, 4.05, -2.6]} scale={0.6} src={traditionalGroupImg} />

      {/* drifting gold dust */}
      <Sparkles count={90} scale={[11, 7.5, 6]} position={[0, 2, -1]} size={2.4} speed={0.32} color="#D4A437" opacity={0.6} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        autoRotate={!reduced}
        autoRotateSpeed={0.85}
        minPolarAngle={0.85}
        maxPolarAngle={1.45}
        target={[0, 1.7, 0]}
      />
    </Canvas>
  );
}
