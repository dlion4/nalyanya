# Nalyanya — Home Pages Build Prompt (H-1 → H-7) — Tailwind edition

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

## STACK (install on first build — never change) — TAILWIND, NOT BOOTSTRAP
- TanStack Start + React 19 + Vite; TanStack Router (typed file routes, search-param
  overlays), TanStack Query (queryFn reads local mock services — never HTTP), TanStack
  Table where tables appear.
- **Tailwind CSS v4** (latest) — CSS-first config: `@import "tailwindcss"` + the
  `@tailwindcss/vite` plugin. ALL design tokens declared once inside `@theme` in
  `src/styles/tokens.css`, so `bg-surface-0`, `text-brand-primary`, `font-display`,
  `rounded-md`, `shadow-lift`, `ease-out`, `duration-base` work as native utilities. JIT
  ships only the classes you actually use → tiny CSS, no purge config. Light mode
  DEFAULT. **No Bootstrap anywhere** — zero `bootstrap` import, zero Bootstrap classes.
- **Icons: Lucide React** (tree-shakeable). **Primitives: @headlessui/react** for
  accessible Dialog (modal/drawer), Menu (nav menus, Actions dropdowns), Tabs,
  Disclosure (accordion), Listbox/Combobox (selects) — styled with Tailwind utilities +
  Framer Motion transitions. No jQuery.
- Page-scoped CSS: ONE stylesheet per route (`src/styles/pages/<page>.css`) holding
  `@layer components` bespoke styles under the `.page-<route>` root class + page-specific
  `@keyframes`; mounted on route enter, removed on leave (zero leakage). Tailwind
  utilities are global; bespoke page styles stay scoped. Page classes prefixed `.ny-`.
- Motion / rendering — ADVANCED, RESPONSIVE, ANIMATED, 3D, SUPER DESIGNED — but FAST:
  - Framer Motion: modal/drawer/section transitions + reveal staggers + `layout`
    (Flip) animations.
  - GSAP: hero fly-through / parallax accents ONLY (H-1 hero). Short timelines, kill on
    unmount, never on off-screen elements.
  - react-three-fiber (`@react-three/fiber`) + `@react-three/drei` + `three`: the H-1
    3D tree teaser canvas — LAZY route-loaded (dynamic import) so it never blocks first
    paint; falls back to a static SVG under `prefers-reduced-motion` or WebGL failure.
  - **Tailwind built-in 3D utilities** for depth: `perspective-[1200px]`,
    `transform-3d`, `rotate-x-6`, `rotate-y-12`, `translate-z-12`, `backface-hidden` —
    tilts on feature cards, parallax hero layers, glassmorphic floating panels.
  - **Glassmorphic HUD panels** (the floating-over-content pattern):
    `backdrop-blur-xl bg-surface-1/70 border border-white/15 shadow-lift rounded-lg` —
    used for the floating navbar and the hero CTA cluster over the 3D teaser canvas.
    Tasteful, not on every surface.
  - CSS keyframes + `IntersectionObserver` for reveals/hovers/count-ups — cheap,
    main-thread-light.
- Forms: React Hook Form + Zod. Charts: Recharts (sparklines, progress rings).

## PERFORMANCE — fastest load, no waiting for resources
- Fonts: preload only the Fraunces + Inter subsets used above the fold;
  `font-display: swap`; never ship full families.
- Heavy libs (3D bundle, GSAP) dynamic-imported per route — the landing shell (text +
  hero copy + CTAs) paints FIRST; the 3D teaser mounts after idle.
- Images: lazy-load with blur/LQIP placeholder, `loading="lazy"` + `decoding="async"`,
  WebP/AVIF mock assets; never block LCP.
- Tailwind v4 JIT → CSS is only the classes used (a few KB); no render-blocking
  third-party scripts. Skeletons during mock-fetch (300–800ms fake latency) so pages
  feel instant.
- LCP < 1.5s on 4G, CLS ~ 0, INP < 200ms. Verify with Lighthouse mobile before declaring
  a page done.
- `prefers-reduced-motion` → snap count-ups, static SVG tree (no 3D), no parallax, no
  GSAP fly-through, no card tilts. Elder Mode forces reduced-motion ON.

## DESIGN SYSTEM (locked — warm heritage + super designed, do not improvise)
- Light-first, warm cream surfaces, flat and confident. Buttons/cards = flat solids (no
  gradients); at most one subtle radial glow behind a hero. Depth comes from 1px
  hairlines (`border`), soft shadows (`shadow-*` tokens), spacing, **and tasteful 3D
  tilts on hero/feature elements** (keep tilt ≤ ~6° — polish, not gimmick).
- Colors (declared in `@theme` as `--color-*`, used as `bg-*`/`text-*`/`border-*` —
  never raw hex in .tsx): surfaces `--color-surface-0 #FAF6EE` · `--color-surface-1
  #FFFFFF` · `--color-surface-2 #F2ECDE` · `--color-surface-3 #E8E0CC`; brand evergreen
  `--color-brand-primary #1F4D3A`, mzee gold `--color-brand-accent #D4A437`, terracotta
  `--color-brand-secondary #B5532A`, success `#2E7D32`, danger `#C62828`, warning
  `#E0A82E`, foundation violet `#6A4C93`; text `--color-text-primary #1A2618` /
  `--color-text-secondary #5A6B57` / `--color-text-tertiary #8A9686`.
- Type: `--font-display` Fraunces (headings), `--font-sans` Inter (UI + `tabular-nums`
  for numbers); body 1rem floor, leading 1.55 (1.8 in Elder Mode).
- Motion tokens in `@theme`: `--ease-out`, `--duration-fast/base/slow`, `--animate-*`;
  count-up on stats; reveal-on-scroll via IntersectionObserver; signature gold flash on
  "received" deltas.
- Responsive: Tailwind breakpoints `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.
  Elder Mode via `[data-ny-mode="elder"]` bumping `--font-*` and `--min-touch` (56px).

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
  tokens; re-read `src/styles/tokens.css` (the `@theme` block) and one already-built
  page's stylesheet for consistency. Reuse shared components — never duplicate or
  restyle them.
- If scaffolding doesn't exist yet (`tokens.css` with `@theme`, MarketingNav, app shell,
  mock data per §9, shared components per §7, the `.ny-btn/.ny-input/.ny-card` component
  layer in `@layer components`), create it as part of H-1, then build the page.
- Nav/footer links to pages not built yet must still resolve: tiny designed stub route
  ("opens in a later step" + link home). Never a 404, never blank.
- When done: run build + Lighthouse mobile, fix everything, then STOP and reply with a
  3-line report (what built · files created · verification incl. Lighthouse scores).
  Wait for my "next" instruction.

## NALYANYA RULES (apply where relevant)
- **Old and young together**: every page renders cleanly in Elder Mode (test it); copy
  is plain language ("our family" not "the lineage collective").
- Family/branch context switcher in the nav; reflected in the URL where relevant.
- Integration CTAs (M-Pesa, WhatsApp, Google Drive) render fully but resolve SIMULATED
  with a visible badge — never fake success.
- Family, not corporate: warm, personal, heritage voice in all copy.

## FIRST PAGE — H-1 Landing (`/`)
Implement every section from `nalyanyaMO.md` "PAGE H-1": **glassmorphic floating navbar**
(`backdrop-blur-xl bg-surface-1/70 border-b border-white/15`, logo · About · Professions
· Foundation · Events · Gallery · Contact · Sign in · Join the family) over a full-bleed
hero → hero ("Our roots. Our people. One home." + dual CTA in a glass cluster + lazy 3D
tree teaser canvas behind, `perspective-[1200px] transform-3d` parallax layers,
auto-rotate, static SVG fallback under reduced-motion) → trust bar (M-Pesa ready ·
WhatsApp broadcasts · Google Drive gallery · PIN-only receive for elders · AES-256 vault
Phase 2) → 3 feature cards (3D Lineage / Family Finance / Memories,
`hover:-translate-y-1 hover:rotate-y-3 hover:translate-z-4 transition duration-200
ease-out` tilt) → elder-mode strip → CTA + footer with real nav links. Set up the theme
scaffolding (`tokens.css` `@theme`, MarketingNav, mock data, `.ny-*` component layer) as
part of H-1, verify against the quality bar, report, and stop.
