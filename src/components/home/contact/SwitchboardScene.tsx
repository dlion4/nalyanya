/* ── H-7 · 3D message switchboard (lazy chunk) ──────────────────────────────
   A gold "family office" hub, the six people a note can go to, and a glowing
   tube to each. Choosing a route flies the camera to that person and sends
   bright packets down their tube. People carry numbered badges (01–06) that
   match the glass list beside the canvas — nothing is downloaded at runtime. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { ROUTES } from "../../../data/home/contact";

const HUB: [number, number, number] = [0, 0.7, 0];
const RING = 3.7;
const COUNT = ROUTES.length;
const FOV = 42;
const TAN = Math.tan((FOV / 2) * (Math.PI / 180));

function endPoint(i: number): [number, number, number] {
  const a = (i / COUNT) * Math.PI * 2 + Math.PI / 2;
  return [Math.cos(a) * RING, 0.7 + (i % 2 === 0 ? 0.18 : -0.12), Math.sin(a) * RING];
}

const CURVES = ROUTES.map((_, i) => {
  const end = endPoint(i);
  return new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...HUB),
    new THREE.Vector3(end[0] / 2, Math.max(HUB[1], end[1]) + 1, end[2] / 2),
    new THREE.Vector3(...end)
  );
});
const TUBES = CURVES.map((c) => new THREE.TubeGeometry(c, 48, 0.035, 8, false));

const GOAL = new THREE.Vector3(0, 6.8, 11.7);
const LOOK = new THREE.Vector3(0, 0.4, 0);
const TARGET = new THREE.Vector3(0, 0.4, 0);

function makeBadgeTexture(n: number, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(11, 22, 16, 0.92)";
    ctx.stroke();
    ctx.fillStyle = "#0b1610";
    ctx.font = "700 54px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n).padStart(2, "0"), 64, 68);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function CursorGuard() {
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return null;
}

/* camera: idle orbit that follows the pointer, eased fly-to when a route is chosen */
function Rig({ active, shift }: { active: number; shift: number }) {
  useEffect(() => { LOOK.set(0, 0.4, 0); }, []);
  useFrame((state) => {
    const aspect = state.size.width / Math.max(1, state.size.height);
    const pad = aspect < 1.25 ? Math.min(1.9, 1.25 / aspect) : 1;
    if (active < 0) {
      GOAL.set(state.pointer.x * 0.9, 6.8 + state.pointer.y * 0.4, 11.7).multiplyScalar(pad);
      TARGET.set(0, 0.4, 0);
    } else {
      const e = endPoint(active);
      GOAL.set(e[0] * (0.9 + 0.6 * pad), e[1] + 2.4 * pad, e[2] * (0.9 + 0.6 * pad));
      TARGET.set(e[0] * 0.55, 0.4 + e[1] * 0.55, e[2] * 0.55);
    }
    if (shift > 0) {
      // leave room for the glass list on the right: slide the whole view left
      const s = shift * 2 * GOAL.distanceTo(TARGET) * TAN * aspect;
      GOAL.x += s;
      TARGET.x += s;
    }
    state.camera.position.lerp(GOAL, 0.05);
    LOOK.lerp(TARGET, 0.06);
    state.camera.lookAt(LOOK);
  });
  return null;
}

function TubeMesh({ i, on, dim }: { i: number; on: boolean; dim: boolean }) {
  const color = ROUTES[i].color;
  return (
    <mesh geometry={TUBES[i]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={on ? 1.5 : dim ? 0.25 : 0.7} roughness={0.4} metalness={0.1} transparent opacity={dim ? 0.3 : 1} />
    </mesh>
  );
}

/* light packets travelling office → person */
function Packets({ i, count, speed, size, color, opacity }: { i: number; count: number; speed: number; size: number; color: string; opacity: number }) {
  const curve = CURVES[i];
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    for (let k = 0; k < count; k++) {
      const m = meshes.current[k];
      if (m) curve.getPoint((t + k / count) % 1, m.position);
    }
  });
  return (
    <>
      {Array.from({ length: count }, (_, k) => (
        <mesh key={k} ref={(el) => { meshes.current[k] = el; }}>
          <sphereGeometry args={[size, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
    </>
  );
}

function Person({ i, on, dim, onSelect }: { i: number; on: boolean; dim: boolean; onSelect: (i: number) => void }) {
  const orb = useRef<THREE.Mesh>(null);
  const route = ROUTES[i];
  const tex = useMemo(() => makeBadgeTexture(i + 1, route.color), [i, route]);
  useEffect(() => () => tex.dispose(), [tex]);
  const over = () => { document.body.style.cursor = "pointer"; };
  const out = () => { document.body.style.cursor = ""; };
  const pick = (e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(i); };

  useFrame((state) => {
    const m = orb.current;
    if (m) m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, on ? 1.3 + Math.sin(state.clock.elapsedTime * 4) * 0.05 : 1, 0.12));
  });

  return (
    <group position={endPoint(i)}>
      <mesh ref={orb} onClick={pick} onPointerOver={over} onPointerOut={out}>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color={route.color} emissive={route.color} emissiveIntensity={on ? 1.3 : dim ? 0.25 : 0.7} roughness={0.3} metalness={0.2} transparent opacity={dim ? 0.45 : 1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.018, 8, 48]} />
        <meshStandardMaterial color={route.color} emissive={route.color} emissiveIntensity={on ? 1.2 : 0.5} transparent opacity={dim ? 0.25 : 0.9} />
      </mesh>
      <sprite position={[0, 0.72, 0]} scale={[0.5, 0.5, 1]} renderOrder={10}>
        <spriteMaterial map={tex} transparent depthTest={false} depthWrite={false} opacity={dim ? 0.6 : 1} />
      </sprite>
      {/* generous, invisible hit area so the person is easy to tap */}
      <mesh onClick={pick} onPointerOver={over} onPointerOut={out}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Hub() {
  return (
    <group position={HUB}>
      <Float speed={1.4} floatIntensity={0.3} rotationIntensity={0.1}>
        <mesh>
          <sphereGeometry args={[0.52, 48, 48]} />
          <meshStandardMaterial color="#D4A437" emissive="#E9C35A" emissiveIntensity={0.95} roughness={0.28} metalness={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.86, 0.025, 12, 80]} />
          <meshStandardMaterial color="#F3D488" emissive="#D4A437" emissiveIntensity={0.9} />
        </mesh>
      </Float>
    </group>
  );
}

export default function SwitchboardScene({ activeIndex, onSelect, running, shift = 0 }: {
  activeIndex: number; onSelect: (i: number) => void; running: boolean; shift?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 6.8, 11.7], fov: FOV }}
      gl={{ antialias: true, alpha: true }}
      frameloop={running ? "always" : "never"}
      onPointerMissed={() => onSelect(-1)}
      style={{ width: "100%", height: "100%" }}
    >
      <CursorGuard />
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 5, 3]} intensity={30} color="#ffe2a0" />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} color="#9cc7ae" />
      <Rig active={activeIndex} shift={shift} />
      <gridHelper args={[18, 18, "#2c5443", "#193026"]} position={[0, -0.35, 0]} />
      <Hub />
      {ROUTES.map((r, i) => {
        const on = i === activeIndex;
        const dim = activeIndex >= 0 && !on;
        return (
          <group key={r.id}>
            <TubeMesh i={i} on={on} dim={dim} />
            <Packets i={i} count={3} speed={0.12} size={0.05} color={r.color} opacity={dim ? 0.15 : 0.45} />
            {on && <Packets i={i} count={5} speed={0.3} size={0.085} color="#FFE9A8" opacity={1} />}
            <Person i={i} on={on} dim={dim} onSelect={onSelect} />
          </group>
        );
      })}
      <Sparkles count={60} scale={[11, 5, 11]} position={[0, 0.8, 0]} size={2} speed={0.25} color="#D4A437" opacity={0.5} />
    </Canvas>
  );
}
