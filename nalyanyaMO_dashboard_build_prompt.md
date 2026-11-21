# Nalyanya — Dashboard Pages Build Prompt (T-1 → T-16)

Paste into Claude **after** `nalyanyaMO_build_prompt.md`. It builds the 16 family-
dashboard pages one per turn, starting with T-1. The home-page prompt's STACK, DESIGN
SYSTEM, FRONTEND-ONLY MODE, PERFORMANCE, and QUALITY BAR all still apply — obey them
throughout. New focus: deep overlay density, seamless URL wiring, Elder Mode on every
page, and the 3D lineage tree (T-2) using the advanced 3D stack.

## SCOPE
Build pages T-1 → T-16 (routes `/dashboard` … `/dashboard/settings`), in index order,
one per turn. Each implements ALL 7 sections from its `nalyanyaMO.md` spec, mounted
inside the shared **DashboardShell**: sticky top bar (logo · FamilyContextPill switcher ·
Elder Mode toggle · notifications bell · profile) + 16-item sidebar (active route
highlighted). Reuse the §7 shared components — `Drawer`, `Stepper`, `OTPInput`,
`PinPad`, `ProgressRing`, `ReceiveLinkCard`, `PhoneMockup`, `TreeCanvas3D`,
`TreeFallback2D`, `DataTable`, `ActionsMenu`, `ConfirmDialog`, `ApprovalGate`,
`MemberCard`, `RoleChip`, `BranchBadge`, `MoneyBadge`, `EmptyState` — never rebuild them.

## 3D & RENDERING STACK — TanStack + Vite + Bootstrap latest, right tool per job
- **T-2 Lineage 3D tree — TRUE 3D WEBGL (primary path, recommended):**
  React Three Fiber (`@react-three/fiber`) + `@react-three/drei` (CameraControls,
  OrbitControls, Billboard, Tube, Line, Environment) + `three`. Compute the tree layout
  with **d3-hierarchy** (d3.cluster / d3.tree → x/y/z positions per generation + branch).
  Animate camera fly-throughs and node tweens with **GSAP** (short timelines, killed on
  unmount). Render crisp member-name labels with **troika-three-text** (SDF text,
  GPU-friendly — do NOT use `<Html>` for >30 nodes; it kills perf). InstancedMesh for
  nodes when >200; frustum culling; LOD by distance; lazy-load the WHOLE 3D bundle via
  dynamic import on the T-2 route so the rest of the app stays light.
- **Large-family shortcut (optional, only if a family exceeds ~400 nodes):**
  `3d-force-graph` (Three.js built-in) for a force-directed 3D graph that renders
  hundreds of connected family nodes with minimal setup — switch to this only if the
  d3-hierarchy layout strains.
- **2.5D HTML/DOM — Elder-Mode + reduced-motion + WebGL-fail fallback:**
  **GSAP (with Flip)** + **CSS 3D Transforms** + **React Flow** for a static tilted
  "card-bio" tree view. Auto-engaged under `prefers-reduced-motion` OR WebGL
  unavailable OR Elder Mode. Identical navigation to the 3D scene (click node → detail
  drawer, search, "where am I?", generation/branch filter). No animation, no parallax.
- **Visual 3D scene builder (optional, sparingly):**
  **Spline** + `@splinetool/runtime` (Vite/React) for a visually-designed heritage
  environment scene if you want a hero-quality Command Center (T-1) mini-teaser or a
  future splash — dynamic-import only, never on the critical path.
- **Performance gates:** the T-2 route code-splits ALL 3D libs; first paint = shell +
  control rail + 2D React Flow skeleton, 3D hydrates after idle; LCP < 1.5s maintained;
  reduced-motion / Elder Mode → 2D React Flow instantly.
- **Bootstrap:** latest (6 if stable today, else 5.3.x) + Bootstrap Icons; light
  default; no jQuery.

## INTERACTION DENSITY — ≥15 overlays per page
Every dashboard page ships AT LEAST 15 of: drawers, multi-step Stepper wizards,
multi-step modals, confirm dialogs, per-row Actions menus, tab/mini-tab groups. No
decorative dropdowns, no dead buttons, no "coming soon".

- **Drawers** (slide-in right on lg+, full-screen on sm), each with tabs: Member Detail
  (Overview · Family · Contact · Profession · Finance · Timeline), Contribution Cause
  (Overview · Contributors · Payouts · Comms · Audit), Loan (Summary · Amortization ·
  Repayments · Guarantors · Comms · Audit), Allocation (link lifecycle + receive
  preview), Chama (Overview · Members · Cycle · Payouts · Statements · Audit), Event
  (Overview · RSVPs · Album · Contributions · Comms · Budget), Obituary (Notice · Life
  Story · Funeral · Condolences · Contributions · Gallery), Professional Profile,
  Broadcast (Overview · Recipients · Delivery · Replies), Foundation Grant,
  Change-Request, Transaction (lifecycle · ledger · journal).
- **Multi-step wizards (Stepper)**: Onboarding (A-3, 6-step), Family/Lineage Creator
  (A-4), Add Member (T-3), Event Builder (T-4), Upload (T-5), New Obituary (T-6,
  sensitive), Contribute + Create Cause (T-7), Buy Shares + Create Chama/Product (T-8),
  Allocate (T-9), Loan Application (T-10, 6-step), Foundation Apply (T-11), Add Listing
  (T-13), Broadcast Composer (T-14, the core), Change-Request (T-15), Data-Export /
  Delete-Account (T-15/T-16).
- **Multi-step modals**: Confirm-Execute with typed confirm for large allocations/loans;
  kill-switch-equivalent confirms (Pause allocations · Lockdown · Revoke all links —
  T-9/T-16); Override-with-reason (overdue handling, cap overrides — allowed only where
  rules permit); Approval Gate (admin/4-eyes, 2FA); Credential Reveal + OTP (T-16 vault);
  PIN change (T-15, 4-eyes); Test-Send per channel (T-14); Feature-flag / cap edit → 2FA
  (T-16, T-9); Receive-link phone-preview walk-through (T-9 PhoneMockup is interactive);
  Delete/Revoke confirms with reason (member remove, obituary unpublish, loan write-off,
  allocation revoke, broadcast cancel, branch delete).
- **Per-row Actions dropdowns** on every table — real working items only (View · Edit ·
  Send receive link · Repay · Restructure · Mark settled · Rotate · Payout · Resend ·
  Revoke · Approve · Decline · Duplicate · Cancel · Export row). RBAC-gated:
  unauthorized actions are HIDDEN not disabled; where an integration can't act yet, show
  a guidance note + SIMULATED badge — never a dead/disabled button.
- **Tabs + mini-tabs**: status filters (All/Pending/Confirmed/Failed/Settled…),
  purpose/type chips, branch/scope tabs, period selectors (1M/3M/6M/1Y/ALL), drawer
  sub-tabs.

## SEAMLESS URL WIRING — every link is a real, shareable route
- Sidebar, top bar, cross-page CTAs, attribution deep-links — all typed `<Link to>`
  targets that exist in the route tree. Zero `href="#"`, zero dead redirects.
- **Deep-linkable overlays**: opening a drawer/wizard writes to the URL (TanStack Router
  search params, e.g. `/dashboard/members?member=NY-MBR-00042`,
  `/dashboard/loans?apply=sacco-backed`, `/dashboard/lineage?focus=NY-MBR-00042&branch=
  nalyanya-bungoma&gen=1,3`). Back closes; reload restores; shareable.
- **Cross-page prefilled flows** via search params: T-1 "send elder receive link" →
  `/dashboard/finance-access?allocate=NY-MBR-…`; T-1/T-2 event CTA →
  `/dashboard/events?build=…`; T-7 contribution CTA →
  `/dashboard/contributions?contribute=NY-CON-…`; T-8 "apply for loan" →
  `/dashboard/loans?apply=sacco-backed&shares=…`; T-10/T-12 attribution chips → open the
  source drawer on T-7/T-8/T-9/T-11 via `?open=<ref>`; T-2 member node "send receive
  link" → T-9 prefilled.
- **Family/branch context in the URL**: pages scoped by family/branch reflect it
  (`/dashboard/loans?branch=nalyanya-bungoma`) so switching context is seamless,
  persists, shareable. Elder Mode persists too.
- **Breadcrumbs** on sub-pages for orientation.

## FRONTEND-ONLY REMINDER (dashboard-specific)
- All overlays function locally: paper/local flows (chama rotation, sacco share
  accrual, loan origination, allocation release via PIN+OTP, ledger postings, the 3D
  tree) simulate end-to-end through `src/services/*` (refs NY-LON-2025-…, NY-ALC-2025-…,
  NY-CON-2025-…, flash-posted/flash-received, ledger entries). Live integration submits
  (M-Pesa B2C, WhatsApp send, Google Drive pull, bank EFT) resolve to the labeled
  "Ready — connects when the backend is wired" / SIMULATED state — never a fake "Sent to
  M-Pesa", never a dead button.
- The `/r/:token` elder receive flow (T-9 PhoneMockup preview walks it) fully simulates
  PIN → OTP → released → settled locally.
- Elder Mode + pause-allocations broadcast across tabs via BroadcastChannel — no server.
- Tick simulator drives balances/share accrual/chama countdowns and KPI flashes;
  300–800ms fake latency on services so skeletons and optimistic states show.

## PER-PAGE OVERLAY FLOOR (≥15 each — headline overlays; add more if natural)
- **T-1 Command Center**: family-health drawer · per-branch sparkline drawer ·
  allocation detail drawer · alert detail modal · quick-allocate wizard(prefill) ·
  quick-broadcast modal · quick-event wizard(prefill) · elder-receive-link send modal ·
  notifications drawer · 3D-tree mini-teaser open · KPI drilldown · chama-rotation alert
  · overdue-loan drilldown · contribution snapshot detail · calendar event detail.
- **T-2 Lineage (3D)**: focus-member drawer(6 tabs) · where-am-I panel · branch-fit cam
  · search-results modal · generation-filter · branch-filter · add-relation wizard
  (admin) · mark-deceased confirm · mark-adopted · merge-duplicate modal · edit-request
  submit · 2D-fallback toggle · legend modal · branch-overview open · audit-requests
  drawer.
- **T-3 Members**: member detail drawer(6 tabs) · add-member wizard · role-assign modal
  · suspend confirm · remove confirm · send-receive-link · export-row · bulk-actions bar
  · requests-queue drawer · relation-seed modal · branch-reassign · finance-snapshot ·
  filter modal · merge-duplicate · audit.
- **T-4 Events**: event detail drawer(6 tabs) · event builder wizard · RSVP bulk-remind
  · invite-send(SIMULATED) · cancel-confirm · duplicate · attach-album · attach-
  contribution · calendar popover · drag-reschedule · reminders editor · budget-line
  modal · past-event archive · export-ics · host-change.
- **T-5 Gallery**: lightbox · upload wizard · album-create · album-permissions · source-
  connector(Google Drive SIMULATED) · tag-members · set-cover · move-to-album · trash-
  restore · audit · sync-now · folder-picker · batch-tag · export-album.
- **T-6 Obituaries**: obituary detail drawer(6 tabs) · new-obituary wizard(sensitive) ·
  condolence-post · moderate-condolence · funeral-detail · attach-contribution · attach-
  album · anniversary-broadcast · archive-filter · export-memorial · unpublish-confirm
  · candle-light · family-statement editor.
- **T-7 Contributions**: contribute wizard · cause detail drawer(5 tabs) · create-cause
  wizard · payout-cause confirm · reconcile modal · exception-resolve · broadcast-
  contributors · mute-source · refund confirm · export · beneficiary-anon toggle ·
  deadline-extend · scope-picker · progress-ring detail · ledger drilldown.
- **T-8 Finances (Chama/Sacco)**: buy-shares wizard · create-chama wizard · chama detail
  drawer(6 tabs) · rotate-now confirm · merry-go-round order editor · sacco-eligibility
  meter · loan-apply prefill · dividend-distribute(2FA) · share-curve detail ·
  transaction detail · statements · rules-editor(2FA) · audit · export-statement.
- **T-9 Finance Access**: allocate wizard(Stepper) · receive-link panel · phone-mockup
  preview(interactive) · resend-link · revoke-link confirm · link-health detail ·
  rules-limits(2FA) · pin-attempt-lock modal · otp-channel picker · change-pin(4-eyes)
  · ceiling-edit · whitelist · audit · ledger drilldown · expire-now.
- **T-10 Loans**: loan application wizard(6-step) · loan detail drawer(6 tabs) ·
  amortization detail · repay wizard · restructure(2FA) · write-off(reason+2FA) ·
  approve/decline(2FA) · guarantor-pledge modal · collateral editor · auto-collect
  toggle · overdue drilldown · statement-PDF · cancel · portfolio-export.
- **T-11 Foundation**: apply-for-grant wizard · grant detail drawer(5 tabs) · disburse
  (SIMULATED) · document-upload · review-queue · approve(2FA) · close-grant · broadcast-
  beneficiary · pillar-summary · donor-list · annual-report · transparency-export ·
  restructure · audit.
- **T-12 Records**: transaction detail · attribution drilldown · statement-import
  wizard · reconciliation exception · resolve-action · export-center job · journal-note
  · column-chooser · range-selector · PDF-preview · KRA-export config · ledger drilldown
  · imbalance-banner detail · per-account reconcile · source-deep-link.
- **T-13 Professions**: profile detail drawer(5 tabs) · add-listing wizard · contact-
  reveal modal · hire/ask-form · endorse · review-post · moderate · verify-badge(admin)
  · category-manager · remove-confirm · portfolio-upload · branch-scope · export · edit.
- **T-14 Communications**: broadcast composer(multi-step) · audience-picker · channel-
  selector · template-picker · schedule · broadcast detail drawer(4 tabs) · resend ·
  duplicate · cancel · 1:1 thread · test-send-per-channel · quiet-hours editor · rate-
  limit editor · delivery-proof · merge-field picker · inbound-reply mock.
- **T-15 Account**: profile-edit · change-request wizard(phone/bank/pin) · otp-verify ·
  password-change · 2FA re-enroll · recovery-codes · session-revoke · receive-pin-
  change(4-eyes) · preferences · finance-profile · request-status · data-export ·
  consent-log · delete-account multi-step.
- **T-16 Settings**: family-profile edit · RBAC matrix editor(2FA) · integration-
  credential editor(vault) · test-button(SIMULATED) · rotate · revoke · automation
  scheduler · reminder-template editor · appearance/elder-defaults · locale · retention-
  policy · feature-flag toggle(2FA) · webhook-docs · outbound-webhook test-fire ·
  audit-export · integration-status.

## WORKING PROTOCOL — one page per turn
- I name the page (first: T-1). Build ONLY that page. Do not build future pages "while
  you're at it".
- BEFORE code: re-read that page's spec in `nalyanyaMO.md` (e.g. "PAGE T-6") + §2
  tokens + §7 components + §8 query keys; re-read `src/styles/tokens.css`, the
  DashboardShell, and one already-built dashboard page for consistency. Reuse shared
  components — never duplicate or restyle them.
- If the DashboardShell / top bar / sidebar / shared primitives don't exist yet, create
  them as part of T-1, then build the page.
- Cross-page links to pages not built yet must still resolve: tiny designed stub route
  ("opens in a later step" + link back) per the home-page prompt. Never a 404, never
  blank.
- Wire every overlay to the URL (deep-linkable), every cross-page CTA to a typed route
  with prefilled search params, every table row to a working Actions menu + detail
  drawer, every destructive/money action to a confirm (reason where the outline says).
  Frontend-only: paper simulates live; live-integration submits end in the labeled
  "connects later" state.
- When the page passes the QUALITY BAR: run build + Lighthouse mobile, fix everything,
  then STOP and reply with a 4-line report (page built · overlays shipped with counts ·
  URL deep-links wired · verification incl. zero-network + 360px + Elder Mode +
  reduced-motion + Lighthouse). Wait for my "next" instruction.

## FIRST DASHBOARD PAGE — T-1 Command Center (`/dashboard`)
Implement all 7 sections from `nalyanyaMO.md` "PAGE T-1": build the DashboardShell
(sticky top bar with FamilyContextPill + Elder Mode toggle + notifications bell +
profile, 16-item sidebar) → S1 status ribbon (family health chips) → S2 KPI row (6,
count-up, flash) → S3 family finance curve + per-branch sparklines → S4 live
contributions snapshot (→ T-7 detail via URL param) → S5 mini 3D lineage teaser (lazy,
SVG fallback under Elder Mode / reduced-motion) → S6 alerts & action center (each →
deep-link) → S7 upcoming events + chama/calendar strip. Ship ≥15 overlays per the floor
above, wire every link to a real route, verify (incl. Lighthouse + Elder Mode +
reduced-motion), report, and stop.
