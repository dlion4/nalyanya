# Nalyanya — Home Pages Build Prompt (H-1 → H-7)

Paste this into Claude. Attach (or point it to) `nalyanyaMO.md`. It builds the 7 public
home pages ONE per turn — H-1 first — and waits for your go-ahead before every next page.

---

You are building Nalyanya, a warm heritage-first family platform (lineage · finance ·
memories) for the Nalyanya family rooted at Mzee Victor Nalyanya. The full blueprint is
`nalyanyaMO.md` (7 home pages H-1..H-7, 8 auth, 16 dashboard). THIS PROMPT builds ONLY
the 7 home pages, one per turn, starting with H-1.

**THIS PHASE IS FRONTEND-ONLY:** no backend. Every page runs on local typed mock data
(`src/data/*.ts`); every integration section (M-Pesa, WhatsApp, Google Drive, SMS) is
built in full but its submit resolves to a designed, clearly-labeled "Ready — connects
when the backend is wired" / SIMULATED state — never a fake "Sent" claim.

## STACK (install on first build — never change)
- TanStack Start + React 19 + Vite; TanStack Router (typed file routes, search-param
  overlays), TanStack Query for all server state (queryFn reads from local mock services
  — never HTTP), TanStack Table where tables appear.
- Bootstrap 6 if it installs cleanly today; else pin `bootstrap@5.3.x` + Bootstrap Icons.
  Light mode DEFAULT (`data-bs-theme="light"`). No jQuery; import Bootstrap JS per
  route only when needed.
- Page-scoped CSS: global tokens in `src/styles/tokens.css` + ONE stylesheet per route
  (`src/styles/pages/<page>.css` — mount on enter, remove on leave), every selector
  scoped under `.page-<route>`, page classes prefixed `.ny-`.
- Motion / rendering — ADVANCED but FAST:
  - Framer Motion: drawer/modal/section transitions + reveal staggers.
  - GSAP: hero fly-through / parallax accents ONLY (H-1 hero). Keep timelines short,
    kill them on unmount, never run GSAP on off-screen elements.
  - react-three-fiber (`@react-three/fiber`) + `@react-three/drei` + `three`: the H-1
    3D tree teaser canvas — LAZY route-loaded (dynamic import) so it never blocks first
    paint; falls back to a static SVG under `prefers-reduced-motion` or WebGL failure.
  - CSS keyframes + `IntersectionObserver` for everything else (reveals, hovers,
    count-ups) — cheaper than JS, keeps the main thread free.
- Forms: React Hook Form + Zod. Charts: Recharts (sparklines, progress rings).

## PERFORMANCE — fastest load, no waiting for resources
- Fonts: preload only the Fraunces + Inter subsets actually used above the fold;
  `font-display: swap`; never ship full font families.
- Heavy libs (3D bundle, GSAP) are dynamic-imported per route — the landing shell
  (text + hero copy + CTAs) paints FIRST; the 3D teaser mounts after idle.
- Images: lazy-load with a blur/LQIP placeholder, `loading="lazy"` + `decoding="async"`,
  serve WebP/AVIF mock assets; never block LCP.
- No render-blocking third-party scripts. Skeletons during mock-fetch (300–800ms fake
  latency) so the page feels instant and structured.
- LCP < 1.5s on 4G, CLS ~ 0, INP < 200ms. Verify with Lighthouse mobile before declaring
  a page done.
- `prefers-reduced-motion` → snap count-ups, static SVG tree (no 3D), no parallax, no
  GSAP fly-through. Elder Mode forces reduced-motion ON.

## DESIGN SYSTEM (locked — warm heritage, do not improvise)
- Light-first, warm cream surfaces, flat and confident. **No gradients** on
  buttons/cards — depth comes from 1px hairlines, soft shadows, spacing. At most one
  subtle radial glow behind a hero.
- Colors (CSS vars only, never raw hex in .tsx): surfaces `--surface-0 #FAF6EE` ·
  `--surface-1 #FFFFFF` · `--surface-2 #F2ECDE` · `--surface-3 #E8E0CC`; brand evergreen
  `#1F4D3A`, mzee gold `#D4A437` (1st generation), terracotta `#B5532A`, success
  `#2E7D32`, danger `#C62828`, warning `#E0A82E`, foundation violet `#6A4C93`; text
  `#1A2618` / `#5A6B57` / `#8A9686`.
- Type: Fraunces (display headings), Inter (UI + tabular-nums for any number), body
  1rem floor, line-height 1.55 (1.8 in Elder Mode).
- Motion: 160–240ms ease-out standard; count-up on stats; reveal-on-scroll via
  IntersectionObserver; hover-lift on cards; signature gold flash on "received" deltas.

## QUALITY BAR — a page is DONE only when ALL true
1. **Zero dead ends**: every button/link/nav/CTA navigates to a real route or fires a
   visible action (toast/state change). No `href="#"`, no empty handlers, no "coming
   soon".
2. **No blank anything**: loading = skeletons; error = designed panel with retry;
   empty = designed empty state with a working CTA.
3. **Zero errors**: no console errors, zero network requests, build + typecheck pass,
   renders at 1440 / 768 / 360px, every `<Link to>` exists in the route tree.
4. **Real-feeling data**: realistic Kenyan family mock — Mzee Victor Nalyanya as root,
  real Kenyan names (Brian Otieno Nalyanya, Faith Chebet Nalyanya, Hamza Hassan
  Nalyanya…), EAT dates, KES via `kes()`, +254 phones, real counties (Bungoma,
  Kakamega, Nairobi, Trans-Nzoia). Never lorem ipsum, never "John Doe".

## WORKING PROTOCOL — one page per turn
- I name the page (first: H-1). Build ONLY that page. Do not build future pages "while
  you're at it".
- BEFORE code: re-read that page's spec in `nalyanyaMO.md` (e.g. "PAGE H-1") + §2
  tokens; re-read `src/styles/tokens.css` and one already-built page's stylesheet for
  consistency. Reuse shared components — never duplicate or restyle them.
- If scaffolding doesn't exist yet (`tokens.css`, MarketingNav, app shell, mock data per
  §9, shared components per §7), create it as part of H-1, then build the page.
- Nav/footer links to pages not built yet must still resolve: tiny designed stub route
  ("opens in a later step" + link home). Never a 404, never blank.
- When done: run build, run Lighthouse mobile, fix everything, then STOP and reply with
  a 3-line report (what built · files created · verification incl. Lighthouse scores).
  Wait for my "next" instruction.

## NALYANYA RULES (apply where relevant)
- **Old and young together**: every page renders cleanly in Elder Mode (test it); copy
  is plain language ("our family" not "the lineage collective").
- Family/branch context switcher in the nav; reflected in the URL where relevant.
- Integration CTAs (M-Pesa, WhatsApp, Google Drive) render fully but resolve SIMULATED
  with a visible badge — never fake success.
- Family, not corporate: warm, personal, heritage voice in all copy.

## FIRST PAGE — H-1 Landing (`/`)
Implement every section from `nalyanyaMO.md` "PAGE H-1": navbar (logo · About ·
Professions · Foundation · Events · Gallery · Contact · Sign in · Join the family) →
hero ("Our roots. Our people. One home." + dual CTA + lazy 3D tree teaser canvas that
auto-rotates, static SVG fallback under reduced-motion) → trust bar (M-Pesa ready ·
WhatsApp broadcasts · Google Drive gallery · PIN-only receive for elders · AES-256
vault Phase 2) → 3 feature cards (3D Lineage / Family Finance / Memories, hover-lift)
→ elder-mode strip → CTA + footer with real nav links. Set up the theme scaffolding
(`tokens.css`, MarketingNav, mock data) as part of H-1, verify against the quality bar,
report, and stop.
