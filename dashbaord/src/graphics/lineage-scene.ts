import * as THREE from "three";

export type TreeNode = {
  id: string;
  label: string;
  parent?: string;
  x: number;
  y: number;
  z: number;
  depth: number;
  image?: string;
};
export type TreeApi = {
  dispose(): void;
  focus(id: string): void;
  zoom(direction: number): void;
  reset(): void;
};
export function mountTree(
  host: HTMLElement,
  nodes: TreeNode[],
  select: (id: string) => void,
): TreeApi {
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2", {
    failIfMajorPerformanceCaveat: true,
    alpha: true,
    antialias: true,
  });
  if (!gl) throw new Error("Use the accessible SVG tree on this device.");
  const renderer = new THREE.WebGLRenderer({
    canvas: probe,
    context: gl,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setClearColor(0, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(),
    group = new THREE.Group();
  scene.add(group);
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  cam.position.set(0, 0, 10.2);
  const target = new THREE.Vector3();
  const targetCam = new THREE.Vector3(0, 0, 10.2);
  const sprites: THREE.Sprite[] = [];
  const resources: { dispose(): void }[] = [];
  let alive = true;
  for (const n of nodes) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const paint = (image?: HTMLImageElement) => {
      ctx.clearRect(0, 0, 256, 256);
      ctx.save();
      ctx.beginPath();
      ctx.arc(128, 128, 117, 0, Math.PI * 2);
      ctx.fillStyle = ["#bd9d55", "#637e5d", "#788b70", "#928464", "#79958c"][
        n.depth % 5
      ];
      ctx.fill();
      ctx.clip();
      if (image) ctx.drawImage(image, 9, 9, 238, 238);
      else {
        ctx.fillStyle = "#f5efda";
        ctx.font = "500 100px Georgia";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.label.startsWith("Mzee") ? "V" : n.label[0], 128, 133);
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(128, 128, 118, 0, Math.PI * 2);
      ctx.strokeStyle = n.depth === 0 ? "#e6cc91" : "#c4d1b9";
      ctx.lineWidth = 8;
      ctx.stroke();
    };
    paint();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const node = new THREE.Sprite(material);
    const s = n.depth === 0 ? 0.65 : 0.48;
    node.scale.set(s, s, 1);
    node.position.set(n.x, n.y, n.z);
    node.userData.id = n.id;
    group.add(node);
    sprites.push(node);
    resources.push(texture, material);
    if (n.image) {
      const img = new Image();
      img.onload = () => {
        if (alive) {
          paint(img);
          texture.needsUpdate = true;
        }
      };
      img.src = n.image;
    }
    const label = document.createElement("canvas");
    label.width = 512;
    label.height = 80;
    const lc = label.getContext("2d")!;
    lc.fillStyle = "#edf2df";
    lc.font = "32px Arial";
    lc.textAlign = "center";
    lc.fillText(n.label, 256, 48);
    const lt = new THREE.CanvasTexture(label);
    const lm = new THREE.SpriteMaterial({
      map: lt,
      transparent: true,
      depthWrite: false,
    });
    const text = new THREE.Sprite(lm);
    text.scale.set(2.54, 0.4, 1);
    text.position.set(n.x, n.y - 0.4, n.z + 0.03);
    group.add(text);
    resources.push(lt, lm);
    const p = nodes.find((v) => v.id === n.parent);
    if (p) {
      const start = new THREE.Vector3(p.x, p.y, p.z),
        end = new THREE.Vector3(n.x, n.y, n.z);
      const path = new THREE.CubicBezierCurve3(
        start,
        new THREE.Vector3(p.x, p.y - 0.72, p.z),
        new THREE.Vector3(n.x, n.y + 0.78, n.z),
        end,
      );
      const geometry = new THREE.TubeGeometry(path, 28, 0.015, 4, false);
      const mat = new THREE.MeshBasicMaterial({
        color: n.depth < 2 ? "#c6ae75" : "#8ba782",
        transparent: true,
        opacity: 0.8,
      });
      group.add(new THREE.Mesh(geometry, mat));
      resources.push(geometry, mat);
    }
  }
  let baseDistance = 10.2;
  const resize = () => {
    const width = Math.max(1, host.clientWidth),
      height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    cam.aspect = width / height;
    baseDistance = Math.max(
      9.3,
      9.5 / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * cam.aspect),
    );
    cam.updateProjectionMatrix();
    targetCam.z = baseDistance;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  let dragging = false,
    downX = 0,
    downY = 0,
    lastX = 0,
    lastDrag = 0;
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const down = (e: PointerEvent) => {
    dragging = true;
    downX = lastX = e.clientX;
    downY = e.clientY;
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (dragging) {
      group.rotation.y += (e.clientX - lastX) * 0.008;
      lastX = e.clientX;
      lastDrag = performance.now();
    }
  };
  const up = (e: PointerEvent) => {
    dragging = false;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, cam);
    const hit = ray.intersectObjects(sprites)[0];
    if (hit) select(hit.object.userData.id);
  };
  renderer.domElement.addEventListener("pointerdown", down);
  renderer.domElement.addEventListener("pointermove", move);
  renderer.domElement.addEventListener("pointerup", up);
  let previous = 0;
  const look = new THREE.Vector3();
  renderer.setAnimationLoop((time) => {
    if (document.hidden || time - previous < 32) return;
    const delta = Math.min((time - previous) / 1000, 0.05);
    previous = time;
    if (!dragging && time - lastDrag > 8000) group.rotation.y += delta * 0.027;
    cam.position.lerp(targetCam, 0.075);
    look.lerp(target, 0.075);
    cam.lookAt(look);
    renderer.render(scene, cam);
  });
  return {
    focus(id) {
      const n = nodes.find((v) => v.id === id);
      if (n) {
        group.rotation.y = 0;
        sprites.forEach((sprite) => {
          sprite.material.opacity = sprite.userData.id === id ? 1 : 0.45;
          sprite.material.color.set(
            sprite.userData.id === id ? 0xffe7a8 : 0xffffff,
          );
        });
        target.set(n.x, n.y, n.z);
        targetCam.set(n.x, n.y + 0.15, baseDistance * 0.68);
        lastDrag = performance.now();
      }
    },
    zoom(direction) {
      targetCam.z = Math.max(4.5, Math.min(20, targetCam.z - direction * 1.4));
    },
    reset() {
      sprites.forEach((sprite) => {
        sprite.material.opacity = 1;
        sprite.material.color.set(0xffffff);
      });
      target.set(0, 0, 0);
      targetCam.set(0, 0, baseDistance);
      group.rotation.y = 0;
    },
    dispose() {
      alive = false;
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up);
      resources.forEach((r) => r.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
