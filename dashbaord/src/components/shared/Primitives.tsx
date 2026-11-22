import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useWorkspace } from "@/state/Workspace";

export function IconBox({
  icon: Icon,
  tone = "sage",
  size = 17,
}: {
  icon: LucideIcon;
  tone?: string;
  size?: number;
}) {
  return (
    <span className={`ny-icon-box tone-${tone}`}>
      <Icon size={size} strokeWidth={1.65} />
    </span>
  );
}
export function SectionTitle({
  children,
  action,
  onClick,
}: {
  children: ReactNode;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="ny-section-heading">
      <h2>{children}</h2>
      {action && (
        <button className="ny-text-link" onClick={onClick}>
          {action}
          <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}
export function Simulated() {
  return (
    <span className="ny-simulated">
      <FlaskConical size={11} /> SIMULATED
    </span>
  );
}
export function Avatar({
  name,
  image,
  size = 34,
  color = 0,
}: {
  name: string;
  image?: string;
  size?: number;
  color?: number;
}) {
  return (
    <span
      className={`ny-avatar avatar-${color % 5}`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {image ? (
        <img src={image} alt="" width={size} height={size} loading="lazy" />
      ) : (
        name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
      )}
    </span>
  );
}
export function Sparkline({
  values,
  color = "#729779",
  fill = false,
}: {
  values: number[];
  color?: string;
  fill?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const min = Math.min(...values),
    max = Math.max(...values);
  const points = values
    .map(
      (v, i) =>
        `${(i * 79) / (values.length - 1)},${26 - ((v - min) / (max - min || 1)) * 22}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 80 30" className="ny-sparkline" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <polygon points={`0,30 ${points} 79,30`} fill={`url(#${id})`} />}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Count({ value }: { value: number }) {
  const { reduced } = useWorkspace();
  const [shown, setShown] = useState(value);
  const previous = useRef(value);
  useEffect(() => {
    const start = previous.current;
    previous.current = value;
    if (reduced || start === value) {
      setShown(value);
      return;
    }
    let frame = 0;
    const t = performance.now();
    const draw = (now: number) => {
      const p = Math.min(1, (now - t) / 650);
      setShown(Math.round(start + (value - start) * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);
  return <>{shown.toLocaleString("en-KE")}</>;
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reduced } = useWorkspace();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-text-secondary">
      <Check className="mt-0.5 shrink-0 text-brand-primary" size={16} />
      {children}
    </p>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="ny-empty">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
