import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Aperture, ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import type { Memory } from "@/types/workspace";
import { heroSizes, photoSrcSet } from "@/utils/photos";

export function IrisPhoto({
  slides,
  initial = 0,
  className = "",
  children,
  onChange,
  priority = false,
}: {
  slides: Memory[];
  initial?: number;
  className?: string;
  children?: ReactNode;
  onChange?: (index: number) => void;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(initial);
  const current = slides[index] || slides[0];
  const { reduced } = useWorkspace();
  const iris = useRef<SVGSVGElement>(null);
  const frame = useRef(0);
  const busy = useRef(false);
  const alive = useRef(true);
  const touchX = useRef(0);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      cancelAnimationFrame(frame.current);
    };
  }, []);
  const step = useCallback(
    async (direction: number) => {
      if (busy.current) return;
      busy.current = true;
      const next = (index + direction + slides.length) % slides.length;
      const asset = new Image();
      asset.sizes = className.includes("welcome")
        ? heroSizes
        : "(max-width: 760px) 94vw, 712px";
      asset.srcset = photoSrcSet(slides[next].image);
      asset.src = slides[next].image;
      try {
        await asset.decode();
      } catch {
        /* The browser still provides the image's accessible description. */
      }
      if (!alive.current) return;
      const swap = () => {
        setIndex(next);
        onChange?.(next);
      };
      if (reduced || !iris.current) {
        swap();
        busy.current = false;
        return;
      }
      const svg = iris.current;
      svg.style.visibility = "visible";
      const blades = Array.from(svg.querySelectorAll("polygon"));
      let swapped = false;
      const start = performance.now();
      // Each blade shares the next blade's inner vertex, leaving a real octagonal aperture.
      const draw = (now: number) => {
        const t = Math.min(1, (now - start) / 760);
        const openness =
          t < 0.45 ? 1 - t / 0.45 : t < 0.55 ? 0 : (t - 0.55) / 0.45;
        const radius = (151 * (1 - Math.cos(Math.PI * openness))) / 2;
        const spin = ((1 - openness) * 37 * Math.PI) / 180;
        const point = (r: number, angle: number) =>
          `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
        blades.forEach((blade, i) => {
          const a = (i * Math.PI) / 4 + spin;
          const b = a + Math.PI / 4;
          blade.setAttribute(
            "points",
            [
              point(radius, a),
              point(radius, b),
              point(270, b + 0.5),
              point(270, a + 0.5),
            ].join(" "),
          );
        });
        if (t >= 0.47 && !swapped) {
          swap();
          swapped = true;
        }
        if (t < 1) frame.current = requestAnimationFrame(draw);
        else {
          svg.style.visibility = "hidden";
          busy.current = false;
        }
      };
      frame.current = requestAnimationFrame(draw);
    },
    [index, slides, reduced, onChange, className],
  );
  return (
    <div
      className={`ny-iris-photo ${className}`}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Family photographs"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          void step(e.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const delta = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(delta) > 55) void step(delta < 0 ? 1 : -1);
      }}
    >
      <img
        className={`ny-lens-image lens-${current.id}`}
        src={current.image}
        srcSet={photoSrcSet(current.image)}
        sizes={
          className.includes("welcome")
            ? heroSizes
            : "(max-width: 760px) 94vw, 712px"
        }
        alt={current.alt}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="ny-lens-shade" />
      <svg
        ref={iris}
        className="ny-shutter"
        viewBox="-100 -100 200 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <polygon
            key={i}
            fill={["#19241f", "#1c2722", "#202c25", "#263129"][i % 4]}
            stroke="#344039"
            strokeWidth=".5"
          />
        ))}
      </svg>
      {children}
      <div className="ny-lens-controls">
        <Aperture size={14} />
        <span aria-live="polite">
          {String(index + 1).padStart(2, "0")}
          <b> / </b>
          {String(slides.length).padStart(2, "0")}
        </span>
        <button aria-label="Previous photograph" onClick={() => void step(-1)}>
          <ChevronLeft size={16} />
        </button>
        <button aria-label="Next photograph" onClick={() => void step(1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
