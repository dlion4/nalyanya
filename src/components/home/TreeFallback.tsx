/* ── H-1 hero static SVG tree fallback — identical layout to the 3D scene,
   used under reduced-motion, Elder Mode, or when WebGL is unavailable. ─── */

export default function TreeFallback({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 420" className={className} role="img" aria-label="Static family tree — gold root with three branches">
      <defs>
        <radialGradient id="ny-root" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#F3D488" />
          <stop offset="45%" stopColor="#D4A437" />
          <stop offset="100%" stopColor="#B8862A" />
        </radialGradient>
        <radialGradient id="ny-leaf" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#3E7757" />
          <stop offset="100%" stopColor="#1F4D3A" />
        </radialGradient>
        <radialGradient id="ny-terracotta" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#D1774E" />
          <stop offset="100%" stopColor="#B5532A" />
        </radialGradient>
        <radialGradient id="ny-violet" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#8F74B0" />
          <stop offset="100%" stopColor="#6A4C93" />
        </radialGradient>
      </defs>

      {/* branch tubes */}
      <path d="M210 96 C 130 150 96 232 78 288" fill="none" stroke="#1F4D3A" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d="M210 96 C 210 160 210 214 210 248" fill="none" stroke="#B5532A" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d="M210 96 C 290 150 324 232 342 288" fill="none" stroke="#6A4C93" strokeWidth="6" strokeLinecap="round" opacity="0.9" />

      {/* grandchildren sprigs */}
      <path d="M78 288 C 60 322 54 330 50 344" fill="none" stroke="#3E7757" strokeWidth="3" strokeLinecap="round" />
      <path d="M78 288 C 96 320 104 330 110 344" fill="none" stroke="#4A7A5E" strokeWidth="3" strokeLinecap="round" />
      <path d="M210 248 C 210 292 208 330 208 344" fill="none" stroke="#D1774E" strokeWidth="3" strokeLinecap="round" />
      <path d="M342 288 C 360 322 366 330 372 344" fill="none" stroke="#8F74B0" strokeWidth="3" strokeLinecap="round" />
      <path d="M342 288 C 322 320 314 330 308 344" fill="none" stroke="#6A4C93" strokeWidth="3" strokeLinecap="round" />

      {/* grandchildren dots */}
      <circle cx="50" cy="352" r="7" fill="#1F4D3A" />
      <circle cx="112" cy="352" r="7" fill="#4A7A5E" />
      <circle cx="208" cy="352" r="7" fill="#B5532A" />
      <circle cx="372" cy="352" r="7" fill="#6A4C93" />
      <circle cx="306" cy="352" r="7" fill="#8F74B0" />

      {/* branch orbs */}
      <circle cx="78" cy="288" r="22" fill="url(#ny-leaf)" />
      <circle cx="78" cy="288" r="30" fill="none" stroke="#1F4D3A" strokeWidth="2.5" opacity="0.55" />
      <circle cx="210" cy="246" r="22" fill="url(#ny-terracotta)" />
      <circle cx="210" cy="246" r="30" fill="none" stroke="#B5532A" strokeWidth="2.5" opacity="0.55" />
      <circle cx="342" cy="288" r="22" fill="url(#ny-violet)" />
      <circle cx="342" cy="288" r="30" fill="none" stroke="#6A4C93" strokeWidth="2.5" opacity="0.55" />

      {/* root orb — Mzee Victor */}
      <circle cx="210" cy="78" r="34" fill="url(#ny-root)" />
      <circle cx="210" cy="78" r="46" fill="none" stroke="#D4A437" strokeWidth="3" opacity="0.75" />
      <circle cx="210" cy="78" r="56" fill="none" stroke="#D4A437" strokeWidth="1.5" strokeDasharray="4 9" opacity="0.45" />

      {/* sparkles */}
      <g fill="#D4A437" opacity="0.8">
        <circle cx="52" cy="120" r="3" />
        <circle cx="368" cy="150" r="3" />
        <circle cx="330" cy="60" r="2.5" />
        <circle cx="92" cy="52" r="2.5" />
        <circle cx="196" cy="26" r="2.5" />
      </g>
    </svg>
  );
}
