/* ── Nalyanya crest — gold-root / three-branch mark, used in nav + footer ── */

export function Crest({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <rect x="1" y="1" width="42" height="42" rx="12" fill="#1F4D3A" />
      <circle cx="22" cy="11.5" r="5" fill="#D4A437" />
      <circle cx="22" cy="11.5" r="8.2" fill="none" stroke="#D4A437" strokeWidth="1.4" opacity="0.6" />
      <path d="M22 16 C 15 22 11 26 10.5 31" fill="none" stroke="#F2ECDE" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 16 C 22 22 22 27 22 31" fill="none" stroke="#F2ECDE" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 16 C 29 22 33 26 33.5 31" fill="none" stroke="#F2ECDE" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10.5" cy="33.5" r="2.6" fill="#F2ECDE" />
      <circle cx="22" cy="33.5" r="2.6" fill="#F2ECDE" />
      <circle cx="33.5" cy="33.5" r="2.6" fill="#F2ECDE" />
    </svg>
  );
}
