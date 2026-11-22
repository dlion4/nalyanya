import { useId, useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { compact, financeHistory, kes } from "@/data/dashboard/command-center";
import { useWorkspace } from "@/state/Workspace";

function curve(points: number[][]) {
  return points.reduce((d, p, i) => {
    if (!i) return `M${p[0]},${p[1]}`;
    const prev = points[i - 1],
      before = points[i - 2] || prev,
      after = points[i + 1] || p;
    return `${d} C${prev[0] + (p[0] - before[0]) / 6},${prev[1] + (p[1] - before[1]) / 6} ${p[0] - (after[0] - prev[0]) / 6},${p[1] - (after[1] - prev[1]) / 6} ${p[0]},${p[1]}`;
  }, "");
}
export function FinancePanel() {
  const w = useWorkspace();
  const [range, setRange] = useState("6");
  const [series, setSeries] = useState<"balance" | "inflow" | "outflow">(
    "balance",
  );
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const [showSacco, setShowSacco] = useState(true);
  const data = useMemo(() => {
    const count =
      range === "1" ? 14 : range === "3" ? 21 : range === "12" ? 30 : 32;
    return financeHistory
      .slice(-count)
      .map((v, i) =>
        series === "balance"
          ? v
          : series === "inflow"
            ? 24 + v * 0.63 + Math.sin(i * 1.2) * 7
            : 15 + v * 0.33 + Math.sin(i * 0.9) * 11,
      );
  }, [range, series]);
  const endValue =
    series === "balance"
      ? w.balance
      : series === "inflow"
        ? w.contributionTotal
        : Math.round(w.contributionTotal * 0.37);
  const ceiling =
    Math.ceil(endValue / (endValue > 500000 ? 500000 : 50000)) *
    (endValue > 500000 ? 500000 : 50000);
  const points = data.map((v, i) => [
    (i * 590) / (data.length - 1),
    133 - (v / data[data.length - 1]) * (endValue / ceiling) * 124,
  ]);
  const line = curve(points);
  const secondary = curve(
    points.map(([x, y], i) => [
      x,
      133 - (133 - y) * 0.33 - Math.sin(i * 0.51) * 2,
    ]),
  );
  const labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    if (range === "1") {
      d.setDate(d.getDate() - (5 - i) * 5);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Nairobi",
      });
    }
    d.setDate(1);
    d.setMonth(d.getMonth() - Math.round(((5 - i) * (Number(range) - 1)) / 5));
    return d.toLocaleDateString("en-GB", {
      month: "short",
      timeZone: "Africa/Nairobi",
    });
  });
  return (
    <section className="ny-panel ny-finance-panel" aria-label="Family finances">
      <div className="ny-section-heading">
        <h2>Family finances</h2>
        <label className="ny-range-select">
          <span className="sr-only">Chart period</span>
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value);
              setHover(null);
            }}
          >
            <option value="1">Last month</option>
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last year</option>
            <option value="24">All time</option>
          </select>
          <ChevronDown size={12} />
        </label>
      </div>
      <div className="ny-finance-label">
        <select
          aria-label="Financial measure"
          value={series}
          onChange={(e) => {
            setSeries(e.target.value as typeof series);
            setHover(null);
          }}
        >
          <option value="balance">Total family balance</option>
          <option value="inflow">Contributions in</option>
          <option value="outflow">Family outflows</option>
        </select>
        <ChevronDown size={11} />
      </div>
      <div className="ny-finance-total">
        <span className="currency">KES</span>
        <strong>{endValue.toLocaleString("en-KE")}</strong>
        <span className="ny-growth">
          <TrendingUp size={12} />
          {series === "balance" ? "12.8" : series === "inflow" ? "8.4" : "3.2"}%
        </span>
      </div>
      <div className="ny-chart-wrap">
        <div className="ny-y-ticks">
          {[1, 0.6667, 0.3333, 0].map((v) => (
            <span key={v}>{compact(v * ceiling)}</span>
          ))}
        </div>
        <div
          className="ny-chart-plot"
          tabIndex={0}
          role="img"
          aria-label={`${series} over the selected period. Current value ${kes(endValue)}. Use arrow keys to inspect data.`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              setHover(
                Math.min(
                  data.length - 1,
                  Math.max(
                    0,
                    (hover ?? data.length - 1) +
                      (e.key === "ArrowRight" ? 1 : -1),
                  ),
                ),
              );
            }
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHover(
              Math.min(
                data.length - 1,
                Math.max(
                  0,
                  Math.round(
                    ((e.clientX - rect.left) / rect.width) * (data.length - 1),
                  ),
                ),
              ),
            );
          }}
          onMouseLeave={() => setHover(null)}
          onBlur={() => setHover(null)}
        >
          <svg
            viewBox="0 0 590 140"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`area${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#799e78" stopOpacity=".34" />
                <stop offset="1" stopColor="#a1b798" stopOpacity=".025" />
              </linearGradient>
            </defs>
            {[9, 50, 92, 133].map((y) => (
              <line
                key={y}
                x1="0"
                x2="590"
                y1={y}
                y2={y}
                stroke="#e6e9e1"
                strokeDasharray="3 4"
                strokeWidth="1"
              />
            ))}
            <path d={`${line} L590,133 L0,133 Z`} fill={`url(#area${id})`} />
            <motion.path
              key={`${range}${series}`}
              d={line}
              fill="none"
              stroke="#4c7653"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              initial={w.reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.95, ease: "easeOut" }}
            />
            {showSacco && (
              <path
                d={secondary}
                fill="none"
                stroke="#c5a161"
                strokeWidth="1.8"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {hover !== null && points[hover] && (
              <g>
                <line
                  x1={points[hover][0]}
                  x2={points[hover][0]}
                  y1="0"
                  y2="134"
                  stroke="#8fa18b"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={points[hover][0]}
                  cy={points[hover][1]}
                  r="4"
                  fill="#315b3a"
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
          {hover !== null && (
            <div
              className="ny-chart-tooltip"
              style={{
                left: `${Math.max(13, Math.min(87, (hover / (data.length - 1)) * 100))}%`,
              }}
            >
              {kes((endValue * data[hover]) / data[data.length - 1])}
            </div>
          )}
          <div className="ny-x-ticks">
            {labels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="ny-chart-footer">
        <div className="ny-chart-legend">
          <span>
            <i />
            Family wallet
          </span>
          <button
            onClick={() => setShowSacco(!showSacco)}
            aria-pressed={showSacco}
            className={!showSacco ? "muted" : ""}
          >
            <i />
            Sacco savings
          </button>
        </div>
        <button
          className="ny-text-link"
          onClick={() => w.go("/dashboard/finances")}
        >
          Finances
          <ArrowUpRight size={13} />
        </button>
      </div>
    </section>
  );
}
