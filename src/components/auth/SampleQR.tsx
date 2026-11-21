/* ── SampleQR — deterministic decorative QR that decodes to nothing ──────────
   Used anywhere the blueprint asks for a "QR stub": 2FA enrolment, receive
   links, elder explainer. Always paired with a SIMULATED label.            */

import { useMemo } from "react";

export default function SampleQR({ seed, size = 148, caption }: { seed: string; size?: number; caption?: string }) {
  const cells = useMemo(() => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    const out: boolean[][] = [];
    const rand = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 0xffffffff; };
    for (let r = 0; r < 21; r++) { out.push(Array.from({ length: 21 }, () => rand() > 0.52)); }
    const finder = (r: number, c: number) => {
      for (let dr = -1; dr < 8; dr++) for (let dc = -1; dc < 8; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < 21 && cc >= 0 && cc < 21) out[rr][cc] = false;
      }
      for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++)
        out[r + dr][c + dc] = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
    };
    finder(0, 0); finder(0, 14); finder(14, 0);
    return out;
  }, [seed]);

  const u = size / 21;
  return (
    <figure className="auth-qr m-0 inline-block">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Sample QR code — decodes nothing">
        {cells.flatMap((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c * u} y={r * u} width={u} height={u} fill="#1F4D3A" /> : null))}
      </svg>
      {caption && <figcaption className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary">{caption}</figcaption>}
    </figure>
  );
}
