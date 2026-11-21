/* ── H-2 · 3D generations scene (lazy chunk) ─────────────────────────────────
   Gold root at the apex, then one ring per generation, descending like a
   cone. Lineage threads link each node to its parent ring. Floating photo
   planes drift around the tree. Selecting a generation flies the camera to
   that ring (eased lerp); pointer adds gentle parallax.                   */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Float, Sparkles, useTexture } from "@react-three/drei";
import { GENERATIONS } from "../../../data/home/about";
import reunionImg from "../../../assets/images/reunion.jpg";
import graduationImg from "../../../assets/images/graduation.jpg";
import weddingImg from "../../../assets/images/wedding.jpg";

const NODE_COUNTS = [1, 9, 16, 24, 32];
const LAYOUT = GENERATIONS.map((g, i) => ({
  ...g,
  radius: i === 0 ? 0 : 0.5 + i * 0.95,
  y: 2.2 - i * 0.9,
  count: NODE_COUNTS[i],
}));

function nodePos(gen: number, k: number): [number, number, number] {
  const l = LAYOUT[gen];
  if (gen === 0) return [0, l.y, 0];
  const a = (k / l.count) * Math.PI * 2 + gen * 0.35;
  return [Math.cos(a) * l.radius, l.y, Math.sin(a) * l.radius];
}

function Threads() {
  const positions = useMemo(() => {
    const arr: number[] = [];
    for (let g = 1; g < LAYOUT.length; g++) {
      for (let k = 0; k < LAYOUT[g].count; k++) {
        const parent = Math.floor((k * LAYOUT[g - 1].count) / LAYOUT[g].count);
        arr.push(...nodePos(g, k), ...nodePos(g - 1, parent));
      }
    }
    return new Float32Array(arr);
  }, []);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#D4A437" transparent opacity={0.32} />
    </lineSegments>
  );
}

function Ring({ gen, focus, onSelect }: { gen: number; focus: number | null; onSelect: (g: number) => void }) {
  const l = LAYOUT[gen];
  const group = useRef<THREE.Group>(null);
  const active = focus === gen;
  const dim = focus !== null && !active;
  const nodes = useMemo(() => Array.from({ length: l.count }, (_, k) => nodePos(gen, k)), [gen, l.count]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const s = THREE.MathUtils.lerp(g.scale.x, active ? 1.08 : 1, 0.08);
    g.scale.setScalar(s);
  });

  const over = () => { document.body.style.cursor = "pointer"; };
  const out = () => { document.body.style.cursor = ""; };

  return (
    <group ref={group}>
      {gen > 0 && (
        <>
          <mesh position={[0, l.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[l.radius, active ? 0.022 : 0.012, 8, 128]} />
            <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={active ? 1.4 : 0.6} transparent opacity={dim ? 0.25 : 0.95} />
          </mesh>
          <mesh position={[0, l.y, 0]} rotation={[Math.PI / 2, 0, 0]} onClick={(e) => { e.stopPropagation(); onSelect(gen); }} onPointerOver={over} onPointerOut={out}>
            <torusGeometry args={[l.radius, 0.16, 6, 64]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </>
      )}
      {nodes.map((p, k) => (
        <mesh key={k} position={p} onClick={(e) => { e.stopPropagation(); onSelect(gen); }} onPointerOver={over} onPointerOut={out}>
          <sphereGeometry args={[gen === 0 ? 0.42 : Math.max(0.05, 0.13 - gen * 0.018), 24, 24]} />
          <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={active ? 1.5 : dim ? 0.2 : 0.7} roughness={0.3} metalness={0.3} transparent opacity={dim ? 0.35 : 1} />
        </mesh>
      ))}
      {gen === 0 && (
        <mesh position={[0, l.y, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[0.72, 0.03, 12, 96]} />
          <meshStandardMaterial color="#D4A437" emissive="#F3D488" emissiveIntensity={1.1} metalness={0.6} roughness={0.25} />
        </mesh>
      )}
    </group>
  );
}

function Photo({ src, position, scale = 1 }: { src: string; position: [number, number, number]; scale?: number }) {
  const tex = useTexture(src);
  useEffect(() => { tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true; }, [tex]);
  return (
    <Billboard position={position}>
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.7}>
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[1.62 * scale, 1.18 * scale]} />
          <meshBasicMaterial color="#fffdf7" />
        </mesh>
        <mesh>
          <planeGeometry args={[1.5 * scale, 1.06 * scale]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </Float>
    </Billboard>
  );
}

function Rig({ focus, reduced }: { focus: number | null; reduced: boolean }) {
  const look = useRef(new THREE.Vector3(0, 0.4, 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (focus === null) {
      tmpPos.current.set(0, 3.6, 10.2);
      tmpLook.current.set(0, 0.2, 0);
    } else {
      const l = LAYOUT[focus];
      tmpPos.current.set(l.radius * 0.5 + 0.9, l.y + 1.7, l.radius + 3.4);
      tmpLook.current.set(0, l.y, 0);
    }
    tmpPos.current.x += state.pointer.x * 0.5;
    tmpPos.current.y += state.pointer.y * 0.3;
    const k = reduced ? 1 : 0.045;
    state.camera.position.lerp(tmpPos.current, k);
    look.current.lerp(tmpLook.current, reduced ? 1 : 0.06);
    state.camera.lookAt(look.current);
  });

  return null;
}

export default function GenerationsScene({ focus, onSelect, reduced = false }: {
  focus: number | null; onSelect: (g: number) => void; reduced?: boolean;
}) {
  const rotating = useRef<THREE.Group>(null);
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 3.6, 10.2], fov: 42 }} gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect(-1)} style={{ width: "100%", height: "100%" }}>
      <fog attach="fog" args={["#10201a", 9, 22]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 4, 3]} intensity={30} color="#ffe2a0" />
      <directionalLight position={[-6, 5, -4]} intensity={0.5} color="#9cc7ae" />
      <Rig focus={focus} reduced={reduced} />
      <SpinGroup refObj={rotating} reduced={reduced}>
        <Threads />
        {LAYOUT.map((l) => <Ring key={l.id} gen={l.id} focus={focus} onSelect={onSelect} />)}
        <Photo src={reunionImg} position={[-4.6, 1.6, -1.2]} scale={0.9} />
        <Photo src={graduationImg} position={[4.6, 0.6, -0.8]} scale={0.85} />
        <Photo src={weddingImg} position={[0.4, 3.9, -3.2]} scale={0.75} />
      </SpinGroup>
      <Sparkles count={120} scale={[14, 8, 10]} position={[0, 0.5, 0]} size={2} speed={0.25} color="#D4A437" opacity={0.55} />
    </Canvas>
  );
}

function SpinGroup({ children, refObj, reduced }: { children: React.ReactNode; refObj: React.RefObject<THREE.Group | null>; reduced: boolean }) {
  useFrame((_, dt) => { if (refObj.current && !reduced) refObj.current.rotation.y += dt * 0.07; });
  return <group ref={refObj}>{children}</group>;
}
