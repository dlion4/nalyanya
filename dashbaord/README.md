# Nalyanya Family Workspace

The T-1 family command center is available at `/dashboard`. The root route also opens the command center for this dashboard-first build.

## Run locally

```sh
npm install
npm run dev
```

`npm run build` creates the production application in `dist`. `npx tsc --noEmit` checks TypeScript. Deploy the contents of `dist` with a single-page-app fallback to `index.html`.

## This phase

T-1 has thirteen sections: the photographic welcome, family overview, finance curve, upcoming gathering, contributions, attention center, interactive lineage, branch balances, family album, savings circles, shared causes, calendar, and integration previews.

The sixteen dashboard destinations have working routes, individual TSX files, local data files, and page stylesheets. T-1 is the detailed implementation in this phase. The other destinations are focused, functional companion views, not claims that all later blueprint phases have been implemented.

All profiles, balances, family events, and relationships are illustrative mock data. The app does not connect to any financial, messaging, authentication, or storage backend. M-Pesa, WhatsApp, SMS, and Drive submissions use a review step followed by an explicitly **SIMULATED** receipt. Payment previews update the demo wallet only. No external message is sent, payment initiated, or folder accessed.

Preferences, RSVPs, saved memories, created gatherings, and simulation records persist in this browser under `nalyanya.workspace.v1`. No credentials or unmasked phone numbers are stored. This is a demonstration, not an authentication or authorization boundary.

## Source organization

- `src/pages/dashboard/command-center/`: T-1 page and its bespoke layout.
- `src/pages/dashboard/<area>/`: individual companion page and stylesheet.
- `src/data/dashboard/`: strongly typed local page data, navigation, and family records.
- `src/routes/dashboard/`: dashboard route group, using TanStack Router.
- `src/styles/tokens.css`: shared Tailwind v4 theme and local font declarations.
- `src/components/media/IrisPhoto.tsx`: eight-blade camera aperture, photo decoding, swipe, and keyboard navigation.
- `src/components/lineage/`: responsive family tree with a keyboard-accessible SVG fallback.
- `src/graphics/lineage-scene.ts`: Three.js scene, curved branch connections, portrait sprites, orbit, zoom, focus, and resource cleanup.
- `src/components/overlays/`: deep-linked Headless UI dialogs, details, and validated workflows.
- `src/services/adapters/local.ts`: frontend-only integration boundary.
- `src/state/Workspace.tsx`: branch context, local mutations, accessible modes, and cross-tab preference updates.

The layout uses Tailwind CSS v4, Fraunces, Inter, Lucide, Motion for React, d3-hierarchy, and Three.js. No Bootstrap is used. The 3D renderer is a separate, locally hosted module, loaded only when its scene is visible. Elder Mode, reduced motion, and unsupported WebGL devices get the static tree instead.

To rebuild the committed 3D browser module after editing its source:

```sh
npx esbuild src/graphics/lineage-scene.ts --bundle --format=esm --target=es2020 --minify --outfile=public/scene/lineage.mjs
```

## Try the workspace

- Use the arrows on the welcome photograph or the memory lightbox to see the iris shutter. The carousel does not autoplay.
- Select a KPI to inspect its underlying members, balance, contributions, or events.
- Use **Quick actions** to preview a deposit, withdrawal, transfer, contribution, broadcast, allocation, or new gathering.
- Change the finance chart's period and measure. Hover or use the arrow keys on the chart to inspect values.
- Choose a branch in the sidebar to scope the overview, wallet, event list, and family tree.
- Open an event, save a local RSVP, and download its `.ics` calendar file.
- Press `Ctrl+K` or `Cmd+K` to search for a page, family member, event, or photograph.
- Open `/dashboard?panel=health` or `/dashboard/gallery?panel=memory&id=reunion` to test reloadable overlays. Browser Back closes an overlay opened from a page.

## Verification

```sh
npm run build
npm run preview -- --port 4173
# In another terminal:
npx playwright install chromium
node scripts/verify.mjs
```

The verification script covers all sixteen routes, form validation, review and simulation, local persistence, finance balances, photo navigation, RSVP, calendar download, branch context, notifications, direct links, responsive sizing, Elder Mode, and reduced motion. It checks for browser errors, broken images, and external network requests. Local asset requests are expected.

## Reference material

The original project is [dlion4/nalyanya](https://github.com/dlion4/nalyanya/tree/main). The [application blueprint](https://github.com/dlion4/nalyanya/blob/main/nalyanyaMO.md#page-t-1-command-center-dashboard), [Tailwind build prompt](https://github.com/dlion4/nalyanya/blob/main/nalyanyaMO_build_prompt.md), and [dashboard prompt](https://github.com/dlion4/nalyanya/blob/main/nalyanyaMO_dashboard_build_prompt.md) informed this build. Reference copies are in `docs/reference/`.

## Photography

All visible photographs are real, locally hosted stock images. They illustrate the fictional family records; they do not identify the photographed people as Nalyanya family members.

- Acacia at sunset: [Unsplash photograph](https://images.unsplash.com/photo-1516026672322-bc52d61a55d5).
- Family gathering and family crafts: Askar Abayev, Pexels [6189933](https://www.pexels.com/photo/6189933/) and [6190854](https://www.pexels.com/photo/6190854/).
- Kenyan highlands: Vince Pictures, Pexels [30255159](https://www.pexels.com/photo/30255159/).
- Grandfather and grandson: Mikhail Nilov, Pexels [6973197](https://www.pexels.com/photo/6973197/).
- Garden gathering: Samuel Peter, Pexels [16934314](https://www.pexels.com/photo/16934314/).
- Administrator portrait: August de Richelieu, Pexels [7432863](https://www.pexels.com/photo/7432863/).
- Family portraits: Greta Hoffman, Pexels [9706101](https://www.pexels.com/photo/9706101/) and Darkshade Photos, Pexels [28375913](https://www.pexels.com/photo/28375913/).
- Golden landscape: Vishva Patel, Pexels [6318162](https://www.pexels.com/photo/6318162/).
