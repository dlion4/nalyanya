/* ── H-3 · 3D trades constellation (lazy chunk) ─────────────────────────────
   A gold "family" core, twelve trade orbs on a ring, tubes between them.
   Selecting a trade flies the camera toward that orb.                     */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { CATEGORIES } from "../../../data/home/professions";

function orbPos(i: number): [number, number, number] {
  const a = (i / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * 3.5, Math.sin(i * 0.9) * 0.45, Math.sin(a) * 3.5];
}

function Tubes({ active }: { active: number }) {
  const positions = useMemo(() => {
    const arr: number[] = [];
    CATEGORIES.forEach((_, i) => arr.push(0, 0.3, 0, ...orbPos(i)));
    return new Float32Array(arr);
  }, []);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#D4A437" transparent opacity={active < 0 ? 0.35 : 0.2} />
    </lineSegments>
  );
}

function Orb({ i, active, onSelect }: { i: number; active: number; onSelect: (i: number) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const cat = CATEGORIES[i];
  const on = active === i;
  const dim = active >= 0 && !on;
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const target = on ? 0.42 : 0.26;
    m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, target / 0.26, dt * 4));
  });
  return (
    <mesh
      ref={ref}
      position={orbPos(i)}
      onClick={(e) => { e.stopPropagation(); onSelect(i); }}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <sphereGeometry args={[0.26, 32, 32]} />
      <meshStandardMaterial color={cat.color} emissive={cat.color} emissiveIntensity={on ? 1.4 : dim ? 0.15 : 0.55} transparent opacity={dim ? 0.35 : 1} roughness={0.3} metalness={0.25} />
    </mesh>
  );
}

function Spin({ active, reduced, children }: { active: number; reduced: boolean; children: React.ReactNode }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (spin.current && !reduced && active < 0) spin.current.rotation.y += dt * 0.08; });
  return <group ref={spin}>{children}</group>;
}

function Rig({ active, reduced }: { active: number; reduced: boolean }) {
  const look = useRef(new THREE.Vector3());
  const goal = useRef(new THREE.Vector3());
  useFrame((state) => {
    if (active < 0) goal.current.set(state.pointer.x * 0.8, 2.4 + state.pointer.y * 0.3, 8.4);
    else {
      const [x, y, z] = orbPos(active);
      goal.current.set(x * 0.55 + 0.4, y + 1.5, z * 0.55 + 4.2);
    }
    const k = reduced ? 1 : 0.05;
    state.camera.position.lerp(goal.current, k);
    const lookAt = active < 0 ? new THREE.Vector3(0, 0.2, 0) : new THREE.Vector3(...orbPos(active));
    look.current.lerp(lookAt, reduced ? 1 : 0.06);
    state.camera.lookAt(look.current);
  });
  return null;
}

export default function TradesScene({ activeIndex, onSelectIndex, reduced = false }: {
  activeIndex: number; onSelectIndex: (i: number) => void; reduced?: boolean;
}) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 2.4, 8.4], fov: 42 }} gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelectIndex(-1)} style={{ width: "100%", height: "100%" }}>
      <color attach="background" args={["#102018"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={28} color="#ffe2a0" />
      <Rig active={activeIndex} reduced={reduced} />
      <Spin active={activeIndex} reduced={reduced}>
        <Float speed={1.2} floatIntensity={0.3}>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.55, 40, 40]} />
            <meshStandardMaterial color="#D4A437" emissive="#E9C35A" emissiveIntensity={0.9} roughness={0.28} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[0.9, 0.025, 12, 80]} />
            <meshStandardMaterial color="#F3D488" emissive="#D4A437" emissiveIntensity={0.8} />
          </mesh>
        </Float>
        <Tubes active={activeIndex} />
        {CATEGORIES.map((c, i) => <Orb key={c.id} i={i} active={activeIndex} onSelect={onSelectIndex} />)}
      </Spin>
      <Sparkles count={70} scale={[10, 5, 10]} size={2} speed={0.25} color="#D4A437" opacity={0.5} />
    </Canvas>
  );
}
