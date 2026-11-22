# Nalyanya — Family Lineage, Finance & Memory Platform Outline
## One Family · Many Generations · Roots Deep · Branches Connected · Old and Young Together
> A warm, heritage-first family platform for the Nalyanya family (and any family that joins): a living 3D family tree rooted at Mzee Victor Nalyanya — where every member can be a father in one branch, an uncle in another, a son in another, a grandson in another — alongside family events & activities, a gallery of memories, obituaries, contributions (weddings, sickness, fundraising, projects), family finances (chama, merry-go-round, a family Sacco with shares and loans), a finance-access layer with no-login PIN+OTP receive links so elders who are not tech-savvy can receive money in one tap, comprehensive loans (individual & family, short-term & long-term, salary advances), the Nalyanya Foundation for academic and medical charity, records, a professions & expertise directory (family, workers, friends), broadcast communications routed to SMS or WhatsApp, an admin-gated account page, and settings.
>
> **Old and young, together.** Every screen is designed so a grandparent on a basic smartphone and a grandchild on a laptop both understand it in seconds: large readable type, warm cream surfaces, clear buttons, a simplified "Elder Mode", and a PIN-only receive link that needs no login.
>
> **Revision 1 — FRONTEND-ONLY — TanStack Start + Bootstrap 5.3.x + page-scoped CSS + 3D lineage (react-three-fiber) + motion system.** Seven public home pages, eight auth/onboarding pages (including lineage/family selection and family creation when a lineage does not yet exist), and ONE master family dashboard (16 pages, 7+ sections each). Every route resolves to exactly one CSS file under `src/styles/pages/` — strict 1-to-1 page-to-stylesheet mapping, scoped isolation, zero style leakage.
>
> **Frontend-only phase:** NO backend exists yet. Every page runs on local typed mock data (`src/data/*.ts`). Every integration section (M-Pesa Daraja, bank EFT, Africa's Talking SMS, WhatsApp Cloud API, Google Drive image pulls, Resend email, OTP delivery) is BUILT in full — forms, validation, capability matrices, status badges — but their final submit calls NOTHING real: it resolves to a designed, clearly-labeled "Ready — connects when the backend is wired" / SIMULATED state. A local service layer (`src/services/*.ts`) carries the exact function signatures the future REST/socket API will have, so wiring the backend later changes only the service files — zero page code touched. Paper/local flows (chama rounds, Sacco share accrual, loan origination, allocations, ledger postings, the 3D tree) fully simulate so the product feels alive.
>
> Design companions: `learnlyMO.md` and `ostradeMO.md` share the same document grammar (tokens, page blocks, 1-to-1 stylesheet mapping, page-by-page build prompts). Nalyanya carries its own warm-heritage design system (light-first cream surfaces, Fraunces serif display + Inter body, evergreen + mzee-gold palette, 3D lineage motion).

---

## TABLE OF CONTENTS

```
1.  PROJECT OVERVIEW & ARCHITECTURE
2.  GLOBAL STYLING SYSTEM  (warm-heritage palette + Bootstrap 5.3.x + page-scoped CSS + 3D motion)
3.  INTEGRATION & API MAP  (frontend-only stubs: M-Pesa, banks, SMS, WhatsApp, Google Drive, email, OTP)
4.  HOME PAGES (7)  — landing · about · professions · foundation · events · gallery · contact
5.  AUTH & ONBOARDING PAGES (8) — incl. lineage/family chooser + family-creation wizard
6.  FAMILY DASHBOARD PAGES (16) — 7+ SECTIONS EACH  — incl. 3D LINEAGE TREE
7.  SHARED COMPONENTS
8.  STATE MANAGEMENT
9.  DATA SCHEMA  (frontend mock shapes)
10. LINEAGE & FAMILY-TREE ENGINE  (3D scene, generations, multi-branch relations, member preview)
11. FINANCE ENGINE  (chama · merry-go-round · Sacco shares · loans · allocations · contributions · ledger)
12. EVENTS & ACTIVITIES ENGINE  (RSVP, scheduling, reminders, photo albums)
13. COMMUNICATIONS & BROADCAST ENGINE  (compose → channel routing SMS/WhatsApp/email/in-app)
14. ACCESS, SECURITY & RBAC ENGINE  (PIN receive links, OTP, 2FA, family roles, admin-gated fields)
15. ACCESSIBILITY & INCLUSION ENGINE  (Elder Mode, large text, high contrast, simplified flows, voice)
16. NOTIFICATIONS & COMMS  (in-app / email / SMS / WhatsApp / push)
17. COMPLETE PAGE INDEX
18. IMPLEMENTATION PHASES
```

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

### 1.1 Tech Stack

```
FRONTEND (TanStack-first — THIS PHASE):
Framework:       TanStack Start  (server functions + file-based routing)
Router:          TanStack Router  (type-safe routes, loaders, search params,
                 code-split route components + assets; deep-linkable overlays
                 via search params — drawers/wizards write to the URL)
Server State:    TanStack Query  (queryFn reads from LOCAL MOCK services in
                 src/services/*.ts — never HTTP in this phase; mutations are
                 optimistic against the local mock store; 300–800ms fake
                 latency so skeletons and optimistic states are visible)
Tables:          TanStack Table v8  (members, contributions, loans, ledger,
                 events, records — sorting, filtering, pagination, row
                 selection, expandable rows, stacked-card collapse < md)
UI Library:      Bootstrap 5.3.x (latest stable) + Bootstrap Icons.
                 Bootstrap 6 (6.0.0-alpha.x) may be tried; if a component
                 misbehaves, pin 5.3.x — same CSS-variable token API.
                 Light mode DEFAULT (`data-bs-theme="light"`); dark theme
                 available; persists in localStorage.
Custom CSS:      Page-scoped stylesheets — ONE per route, 1-to-1 file mapping
                 (31 pages → 31 stylesheets + 1 app-shell = 32). Every
                 selector scoped under the page root class .page-<route>,
                 page classes prefixed .ny-. Mounted on route enter,
                 removed on route leave — zero style leakage.
Forms:           React Hook Form + Zod  (schema reuse for client + future server)
3D Lineage:      react-three-fiber (@react-three/fiber) + @react-three/drei
                 (OrbitControls/CameraControls, Html, Tube, Line, Text,
                 Billboard, Environment) + Three.js — LAZY route-loaded
                 (code-split) so the rest of the app stays light. Static 2D
                 SVG tree fallback under prefers-reduced-motion and on
                 devices that fail WebGL.
Charts:          Recharts (KPI sparklines, equity/share curves, contribution
                 progress rings) + Lightweight-Charts only if needed.
Animation:       Framer Motion (drawer/modal/wizard transitions, 3D camera
                 tweens via drei) + CSS keyframes + Bootstrap collapse/tab.
Build:           Vite (TanStack Start default)

ACCESSIBILITY-FIRST CHOICES:
Base font:       1rem (16px) default; "Elder Mode" toggle boosts to 1.125rem
                 and increases touch targets to 56px and line-height to 1.8.
Contrast:        WCAG AA minimum everywhere; AAA where text is small.
Touch targets:   minimum 44px standard, 56px in Elder Mode.
Motion:          prefers-reduced-motion honored site-wide (snap count-ups,
                 static 2D tree fallback, no auto-rotate, no parallax).

BACKEND (Phase 2 — NOT built now; signatures reserved in src/services/*):
Runtime:         Node.js 20 LTS + Express 4  (or TanStack Start server fns)
Database:        PostgreSQL 16 (Prisma ORM)
Cache:           Redis 7 (sessions, OTP codes, rate-limit tokens,
                 idempotency keys, receive-link PIN attempts)
Auth:            Auth.js (credentials) + JWT refresh + TOTP 2FA +
                 per-member 4-digit receive PIN (separate from login)
Queue:           BullMQ (broadcast fanout, scheduled reminders, statement
                 generation, image sync jobs, chama round rotation)
Storage:         S3-compatible (gallery images cached from Google Drive,
                 obituary photos, document uploads)
Mailer:          React Email + Resend (transactional + digests)
SMS:             Africa's Talking (Kenya-first; transactional + OTP)
WhatsApp:        WhatsApp Cloud API (broadcasts + 1:1)
Money:           M-Pesa Daraja B2C/B2B/STK Push, Airtel Money, Kenyan bank
                 EFT/RTGS, internal ledger transfer
Images:          Google Drive API (read-only gallery pull by folder ID;
                 OAuth per family in Phase 2 — for now, mock image URLs)
Timezone:        Africa/Nairobi (EAT, UTC+3) default — all events, schedules,
                 chama rounds, digests, birth/death dates honor EAT.
```

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Phase 1 — frontend-only)                    │
│                                                                              │
│   TanStack Router (typed file routes, search-param overlays)                 │
│        │                                                                     │
│        ├─── HOME (7):  / · /about · /professions · /foundation ·             │
│        │              /events · /gallery · /contact                          │
│        ├─── AUTH (8):  /auth/signup · /signin · /onboard · /create-family    │
│        │              · /forgot-password · /reset-password · /verify-otp     │
│        │              · /2fa                                                  │
│        └─── DASHBOARD (16): /dashboard · /lineage · /members · /events ·     │
│                  /gallery · /obituaries · /contributions · /finances ·       │
│                  /finance-access · /loans · /foundation · /records ·         │
│                  /professions · /communications · /account · /settings       │
│                                                                              │
│   TanStack Query ──► src/services/*.ts  (LOCAL MOCK — no HTTP)               │
│        │                                                                     │
│        ├─── lineageService    (members, relations, branches, 3D graph data)  │
│        ├─── financeService    (chama, sacco, loans, allocations, ledger)     │
│        ├─── eventsService     (events, RSVPs, albums)                        │
│        ├─── contributionsService                                              │
│        ├─── commsService      (broadcasts, channel routing)                  │
│        ├─── obituariesService · galleryService · recordsService              │
│        ├─── professionsService · accountService · notificationsService       │
│        └─── accessService     (PIN receive links, OTP simulation)            │
│                                                                              │
│   Local state (Zustand): uiStore · contextStore (active family/lineage/      │
│   branch + Elder Mode + LIVE/READ-ONLY) · draftStore (in-progress loan/      │
│   contribution/broadcast drafts survive route changes).                      │
│                                                                              │
│   Local simulators (no server):                                              │
│        ├─── lineage 3D scene (react-three-fiber, camera rig)                 │
│        ├─── tick/sync simulator (balances, share accrual, chama rotation)    │
│        └─── BroadcastChannel (kill-switch / elder-mode sync across tabs)     │
│                                                                              │
│   Page-scoped CSS:  src/styles/pages/<page>.css  (mount on enter,            │
│                      remove on leave, scoped under .page-<route>)            │
└─────────────────────────────────────────────────────────────────────────────┘
                  │  (Phase 2 — not now)
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Node/Express · PostgreSQL/Prisma · Redis · BullMQ · M-Pesa Daraja ·         │
│  Africa's Talking SMS · WhatsApp Cloud API · Google Drive API · Resend ·     │
│  S3 · Auth.js + 2FA + receive-PIN vault                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Architecture Principle

```
ONE FAMILY, MANY BRANCHES, ONE TRUTH.
Nalyanya is the unification layer on top of a family's scattered life: one
member graph (a Person can sit in multiple branches — father here, uncle
there, son elsewhere), one ledger (every shilling in/out posted double-
entry), one calendar (every event, contribution deadline, chama round,
loan instalment in EAT), one broadcast bus (one compose → many channels),
one records journal (every action attributed and auditable). Pages are
LENSES on the same underlying graph — switch the "active context"
(family · lineage · branch) in the top bar and every page re-scopes.

OLD AND YOUNG TOGETHER:
Every page ships a standard view AND an "Elder Mode" rendering: larger
type, fewer controls, bigger touch targets, plain language, PIN-first
flows. The finance-access page generates a no-login receive link
(/r/:token) so a non-tech elder receives money by entering a 4-digit PIN
+ an OTP — no app, no login, no confusion.

FRONTEND-ONLY DISCIPLINE:
Integration sections render completely (forms, fields, validation,
capability matrices) but submit to a labeled "connects when the backend
is wired" state — never a fake "Sent to M-Pesa" claim. Local money
flows (chama rotation, Sacco share accrual, loan origination, allocation
release) fully simulate so the product feels alive. Every service
function in src/services/*.ts has the exact signature the real API will
have, so Phase 2 is a drop-in swap with zero page-code changes.
```

### 1.4 UI Framework & Styling System (Expanded)

```
BOOTSTRAP 5.3.x RESPONSIVE BASE:
Grid:             container / row / col-* with sm-md-lg-xl-xxl breakpoints
Components:       card, table, modal, offcanvas, accordion, toast, dropdown,
                  nav-tabs, progress, badge, navbar, collapse, scrollspy,
                  tab, popover, tooltip, stepper
Utilities:        spacing (m-*, p-*, gap-*), flex (d-flex, gap-*), display
                  (d-none, d-md-block), rounded-4, shadow-*, text-bg-*,
                  opacity-*, ratio
Breakpoints:      sm 576px / md 768px / lg 992px / xl 1200px / xxl 1400px
Theme:            light DEFAULT (`data-bs-theme="light"`); dark available;
                  persists in localStorage; Elder Mode is an orthogonal
                  toggle (size/spacing/contrast) that works in either theme
Form controls:    form-control, form-select, input-group, form-check,
                  floating labels, validation states (is-valid/is-invalid);
                  large variant (.form-control-lg) used liberally for
                  accessibility
Offcanvas:        right-side detail drawers (member detail, contribution
                  detail, loan detail, event detail, obituary detail) via
                  offcanvas-end on mobile; full-screen modal on sm
No jQuery — Bootstrap JS bundle imported per route (only when needed)

PAGE-SCOPED CUSTOM CSS (1-to-1 FILE MAPPING):
Convention:       one stylesheet per page/route — 31 pages → 31 stylesheets
File location:    src/styles/pages/<route>.css
e.g. /dashboard/lineage       → src/styles/pages/dash-lineage.css
e.g. /dashboard/loans         → src/styles/pages/dash-loans.css
e.g. /dashboard/finance-access→ src/styles/pages/dash-finance-access.css
Namespacing:      every selector scoped under .page-<route> root class
                 .page-dash-lineage { … }
                 .page-dash-loans { … }
Layer order:      1) Bootstrap 5.3 (CDN/compiled)
                 2) Global design tokens (src/styles/tokens.css)
                 3) Shared component CSS (src/styles/components/*.css)
                 4) Page-scoped stylesheet (mounted at route enter)
Injection lifecycle:
                 TanStack Router createFileRoute() loader →
                 inject <link> into <head> →
                 on route leave: remove the <link> + clear cached styles
                 Guarantees no style leaks across pages.
Hot-reload:       Vite HMR wires the page stylesheet to its route component.

ANIMATION SYSTEM (warm, calm, accessible):
Page entrance:    fade + slide-up stagger (70ms per item, capped at 12)
Micro-interact:   hover-lift + soft shadow on cards; gentle scale (1.01) on
                  member-tree node hover; focus-ring always visible
Data motion:      number count-up on KPI cards (1.2s ease-out, tabular-nums);
                  progress rings draw on contribution/loan cards (600ms)
3D LINEAGE (signature, T-2):
Camera dolly:     600–900ms ease-in-out focus on a member node; orbit drag;
                  scroll-to-zoom; "fit to family" zoom-out; gentle auto-
                  rotate (0.5 rpm) when idle for 8s; pause on hover/scroll
Node reveal:      selected node scales up, branch tubes brighten, siblings
                  dim; Html overlay card slides in
Fallback:         prefers-reduced-motion OR WebGL unavailable → static 2D
                  SVG tree with the SAME navigation (click node → detail
                  drawer), no auto-rotate, no parallax, instant focus
ROW FLASH:        .ny-flash-received (gold 800ms) on allocation/contribution
                  received · .ny-flash-posted (green 800ms) on ledger entry
                  · .ny-flash-overdue (red 800ms) on overdue loan
LIVE DOTS:        .ny-pulse on active chama round · live contribution tally
                  · broadcast in-flight · 3D "listening" indicator
A11y:             prefers-reduced-motion → disable count-up (snap), tree
                  auto-rotate, draw-ins, parallax; keep opacity transitions
                  and instant focus; Elder Mode forces this on by default

RESPONSIVE CARD & SECTION SYSTEM:
KPI rows:          row-cols-1 row-cols-md-2 row-cols-xl-4  → 1/2/4 column flow
Card grids:        row-cols-1 row-cols-sm-2 row-cols-lg-3  → 1/2/3 flow
Tables-to-cards:   on < md breakpoint, tables collapse to stacked card
                  layout using data-label attributes (CSS ::before content)
Sidebar:           fixed on xl+; offcanvas on < xl with backdrop
Top bar:           sticky; global family-context switcher + Elder Mode
                  toggle + notifications bell always visible
Form layout:       vertical stack on sm, horizontal label on md+
Drawer panels:     slide-in from right on lg+, full-screen modal on sm
3D canvas:         full-width, 60vh on < lg, 78vh on lg+; overlay controls
                  collapse to a bottom sheet on sm
Elder Mode:        enlarges KPI value font, simplifies tables to cards
                  always, hides secondary actions behind one "More" button,
                  shows PIN-link QR codes larger
```

---

## 2. GLOBAL STYLING SYSTEM

> Single source of truth for Nalyanya's design tokens, motion tokens, and page-scoped CSS lifecycle. Any sibling file MUST inherit this section verbatim.

### 2.1 Design Tokens

```
COLOR TOKENS (CSS custom properties on :root + [data-bs-theme="dark"]):

/* Brand — Heritage Evergreen + Mzee Gold (warm, rooted, light-first) */
--brand-primary:        #1F4D3A;   /* heritage evergreen — family tree, roots, growth */
--brand-primary-rgb:   31, 77, 58;
--brand-accent:        #D4A437;   /* mzee gold — heritage, sunlight, 1st generation */
--brand-accent-rgb:   212, 164, 55;
--brand-secondary:     #B5532A;   /* terracotta clay — earth, secondary CTA */
--brand-success:       #2E7D32;   /* contribution received, loan approved, share accrued */
--brand-danger:        #C62828;   /* overdue, declined, blocked */
--brand-warning:       #E0A82E;   /* pending, grace, approaching deadline */
--brand-info:          #1976D2;   /* informational, in-progress */
--brand-purple:        #6A4C93;   /* foundation & charity, grants */

/* Semantic surface tokens (light-first; flip in dark mode) */
--surface-0:           #FAF6EE;   /* warm cream page bg (light default) → #141812 (dark) */
--surface-1:           #FFFFFF;   /* card bg (light) → #1C241D (dark) */
--surface-2:           #F2ECDE;   /* nested bg (light) → #232B23 (dark) */
--surface-3:           #E8E0CC;   /* hover/active bg (light) → #2C352C (dark) */
--border-subtle:       rgba(60, 45, 20, 0.10);
--border-strong:       rgba(60, 45, 20, 0.22);

/* Text */
--text-primary:        #1A2618;   /* deep forest ink → #E8EEE6 (dark) */
--text-secondary:      #5A6B57;
--text-tertiary:       #8A9686;
--text-on-brand:       #FAF6EE;   /* cream text on green/gold buttons */
--text-on-accent:      #1A2618;   /* dark text on gold */

/* Family-branch palette (lineage/branch badges + 3D tree branch tubes) */
--branch-1:  #1F4D3A;  /* evergreen — main Nalyanya line */
--branch-2:  #B5532A;  /* terracotta */
--branch-3:  #6A4C93;  /* plum */
--branch-4:  #1E6091;  /* deep ocean */
--branch-5:  #8B6F1A;  /* antique gold */
--branch-6:  #A03B2C;  /* rust */
--branch-7:  #2E7D32;  /* sage */
--branch-8:  #4A4A8C;  /* indigo */
--branch-9:  #9C5A1A;  /* copper */
--branch-10: #5B3A29;  /* walnut */

/* Generation palette (3D tree depth rings — root = mzee gold) */
--gen-1:  #D4A437;  /* 1st generation — Mzee Victor Nalyanya (root) */
--gen-2:  #1F4D3A;  /* evergreen */
--gen-3:  #1E6091;  /* ocean */
--gen-4:  #6A4C93;  /* plum */
--gen-5:  #B5532A;  /* terracotta */
--gen-6:  #2E7D32;  /* sage */
--gen-7:  #8B6F1A;  /* antique gold */

/* Relationship / role palette (member role chips + tree node rings) */
--role-head:     #1F4D3A;  /* family head / admin */
--role-elder:    #8B6F1A;  /* elder */
--role-parent:   #1F4D3A;
--role-spouse:   #B5532A;
--role-child:    #1E6091;
--role-sibling:  #2E7D32;
--role-extended: #6A4C93;  /* uncle / aunt / cousin / nephew / niece */
--role-inlaw:    #4A4A8C;  /* in-law */
--role-adopted:  #9C5A1A;
--role-ward:     #A03B2C;
--role-minor:    #5B3A29;

/* Event-type palette */
--evt-wedding:    #B5532A;
--evt-funeral:    #4A4A4A;
--evt-birthday:   #D4A437;
--evt-graduation: #1E6091;
--evt-reunion:    #2E7D32;
--evt-anniversary:#6A4C93;
--evt-fundraising:#9C5A1A;
--evt-meeting:    #1F4D3A;
--evt-religious:  #8B6F1A;
--evt-dowry:      #A03B2C;   /* relevant in Kenyan family context */

/* Contribution-purpose palette */
--pur-wedding:        #B5532A;
--pur-medical:        #C62828;
--pur-funeral:        #4A4A4A;
--pur-fundraising:    #9C5A1A;
--pur-project:        #1E6091;
--pur-education:      #1F4D3A;
--pur-emergency:      #D4A437;
--pur-merrygoround:   #2E7D32;
--pur-dowry:          #A03B2C;
--pur-construction:   #8B6F1A;

/* Finance-type palette */
--fin-chama:        #2E7D32;
--fin-merrygoround: #9C5A1A;
--fin-sacco:        #1F4D3A;
--fin-loan:         #1E6091;
--fin-advance:      #6A4C93;
--fin-grant:        #D4A437;
--fin-allocation:   #B5532A;
--fin-transfer:     #4A4A8C;
--fin-dividend:     #8B6F1A;

SPACING / RADIUS / SHADOW TOKENS:
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
--radius-sm: 8px;   --radius-md: 14px;   --radius-lg: 20px;
--radius-pill: 999px;   /* slightly rounder than OStrade — warmer feel */
--shadow-1: 0 1px 2px rgba(40,30,10,0.08), 0 1px 3px rgba(40,30,10,0.06);
--shadow-2: 0 4px 12px rgba(40,30,10,0.10);
--shadow-3: 0 12px 32px rgba(40,30,10,0.14);
--shadow-lift: 0 18px 48px rgba(31,77,58,0.18);
--glow-gold: 0 0 0 1px rgba(212,164,55,0.55), 0 0 14px rgba(212,164,55,0.22);
--glow-gen:  0 0 0 1px rgba(31,77,58,0.45), 0 0 14px rgba(31,77,58,0.18);
--focus-ring: 0 0 0 3px rgba(31,77,58,0.35);

TYPOGRAPHY TOKENS:
--font-display:  "Fraunces", "Georgia", "Times New Roman", serif; /* headings */
--font-sans:     "Inter", "Noto Sans", system-ui, -apple-system, sans-serif;
--font-numeric:  "Inter", tabular-nums;  /* money, shares, ages, loan amounts */
--fs-display:    3rem;
--fs-h1: 2.25rem;  --fs-h2: 1.75rem;  --fs-h3: 1.375rem;
--fs-kpi-xl:     2.5rem;  --fs-kpi:    1.75rem;  --fs-kpi-sm: 1.25rem;
--fs-body:       1rem;     /* 16px — accessibility floor */
--fs-body-lg:    1.125rem; /* Elder Mode body */
--fs-sm: 0.875rem;  --fs-label: 0.75rem; /* uppercase, letter-spacing 0.06em, weight 600 */
--lh-tight: 1.2;  --lh-normal: 1.55;  --lh-relaxed: 1.65;  --lh-elder: 1.8;
/* Rule: EVERY money amount, share count, age, % and loan figure renders in
   --font-numeric so columns align and count-ups don't jitter. Headings use
   Fraunces for the warm heritage voice. */

MOTION TOKENS:
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);
--dur-instant:  80ms;   --dur-fast: 160ms;    --dur-base: 240ms;
--dur-slow:    400ms;   --dur-slower: 600ms;  --dur-camera: 800ms;
--flash-received-bg: rgba(212,164,55,0.18);
--flash-posted-bg:   rgba(46,125,50,0.16);
--flash-overdue-bg:  rgba(198,40,40,0.16);
--flash-dur: 800ms;
--stagger-step: 70ms;   /* capped at 12 items */

Z-INDEX LAYERS:
--z-base: 1;  --z-sticky: 1020;  --z-sidebar: 1030;  --z-dropdown: 1040;
--z-drawer: 1050;  --z-modal-bg: 1060;  --z-modal: 1070;
--z-toast: 1080;  --z-tooltip: 1090;  --z-tree-overlay: 1100;

ELDER-MODE TOKENS (applied via [data-ny-mode="elder"]):
--fs-body: var(--fs-body-lg);            /* 1.125rem */
--touch-min: 56px;                        /* vs 44px standard */
--lh-body: var(--lh-elder);               /* 1.8 */
--control-density: comfortable;           /* hides secondary actions */
```

### 2.2 Page-Scoped CSS Injection Lifecycle

```
TanStack Router integration:

// src/routes/dashboard/lineage.tsx
import { createFileRoute } from "@tanstack/router";
import lineageStyles from "@/styles/pages/dash-lineage.css";

export const Route = createFileRoute("/dashboard/lineage")({
  loader: async ({ context }) => {
    context.styles.mount("dash-lineage", lineageStyles);
    return await context.queryClient.ensureQueryData(...);
  },
  onLeave: ({ context }) => {
    context.styles.unmount("dash-lineage");
  },
  component: LineagePage,
});

BEHAVIOR:
✓ Stylesheet mounted exactly once when the route becomes active.
✓ Multiple instances (dev HMR) deduplicate via loader context.
✓ On route transition (leave), the <link> is removed from <head> and all
  .page-* scoped rules stop applying.
✓ Page components render a <div className="page-dash-<route>"> wrapper.
✓ Cross-page style leakage is structurally impossible.

MIGRATION SAFETY:
- Bootstrap utility classes still apply globally (intended).
- Shared component CSS (src/styles/components/*.css) loads at app root, so
  MemberCard, MoneyBadge, RoleChip, BranchBadge, ProgressRing render
  identically on every page.
- Page stylesheets only override layout/visual specifics for that page.
```

### 2.3 Animation Patterns (Reusable Across All 31 Pages)

```
ENTRANCE:   .ny-reveal  → fade + translateY(8px) → 0, stagger via .ny-stagger-*
                     capped at 12 children, 70ms step
HOVER:      .ny-hover-lift → translateY(-2px) + shadow-lift, 160ms ease-out
COUNT-UP:   .ny-count-up → animates from 0 to value over 1.2s, tabular-nums,
                     snap under reduced-motion
PROGRESS:   .ny-ring → SVG stroke-dashoffset draw 600ms (contribution goal,
                     loan repayment, Sacco share target)
FLASH:      .ny-flash-received (gold 800ms) · .ny-flash-posted (green 800ms)
                     · .ny-flash-overdue (red 800ms) — coalesced so bursts
                     render as ONE flash per 300ms window
PULSE:      .ny-pulse → soft 1.4s opacity/box-shadow pulse on live indicators
                     (active chama round, in-flight broadcast, live tally)
3D CAMERA:  .ny-cam-focus → 800ms dolly+lookAt via drei CameraControls;
                     .ny-cam-fit → 900ms fit-to-bounding-sphere of a branch;
                     .ny-cam-orbit → 0.5rpm idle auto-rotate (disabled under
                     reduced-motion and Elder Mode)
ROW REVEAL: .ny-row-in → new table rows fadeSlideUp (new contribution, new
                     broadcast delivery, new member added)
ACCORDION:  Bootstrap collapse with --dur-base; smooth single-open in drawers
TOAST:      slide-in from bottom-end, 4s auto-hide, swipe-to-dismiss;
                     ≤4 distinct triggers per page
A11Y GATES: prefers-reduced-motion → snap count-ups, no flash, no auto-rotate,
                     no parallax, instant camera focus, static 2D tree;
                     Elder Mode → reduced-motion ON + enlarged hit areas
```

### 2.4 Responsive Card & Section Patterns

```
KPI ROWS:       row-cols-1 row-cols-md-2 row-cols-xl-4   → 1/2/4
CARD GRIDS:     row-cols-1 row-cols-sm-2 row-cols-lg-3   → 1/2/3
MEMBER GRID:    row-cols-2 row-cols-sm-3 row-cols-lg-4 row-cols-xl-6
                (avatars compact; expand to detail drawer on click)
TABLES:         sortable/sticky-header on md+; collapse to stacked cards
                < md via data-label attributes
SIDEBAR:        fixed on xl+ (256px); offcanvas-end with backdrop on < xl
TOP BAR:        sticky; [☰] family-context switcher · elder-mode toggle ·
                notifications bell · profile — always visible
DRAWERS:        offcanvas-end on lg+ (480px); full-screen modal on < lg
3D CANVAS:      60vh on < lg, 78vh on lg+; controls docked bottom on sm
FORMS:          vertical stack on sm; horizontal label on md+
ELDER MODE:     forces tables → cards always, KPI values enlarged, secondary
                actions behind a single "More ⋯" menu, QR codes rendered 2×
```

### 2.5 Page-Scoped Stylesheet Index (1-to-1 Mapping)

```
HOME (7):
/                    → landing.css            (.page-landing)
/about               → about.css              (.page-about)
/professions         → professions-home.css   (.page-professions-home)
/foundation          → foundation-home.css    (.page-foundation-home)
/events              → events-home.css        (.page-events-home)
/gallery             → gallery-home.css       (.page-gallery-home)
/contact             → contact.css            (.page-contact)

AUTH (8):
/auth/signup         → auth-signup.css        (.page-auth-signup)
/auth/signin         → auth-signin.css        (.page-auth-signin)
/auth/onboard        → auth-onboard.css       (.page-auth-onboard)
/auth/create-family  → auth-create-family.css (.page-auth-create-family)
/auth/forgot-password→ auth-forgot.css        (.page-auth-forgot)
/auth/reset-password → auth-reset.css         (.page-auth-reset)
/auth/verify-otp     → auth-verify-otp.css    (.page-auth-verify-otp)
/auth/2fa            → auth-2fa.css           (.page-auth-2fa)

DASHBOARD (16):
/dashboard             → dash-command-center.css   (.page-dash-command-center)
/dashboard/lineage     → dash-lineage.css          (.page-dash-lineage)
/dashboard/members     → dash-members.css          (.page-dash-members)
/dashboard/events      → dash-events.css           (.page-dash-events)
/dashboard/gallery     → dash-gallery.css          (.page-dash-gallery)
/dashboard/obituaries  → dash-obituaries.css       (.page-dash-obituaries)
/dashboard/contributions→ dash-contributions.css  (.page-dash-contributions)
/dashboard/finances    → dash-finances.css         (.page-dash-finances)
/dashboard/finance-access→ dash-finance-access.css(.page-dash-finance-access)
/dashboard/loans       → dash-loans.css            (.page-dash-loans)
/dashboard/foundation  → dash-foundation.css       (.page-dash-foundation)
/dashboard/records     → dash-records.css          (.page-dash-records)
/dashboard/professions→ dash-professions.css      (.page-dash-professions)
/dashboard/communications→ dash-communications.css(.page-dash-communications)
/dashboard/account     → dash-account.css          (.page-dash-account)
/dashboard/settings    → dash-settings.css         (.page-dash-settings)

+ RECEIVE LINK (no-login, public): /r/:token → receive-link.css (.page-receive-link)
TOTAL STYLESHEETS: 31 page-scoped + 1 app-shell + 1 receive-link = 33
```

### 2.6 Page Style Block Template

```
/* src/styles/pages/dash-loans.css */
.page-dash-loans {
  /* page-specific layout only; colors/type/spacing come from tokens.css */
}
.page-dash-loans .loan-summary-grid { display:grid; gap: var(--space-4); }
.page-dash-loans .loan-card--overdue {
  border-left: 4px solid var(--brand-danger);
}
.page-dash-loans .ny-ring-repaid { color: var(--fin-loan); }
/* no hex, no !important, no new fonts — tokens only */
```
---

## 3. INTEGRATION & API MAP (Frontend-Only Stubs)

> Every adapter below is **built in the UI but inert** in this phase. Forms, validation, capability matrices, and status badges render completely; the final submit resolves to a designed "Ready — connects when the backend is wired" / SIMULATED state — never a fake "Sent to M-Pesa" claim. Local money/ledger flows fully simulate. Each adapter lives in `src/services/adapters/*.ts` with the exact signature the real API will have, so Phase 2 swaps only these files.

### 3.1 Unified Integration Adapter Interface

```
type Capability = "read" | "write" | "stream" | "webhook-in" | "webhook-out";

interface IntegrationAdapter {
  id: string;                       // "mpesa" | "airtel" | "bank-eft" | "sms-at" |
                                    // "whatsapp" | "gdrive" | "email-resend" | "otp"
  label: string;                    // "M-Pesa Daraja"
  category: "money-in" | "money-out" | "transfer" | "messaging" | "images" | "identity";
  capabilities: Capability[];       // what the real API allows
  status: "ready-ui" | "configured" | "connected" | "error"; // ready-ui = frontend-only
  healthCheck(): Promise<AdapterHealth>;   // local mock: returns healthy + latency
  configure?(creds: CredentialShape): Promise<ConfigResult>; // vault-stored later
}

FRONTEND-ONLY RULE:
  status === "ready-ui" everywhere. healthCheck() returns a simulated healthy
  snapshot after ~200ms. configure() validates the form, stores nothing real,
  and resolves to: { ok: true, mode: "simulated", note: "Ready — connects when
  the backend is wired" }. No network call. Every UI surface that shows adapter
  status displays a "SIMULATED · backend Phase 2" badge so the user is never
  misled that real M-Pesa / SMS / WhatsApp / Drive is wired.
```

### 3.2 Per-Integration Details

```
M-PESA DARAJA (Safaricom) — money-in/out/transfer
  Capabilities: STK Push (money-in) · B2C (money-out to member M-Pesa) ·
                B2B (to paybill/till) · C2B confirmation callbacks
  Phase-1 UI: full STK-push and B2C forms (phone +2547XXXXXXXX, amount KES,
              paybill/till, account ref) with validation; "Send to M-Pesa"
              button resolves to SIMULATED + a fake M-Pesa ref (RKX7H8KP2-style).
  Live when wired: deposits (T-9 allocations release), contributions payout to
              organizers, loan disbursement to member M-Pesa, sacco withdrawal.

AIRTEL MONEY — money-in/out
  Same shape as M-Pesa; secondary rail. Phase-1: SIMULATED.

BANK EFT / RTGS (Kenyan banks) — transfer
  Banks: KCB · Equity · Cooperative · NCBA · ABSA · Stanbic · Standard
         Chartered · I&M · DTB · Family Bank (real Kenyan paybills surfaced
         where widely known: KCB 522522, Equity 247247, Coop 400200, NCBA
         885100).
  Phase-1 UI: bank picker + account-number + amount + EFT/RTGS choice;
              resolves SIMULATED with a fake bank ref.

AFRICA'S TALKING SMS — messaging + OTP
  Capabilities: bulk SMS (broadcasts) · OTP delivery · premium-rated (opt-in).
  Phase-1 UI: broadcast composer shows channel = SMS with cost preview
              (KES/sec-rate × recipients); "Send" → SIMULATED delivery
              receipts per recipient. OTP entry (A-7) shows a fake code
              prefilled in dev for test users; in Phase 2 it really texts.

WHATSAPP CLOUD API — messaging
  Capabilities: template messages (broadcasts) · 1:1 text/media · reply.
  Phase-1 UI: broadcast composer channel = WhatsApp (template picker,
              media attach); "Send" → SIMULATED per-recipient delivery.
              Broadcasts to elders default to WhatsApp where their number is
              WhatsApp-capable (cheaper, richer).

GOOGLE DRIVE — gallery images
  Capabilities: read-only pull by folder ID; per-family OAuth in Phase 2.
  Phase-1 UI: gallery source connector form (folder URL/ID + label) renders
              fully; "Connect folder" → SIMULATED; images come from local mock
              URLs (real family-photo-style stock) until Phase 2 actually
              pulls. Album/folder picker UI is built so the swap is invisible.

RESEND (EMAIL) — transactional + digests
  Phase-1 UI: digest/statement "email me" actions render; SIMULATED.

OTP DELIVERY (cross-channel)
  OTP can go via SMS or WhatsApp based on the member's channel preference and
  the action class. Receive-link PIN attempts (T-9 / /r/:token) throttle to
  3 tries then lock for 15 min — enforced LOCALLY in Phase 1.
```

### 3.3 Integration Capability Matrix (what each rail will allow when wired)

```
┌──────────────┬──────────┬──────────┬──────────┬───────────┬───────────┐
│ INTEGRATION  │ MONEY-IN │MONEY-OUT │ TRANSFER │ MESSAGING │  IMAGES   │
├──────────────┼──────────┼──────────┼──────────┼───────────┼───────────┤
│ M-Pesa Daraja│   ✓ STK  │  ✓ B2C   │  ✓ B2B   │     —     │     —     │
│ Airtel Money │   ✓      │   ✓      │    —     │     —     │     —     │
│ Bank EFT/RTGS│   —      │   ✓      │  ✓ wire  │     —     │     —     │
│ Africa's Talk│    —     │    —     │    —     │  ✓ SMS+OTP│     —     │
│ WhatsApp API │    —     │    —     │    —     │  ✓ tmpl   │     —     │
│ Google Drive │    —     │    —     │    —     │     —     │  ✓ read   │
│ Resend       │    —     │    —     │    —     │  ✓ email  │     —     │
└──────────────┴──────────┴──────────┴──────────┴───────────┴───────────┘
All "ready-ui" in Phase 1 — every ✓ is a section that renders fully but
resolves SIMULATED. The matrix is surfaced publicly on H-2 About and inside
T-16 Settings so users see exactly what will be wired.
```

### 3.4 Member Identifier Normalization

```
Phone:      +2547XXXXXXXX / 07XXXXXXXX / 011XXXXXXXX (Safaricom) · 075X/076X
            Airtel · 077X Telkom — normalized to E.164 before any (Phase-2)
            send. M-Pesa paybill/till 5–6 digit.
National ID: 8-digit (12345678) — used for adult loan/KYC fields (Phase 2).
Birth cert: 6-digit — for minors registering as wards.
Family IDs: NY-MBR-00001 (member) · NY-FAM-0001 (family) · NY-BRN-0001
            (branch) · NY-CHM-0001 (chama) · NY-SAC-0001 (sacco pool) ·
            NY-LON-2025-00123 (loan) · NY-ALC-2025-00123 (allocation) ·
            NY-CON-2025-00123 (contribution) · NY-EVT-2025-00123 (event) ·
            NY-OBT-2025-00123 (obituary) · NY-BRD-2025-00123 (broadcast) ·
            NY-FND-2025-00123 (foundation grant) · NY-LED-000123 (ledger
            entry) · NY-RCV-ABC123 (receive-link token, public).
Money:      KES, formatted kes() helper (KES 12,500). Display-currency
            toggle (USD/EUR) at a daily mock rate in Phase 1.
Dates:      EAT (Africa/Nairobi). Birth/death by year (elders may not know
            exact day); age computed from birthYear. Event times full
            datetime EAT.
```

### 3.5 Webhooks & Callback URLs (inbound automation — Phase 2)

```
Receive-link fulfillment:  POST /api/webhooks/receive/:token  (M-Pesa B2C
                            confirmation that the elder received) → marks
                            allocation settled.
Contribution confirmation: POST /api/webhooks/mpesa/c2b  (STK push confirm)
                            → marks contributor paid, updates tally live.
Google Drive sync:         push notifications on folder change → refresh
                            album cache.
WhatsApp inbound:          reply routing → 1:1 chat in T-14.
All rendered as documented endpoints in T-16 Settings → API & Webhooks; none
active in Phase 1.
```

---

## 4. HOME PAGES (7 PAGES)

---

### PAGE H-1: Landing Page (`/`)

```
PURPOSE:
First impression. Convince a family member — young or old — that Nalyanya is
the one place the whole family lives: a living 3D tree, the money pool, the
memory gallery, and the elders' easy receive link.

STYLE RULES:
Page stylesheet:   src/styles/pages/landing.css
Root class:        .page-landing
Motion hooks:      hero fadeSlideUp stagger (4 items, 80ms)
                  hover-lift on feature cards
                  count-up on "3 generations", "240+ members", "1 tap"
                  os-draw on hero illustration (tree → branches → members SVG)
                  auto-rotating 3D tree teaser canvas (lazy, paused under
                  reduced-motion; static SVG fallback)
Responsive:        hero 2-col on lg, stacked on md
                  feature cards 3-col on lg, 1-col on sm
                  Elder Mode: hides teaser canvas, shows static SVG tree

LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                          │
│  [Logo: Nalyanya]  [About] [Professions] [Foundation] [Events]  │
│  [Gallery] [Contact]  [Sign in] [Join the family]               │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  HERO                                                            │
│  "Our roots. Our people. One home."                             │
│  "From Mzee Victor Nalyanya to the newest grandchild — every    │
│   branch, every memory, every shilling, in one place. Built so  │
│   grandma can use it too."                                      │
│  [🌿 Explore the family tree →]  [💌 Join the family →]        │
│  3D tree teaser canvas (auto-rotate, lazy)                      │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  TRUST BAR                                                       │
│  "M-Pesa ready" | "WhatsApp broadcasts" | "Google Drive gallery"│
│  | "PIN-only receive for elders" | "AES-256 vault (Phase 2)"    │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  FEATURE CARDS (3)                                               │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
│  │ 🌳 3D Lineage     │ │ 💰 Family Finance │ │ 📸 Memories       ││
│  │ Walk every branch │ │ Chama, Sacco,     │ │ Gallery, events, ││
│  │ and generation in │ │ loans, and one-   │ │ obituaries, and   ││
│  │ 3D — find where   │ │ tap elder receive │ │ contributions —   ││
│  │ you belong.       │ │ links.            │ │ all kept.         ││
│  └──────────────────┘ └──────────────────┘ └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  ELDER-MODE STRIP                                                │
│  "Built for grandpa and grandchild alike — Elder Mode enlarges   │
│   text and turns money-receiving into a 4-digit PIN."           │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  CTA + FOOTER                                                    │
│  "Sign in to your family. Or start one."                        │
│  Footer: Nalyanya · Kenya · hello@nalyanya.app                  │
│  About · Professions · Foundation · Contact · Privacy · Terms   │
└─────────────────────────────────────────────────────────────────┘

SECTIONS (5):
S1 — HERO (display heading, dual CTA, 3D tree teaser / static SVG fallback)
S2 — TRUST BAR (integration + accessibility badges)
S3 — FEATURE CARDS (3, hover-lift: 3D Lineage / Family Finance / Memories)
S4 — ELDER-MODE STRIP (the old-and-young-together promise)
S5 — CTA + FOOTER (family-join funnel, real nav links)
```

---

### PAGE H-2: About Us (`/about`)

```
PURPOSE:
The family story. Origin, the root ancestor Mzee Victor Nalyanya, values,
the generations overview, the family crest/motto, and what membership means.

STYLE RULES:
Page stylesheet:   src/styles/pages/about.css
Root class:        .page-about
Motion hooks:      fadeSlideUp per section, os-draw on the origin-story
                  timeline SVG, count-up on generation counts

SECTIONS (7):
S1 — HEADER ("Our roots run deep.")
     Subhead + crest (motto: "Imarishi — we stand firm") + generation
     count-up chips (1st gen → 5th gen).
S2 — ORIGIN STORY (vertical timeline, os-draw)
     Mzee Victor Nalyanya → spouses → the founding children → branches
     formed → migrations (Western Kenya → Nairobi → diaspora) → present.
S3 — VALUES & TRADITIONS (3 cards: Faith · Family · Service)
     Each value a paragraph + a short list of how it shows up (annual
     reunion, foundation work, the chama).
S4 — THE FAMILY TODAY (stat row + mini branch map)
     240+ members · 12 branches · 5 generations · 4 counties (Bungoma,
     Kakamega, Nairobi, Trans-Nzoia) · 3 countries (KE, UG, US).
S5 — WHAT MEMBERSHIP MEANS (accordion: the lineage graph access ·
     the Sacco · the Foundation · broadcasts · gallery)
S6 — LEADERSHIP ROLL (family head, council of elders, finance officer,
     foundation chair — name + role chip + photo)
S7 — CTA ("See yourself in the tree →" → H-1 hero CTA / sign in)
```

---

### PAGE H-3: Professions & Expertise (`/professions`)

```
PURPOSE:
Public directory of family members and family friends/workers who offer
services — "family helps family" marketplace. Plumbers, lawyers, doctors,
teachers, mechanics, caterers, fundi, DJs, event planners, accountants,
nurses, boda riders, masons, electricians, photographers.

STYLE RULES:
Page stylesheet:   src/styles/pages/professions-home.css
Root class:        .page-professions-home
Motion hooks:      fadeSlideUp per card, hover-lift, count-up on counts

SECTIONS (7):
S1 — HEADER ("Family helping family.")
     Search box + category chips + "List your skill" CTA (→ sign in).
S2 — CATEGORY GRID (12 categories, count per category)
S3 — FEATURED PROFILES (6 cards: photo · name · role · town · "Ask for
     help" contact CTA — masked, reveals on click → contact form modal)
S4 — "FRIENDS OF THE FAMILY" PANEL (non-family workers/friends listed
     with their trade, vetted by admin, with a "verified by family" chip)
S5 — HIRE-FLOW EXPLAINER ("How asking for help works": browse → contact →
     agree → rate after) — 3-step os-draw strip
S6 — ENDORSEMENTS (public testimonials carousel)
S7 — FOOTER CTA ("Are you a family friend with a skill? → join the
     directory" → contact)
```

---

### PAGE H-4: Foundation (`/foundation`)

```
PURPOSE:
Public face of the Nalyanya Foundation — the family's charity arm funding
education, medical, and emergency needs for members and the community.

STYLE RULES:
Page stylesheet:   src/styles/pages/foundation-home.css
Root class:        .page-foundation-home
Motion hooks:      fadeSlideUp, count-up on totals, progress rings on
                  active causes, os-draw on mission emblem

SECTIONS (7):
S1 — HEADER ("Nalyanya Foundation — lifting the next one up.")
S2 — MISSION & PILLARS (3 cards: Education · Medical · Emergency)
S3 — ACTIVE CAUSES (3–6 cards, each: beneficiary (anonymized if minor),
     purpose chip, goal vs raised progress ring, "Contribute →" → sign in
     to T-7 Contributions prefilled, or public contribute modal SIMULATED)
S4 — IMPACT NUMBERS (count-up: students sponsored · medical bills cleared
     · emergencies answered · total disbursed KES)
S5 — TRANSPARENCY REPORT (accordion: latest disbursement list, governance
     — chair, treasurer, council of elders; annual report PDF link stub)
S6 — HOW TO GIVE (M-Pesa paybill stub, bank EFT, in-app, recurring monthly
     — all SIMULATED badges)
S7 — CTA ("Apply for help →" → contact form modal; "Give monthly →")
```

---

### PAGE H-5: Events & Reunions (`/events`)

```
PURPOSE:
Public-facing upcoming family events and the annual reunion hub.

STYLE RULES:
Page stylesheet:   src/styles/pages/events-home.css
Root class:        .page-events-home
Motion hooks:      fadeSlideUp, count-up on countdown, hover-lift on cards

SECTIONS (7):
S1 — HEADER ("Mark the calendar — together.")
     Next-reunion countdown (mono, EAT).
S2 — NEXT REUNION HERO (date · venue · map embed stub · "RSVP →" → sign in)
S3 — UPCOMING EVENTS LIST (wedding · funeral · graduation · birthday ·
     anniversary · fundraising harambee · meeting · religious — each card
     with EventBadge color, date EAT, host, "RSVP →")
S4 — PAST EVENTS HIGHLIGHTS (gallery teaser carousel — 8 recent with
     thumbnails → H-6 Gallery)
S5 — HOST AN EVENT ("Planning something? → create it in the dashboard"
     → sign in to T-4 Events prefilled)
S6 — FAMILY CALENDAR DOWNLOAD (.ics stub link per event)
S7 — FOOTER CTA ("See the full family calendar → sign in")
```

---

### PAGE H-6: Gallery (`/gallery`)

```
PURPOSE:
Public teaser of family memories; full gallery lives in T-5 (Google Drive
pull wired in Phase 2).

STYLE RULES:
Page stylesheet:   src/styles/pages/gallery-home.css
Root class:        .page-gallery-home
Motion hooks:      fadeSlideUp, lazy image reveal, lightbox modal

SECTIONS (7):
S1 — HEADER ("Moments, kept.")
S2 — ALBUM CHIPS (Reunions · Weddings · Graduations · Birthdays ·
     Foundations · In Memoriam · Projects)
S3 — MASONRY GRID (24 curated thumbnails — lazy-loaded, click → lightbox
     modal with caption + album tag + "view full album →" → sign in T-5)
S4 — YEAR STRIP (2018 → 2025; click filters the grid)
S5 — "ADD YOUR PHOTOS" CTA ("Connect your Google Drive folder →" → sign in
     T-5 — SIMULATED badge)
S6 — IN MEMORIAM TEASER (3 recent obituaries → H-2 about / sign in T-6)
S7 — FOOTER CTA ("Open the full gallery → sign in")
```

---

### PAGE H-7: Contact Us (`/contact`)

```
PURPOSE:
Reach the family office / admin. Multiple channels, clear for elders.

STYLE RULES:
Page stylesheet:   src/styles/pages/contact.css
Root class:        .page-contact
Motion hooks:      fadeSlideUp, os-spin on submit, focus-ring emphasis

SECTIONS (7):
S1 — HEADER ("Reach the family office.")
S2 — CONTACT FORM (name · phone/email · family/branch (optional free-text
     since not logged in) · subject · message · "Send" → SIMULATED +
     ticket ref NY-CTC-2025-00123 + ONE toast)
S3 — CHANNEL CARDS (Call · WhatsApp · SMS · Email · Visit — each with real
     placeholder details + "Open WhatsApp →" deep link)
S4 — FAMILY OFFICE ADDRESS (town/county, map embed stub, working hours EAT)
S5 — REQUEST SUPPORT GRID (links: "I can't log in" → A-5 forgot ·
     "I want to receive money sent to me" → /r/:token explainer ·
     "I want to change my bank/M-Pesa" → sign in T-15 ·
     "I want to join the family" → A-1 signup)
S6 — FAQ (accordion: how lineage works, how PIN receive links work, how
     contributions work, is my data safe, what does Elder Mode do)
S7 — EMERGENCY CONTACTS (emergency line · medical · funeral organizer —
     SIMULATED numbers, clearly labeled)
```
---

## 5. AUTH & ONBOARDING PAGES (8 PAGES)

> All auth pages use a shared `AuthShell` (split layout: heritage illustration left, form right; single-column centered on sm). Lineage/family selection is central to A-1/A-2: the user picks (or creates) their family/lineage before credentials. The receive-PIN set in A-8 is the cornerstone of the no-login elder receive flow (T-9 / `/r/:token`).

---

### PAGE A-1: Sign Up (`/auth/signup`)

```
PURPOSE:
Register a new member. The defining step: CHOOSE YOUR FAMILY / LINEAGE. If
the family is not yet on Nalyanya, the user creates it (→ A-4) before
continuing.

STYLE RULES:
Page stylesheet:   src/styles/pages/auth-signup.css
Root class:        .page-auth-signup
Motion hooks:      fadeSlideUp, focus-ring, os-spin on submit

SECTIONS (7):
S1 — STEP INDICATOR (Family · You · Verify · Done) — Stepper top
S2 — FAMILY / LINEAGE CHOOSER
     Search box ("Find your family — e.g. Nalyanya, Wakoli, Barasa…") →
     autocomplete of existing families (mock list: Nalyanya, and 4 others).
     Each result: family name · root ancestor · member count · "This is mine".
     Below: "+ My family isn't here yet — create it →" → A-4 (carries the
     typed name forward as a prefilled seed).
     Within a family, optional BRANCH picker (e.g. "Nalyanya — Bungoma
     branch" / "Nairobi branch") — multiselect not allowed; one primary
     branch, others added in onboarding.
S3 — YOUR DETAILS (names · phone +254 · email · password · confirm)
     Zod validation: phone E.164, password ≥ 8 with mixed, names required.
S4 — RELATIONSHIP SEED (optional, helps placement)
     "Who are you in this family?" quick pick: I'm a son/daughter · father/
     mother · uncle/aunt · cousin · spouse · in-law · grandchild · other.
     "Link me to a member" search (find your parent/spouse in the family
     graph) — optional, completed in onboarding A-3.
S5 — CONSENT & TERMS (checkboxes: data handling · DPA 2019 Kenya notice ·
     family code of conduct) — none submit real data; SIMULATED.
S6 — SUBMIT ("Create my account" → os-spin 800ms → OTP step A-7 prefilled
     with the entered phone/email) → ONE toast "Check your phone for a
     code (SIMULATED — code 123456 in this phase)".
S7 — FOOTER ("Already have an account? → Sign in" → A-2)
```

---

### PAGE A-2: Sign In (`/auth/signin`)

```
PURPOSE:
Log in. Like signup, the user selects their family/lineage first so the
auth scope and post-login context resolve instantly.

STYLE RULES:
Page stylesheet:   src/styles/pages/auth-signin.css
Root class:        .page-auth-signin

SECTIONS (7):
S1 — HEADER ("Welcome back to the family.")
S2 — FAMILY / LINEAGE CHOOSER (same component as A-1 S2 but remembered:
     last-used family prefilled; quick-pick chips of recent families.)
     "+ New to the family? → Sign up" → A-1.
S3 — CREDENTIALS (phone/email + password) · "Show password" toggle ·
     "Forgot password? →" A-5.
S4 — REMEMBER THIS FAMILY (toggle — sets contextStore default family)
S5 — ELDER MODE SHORTCUT ("Logging in for an elder? → use their PIN
     receive link instead — they don't need to sign in to receive money."
     → explainer modal with a sample /r/:token link and a QR.)
S6 — SUBMIT → os-spin → if 2FA on, A-7 OTP then A-8 verify; else straight
     to /dashboard. SIMULATED.
S7 — FOOTER (privacy · terms · contact)
```

---

### PAGE A-3: Onboarding Wizard (`/auth/onboard`)

```
PURPOSE:
A 6-step Stepper that places the new member into the family graph, sets
preferences (incl. Elder Mode), and ends ready to use the dashboard.

STYLE RULES:
Page stylesheet:   src/styles/pages/auth-onboard.css
Root class:        .page-auth-onboard
Motion hooks:      Stepper horizontal on md+, vertical on sm; draft
                  persisted in draftStore (survives refresh); os-draw on
                  the "where do you fit?" mini-tree preview.

SECTIONS (7 — one per step + summary):
S1 — STEP 1 PROFILE (full names · preferred name · date/year of birth ·
     gender · home town/county · current town · ID optional for KYC fields)
S2 — STEP 2 FAMILY & BRANCH (confirm family · primary branch · secondary
     branches you belong to — "you can be in more than one")
S3 — STEP 3 RELATIONSHIPS (link to parents, spouse(s), children, siblings
     by searching existing members; "add adopted child" / "add ward";
     each link creates a Relation edge in the graph)
S4 — STEP 4 PREFERENCES (Elder Mode on/off · display currency ·
     communication channels: SMS / WhatsApp / email / in-app — per class)
S5 — STEP 5 FINANCE PROFILE (opt into the family Sacco? · chama? ·
     default payout channel M-Pesa/bank — masked; "set your receive PIN
     next →" → A-8)
S6 — STEP 6 REVIEW & FINISH (summary card of everything entered ·
     mini-tree preview showing where the user now sits · "Finish" →
     /dashboard)
S7 — EXIT-SAFE ("Save and continue later" — draft persists; resume link)
```

---

### PAGE A-4: Family / Lineage Creator (`/auth/create-family`)

```
PURPOSE:
When a user's family is not yet on Nalyanya, they create it here — naming
the root ancestor, the origin, and the founding branch. This is how new
lineages join the platform.

STYLE RULES:
Page stylesheet:   src/styles/pages/auth-create-family.css
Root class:        .page-auth-create-family
Motion hooks:      fadeSlideUp, os-draw on the crest builder, os-spin submit

SECTIONS (7):
S1 — HEADER ("Start your family on Nalyanya.")
     Note: "Only do this if your family isn't already listed. Search first
     →" (link back to A-1 S2 with the seed name).
S2 — FAMILY IDENTITY (family/lineage name · alternate spellings · clan/
     oluyia · motto (optional) · crest picker — 8 heritage crest SVGs to
     choose + optional upload stub (SIMULATED))
S3 — ROOT ANCESTOR (the 1st generation). For the Nalyanya family this is
     "Mzee Victor Nalyanya". Fields: full names · birth year ·
     deceased? (year) · home/origin town+county · spouse(s) names · brief
     biography (markdown-lite). This member becomes gen-1, the tree root.
S4 — FOUNDING BRANCH (branch name e.g. "Bungoma branch" · founder = one
     of the root ancestor's children · branch color picker (--branch-*))
S5 — ORIGIN STORY (free-text + a vertical-timeline mini-editor: founding
     → migrations → present; becomes the About page seed)
S6 — GOVERNANCE SEED (appoint yourself family head/admin + optional
     co-admin phone; can add council of elders later in T-16 Settings)
S7 — CREATE ("Create family" → os-spin → family + root ancestor + branch
     created locally (mock), you're enrolled as Family Head, redirect to
     A-3 onboarding to fill your own profile, then /dashboard.)
```

---

### PAGE A-5: Forgot Password (`/auth/forgot-password`)

```
PURPOSE:
Start password recovery. Frontend-only: SIMULATED OTP.

SECTIONS (5):
S1 — HEADER ("Reset your password")
S2 — FAMILY + IDENTIFIER (family chooser + phone/email)
S3 — CHANNEL PICK (Send code via SMS / WhatsApp / email — SIMULATED)
S4 — SUBMIT → A-7 verify-otp (code 123456 prefilled in this phase)
S5 — FOOTER ("Remember it? → Sign in" A-2)
```

---

### PAGE A-6: Reset Password (`/auth/reset-password`)

```
PURPOSE:
Set a new password after OTP success.

SECTIONS (5):
S1 — HEADER ("Choose a new password")
S2 — NEW PASSWORD + CONFIRM (Zod strength meter)
S3 — LOG OUT OTHER SESSIONS toggle
S4 — SUBMIT → /auth/signin with a success toast
S5 — FOOTER
```

---

### PAGE A-7: Verify OTP (`/auth/verify-otp`)

```
PURPOSE:
6-digit OTP entry used by signup, signin-2FA, forgot-password, and every
money/receive-link confirmation. Reusable OTP modal component too.

SECTIONS (5):
S1 — HEADER ("Enter the code we sent")
     Subhead shows masked channel ("sent to •••• 7890 via SMS").
S2 — OTPInput (6-digit split, auto-advance, paste support)
S3 — RESEND (countdown 30s then enabled — SIMULATED)
S4 — VERIFY → routes onward by context (signup→onboard, signin→dashboard,
     forgot→A-6, receive-link→release)
S5 — TROUBLE ("Didn't get it? → try WhatsApp / contact admin" → H-7)
```

---

### PAGE A-8: 2FA & Receive-PIN Setup (`/auth/2fa`)

```
PURPOSE:
Two distinct security enrollments: (a) TOTP 2FA for login & sensitive
actions; (b) a 4-digit RECEIVE PIN — separate from login — that the elder
uses on the no-login receive link (T-9 / /r/:token). The PIN is what makes
"receive money without logging in" safe.

STYLE RULES:
Page stylesheet:   src/styles/pages/auth-2fa.css
Root class:        .page-auth-2fa

SECTIONS (7):
S1 — HEADER ("Protect your account and your money.")
S2 — TOTP 2FA ENROLL (QR code stub + secret + authenticator-app steps +
     6-digit verify; recovery codes generated, download/copy stub)
S3 — RECEIVE PIN SETUP (the elder-friendly piece)
     Explain: "This 4-digit PIN lets you receive money sent to you WITHOUT
     logging in — you'll get a link, open it, enter your PIN and an OTP.
     Perfect for grandparents." Set 4-digit PIN (masked, confirm) ·
     strength note (no sequential/all-same) · "remember this — you'll need
     it every time you receive."
S4 — PIN RECOVERY ("Forgot PIN? → admin can reset it for you" → H-7
     contact; reset requires OTP + audit log — simulated)
S5 — CHANNEL FOR OTP (where receive-link OTP goes: SMS / WhatsApp default
     per preference)
S6 — TEST RECEIVE LINK ("Try it now" → generates a sample /r/:token and
     opens it in a new tab preview so the user sees the elder flow)
S7 — FINISH → /dashboard
```

---

## 6. FAMILY DASHBOARD PAGES (16 PAGES — 7+ SECTIONS EACH)

> All dashboard pages mount inside the shared **DashboardShell**: sticky top bar (logo · FamilyContextPill switcher · Elder Mode toggle · notifications bell · profile) + 16-item sidebar (active route highlighted) + main. Every drawer and wizard is **deep-linkable** (writes to the URL via TanStack Router search params; back closes; reload restores; shareable). Every table row has a working Actions menu → detail drawer. Every money/destructive action has a confirm (reason where noted). Paper/local flows fully simulate; live API sections resolve SIMULATED with visible feedback — never a dead button, never a fake "Sent to M-Pesa" claim.

---

### PAGE T-1: Command Center (`/dashboard`)

```
PURPOSE:
The family cockpit. Everything that matters in one screen — for the Family
Head/admin especially: portfolio state, active chama rounds, upcoming
events, contribution tallies, alerts, quick finance actions (deposit /
withdraw / transfer), and the elder-mode shortcut.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-command-center.css
Root class:        .page-dash-command-center
Motion hooks:      fadeSlideUp stagger (12), count-up on KPIs (tabular-nums),
                  ny-flash-received on contribution/ledger deltas, ny-pulse
                  on live chama & broadcast indicators, os-draw on equity
                  curve, auto-rotate 3D tree mini in S5 (paused Elder Mode)
Responsive:        KPIs 1/2/4, cards 1/2/3, tables collapse < md, sidebar
                  offcanvas < xl

LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│ TOP BAR: [☰] Nalyanya · [Family ▾ Nalyanya · branch ▾] · [Elder │
│ Mode] [🔔 5] [Profile ▾]                                        │
└─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────┐
│ SIDEBAR (16)  │ MAIN                                            │
│ 1. Command    │ S1 STATUS RIBBON (family health chips)          │
│ 2. Lineage    │ S2 KPI ROW (6)                                  │
│ 3. Members    │ S3 FAMILY FINANCE CURVE + per-branch sparklines │
│ 4. Events     │ S4 LIVE CONTRIBUTIONS SNAPSHOT                  │
│ 5. Gallery    │ S5 MINI 3D LINEAGE TEASER ("open full tree →")  │
│ 6. Obituaries │ S6 ALERTS & ACTION CENTER                       │
│ 7. Contribs   │ S7 UPCOMING EVENTS + ECON/CHAMA CALENDAR STRIP  │
│ 8. Finances   │                                                 │
│ 9. Fin. Access│                                                 │
│ 10. Loans     │                                                 │
│ 11. Foundation│                                                 │
│ 12. Records   │                                                 │
│ 13. Profess.  │                                                 │
│ 14. Comms     │                                                 │
│ 15. Account   │                                                 │
│ 16. Settings  │                                                 │
└───────────────┴─────────────────────────────────────────────────┘

SECTIONS (7):

S1 — STATUS RIBBON (horizontal chip strip)
    Family health: BranchBadge + member count + active chama dot +
    sacco share-total + pending contributions count. Integration chips:
    M-Pesa · WhatsApp · SMS · Google Drive (each SIMULATED badge + last-
    sync age). Right: FAMILY-CONTEXT pill (Nalyanya · Bungoma branch) +
    Elder Mode state (ON/OFF) + admin-role chip (Family Head).

S2 — KPI ROW (6 cards, count-up, flash on deltas)
    • Aggregate family wallet (sum of all member balances + sacco pool,
      KES display)
    • This month contributions in (flash-received)
    • Active chama rounds + merry-go-round position
    • Sacco shares value (your shares × unit value)
    • Outstanding loans (count + KES, overdue flagged)
    • Upcoming events (next 30 days count; sub-label: "across all branches")

S3 — FAMILY FINANCE CURVE PANEL
    Left (8 cols): aggregate wallet + sacco pool curve (Recharts area,
    os-draw), range tabs 1M / 3M / 6M / 1Y / ALL; inflow vs outflow toggle;
    drawdown shading.
    Right (4 cols): per-branch sparkline list — BranchBadge + branch label
    + mini balance sparkline + this-month net (flash). Click → T-8 scoped.

S4 — LIVE CONTRIBUTIONS SNAPSHOT (top 8 by recency/amount)
    Compact table: contributor · purpose (PurposeBadge) · amount (mono) ·
    cause · time-ago · status (received/pending/quarantined) · "View →"
    (→ T-7 detail drawer via ?con=NY-CON-2025-…). Footer: "All
    contributions → T-7".

S5 — MINI 3D LINEAGE TEASER
    A small auto-rotating 3D tree canvas (react-three-fiber, lazy, paused
    under reduced-motion/Elder Mode → static SVG). Shows the active branch.
    "Open the full tree →" deep-links to T-2 (and optionally to a focused
    member via ?focus=NY-MBR-…). "Where am I?" button highlights the user's
    node(s).

S6 — ALERTS & ACTION CENTER
    Stacked alert cards (ny-pulse on critical):
      • "3 contributions pending verification" → T-7
      • "Chama 'Wazee Round' rotates in 2 days — your turn is position 4" → T-8
      • "Loan NY-LON-2025-00088 instalment overdue by 2 days" → T-10
      • "Mzee Grace's receive link unused for 7 days — resend? →" T-9
      • "Broadcast 'December reunion' delivered to 240/242" → T-14
    Each dismissible (writes alerts_ack locally); critical ones sticky.

S7 — UPCOMING EVENTS + CHAMA/ECON CALENDAR STRIP
    Left: next 5 family events (EventBadge, EAT date, host, RSVP state) →
    T-4 detail drawer.
    Right: next 5 chama rotations + contribution deadlines + loan
    instalments on an EAT week strip. Click any → relevant page prefilled.

QUICK ACTIONS (admin, sticky bottom-right FAB on mobile):
    Deposit · Withdraw · Transfer · New Broadcast · New Event · Send elder
    receive link — each opens a fast wizard/modal scoped to T-9/T-12/T-14/T-4.
```

---

### PAGE T-2: Lineage — 3D Family Tree (`/dashboard/lineage`)

```
PURPOSE:
The showpiece. A living 3D family tree, rooted at Mzee Victor Nalyanya,
where the user can orbit, zoom into a branch, select a member, and see
exactly where they sit — a father in one branch, an uncle in another, a
son in another, a grandson in another. Camera dollies in on select, zooms
out to view the larger family. Member preview shows age, home, children,
spouses, adopted, profession, contact — and links spouses→children as the
tree grows.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-lineage.css
Root class:        .page-dash-lineage
Motion hooks:      .ny-cam-focus (800ms dolly+lookAt), .ny-cam-fit (900ms
                  fit-to-branch), .ny-cam-orbit (0.5rpm idle auto-rotate,
                  paused on hover/scroll/reduced-motion/Elder Mode), node
                  hover scale 1.06, branch tubes brighten on selection,
                  Html detail card slide-in, count-up on member stats.
                  Fallback: prefers-reduced-motion OR WebGL unavailable →
                  static 2D SVG tree with IDENTICAL navigation (click node
                  → drawer, search, generation filter, "where am I?").
Responsive:        canvas 78vh lg+ / 60vh <lg; controls dock bottom-sheet
                  on sm; detail drawer full-screen on sm.
3D libs:           @react-three/fiber + @react-three/drei (CameraControls,
                  OrbitControls, Html, Tube, Line, Text, Billboard,
                  Environment) + three. Lazy route-loaded (code-split).
                  Instanced nodes for performance; frustum culling; LOD.

LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│ TOP BAR (shared)                                                │
├───────────────┬─────────────────────────────────────────────────┤
│ SIDEBAR       │ LINEAGE HEADER                                   │
│               │ "The Nalyanya Family Tree" · root: Mzee Victor   │
│               │ Nalyanya (1st gen, --gen-1 gold)                 │
│               ├─────────────────────────────────────────────────┤
│               │ CONTROL RAIL (left of canvas)                    │
│               │ • Search member (fuzzy, names/IDs)               │
│               │ • Generation filter (1–7, multi-select chips)    │
│               │ • Branch filter (BranchBadge chips, multi)       │
│               │ • "Where am I?" button (highlights ALL nodes the │
│               │   current user occupies across branches)         │
│               │ • "Fit to family" / "Fit to branch" / "Reset"    │
│               │ • Auto-rotate toggle (off in Elder Mode)         │
│               │ • 2D fallback toggle (or forced by reduced-motion)│
│               ├─────────────────────────────────────────────────┤
│               │ 3D CANVAS (78vh)                                 │
│               │  • Root node (Mzee Victor Nalyanya) large, --gen-1│
│               │    gold glow, labeled.                           │
│               │  • Each generation a vertical layer; nodes =     │
│               │    glowing orbs sized by descendant count, color  │
│               │    = --gen-N.                                    │
│               │  • Branch tubes: curved Bezier tubes connecting   │
│               │    parent→child, colored by --branch-N of that   │
│               │    branch.                                       │
│               │  • Spouse links: horizontal double-line between   │
│               │    spouses (--role-spouse).                      │
│               │  • Adopted/ward: dashed ring (--role-adopted/    │
│               │    ward).                                        │
│               │  • Deceased: halo ring + † glyph.                │
│               │  • Html labels: preferred name + role chip; full │
│               │    card on focus.                                │
│               │  • Ambient: gentle leaf-particle drift, warm fog │
│               │    (disabled Elder Mode).                        │
│               ├─────────────────────────────────────────────────┤
│               │ MEMBER PREVIEW (right drawer / bottom sheet)     │
│               │  Opens on node click (camera dollies in first).   │
│               ├─────────────────────────────────────────────────┤
│               │ LEGEND BAR (generations + roles + branch colors) │
└───────────────┴─────────────────────────────────────────────────┘

SECTIONS (7):

S1 — LINEAGE HEADER + ROOT CARD
    Family name · motto · root ancestor Mzee Victor Nalyanya card (photo,
    birth year, home, brief bio, "view his branch"). Generation legend.

S2 — CONTROL RAIL (search · generation filter · branch filter · "Where
    am I?" · fit/reset · auto-rotate · 2D fallback) — every control
    updates the URL (?gen=1,3&branch=nalyanya-bungoma&focus=NY-MBR-00042
    &mode=2d) so views are shareable and back-button restores.

S3 — 3D CANVAS (the scene)
    - Camera rig: OrbitControls (drag rotate, scroll zoom) + drei
      CameraControls for animated focus/fit. Idle auto-rotate 0.5rpm after
      8s (disabled Elder Mode/reduced-motion).
    - Click node → .ny-cam-focus dollies to it, Html detail card slides in.
    - "View this family" on a node → .ny-cam-fit zooms OUT to that
      member's branch bounding sphere (see the larger family).
    - "View spouses" / "View children" → camera reframes + those links
      brighten, others dim.
    - Multi-presence: a user appears as multiple nodes (father here, uncle
      there, son elsewhere); "Where am I?" draws connector arcs between
      them and offers "jump to next me →".
    - Keyboard nav: arrow keys move between nodes; Enter opens detail.
    - Performance: instancing for >200 nodes, LOD by distance, lazy load
      branches on demand.

S4 — MEMBER PREVIEW DRAWER (the detail spine)
    Tabs:
    • OVERVIEW: photo · full + preferred names · role chip · generation ·
      birth year + age (or birth/death if deceased) · home town+county ·
      current town · adopted? ward? · brief bio · "edit (admin)".
    • FAMILY: spouses (linked, click → focus spouse node) · children
      (linked) · parents · siblings · "add spouse/child/relation" (admin/
      self) with confirm + audit.
    • CONTACT: phone (masked, Reveal gated) · email · WhatsApp-capable ·
      preferred channel.
    • PROFESSION: profession(s) · employer · "view in directory →" T-13.
    • FINANCE: wallet balance · sacco shares · active loans · recent
      contributions (mini list) · "send elder receive link →" T-9 prefilled.
    • TIMELINE: life events (birth, marriage, graduation, etc.) + family
      events they're part of.
    Every tab's links deep-link to the relevant page with ?focus=… or
    ?member=….

S5 — "WHERE AM I?" PANEL
    Lists every position the current user holds across the family graph:
    "Father — Nalyanya/Bungoma branch (gen 3)" · "Uncle — Nalyanya/Nairobi
    branch (gen 3)" · "Son-in-law — Wakoli family (gen 4)" · "Grandson —
    Nalyanya main (gen 4)". Click → focuses that node in the 3D scene.

S6 — BRANCHES OVERVIEW (cards grid)
    Each branch: BranchBadge · founder · member count · generations ·
    "open branch in 3D →" (cam-fit). "Create new branch" (admin) → modal.

S7 — LINEAGE AUDIT & REQUESTS
    Every graph edit (add member, add relation, mark deceased, mark
    adopted, merge duplicate) is a request. Admin edits apply + audit-log;
    member-suggested edits queue for admin approval. Audit list with
    before/after + actor + timestamp. Export CSV (stub).
```

---

### PAGE T-3: Members Directory (`/dashboard/members`)

```
PURPOSE:
The searchable list of every member across branches — the table companion
to the 3D tree. Filters, relation tags, finance snapshots, role management.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-members.css
Root class:        .page-dash-members
Motion hooks:      fadeSlideUp, count-up, ny-row-in on new members,
                  hover-lift on cards

SECTIONS (7):
S1 — KPI ROW (5): total members · branches · generations · elders (65+)
     · minors (wards).
S2 — FILTER BAR (branch · generation · role · home county · age band ·
     "has loan" · "sacco member" · search) + view toggle (table / avatar
     grid).
S3 — MEMBERS TABLE (TanStack Table)
     Columns: avatar+name · NY-MBR id · role chip · generation · branch ·
     age · home · phone(masked) · sacco shares · wallet · actions (View ·
     Edit · Send receive link · Suspend · Remove-confirm). Expandable row
     → mini relations summary. Bulk select → bulk actions bar.
S4 — MEMBER DETAIL DRAWER (reuse T-2 S4 tabs) deep-linkable ?member=…
S5 — ADD MEMBER WIZARD (admin/Stepper: identity · family placement ·
     relations seed · finance opt-in · finish) — mirrors A-3 mini.
S6 — ROLES & ACCESS PANEL (per-member role assignment: Family Head ·
     Co-Admin/Elder · Finance Officer · Member · Ward/Minor · Viewer;
     hidden not disabled where unauthorized).
S7 — REQUESTS QUEUE (member-suggested relation edits, branch-change
     requests, profile updates pending admin approval).
```

---

### PAGE T-4: Events & Activities (`/dashboard/events`)

```
PURPOSE:
Plan, schedule, and run family events — weddings, funerals, birthdays,
graduations, reunions, anniversaries, fundraising harambees, meetings,
religious events. RSVPs, reminders, photo albums, contribution hooks.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-events.css
Root class:        .page-dash-events
Motion hooks:      fadeSlideUp, count-up, ny-pulse on "today" events,
                  hover-lift

SECTIONS (7):
S1 — KPI ROW (4): upcoming (30d) · this month · RSVPs pending · events
     you host.
S2 — CALENDAR VIEW (month/week/list, EAT) with EventBadge dots; click →
     event drawer; drag-to-reschedule (admin). Session/shading for
     weekends + Kenyan public holidays.
S3 — EVENTS TABLE (title · type chip · date EAT · venue · host · RSVPs
     x/y · contribution link · status · actions: View · Edit · Duplicate ·
     Cancel-confirm · Send invites).
S4 — EVENT DETAIL DRAWER (tabs: Overview · RSVPs · Album · Contributions ·
     Comms · Budget). Overview: date/venue/map embed stub/host/chairs/
     description. RSVP: per-member going/maybe/declined/pending + bulk
     remind. Album: link to T-5 scoped. Contributions: link to T-7 cause
     prefilled. Comms: broadcast to attendees (→ T-14 prefilled). Budget:
     line items vs contributions.
S5 — EVENT BUILDER WIZARD (Stepper: Type · When/Where · Hosts · Description
     · RSVP settings · Contribution hook optional · Reminders · Review).
     Prefilled from T-1/T-2 "create event around…" deep-links.
S6 — INVITES & REMINDERS (send via SMS/WhatsApp/email — SIMULATED; RSVP
     link shareable; auto-reminders E-2d/E-1h).
S7 — PAST EVENTS ARCHIVE (filterable, links to albums + contribution
     reconciliation).
```

---

### PAGE T-5: Gallery (`/dashboard/gallery`)

```
PURPOSE:
All family images, organized by album/event/year. Google Drive pull is the
Phase-2 source; Phase-1 uses local mock URLs. Upload, lightbox, tag, share.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-gallery.css
Root class:        .page-dash-gallery
Motion hooks:      lazy image reveal, fadeSlideUp, lightbox modal,
                  hover-lift on tiles

SECTIONS (7):
S1 — KPI ROW (4): albums · photos · this year · storage used (mock).
S2 — SOURCE CONNECTOR PANEL (Google Drive folder connector form — built
     fully, SIMULATED; "Connect folder" → ready-ui badge. List of connected
     folders with sync state + last-sync age.) Other sources: direct upload,
     contributor uploads.
S3 — ALBUM CHIPS + FILTERS (album · event · year · branch · contributor ·
     tagged member search).
S4 — MASONRY GRID (lazy, infinite scroll) with hover overlays (caption,
     album, date, tagged members). Click → lightbox: large view, caption,
     prev/next, tag members, "add to album", "set as profile/cover", copy
     share link (deep-link /dashboard/gallery?img=NY-IMG-…).
S5 — UPLOAD WIZARD (multi-file drag/drop · album pick/create · caption ·
     tag members · event link · "upload" → SIMULATED progress + ONE toast).
S6 — ALBUMS MANAGER (create/rename/cover/delete-confirm; per-album
     permissions: all-family / branch / admins-only).
S7 — TRASH & AUDIT (deleted photos recoverable 30d; audit of uploads/
     deletes/tags).
```

---

### PAGE T-6: Obituaries (`/dashboard/obituaries`)

```
PURPOSE:
Honor the departed. Obituary notices, life stories, funeral details,
condolences, and contribution links — handled with dignity and a quieter
visual treatment.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-obituaries.css
Root class:        .page-dash-obituaries
Motion hooks:      fadeSlideUp (slow), no auto-rotate, no count-up on this
                  page (respectful), candle-flame ny-pulse on in-memoriam
                  badge, muted palette (slightly desaturated surfaces).

SECTIONS (7):
S1 — IN MEMORIAM HEADER (a quiet statement + count of those remembered).
S2 — OBITUARY CARDS (photo · name · birth–death years · relationship in
     family · "read notice" → drawer).
S3 — OBITUARY DETAIL DRAWER (tabs: Notice · Life Story · Funeral ·
     Condolences · Contributions · Gallery).
     Notice: text + photo + family statement. Life Story: timeline. Funeral:
     date/venue/map/map stub + program. Condolences: threaded messages
     (add one). Contributions: link to T-7 cause (funeral) prefilled.
     Gallery: scoped T-5 album.
S4 — NEW OBITUARY WIZARD (admin, sensitive): member/identity · dates ·
     notice · funeral details · contribution hook · publish scope ·
     confirm (reason) · audit.
S5 — CONDOLENCE WALL (per obituary; members post; admin moderate).
S6 — ANNIVERSARY REMINDERS (auto-surface passing anniversaries → optional
     broadcast).
S7 — ARCHIVE (filter by year/branch; export memorial PDF stub).
```

---

### PAGE T-7: Contributions (`/dashboard/contributions`)

```
PURPOSE:
The family's giving hub. Create and contribute to any cause — weddings,
sickness, funerals, fundraising harambees, projects, pool-funded projects,
education, emergencies, merry-go-rounds. Live tallies, payout to organizer,
full reconciliation.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-contributions.css
Root class:        .page-dash-contributions
Motion hooks:      fadeSlideUp, count-up, ny-flash-received on new
     contributions, ny-pulse on active cause tallies, progress-ring draw.

SECTIONS (7):
S1 — KPI ROW (5): active causes · contributed this month (KES) · your
     contributions (count/KES) · pending verification · causes you benefit
     from.
S2 — CAUSES GRID (cards: title · PurposeBadge · beneficiary(anonymized
     if minor/sensitive) · goal vs raised progress ring · contributors
     count · deadline · "Contribute →" · "Details →"). Filter by purpose.
S3 — CONTRIBUTE WIZARD (multi-step modal: cause · amount KES · channel
     (M-Pesa/Airtel/bank/internal) · phone/account prefilled from your
     profile · message · review (fees, ETA) → confirm → SIMULATED receipt
     NY-CON-2025-… + flash-received + ONE toast). Capability-gated channels
     shown with SIMULATED badges.
S4 — CONTRIBUTIONS TABLE (all): date · contributor · cause · amount ·
     channel chip · status (initiated→pending→confirmed/failed) · receipt
     · ledger ref. Filters + export.
S5 — CAUSE DETAIL DRAWER (tabs: Overview · Contributors · Payouts ·
     Comms · Audit). Overview: goal/raised ring, beneficiary, deadline.
     Contributors: list with amounts + messages. Payouts: to organizer
     (M-Pesa/bank — SIMULATED). Comms: broadcast to contributors (→ T-14).
     Audit: every create/contribute/payout logged.
S6 — CREATE CAUSE WIZARD (admin/beneficiary: title · purpose · beneficiary
     · goal · deadline · contributors scope (all/branch/selected) · payout
     destination · publish).
S7 — PAYOUT & RECONCILIATION (release funds to organizer when goal met or
     admin-triggered; double-entry ledger entries visible; reconciliation
     against M-Pesa statements — SIMULATED).
```

---

### PAGE T-8: Finances — Chama, Merry-Go-Round & Sacco (`/dashboard/finances`)

```
PURPOSE:
The family's collective money engine. Each branch can have its own chama
and merry-go-round; the family Sacco lets members buy shares via monthly
contributions that unlock loan access. This page is the control room.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-finances.css
Root class:        .page-dash-finances
Motion hooks:      fadeSlideUp, count-up, ny-pulse on active round, ny-flash-
     posted on share accrual/round rotation, os-draw on share-curve.

SECTIONS (7):

S1 — FINANCE KPI ROW (6)
    • Sacco total pool (KES) · • Your shares (count + value) · • Active
    chama rounds · • Merry-go-round active cycle · • Your loan-eligible
    amount (3× shares, configurable) · • This month contributions (shares +
    chama).

S2 — CHAMA & MERRY-GO-ROUND PANEL
    Per chama card: name · BranchBadge · members · contribution amount ·
    cycle period (weekly/fortnightly/monthly) · current recipient (merry-go-
    round position, ny-pulse on active) · next rotation countdown · pool
    balance · actions (Contribute · View cycle · Rotate now (admin) ·
    Statements).
    Chama types: savings-chama (pool + shared goal) · merry-go-round
    (rotating recipient) · investment-chama (projects). Bulk rotate.

S3 — SACCO PANEL (the share → loan-access engine)
    • Share unit value (KES) · total shares issued · pool value · reserve %.
    • Your shares: count · cumulative contributed · current value · dividend
      history (mock).
    • BUY SHARES wizard (monthly auto-debit toggle + one-off top-up → M-Pesa
      / bank / internal → SIMULATED + share count increments + ledger entry +
      ny-flash-posted).
    • SHARE-CURVE chart (your shares over time, os-draw).
    • Dividend distribution panel (admin; annual; SIMULATED).
    • Loan-eligibility meter: "With 120 shares you can borrow up to KES X
      (3× shares) → apply →" deep-links T-10 prefilled.

S4 — TRANSACTIONS TABLE (shares + chama + merry-go-round): date · type chip ·
     member · chama/sacco ref · amount · channel · status · ledger ref.

S5 — CHAMA DETAIL DRAWER (tabs: Overview · Members · Cycle · Payouts ·
     Statements · Audit). Cycle: merry-go-round rotation order with each
     member's position + when they receive. Payouts: to current recipient
     (SIMULATED). Statements: per-cycle summary.

S6 — CREATE CHAMA / SACCO PRODUCT WIZARD (admin: type · name · branch ·
     contribution amount · cycle · members · rules (penalty for late,
     skip policy) · merry-go-round order · save).

S7 — GOVERNANCE & AUDIT
    Sacco/chama rules editable (admin, 2FA); every contribution, rotation,
    share issue, dividend audit-logged with actor + timestamp + ledger
    ref. Export CSV/statement PDF (stub).
```
---

### PAGE T-9: Finance Access — Allocations & Elder Receive Links (`/dashboard/finance-access`)

```
PURPOSE:
The user (per their status — admin/family-head/finance-officer/eligible
member) has access to money the platform can ALLOCATE to a member for
family or personal needs, depending on settings. The defining feature: a
NO-LOGIN RECEIVE LINK you can send to an elder so they receive the money
by entering their 4-digit PIN + an OTP — no app, no login. This page
shows allocations, generates the link, and LIVE-PREVIEWS what the elder
sees.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-finance-access.css
Root class:        .page-dash-finance-access
Motion hooks:      fadeSlideUp, count-up, ny-pulse on pending/active
     links, ny-flash-received on settled allocations, QR reveal, phone
     mockup live preview.

LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│ TOP BAR (shared)                                                │
├───────────────┬─────────────────────────────────────────────────┤
│ SIDEBAR       │ S1 KPI ROW                                      │
│               │ S2 ALLOCATIONS TABLE + CREATE                   │
│               │ S3 RECEIVE-LINK PANEL (generate + preview)      │
│               │ S4 ELDER PREVIEW (phone mockup, live)           │
│               │ S5 LINK HEALTH & STATUS                         │
│               │ S6 RULES & LIMITS (admin)                       │
│               │ S7 AUDIT                                        │
└───────────────┴─────────────────────────────────────────────────┘

SECTIONS (7):

S1 — KPI ROW (5)
    • Available to allocate (your access ceiling by status — KES)
    • Active allocations out (count + KES)
    • Pending receive links (awaiting PIN+OTP) — ny-pulse
    • Settled today (flash-received)
    • Expired/failed links 7d.

S2 — ALLOCATIONS TABLE + CREATE
    Table: ref NY-ALC-2025-… · recipient (name + masked phone) · amount
    KES · purpose (personal/family/medical/school/emergency) · channel
    (M-Pesa/bank/internal) · status (draft → link-issued → pin-entered →
    otp-verified → released → settled / expired / failed) · link expiry ·
    actions (View · Resend link · Revoke · Mark settled). Create allocation
    → ALLOCATE WIZARD (Stepper: recipient (search member or free phone for
    a non-member elder) · amount (vs your ceiling + per-member limits) ·
    purpose · channel · pin-required? (default yes) · OTP channel · link
    expiry (default 24h) · review → issue). Capability-gated channels shown
    SIMULATED; release resolves SIMULATED to "Ready — connects when backend
    wired" but the allocation lifecycle + ledger entry fully simulate.

S3 — RECEIVE-LINK PANEL (the elder receive link)
    For a selected/created allocation:
    • Link: https://nalyanya.app/r/NY-RCV-ABC123  (copy button · QR code ·
      "Send via WhatsApp" deep link · "Send via SMS" SIMULATED).
    • Link metadata: recipient · amount · expiry · PIN required · OTP
      channel · attempts left (3) · status.
    • "Regenerate token" (admin) · "Revoke" (confirm + reason + audit).
    • Deep-link to the actual /r/:token route so the admin/you can open it
      in a new tab and walk the elder flow.

S4 — ELDER PREVIEW (phone mockup, live)
    A styled phone-frame on the right showing EXACTLY what the recipient
    sees at /r/:token — kept in sync with the selected allocation:
      Step 1: "Mama, you've been sent KES 5,000 from Brian. Enter your PIN
              to receive." → 4-digit PIN pad (big buttons, Elder Mode
              sizing).
      Step 2: "We've sent a code to •••• 7890 via SMS. Enter it." → 6-digit
              OTP (SIMULATED code shown to admin in dev, real in Phase 2).
      Step 3: "Receiving… KES 5,000 to your M-Pesa •••• 7890." → success
              screen with reference + "Done".
    The mockup is INTERACTIVE — clicking through it locally simulates the
    full release (allocation → pin-entered → otp-verified → released →
    settled, ledger entry, flash-received). This is the "preview how it
    appears" the user asked for.

S5 — LINK HEALTH & STATUS
    Per active link: issued-at · last-opened-at · pin attempts · otp
    attempts · expires-at · delivery proof (SMS/WhatsApp sent SIMULATED).
    Alerts: "link unused 7d → resend?" · "3 wrong PINs → locked 15m".

S6 — RULES & LIMITS (admin, 2FA-gated)
    Per-role allocation ceilings · per-member daily/monthly caps ·
    whitelist of who can allocate · default link expiry · pin attempt cap
    · otp throttling · "disable allocations while READ-ONLY mode" toggle.
    Every change audit-logged.

S7 — AUDIT
    Every allocation create/release/revoke, every PIN attempt (success +
    failure + lock), every OTP send, every link open — timestamped, actor,
    recipient, amount, IP/UA stub. Export CSV. (In Phase 2 the actual M-Pesa
    B2C confirmation webhook fulfils "settled"; in Phase 1 it's simulated
    after the OTP step.)
```

> The public `/r/:token` route (receive-link page) is a SEPARATE lightweight route outside the dashboard shell — minimal chrome, Elder-Mode styling by default, only PIN pad + OTP + success/failure. Built so a non-tech elder on a basic Android can complete it. Detailed in §14 Access Engine.

---

### PAGE T-10: Loans (`/dashboard/loans`)

```
PURPOSE:
Comprehensive, advanced loans. Borrow as an INDIVIDUAL or as a FAMILY
(joint/group). Short-term and long-term loans, salary advances, school-
fees loans, emergency loans, asset/business loans, Sacco-backed loans
(against shares), and Chama group loans. Full lifecycle: apply → eligibility
→ review → disburse → repay → settle, with amortization, instalments,
collateral/guarantors, and overdue handling.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-loans.css
Root class:        .page-dash-loans
Motion hooks:      fadeSlideUp, count-up, ny-flash-posted on disbursement,
     ny-flash-overdue on overdue rows, progress-ring draw on repayment,
     os-draw on amortization chart.

SECTIONS (7):

S1 — LOANS KPI ROW (6)
    • Active loans (count + KES) · • Your outstanding (KES) · • Eligible to
    borrow (KES — 3× Sacco shares) · • Next instalment (date + KES) · •
    Overdue (count + KES, red) · • Repayment rate (on-time %).

S2 — LOAN PRODUCTS GRID (the catalog)
    Cards per product: name · type chip (short-term / long-term / salary
    advance / school-fees / emergency / asset-business / sacco-backed /
    chama-group) · min/max amount · term range · interest rate (flat or
    reducing) · eligibility (shares required? guarantors? salary? ) ·
    "Apply →" prefilled wizard. Products:
      • Short-Term Personal (1–6 mo, KES 5k–100k)
      • Long-Term Personal (6–36 mo, KES 50k–1M, guarantors)
      • Salary Advance (≤ net monthly salary, ≤ 30 days, repay on payday)
      • School-Fees Loan (per term, paid direct to school paybill)
      • Emergency Medical (fast-track, 24h, against shares)
      • Asset / Business (3–60 mo, KES 50k–3M, collateral/guarantors)
      • Sacco-Backed (up to 3× shares, reducing balance)
      • Chama Group Loan (the chama borrows as a group against pooled shares)
      • Family Joint Loan (multiple members co-sign; family-head guarantee)

S3 — LOAN APPLICATION WIZARD (multi-step Stepper, deep-linkable
     ?apply=product)
    Step 1 PRODUCT & BORROWER: pick product · individual or family/group ·
      borrower(s) (you / + co-borrowers / the chama).
    Step 2 AMOUNT & TERM: amount vs eligibility ceiling (live) · term ·
      purpose · (school-fees → school paybill field; asset → supplier).
    Step 3 TERMS PREVIEW: interest type (flat/reducing) · rate · instalment
      amount + frequency (weekly/monthly) · total repayable · amortization
      mini-chart (os-draw) · first instalment date EAT.
    Step 4 GUARANTORS / COLLATERAL (where required): pick guarantor members
      (their shares pledge shown) or collateral description + value.
    Step 5 DESTINATION: disbursement channel (M-Pesa/bank/internal ledger
      transfer to wallet) — masked account picker.
    Step 6 REVIEW & SUBMIT: full summary · declarations · submit →
      SIMULATED ref NY-LON-2025-… + status "under review" + ONE toast.
    Loan eligibility = function of (sacco shares × multiplier, guarantor
    shares, salary-on-file, existing obligations, credit history mock,
    admin rules). All computed locally; guardrails block over-borrowing.

S4 — LOANS TABLE (all): ref · borrower(s) · product chip · amount ·
     term · instalment · next due (EAT) · balance · status (applied →
     under-review → approved → disbursed → repaying → settled / declined /
     overdue / written-off) · actions (View · Repay · Restructure ·
     Statement · Cancel). Filter by product/status/borrower. Bulk: mark
     settled (admin).

S5 — LOAN DETAIL DRAWER (tabs: Summary · Amortization · Repayments ·
     Guarantors · Comms · Audit)
     Summary: full terms, disbursement, balance, progress ring (repaid %).
     Amortization: full schedule table (period · principal · interest ·
     instalment · balance) os-draw chart. Repayments: history (M-Pesa/bank/
     internal — SIMULATED) + "Make a payment" mini-wizard (amount · channel
     · confirm). Guarantors: list with pledged shares + release on settle.
     Comms: broadcast to borrower/guarantors (→ T-14). Audit: every
     application/approval/disbursement/repayment/restructure logged.

S6 — REPAYMENT & COLLECTIONS
    • Make a payment wizard (loan · amount · channel · confirm → ledger
      entry + flash-posted + progress ring updates).
    • Auto-collect toggle (STK push on due date — SIMULATED).
    • Overdue handling: grace period · penalty accrual · auto-flag ·
      guarantor call-up · write-off (admin, reason + 2FA + audit).
    • Restructure wizard (extend term / reduce instalment — admin, reason).

S7 — GOVERNANCE & AUDIT
    Loan policy editor (admin, 2FA): products enabled · rates · ceilings ·
    guarantor rules · max active loans per member · auto-approve thresholds.
    Full audit; exports (statement PDF per loan, portfolio CSV for admin).
```

---

### PAGE T-11: Foundation & Charities (`/dashboard/foundation`)

```
PURPOSE:
The Nalyanya Foundation dashboard. The family finances academic
scholarships, medical bills, emergency relief, and community charity —
with transparent governance, application intake, and disbursement tracking.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-foundation.css
Root class:        .page-dash-foundation
Motion hooks:      fadeSlideUp, count-up, progress rings, os-draw on
     disbursement timeline, ny-flash-posted on grant release.

SECTIONS (7):
S1 — KPI ROW (5): total disbursed (KES) · active beneficiaries ·
     applications pending · this year funded · donor count.
S2 — PILLARS (3 cards: Education · Medical · Emergency) with per-pill
     totals + active causes.
S3 — ACTIVE GRANTS GRID (cards: beneficiary anonymized where minor ·
     purpose chip · amount disbursed · duration · progress · "Details →").
S4 — GRANT DETAIL DRAWER (tabs: Overview · Disbursements · Documents ·
     Comms · Audit). Overview: beneficiary, purpose, total, schedule.
     Disbursements: schedule + history (SIMULATED). Documents: proof
     uploads (fee structure, hospital invoice — SIMULATED). Comms: to
     beneficiary/guardian (→ T-14). Audit: every grant decision logged.
S5 — APPLICATION INTAKE (members apply for help): APPLY WIZARD (type ·
     beneficiary · purpose · amount · justification · documents upload ·
     reviewer notes) → "submitted" → admin review queue.
S6 — DISBURSEMENT & RECONCILIATION (release funds to school paybill /
     hospital / beneficiary M-Pesa — SIMULATED; double-entry ledger;
     reconciliation against statements).
S7 — GOVERNANCE & TRANSPARENCY (chair · treasurer · council of elders ·
     annual report PDF stub · donor list · public H-4 sync).
```

---

### PAGE T-12: Records (`/dashboard/records`)

```
PURPOSE:
The system of record. Every family money event — contributions, chama,
sacco shares, loans, allocations, foundation grants, transfers, deposits,
withdrawals — unified, attributed, analyzed, reconciled, exportable.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-records.css
Root class:        .page-dash-records
Motion hooks:      fadeSlideUp, count-up, os-draw on charts, os-spin on
     export jobs.

SECTIONS (7):
S1 — KPI ROW (6): total in (all-time) · total out · net · transactions
     this month · pending reconciliation · your share.
S2 — UNIFIED HISTORY TABLE (every tx): date EAT · type chip · ref ·
     member · account/branch · amount (native + display) · channel ·
     balance-after · source attribution (manual/contribution/loan/sacco/
     chama/allocation/foundation/transfer) · linked-entity deep-link.
     Filters (type/date/member/channel/branch) + CSV/XLSX export (stub).
S3 — ANALYTICS CHARTS (2×2 os-draw): family cashflow curve · monthly net
     bars · by-type donut · by-branch heat table.
S4 — ATTRIBUTION ANALYTICS (per source: who contributed/funded most).
S5 — RECONCILIATION (internal ledger vs M-Pesa/bank statements — SIMULATED
     importer; exceptions table with resolve actions; SYNCED/DRIFT/STALE
     chips per channel).
S6 — EXPORT CENTER (CSV/XLSX/PDF statement per member/branch/family; KRA-
     ready tax export stub; queued jobs with download links).
S7 — JOURNAL & NOTES (per-transaction notes + tags; lesson-style weekly
     digest option).
```

---

### PAGE T-13: Professions & Expertise (`/dashboard/professions`)

```
PURPOSE:
The directory of related people — family members AND family workers/
friends — who offer services, with contact details and vetting. Powers
the "family helps family" marketplace (mirrors public H-3, but scoped +
editable here).

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-professions.css
Root class:        .page-dash-professions
Motion hooks:      fadeSlideUp, count-up, hover-lift, focus-ring.

SECTIONS (7):
S1 — KPI ROW (4): listed professionals · categories · friends-of-family
     · endorsements this month.
S2 — FILTER BAR (category · branch · town · family/friend · verified ·
     search) + view toggle (table / card grid).
S3 — DIRECTORY TABLE (name · role chip · category · town · phone(masked)
     · family-member? · verified-by-admin chip · rating · actions: View ·
     Contact · Endorse · Edit · Remove-confirm).
S4 — PROFILE DETAIL DRAWER (tabs: Overview · Services · Contact · Reviews ·
     Gallery). Contact: reveal-gated phone/email/WhatsApp; "Hire / ask for
     help" → contact form modal (SIMULATED ticket NY-CTC-…).
S5 — ADD LISTING WIZARD (self or admin: person (member or friend) ·
     category · services · town · contact · portfolio images (SIMULATED) ·
     rates · publish).
S6 — ENDORSEMENTS & REVIEWS (per listing; members endorse; admin
     moderates; "verified by family" badge granted by admin).
S7 — CATEGORIES MANAGER (admin: add/rename/disable categories).
```

---

### PAGE T-14: Communications / Broadcasts (`/dashboard/communications`)

```
PURPOSE:
When something must reach everyone at once — a reunion, a funeral, a
harambee, an alert — one compose routes to SMS, WhatsApp, email, and
in-app, depending on the message and each recipient's preference and
channel capability. Also 1:1 messages to members.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-communications.css
Root class:        .page-dash-communications
Motion hooks:      fadeSlideUp, count-up, ny-pulse on in-flight broadcasts,
     ny-row-in on delivery receipts, typing indicator on 1:1.

SECTIONS (7):
S1 — KPI ROW (4): sent this month · recipients reached · delivery rate ·
     pending/in-flight (ny-pulse).
S2 — BROADCAST COMPOSER (the core)
     • Audience picker: all family · by branch · by generation · by role ·
       by event attendees · custom member set · "elders only" · "sacco
       members". Shows resolved recipient count + per-channel counts.
     • Channel selector: SMS / WhatsApp / email / in-app (multi). Auto-
       routing hint per recipient (WhatsApp-capable → WhatsApp; else SMS;
       email for long-form; in-app always). Cost preview (SMS KES ×
       recipients — SIMULATED).
     • Message editor: plain text + template picker (event/funeral/harambee/
       reminder/alert) + media attach (image for WhatsApp) + merge fields
       ({first_name}, {branch}).
     • Schedule (now / later EAT) · quiet-hours respect · retry policy.
     • "Send" → SIMULATED fanout: per-recipient delivery receipts stream in
       (ny-row-in) with status (delivered/failed/pending) + ONE toast.
S3 — BROADCASTS TABLE (all): ref NY-BRD-… · subject/excerpt · audience ·
     channels · sent-at · delivered/total · status · actions (View ·
     Resend · Duplicate · Cancel).
S4 — BROADCAST DETAIL DRAWER (tabs: Overview · Recipients · Delivery ·
     Replies). Recipients: per-member delivery per channel. Delivery:
     receipts + proofs (SIMULATED). Replies: WhatsApp/SMS inbound threaded
     (Phase 2 inbound webhook; Phase 1 mock).
S5 — 1:1 MESSAGES (member-to-member via SMS/WhatsApp/in-app — SIMULATED;
     threads list + composer).
S6 — TEMPLATES & QUICK SEND (saved templates; one-tap "RSVP reminder for
     event X" prefilled).
S7 — QUIET HOURS & RATE LIMITS (EAT range; critical classes break through;
     SMS/day cap budget guard; fallback chain push→SMS). Test-send per
     channel (SIMULATED proof).
```

---

### PAGE T-15: Account (`/dashboard/account`)

```
PURPOSE:
The member's own identity and money-routing profile. CRITICAL RULE:
changing the mobile number or bank account number where loans/allocation
payouts are channeled CANNOT be done by the member alone — it requires
REQUESTING ADMIN SUPPORT (the change is staged, admin approves, audit-
logged). Everything else (photo, email, password, preferences) the member
can self-edit.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-account.css
Root class:        .page-dash-account
Motion hooks:      fadeSlideUp, os-spin on submit, focus-ring emphasis,
     lock-glyph animation on admin-gated fields.

SECTIONS (7):
S1 — PROFILE (photo upload SIMULATED · names · preferred name · DOB/year
     · gender · home/current town · bio) — self-edit + audit.
S2 — CONTACT & MONEY-ROUTING (the admin-gated block)
     • Mobile number (M-Pesa destination) — LOCKED: shows current masked,
       "Request change →" opens a REQUEST WIZARD (new number · reason ·
       OTP verify on current number · submitted to admin queue). Until
       admin approves, the OLD number stays active. Audit-logged.
     • Bank account (EFT destination) — same LOCKED + request flow
       (bank picker · account · account-name · proof upload optional ·
       reason · OTP · admin queue).
     • Alternative channels (Airtel, internal wallet) — same gating.
     • Receive PIN — change requires OTP + admin co-sign (4-eyes for
       money-touching credential).
     WHY: prevents an attacker (or a coerced member) from silently
     redirecting loan/allocation payouts to a new number.
S3 — SECURITY (password change (current-password gate) · TOTP 2FA
     re-enroll · recovery codes · active sessions (device/IP/location/
     last-seen · revoke) · login alerts).
S4 — PREFERENCES (Elder Mode toggle · display currency · communication
     channels per class · language EN/SW (mock)).
S5 — FINANCE PROFILE (sacco membership · chama memberships · loan-
     eligibility summary · payout-channel display).
S6 — MY CHANGE REQUESTS (status of pending mobile/bank/PIN change
     requests: submitted → under-review → approved/rejected + admin note).
S7 — DATA & PRIVACY (export my data ZIP stub · consent log viewer · DPA
     2019 Kenya notice · delete-account multi-step: OTP + typed confirm +
     admin review; ledger/audit retained per policy).
```

---

### PAGE T-16: Settings (`/dashboard/settings`)

```
PURPOSE:
Master-admin configuration of the whole family instance — security policy,
roles, integration credentials, feature flags, scheduling/automation of
finance actions, inbound/outbound webhooks, data retention.

STYLE RULES:
Page stylesheet:   src/styles/pages/dash-settings.css
Root class:        .page-dash-settings
Motion hooks:      fadeSlideUp per accordion section, os-spin on test
     buttons, focus-ring.

SECTIONS (7):

S1 — FAMILY PROFILE & GOVERNANCE
    Family name/motto/crest (edit) · family head + co-admins · council of
    elders roll · branch list manager · family code of conduct (text).

S2 — ROLES, RBAC & APPROVAL POLICY
    Role matrix (Family Head · Co-Admin · Elder · Finance Officer · Member
    · Ward/Minor · Viewer) × permissions (allocate · approve loan · send
    broadcast · edit lineage · manage sacco · payout). 4-eyes rules for
    money-touching config (adding payout channel, changing caps). Approval
    policy per action class (always-ask / standing / never). Changes 2FA.

S3 — INTEGRATIONS & CREDENTIALS (the vault — SIMULATED)
    M-Pesa Daraja (consumer key/secret stubs — write-only UI, masked) ·
    Airtel · bank EFT accounts · Africa's Talking (username/apiKey) ·
    WhatsApp Cloud API (token · phone-number-id · template sync) · Google
    Drive (OAuth folder IDs per album) · Resend (api key). Each: connected
    state chip · test button (SIMULATED proof) · credential editor (vault-
    backed in Phase 2, write-only now) · rotate · revoke. All show
    "ready-ui · backend Phase 2" badge.

S4 — AUTOMATION & SCHEDULING (the master-admin control room)
    • Auto-run chama rotations on schedule (toggle + cadence).
    • Auto-collect loan instalments via STK push on due date (SIMULATED).
    • Auto-reminders: event E-2d/E-1h, contribution deadline E-1d, loan
      instalment E-3d, sacco monthly share call.
    • Auto-broadcast digests (daily/weekly/monthly).
    • Auto-mitigate (AI/anomaly → pause) — default OFF.
    • Scheduler queue viewer (next 20 firings) + pause-all + audit.

S5 — APPEARANCE, ACCESSIBILITY & LOCALE
    Theme (light default / dark / system) · Elder Mode defaults · display
    currency · timezone Africa/Nairobi · language EN/SW (mock) · number
    format · reduce-motion override.

S6 — DATA & PRIVACY (admin)
    Retention policy (ledger/audit 7y default, images 90d hot/longer
    archive) · export everything (ZIP async stub) · consent log viewer ·
    delete member (multi-step, audit) · DPA 2019 Kenya notice.

S7 — FEATURE FLAGS, WEBHOOKS & AUDIT
    Flags: enable_sacco · enable_loans · enable_allocations · enable_
    foundation · enable_broadcasts · enable_gallery_gdrive · enable_
    elder_receive_links · MAX_BRANCHES (default 12) · MAX_MEMBERS (default
    500) · MAX_ACTIVE_LOANS_PER_MEMBER (default 3) · MAX_ALLOCATION_LINKS
    (default 50/day). Inbound webhook URL docs (receive-link fulfilment,
    M-Pesa c2b, WhatsApp inbound) — Phase 2. Outbound webhooks (URL +
    HMAC secret + event picker + test-fire SIMULATED + delivery log).
    Full audit trail of every admin/finance action with HMAC export.
```
---

## 7. SHARED COMPONENTS

```
Located at src/styles/components/*.css — loaded once at app root, rendered
identically on every page.

COMPONENT INVENTORY:
├── StatCard              — KPI card (label, value, delta, icon; flash variants)
├── BranchBadge          — colored badge per family branch (--branch-* palette)
├── GenerationRing       — colored ring per generation (--gen-* palette)
├── RoleChip             — member role chip (--role-* palette) — head/elder/
│                          parent/spouse/child/sibling/extended/inlaw/adopted/
│                          ward/minor
├── MemberAvatar         — initials/photo avatar with role ring + deceased †
├── MemberCard           — compact member summary (avatar, name, role, branch)
├── FamilyContextPill    — top-bar family + branch switcher (scopes all pages)
├── PurposeBadge         — contribution purpose chip (--pur-* palette)
├── EventBadge           — event-type chip (--evt-* palette)
├── FinanceTypeBadge     — finance-type chip (--fin-* palette)
├── MoneyBadge           — KES amount cell (mono, tabular, colored)
├── ProgressRing         — SVG ring (contribution goal, loan repaid, sacco target)
├── OTPInput             — 6-digit split input (auto-advance, paste)
├── PinPad               — 4-digit PIN pad (big buttons, Elder Mode sizing)
│                          — used on /r/:token and A-8
├── AmountInput          — KES amount (with ceiling hints + live validation)
├── PhoneInput           — Kenyan +254 aware, E.164 normalization
├── BankPicker           — Kenyan bank select with known paybills
├── ChannelSelector      — SMS/WhatsApp/email/in-app multi with cost preview
├── Stepper              — wizard steps (onboarding, loan, allocation, event…)
├── Drawer               — slide-in right (lg+) / full-screen modal (sm)
├── DataTable            — TanStack Table + Bootstrap styling + responsive
│                          collapse + sticky header + row actions
├── FilterBar            — reusable filter chips + search
├── ActionsMenu          — per-row dropdown (only working items, guidance note
│                          where capability-gated, never dead/disabled)
├── ConfirmDialog        — confirm with optional reason field + 2FA gate
├── ApprovalGate         — inline approve (admin/4-eyes, 2FA optional)
├── ReceiveLinkCard      — allocation link + QR + copy + status + preview open
├── PhoneMockup          — styled phone frame for elder-flow live preview (T-9)
├── TreeCanvas3D         — react-three-fiber tree scene wrapper (lazy, fallback)
├── TreeFallback2D       — static SVG tree with identical navigation
├── LedgerEntry          — double-entry posting line (debit → credit)
├── StatusChip           — pending/confirmed/failed/overdue/settled/released
├── EmptyState           — illustration + headline + working CTA
├── Reveal               — scroll-reveal wrapper (.ny-reveal)
├── ElderModeToggle      — global top-bar toggle (sets [data-ny-mode="elder"])
└── SimulatedBadge       — "SIMULATED · backend Phase 2" pill used on every
                          inert integration surface so users are never misled
```

---

## 8. STATE MANAGEMENT

```
SERVER STATE (TanStack Query) — query-key conventions (all served by local
mock services in src/services/*.ts; no HTTP in Phase 1):
  ["me"]                                  — current member + role + context
  ["family", familyId]                    — family + branches + counts
  ["branches", {familyId}]                — branch list
  ["members", {filters, page}]            — directory (paginated)
  ["member", id]                          — single member + relations + finance
  ["relations", memberId]                 — graph edges for a member
  ["lineage-graph", {familyId, branchId}] — 3D tree nodes + tubes
  ["events", {filters, page}]             — events
  ["event", id]                           — single event + RSVPs + album
  ["albums"], ["album", id]               — gallery albums
  ["images", {albumId, page}]             — gallery images
  ["obituaries"], ["obituary", id]
  ["contributions", {filters}]            — causes + contributions
  ["contribution", id]                    — cause + contributors + payouts
  ["chamas"], ["chama", id]               — chama + cycle + members
  ["sacco", {familyId}]                   — pool + share-unit-value + your shares
  ["shares", memberId]                    — share ledger for a member
  ["loans", {filters}]                    — loans list
  ["loan", id]                            — loan + amortization + repayments
  ["allocations", {filters}]              — finance-access allocations
  ["allocation", id]                      — allocation + link + lifecycle
  ["foundation-grants"], ["grant", id]
  ["transactions", {filters, page}]       — unified records
  ["ledger", {filters, page}]             — double-entry postings
  ["professionals", {filters}]            — professions directory
  ["broadcasts"], ["broadcast", id]       — comms
  ["notifications", {filters}]
  ["settings", section]
  ["audit", {filters}]
  ["change-requests", {memberId}]         — admin-gated mobile/bank changes

INVALIDATION STRATEGY:
  member/relation mutation → invalidate ["members"], ["member",id],
    ["lineage-graph"]
  finance mutation (contribution/share/loan/allocation) → invalidate
    respective keys + ["transactions"], ["ledger"], ["me"] (balance),
    ["sacco"], ["loan",id]
  allocation release → invalidate ["allocations"], ["transactions"],
    ["ledger"], ["member",recipientId]
  broadcast send → invalidate ["broadcasts"]
  settings/role change → targeted invalidation + contextStore refresh

LIVE STATE (Phase-1 local simulators — no Socket.IO server):
  tick:simulator            — periodic mock balance/share/round updates so
                              KPIs flash and charts feel alive (every ~5s,
                              coalesced)
  broadcast:delivery        — per-recipient receipts stream in (ny-row-in)
                              over ~2s after a send
  allocation:lifecycle      — PIN/OTP/release steps advance when the
                              PhoneMockup preview is walked through
  chama:rotation            — countdown + auto-rotate when cadence fires
  Kill-switch / Elder-Mode  — BroadcastChannel syncs across open tabs

CLIENT STATE (Zustand, minimal):
  uiStore        — sidebar open, theme, density, drawer stack, active modal,
                   Elder Mode (persisted)
  contextStore   — ACTIVE CONTEXT (family · lineage · branch) + LIVE/READ-
                   ONLY mode — persisted per user, consumed by every page;
                   reflected in the URL where it scopes a page
  draftStore     — in-progress loan/contribution/broadcast/event/allocation
                   drafts survive route changes (localStorage), not reloads
  receiveStore   — the /r/:token flow state (pin attempts, otp step, status)
```

---

## 9. DATA SCHEMA (Frontend Mock Shapes)

> These are TypeScript types in `src/data/*.ts` + `src/types/*.ts`. In Phase 2 they become Prisma models 1:1; the mock files become seed data. Every page reads/writes through `src/services/*.ts` which operate on these shapes locally.

```
CORE ENTITIES:

Family {
  id: string;                 // NY-FAM-0001
  name: string;               // "Nalyanya"
  altSpellings?: string[];
  clan?: string;              // oluyia / likhubi
  motto?: string;             // "Imarishi"
  crestKey: string;           // one of 8 heritage crests
  rootAncestorId: string;     // → Member (Mzee Victor Nalyanya)
  branchIds: string[];
  createdAt: string;
}

Branch {
  id: string;                 // NY-BRN-0001
  familyId: string;
  name: string;               // "Bungoma branch"
  founderId: string;          // → Member
  colorVar: string;           // --branch-N
  memberIds: string[];
}

Member {
  id: string;                 // NY-MBR-00001
  familyId: string;
  branchIds: string[];        // can belong to several branches
  fullName: string;
  preferredName: string;
  gender?: "male"|"female"|"other";
  birthYear?: number;         // elders may only know the year
  birthDate?: string;         // ISO when known
  deceased?: { year?: number; date?: string; cause?: string };
  homeTown?: string; homeCounty?: string;
  currentTown?: string; currentCountry?: string;
  roleInFamily: Role;         // head/elder/parent/spouse/child/sibling/
                              // extended/inlaw/adopted/ward/minor
  generation: number;         // 1 = root (Mzee Victor Nalyanya)
  adopted?: boolean; wardOf?: string;
  professionIds?: string[];
  phone?: string;             // E.164
  email?: string;
  whatsappCapable?: boolean;
  receivePinHash?: string;    // set via A-8 (mock — 4-digit)
  preferredOtpChannel: "sms"|"whatsapp"|"email";
  avatarUrl?: string;
  bio?: string;
  saccoMember?: boolean;
  chamaIds?: string[];
  walletBalanceKes: number;
  saccoShares: number;
  activeLoanIds?: string[];
  adminPermissions?: string[];
  createdAt: string;
}

Relation {                    // the graph edge — enables multi-branch presence
  id: string;
  fromMemberId: string;       // the subject
  toMemberId: string;         // the related
  type: "spouse"|"parent"|"child"|"sibling"|"guardian"|"ward"
       |"inlaw"|"extended"|"co-parent";
  branchContextId?: string;   // which branch this relation is observed in
  roleLabel?: string;         // "uncle", "father-in-law", …
  since?: string;
}

UserAccount {                 // login identity (separate from Member profile)
  id: string; memberId: string;
  phone: string; email?: string;
  passwordHash: string;       // mock
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  receivePinHash?: string;    // the 4-digit receive PIN
  sessions?: Session[];
  lastLoginAt?: string;
}

// FINANCE
Chama {
  id: string; familyId: string; branchId?: string;
  name: string; type: "savings"|"merrygoround"|"investment";
  memberIds: string[]; contributionKes: number; cadence: "weekly"|
  "fortnightly"|"monthly"; poolKes: number;
  merryGoRoundOrder?: string[]; // member ids in rotation
  currentRecipientId?: string; nextRotationAt: string;
  rules?: { latePenaltyKes?: number; skipPolicy?: string };
}

Sacco {
  familyId: string; shareUnitValueKes: number; totalShares: number;
  poolKes: number; reservePct: number; loanMultiplier: number; // 3×
  dividendHistory: {year:number; perShareKes:number}[];
}

ShareLedger { memberId: string; entries: ShareEntry[] }
ShareEntry { id:string; date:string; type:"buy"|"dividend"|"pledge"|
  "release"; shares:number; kes:number; channel:Channel; ref:string; }

Loan {
  id: string;                 // NY-LON-2025-00123
  product: LoanProduct;
  borrowerIds: string[];      // 1 = individual; >1 = family/group
  amountKes: number; interestType:"flat"|"reducing"; ratePct: number;
  termMonths: number; instalmentKes: number; frequency:"weekly"|"monthly";
  disbursementChannel: Channel; disbursementRef?: string;
  guarantorIds?: {memberId:string; sharesPledged:number}[];
  collateral?: {description:string; valueKes:number};
  status: "applied"|"under-review"|"approved"|"disbursed"|"repaying"|
          "settled"|"declined"|"overdue"|"written-off";
  nextInstalmentAt: string; balanceKes: number; repaidKes: number;
  amortization: AmortRow[];
  createdAt: string;
}
AmortRow { period:number; date:string; principalKes:number; interestKes:number;
  instalmentKes:number; balanceKes:number; status:"due"|"paid"|"overdue"; }

Allocation {                  // T-9 finance-access
  id: string;                 // NY-ALC-2025-00123
  allocatorId: string;        // who allocated (admin/eligible member)
  recipientId?: string;       // member (or free phone for non-member elder)
  recipientPhone: string;
  amountKes: number; purpose: AllocationPurpose;
  channel: Channel;
  receiveToken: string;       // NY-RCV-ABC123 (public link token)
  pinRequired: boolean;
  otpChannel: "sms"|"whatsapp"|"email";
  status: "draft"|"link-issued"|"pin-entered"|"otp-verified"|"released"|
          "settled"|"expired"|"failed";
  attempts: {pin:number; otp:number};
  issuedAt: string; expiresAt: string; lastOpenedAt?: string;
  settledRef?: string;        // M-Pesa tx ref (SIMULATED)
  ledgerRef: string;
}
AllocationPurpose = "personal"|"family"|"medical"|"school"|"emergency"|
                    "welfare";

Contribution {
  id: string;                 // NY-CON-2025-00123
  cause: ContributionCause;
  contributorId: string; amountKes: number;
  channel: Channel; status: TxStatus; message?: string;
  receivedAt: string; receiptRef?: string; ledgerRef: string;
}
ContributionCause {
  id: string; title: string; purpose: PurposeType;
  beneficiaryId?: string; beneficiaryAnon?: boolean;
  goalKes: number; raisedKes: number; contributorsCount: number;
  deadline?: string; scope: "all"|"branch"|"selected";
  payoutDestination: Channel;
}

FoundationGrant {
  id: string;                 // NY-FND-2025-00123
  pillar: "education"|"medical"|"emergency";
  beneficiaryId: string; beneficiaryAnon?: boolean;
  amountKes: number; purpose: string; duration?: string;
  disbursements: {date:string; kes:number; channel:Channel; ref:string}[];
  documents?: {name:string; url:string}[];
  reviewerId: string; status: "applied"|"approved"|"active"|"closed";
}

Transaction {                 // unified records row
  id: string; date: string; type: FinanceType;
  ref: string; memberId: string; branchId?: string;
  amountKes: number; displayAmount?: number; channel: Channel;
  balanceAfterKes: number; sourceRef: string; // deep-link to origin entity
  ledgerRef: string; note?: string;
}
LedgerEntry {                 // double-entry
  id: string;                 // NY-LED-000123
  date: string; entryType: FinanceType;
  debitAccount: string; creditAccount: string;
  amountKes: number; sourceRef: string;
  balanceAfterPerAccount: Record<string, number>;
}

// NON-FINANCE
EventItem {
  id: string;                 // NY-EVT-2025-00123
  title: string; type: EventType;
  startsAt: string; endsAt?: string; // EAT
  venue?: string; mapQuery?: string; hostIds: string[];
  branchId?: string; description?: string;
  rsvps: {memberId:string; status:"going"|"maybe"|"declined"|"pending"}[];
  albumId?: string; contributionCauseId?: string;
  reminders: {offsetMin:number; channel:Channel}[];
  status: "draft"|"scheduled"|"ongoing"|"completed"|"cancelled";
}
EventType = "wedding"|"funeral"|"birthday"|"graduation"|"reunion"|
  "anniversary"|"fundraising"|"meeting"|"religious"|"dowry";

Album { id:string; title:string; eventId?:string; branchId?:string;
  coverUrl:string; imageCount:number; permission:"all"|"branch"|"admin"; }
Image { id:string; albumId:string; url:string; caption?:string;
  date?:string; taggedMemberIds?:string[]; contributorId?:string; }

Obituary { id:string; member?:Member; name:string; birthYear?:number;
  deathYear?:number; deathDate?:string; notice:string; lifeStory?:string;
  funeral?: {date:string; venue:string; mapQuery?:string; program?:string};
  contributionCauseId?:string; albumId?:string; publishedAt:string; }

Professional {
  id: string; memberId?: string; // family member (or null = friend)
  isFamilyFriend: boolean; name: string; category: string;
  services: string[]; town: string; phone?: string; email?: string;
  whatsappCapable?: boolean; verified: boolean; rating?: number;
  endorsements: number; portfolio?: string[];
}

Broadcast {
  id: string;                 // NY-BRD-2025-00123
  subject?: string; body: string; templateKey?: string;
  audience: {type:"all"|"branch"|"generation"|"role"|"event"|"custom";
    ids?:string[]};
  channels: Channel[]; mergeFields?: Record<string,string>;
  scheduledAt?: string; sentAt?: string;
  recipients: {memberId:string; channel:Channel; status:DeliveryStatus;
    deliveredAt?:string; proofRef?:string}[];
  status:"draft"|"scheduled"|"sending"|"sent"|"failed";
}

ChangeRequest {               // T-15 admin-gated changes
  id:string; memberId:string; field:"phone"|"bankAccount"|"airtel"|
    "receivePin"|"email";
  currentValue:string; requestedValue:string; reason:string;
  otpVerified:boolean; status:"submitted"|"under-review"|"approved"|
    "rejected"; adminNote?:string; createdAt:string; decidedAt?:string;
}

AuditEntry { id:string; actorId:string; action:string; entity:string;
  entityId:string; before?:any; after?:any; reason?:string;
  timestamp:string; ipStub?:string; uaStub?:string; }

Notification { id:string; memberId:string; class:string; title:string;
  body:string; deepLink?:string; channels:Channel[]; read:boolean;
  createdAt:string; }

// ENUMS / HELPERS
Role = "head"|"elder"|"parent"|"spouse"|"child"|"sibling"|"extended"|
       "inlaw"|"adopted"|"ward"|"minor"|"viewer";
PurposeType = "wedding"|"medical"|"funeral"|"fundraising"|"project"|
              "education"|"emergency"|"merrygoround"|"dowry"|"construction";
FinanceType = "chama"|"merrygoround"|"sacco"|"loan"|"advance"|"grant"|
              "allocation"|"transfer"|"dividend"|"contribution";
Channel = "mpesa"|"airtel"|"bank"|"internal"|"sms"|"whatsapp"|"email"|
          "inapp";
TxStatus = "initiated"|"pending"|"confirmed"|"failed"|"expired"|"settled"|
           "released"|"overdue"|"declined";
DeliveryStatus = "pending"|"delivered"|"failed"|"read";

// helpers (in src/data/format.ts)
kes(n:number):string          // KES 12,500
fmtDate(iso:string):string    // EAT, Africa/Nairobi
fmtDateShort(iso:string):string
relativeTime(iso:string):string
ageFromYear(year:number):number
maskPhone(phone:string):string       // •••• 7890
maskAccount(n:string):string         // •••• 1234
memberInitials(m:Member):string
branchColorVar(branchId:string):string
genColorVar(generation:number):string
```

MOCK DATA FLOOR (per dataset, ≥10 realistic Kenyan records):
  • 1 root family "Nalyanya" with root ancestor Mzee Victor Nalyanya (gen 1),
    5+ generations, 12 branches, 240+ members across Bungoma, Kakamega,
    Nairobi, Trans-Nzoia counties + diaspora (UG, US).
  • Realistic Kenyan names (Brian Otieno Nalyanya, Faith Chebet Nalyanya,
    Hamza Hassan Nalyanya, Zawadi Mutua Nalyanya, Amani Wanjiku Nalyanya,
    Mzee Victor Nalyanya, Mama Grace Nalyanya, etc.).
  • 10+ chamas (mix of savings/merry-go-round/investment per branch).
  • 10+ sacco share-ledger entries.
  • 10+ loans across all products/statuses (incl. overdue + settled).
  • 10+ allocations (mix of link-issued/pin-entered/settled/expired).
  • 10+ contribution causes (wedding, medical, funeral, harambee, project,
    education) with 10+ contributions each mix of statuses/channels.
  • 10+ foundation grants across pillars.
  • 10+ events across types + RSVPs.
  • 10+ obituaries (handled respectfully).
  • 10+ gallery albums with 24+ images.
  • 10+ professionals (mix family + friends, verified/unverified).
  • 10+ broadcasts (mix channels/statuses/delivery receipts).
  • 10+ change-requests (phone/bank/pin, mix statuses).
  • 10+ audit entries covering money + lineage + comms actions.
  • Real Kenyan geography (47 counties with sub-county/ward examples for
    Bungoma/Kakamega/Nairobi/Trans-Nzoia/Mombasa/Kisumu), real Kenyan banks
    + paybills, real M-Pesa refs (RKX7H8KP2-style), real phone formats
    +2547XX/Airtel 075X/076X/Telkom 077X. No lorem ipsum, ever.
```
---

## 10. LINEAGE & FAMILY-TREE ENGINE (3D)

```
PURPOSE:
Power T-2's 3D tree and every "where am I?" / relation query across the
platform. A Person can occupy multiple branch positions (father here,
uncle there, son elsewhere) — modeled as a graph of Member nodes + Relation
edges scoped by branchContext, NOT a single hierarchy.

3D SCENE MODEL:
  • Nodes: one per Member, positioned by (generation = y-layer,
    branch = x/z cluster, birth-order = intra-cluster offset). Root
    (Mzee Victor Nalyanya) at gen-1 apex, gold (--gen-1), larger radius.
  • Tubes: parent→child curved Bezier tubes colored by the child's branch
    (--branch-N). Spouse links = horizontal double-line (--role-spouse).
  • Node visuals: orb + GenerationRing + role ring (inner) + deceased †
    halo + adopted/ward dashed ring. Html label: preferred name + role chip.
  • Multi-presence: the SAME member.id rendered at each branch position;
    "Where am I?" draws faint connector arcs between a member's instances.

CAMERA RIG:
  • OrbitControls (drag rotate, scroll zoom) + drei CameraControls for
    animated transitions.
  • focus(memberId): dolly + lookAt, 800ms ease-in-out (.ny-cam-focus).
  • fitBranch(branchId): frame the branch bounding sphere, 900ms (.ny-cam-fit).
  • fitFamily(): frame the whole tree.
  • Idle auto-rotate 0.5rpm after 8s (.ny-cam-orbit) — disabled under
    reduced-motion OR Elder Mode OR on touch-drag.
  • All camera intents also write to the URL (?focus=…&branch=…&view=family)
    so views are shareable and back-button restores.

PERFORMANCE:
  • react-three-fiber + drei, lazy route-loaded (code-split) so the rest
    of the app stays light.
  • InstancedMesh for nodes when >200; frustum culling; LOD by distance;
    lazy-load branches on demand (only the active family + visible gens).
  • WebGL fallback: if context creation fails or is software-only on a
    weak device, swap to TreeFallback2D (static SVG, identical navigation).

FALLBACK 2D TREE (TreeFallback2D):
  • SVG layered tree (gen rows), same node/tube styling, same click →
    drawer, same search/filter/where-am-I. Auto-engaged under
    prefers-reduced-motion or Elder Mode or WebGL-fail. No animation.

GRAPH OPERATIONS (lineageService):
  getGraph(familyId, {branchId?, generations?}): {nodes, tubes, members}
  getMember(id): Member + relations
  getRelations(memberId): Relation[]
  whereAmI(memberId): Position[]  // every branch context the member holds
  searchMembers(q): Member[]      // fuzzy on names/ids
  addMember(input) [admin]: creates Member + relation edges + audit
  addRelation(input) [admin/self]: spouse/child/parent/sibling/ward
  markDeceased(memberId, {year,date,cause}) [admin]: updates node visuals
  markAdopted(memberId) [admin]
  requestEdit(proposedChange) [member]: queues for admin approval
  All local in Phase 1; signatures match the Phase-2 REST API.

MEMBER PREVIEW COMPOSITION (T-2 S4 drawer):
  Composed from: Member core + Relations (spouses, children, parents,
  siblings, wards) + Profession links + Finance snapshot (wallet, sacco
  shares, active loans) + Timeline (life + family events). Every sub-card
  deep-links to the relevant page (?member=… / ?focus=…).
```

---

## 11. FINANCE ENGINE (chama · merry-go-round · sacco · loans · allocations · contributions · ledger)

```
THE ONE LEDGER:
  Every money movement posts a double-entry LedgerEntry (debit account →
  credit account, amount, sourceRef deep-link, balanceAfter per account).
  Accounts: per-member wallet, per-chama pool, sacco pool, foundation pool,
  contribution-cause escrow, bank/mpesa clearing. Imbalance is structurally
  impossible — an alarm banner surfaces if ever debits≠credits.

CHAMA & MERRY-GO-ROUND (financeService.chama):
  • createChama(input) [admin] · contribute(chamaId, memberId, amount,
    channel) → ledger · rotate(chamaId) [admin/auto]: advances merry-go-
    round recipient, pays out pool to current recipient (SIMULATED B2C),
    posts ledger, ny-flash-posted.
  • Cycle cadence scheduler: weekly/fortnightly/monthly auto-rotation
    (local timer in Phase 1, BullMQ in Phase 2).

SACCO (financeService.sacco):
  • buyShares(memberId, count, channel): increments shares, adds ShareEntry,
    increases pool, posts ledger, updates loan-eligibility (3× shares ×
    unit value − existing obligations), ny-flash-posted.
  • dividendDistribute(year, perShareKes) [admin]: posts dividend entries.
  • shareUnitValue floats with pool/totalShares (mock appreciates ~quarterly).

LOANS (financeService.loan):
  • eligibleAmount(memberId): min(saccoShares × multiplier × unitValue,
    maxActiveCeiling, productMax) − existing obligations − guarantor
    pledges already in use. Guardrails block over-borrowing.
  • apply(input): creates Loan (status under-review), amortization
    schedule generated (flat or reducing-balance), ref NY-LON-2025-…,
    audit entry.
  • approve/reject/decline [admin/finance-officer]: 2FA for approval; on
    approve → disburse (channel SIMULATED, ledger credit to borrower
    wallet/mpesa, debit sacco/capital) → status repaying.
  • repay(loanId, amount, channel): applies to earliest overdue then
    current instalment per amortization; posts ledger; updates progress
    ring; on full repayment → settled + release guarantor pledges.
  • restructure [admin]: extend term / reduce instalment (reason + 2FA +
    audit). writeOff [admin] (reason + 2FA + audit).

ALLOCATIONS + RECEIVE LINKS (financeService.allocation + accessService):
  • createAllocation(input): validates allocator ceiling + per-member cap +
    whitelist; creates Allocation + receiveToken (NY-RCV-…); status
    link-issued; ledger pending (no money moves yet).
  • walkReceive(token, pin, otp): the /r/:token flow — verifies PIN (≤3
    attempts then 15m lock), verifies OTP (SIMULATED), on success → status
    released → settled (ledger credit to recipient wallet/mpesa SIMULATED
    B2C, ny-flash-received).
  • revoke(token) [admin]: confirm + reason + audit; expires the link.
  • autoExpire: links past expiresAt → status expired.

CONTRIBUTIONS (financeService.contribution):
  • createCause(input) [admin/beneficiary] · contribute(causeId, memberId,
    amount, channel): SIMULATED STK/B2C, posts ledger to cause escrow,
    updates raised tally + progress ring, ny-flash-received.
  • payoutCause(causeId) [admin]: releases escrow to organizer destination
    (SIMULATED), posts ledger, audit.

FOUNDATION (financeService.foundation):
  • applyForGrant(input) · approve/disburse(pillar, beneficiary, amount,
    channel): SIMULATED disbursement to school paybill/hospital/beneficiary,
    posts ledger + grant disbursement record.

TRANSACTIONS & RECONCILIATION (recordsService):
  • unified list across all finance types, attributed, deep-linked.
  • reconcile(channelId): pulls mock statement, diffs vs ledger, raises
    exceptions (missing/mismatch/duplicate) with resolve actions.
  • exports (CSV/XLSX/PDF/KRA stub) queued.

EVERY finance mutation → audit_trail entry (actor, before/after, reason,
timestamp, IP/UA stub) + ledger entry. Money-touching config (caps, payout
channels, receive-PIN change) requires 2FA and (for some) 4-eyes.
```

---

## 12. EVENTS & ACTIVITIES ENGINE

```
eventsService:
  createEvent(input) [admin/host] · updateEvent · cancelEvent (confirm +
    reason + audit + notify attendees).
  rsvp(eventId, memberId, status) · bulkRemind(eventId).
  attachAlbum(eventId, albumId) · attachContributionCause(eventId, causeId).
  Reminder scheduler: fires at configured offsets (E-2d, E-1h) → broadcast
    to attendees via preferred channel (SIMULATED). Local timer in Phase 1.
  Calendar export (.ics per event / per family).
  Past-event archive + reconciliation (album links, contribution totals).
```

---

## 13. COMMUNICATIONS & BROADCAST ENGINE

```
commsService:
  composeBroadcast(input): resolves audience → recipient list with per-
    recipient channel (WhatsApp-capable → WhatsApp; else SMS; email for
    long-form; in-app always), cost preview (SMS KES × recipients),
    merge-field render ({first_name}, {branch}).
  send(broadcastId): SIMULATED fanout — per-recipient delivery receipts
    stream in (ny-row-in) over ~2s with status delivered/failed/pending +
    proof refs (SIMULATED). ONE toast at end ("sent to 240/242").
  schedule(broadcastId, atEAT) [BullMQ Phase 2 / local timer Phase 1].
  resend / duplicate / cancel.
  1:1 message(memberId, body, channel): SIMULATED thread.
  Templates: saved + quick-send ("RSVP reminder for {event}", "harambee
    announcement", "funeral notice", "due-date reminder").
  Quiet hours (EAT range; critical classes break through). SMS/day cap
    budget guard. Fallback chain: push → SMS if unread ≥ 10min for
    critical. Test-send per channel (SIMULATED proof + delivery log).
  Inbound (Phase 2 webhook): WhatsApp/SMS replies → threads; outbound now.
```

---

## 14. ACCESS, SECURITY & RBAC ENGINE

```
RBAC ROLES (family-scoped):
  Family Head (admin) — ALL permissions + ALL scope.
  Co-Admin / Elder    — most permissions, scoped to branch(es); cannot
                         change RBAC matrix or vault credentials.
  Finance Officer     — allocations, loan approval, payouts, ledger; no
                         lineage/role edits.
  Member              — own profile (non-money-routing fields), contribute,
                         apply for loans, RSVP, view.
  Ward / Minor        — view-only, guardian-managed.
  Viewer              — read-only across (e.g. diaspora relative).
  Permissions surface only the action buttons allowed (hidden, NOT
  disabled — disabled implies "you might get access"; hidden implies "not
  your job").

4-EYES / 2FA RULES:
  • Adding/changing a payout channel (M-Pesa/bank) — 2FA + admin.
  • Changing caps / RBAC matrix — 2FA + admin.
  • Approving a loan above threshold — 2FA + (optionally) co-sign.
  • Receive-PIN change — OTP on current number + admin co-sign.
  • Allocation release above per-tx cap — 2FA.
  • Write-off / restructure / revoke allocation — reason + 2FA + audit.

NO-LOGIN RECEIVE LINK (/r/:token — the elder flow):
  • A separate PUBLIC route, outside the dashboard shell, minimal chrome,
    Elder-Mode styling by default, large type, PinPad + OTPInput.
  • Flow: open link → "You've been sent KES X from {sender}. Enter your
    PIN." → PinPad (4-digit, ≤3 attempts then 15m lock) → "We sent a code
    to •••• 7890 via {channel}." → OTPInput (6-digit, SIMULATED in Phase 1)
    → "Receiving KES X to your M-Pesa •••• 7890…" → success screen with
    reference + "Done". On any failure → clear message + retry/contact.
  • No login required. No app install. Works on a basic Android browser.
  • Throttling: PIN 3 tries → 15m lock; OTP 3 tries → 15m lock; link
    expires at expiresAt; revoke by admin.
  • The dashboard T-9 PhoneMockup preview walks the same flow for the
    admin so they see exactly what the elder will see.
  • In Phase 2: the final "settled" step is fulfilled by the M-Pesa B2C
    confirmation webhook → /api/webhooks/receive/:token.

ADMIN-GATED FIELDS (T-15):
  • Mobile number (M-Pesa destination), bank account, Airtel, receive PIN
    → member CANNOT self-edit; they submit a ChangeRequest (new value +
    reason + OTP on current channel) → admin approves → field updates →
    audit. Until approved the OLD value stays active. Prevents silent
    redirection of payouts.

AUDIT:
  Every auth, money, lineage, comms, and config action → immutable
  audit_trail (append-only) with actor, action, entity, before/after,
  reason, timestamp, IP/UA stub. HMAC export. Feeds records + anomaly
  detection (Phase 2).
```

---

## 15. ACCESSIBILITY & INCLUSION ENGINE

```
OLD AND YOUNG TOGETHER — the design mandate.
  • Elder Mode (global toggle, top bar; persists; BroadcastChannel-synced
    across tabs): applies [data-ny-mode="elder"] → body 1.125rem, touch
    targets 56px, line-height 1.8, tables→cards always, secondary actions
    behind one "More ⋯" menu, QR codes 2×, reduced-motion ON, 3D tree →
    2D SVG fallback, larger PinPad buttons.
  • Plain language: all money/finance copy written for a non-finance
    reader ("Borrow up to KES X" not "credit facility utilization").
  • PIN-first flows: elders receive money via /r/:token without login.
  • High contrast: WCAG AA minimum everywhere, AAA for small text; focus
    ring always visible (--focus-ring).
  • Keyboard nav: full keyboard support across dashboard + 3D tree (arrow
    keys move nodes, Enter opens, Esc closes overlays).
  • Screen-reader: semantic landmarks, aria-labels on every icon button,
    live-region announcements for flash-received/posted/overdue.
  • Voice/assisted (mock in Phase 1, real in Phase 2): a "read aloud"
    button on key flows.
  • Language: EN primary with SW (Swahili) mock strings surfaced for
    common finance/lineage terms.
  • Reduced-motion: snap count-ups, no flash, no auto-rotate, no parallax,
    static 2D tree; Elder Mode forces ON.
```

---

## 16. NOTIFICATIONS & COMMS

```
EVENT × CHANNEL MATRIX (T-1 alert center + a global notifications drawer
from the bell; preferences in T-16):
  Events: contribution.received · loan.approved · loan.disbursed ·
  loan.overdue · allocation.received (elder link) · chama.rotation ·
  sacco.dividend · broadcast.received · event.reminder · obituary.posted ·
  foundation.approved · change-request.decided · lineage.edit-approved ·
  login.alert.
  Channels: In-app / Email / SMS / WhatsApp / Push.
  Defaults: money-in + alerts → in-app + WhatsApp (if capable) else SMS;
  critical (kill-switch equivalent — e.g. large allocation, overdue) → ALL.
  Quiet hours + SMS/day cap + fallback chain. Test-send per channel
  (SIMULATED proof). In Phase 1 these are simulated + drawer-only; a
  dedicated Notifications page can be added later if desired (currently
  folded into Command Center + bell drawer + Settings preferences).
```

---

## 17. COMPLETE PAGE INDEX

```
HOME (7):
H-1   /                        Landing
H-2   /about                   About us (Mzee Victor Nalyanya, origin, values)
H-3   /professions             Professions & expertise (public directory)
H-4   /foundation              Nalyanya Foundation (public)
H-5   /events                  Events & reunions (public)
H-6   /gallery                 Gallery (public teaser)
H-7   /contact                 Contact us

AUTH & ONBOARDING (8):
A-1   /auth/signup             Sign up (choose/create family + lineage)
A-2   /auth/signin             Sign in (choose family + lineage)
A-3   /auth/onboard            Onboarding wizard (6-step Stepper)
A-4   /auth/create-family      Family/lineage creator (root ancestor, branch)
A-5   /auth/forgot-password    Forgot password
A-6   /auth/reset-password     Reset password
A-7   /auth/verify-otp         Verify OTP (6-digit, reusable)
A-8   /auth/2fa                2FA + 4-digit receive-PIN setup

FAMILY DASHBOARD (16) — 7+ sections each:
T-1   /dashboard                   Command center (admin cockpit)
T-2   /dashboard/lineage           3D FAMILY TREE (showpiece)
T-3   /dashboard/members           Members directory
T-4   /dashboard/events            Events & activities
T-5   /dashboard/gallery           Gallery (Google Drive — Phase 2)
T-6   /dashboard/obituaries        Obituaries
T-7   /dashboard/contributions     Contributions (causes + payouts)
T-8   /dashboard/finances          Chama · merry-go-round · Sacco
T-9   /dashboard/finance-access    Allocations + elder receive links + preview
T-10  /dashboard/loans             Loans (advanced, comprehensive)
T-11  /dashboard/foundation        Foundation & charities
T-12  /dashboard/records           Records & analytics + ledger
T-13  /dashboard/professions       Professions & expertise directory
T-14  /dashboard/communications    Broadcasts (SMS/WhatsApp/email/in-app)
T-15  /dashboard/account           Account (admin-gated money-routing fields)
T-16  /dashboard/settings          Settings (master-admin config)

PUBLIC RECEIVE LINK (no-login):
R-1   /r/:token                   Elder receive flow (PIN + OTP → receive)

TOTAL PAGES: 7 + 8 + 16 + 1 (receive) = 32
TOTAL STYLESHEETS: 31 page-scoped + 1 app-shell + 1 receive-link = 33
```

---

## 18. IMPLEMENTATION PHASES

```
PHASE 0 — SCAFFOLD (frontend-only, first build step)
  • Repo: TanStack Start + Vite + React 19 + Bootstrap 5.3.x + Bootstrap Icons
  • tokens.css (warm-heritage palette, Fraunces/Inter, motion tokens, Elder
    Mode tokens), app-shell.css, DashboardShell, AuthShell, MarketingNav.
  • src/services/*.ts service layer (local mock signatures) + src/data/*.ts
    mock files (Family "Nalyanya" rooted at Mzee Victor Nalyanya, 240+ members,
    12 branches, 5+ generations) + src/types/*.ts.
  • Shared components (§7), Zod schemas, format helpers (kes, fmtDate EAT,
    maskPhone, ageFromYear).
  • Local tick/sync simulator + BroadcastChannel (elder-mode/kill-switch sync).
  • Bootstrap 6 may be tried; pin 5.3.x if anything misbehaves.

PHASE 1 — HOME + AUTH (build page-by-page per the build prompt)
  • H-1 → H-7 marketing pages (deep-link to auth).
  • A-1..A-8 auth incl. lineage chooser + family creator + receive-PIN setup.
  • /r/:token public receive-link route (PinPad + OTPInput + success/failure).

PHASE 2 — DASHBOARD (build page-by-page per the dashboard build prompt)
  • T-1 Command Center (sets the shell + top bar + sidebar + context store).
  • T-2 Lineage 3D Tree (react-three-fiber lazy + 2D fallback).
  • T-3..T-16 in order — each ships 7+ sections, ≥15 overlays (drawers,
    multi-step wizards, multi-step modals, confirms, per-row Actions),
    seamless deep-linkable URLs, zero dead ends, SIMULATED integrations.
  • Elder Mode rendering verified on every page; reduced-motion + 360px.

PHASE 3 — BACKEND WIRE-UP (later — not now)
  • Node/Express (or TanStack Start server fns) + PostgreSQL/Prisma +
    Redis + BullMQ.
  • Swap src/services/*.ts local mock bodies for real REST/socket calls —
    signatures unchanged, zero page-code edits.
  • Wire M-Pesa Daraja (B2C/STK/B2B), bank EFT, Africa's Talking SMS,
    WhatsApp Cloud API, Google Drive image pull, Resend email, OTP delivery.
  • Receive-link fulfilment via M-Pesa B2C webhook → /api/webhooks/receive/
    :token. Admin-gated change requests → real approval queue. Reconciliation
    against real broker/bank statements. Audit HMAC export.
  • Auth.js + TOTP 2FA + receive-PIN vault (AES-256-GCM at rest).
  • DPA 2019 Kenya compliance, data residency, consent log.

PHASE 4 — GROW
  • Anomaly/auto-mitigate, AI lineage suggestions, mobile installable
    (PWA) for elders, offline PIN retry, deeper Swahili localization,
    foundation public donate rails, Chama group-loan securitization views.

VERIFICATION PER PAGE (every build):
  1. npm run build + typecheck clean; zero console errors; zero network
     requests (frontend-only).
  2. Route curls 200 at 1440 / 768 / 360px; Elder Mode renders; reduced-
     motion path verified (3D tree → 2D fallback).
  3. Every <Link to> target exists in routeTree.gen.ts; every drawer/wizard
     deep-links via search params (back closes, reload restores).
  4. ≥15 overlays per dashboard page, all wired (no dead buttons, no
     placeholders, no "coming soon"); SIMULATED badges on every inert
     integration surface.
  5. ≥10 realistic Kenyan records per dataset on the page; no lorem ipsum,
     no "John Doe"; money in KES via kes(); dates EAT.
  6. RBAC: hidden-not-disabled for unauthorized actions; 2FA/4-eyes on
     money-touching config; admin-gated mobile/bank/PIN change enforced.

## END OF OUTLINE
```
