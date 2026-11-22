# T-1 verification

- Production build: passed.
- TypeScript: passed with `npx tsc --noEmit`.
- End-to-end browser checks: 19 passed.
- Dashboard routes: 16 verified, plus the root command-center alias.
- Sections: 13. Deep-linkable panel types: 34.
- Widths checked: 360, 390, 768, 1024, and 1440 pixels.
- Browser errors: 0. External requests: 0.
- Elder Mode: persisted on reload; 56px controls; accessible static tree.
- Reduced motion: instant image changes and the SVG tree.
- True 3D: Three.js WebGL canvas and member focus verified in Chromium with SwiftShader.

## Mobile Lighthouse

Measured against the production preview with Lighthouse 12.8.2, default mobile throttling.

- Performance: 91/100
- Accessibility: 100/100
- Best practices: 100/100
- Largest Contentful Paint: 2.9 s
- Cumulative Layout Shift: 0

Scores are local lab measurements, not guarantees for every device. The blueprint's sub-1.5-second mobile LCP target was not reached in this throttled run. SEO is not a target for these dashboard routes; robots.txt intentionally excludes them from indexing.

## Checks

- Desktop command center has 13 sections and local photography
- The eight-blade shutter closes, changes photographs, and opens
- Command search finds people and supports Escape
- Branch selection scopes the dashboard and survives reload
- Money form validates, reviews, simulates, and persists a balanced wallet delta
- Withdraw, internal transfer, allocation and contribution flows
- M-Pesa preview enforces branch-specific funds
- WhatsApp, SMS and broadcast previews never send messages
- Drive folder validates and simulates without OAuth or file access
- New gathering, RSVP persistence and calendar export
- Memory lightbox preserves its URL, bookmark, and shutter navigation
- Notifications support acknowledgements and safe dismissal
- All sixteen grouped dashboard routes render real content
- Drilldowns and review panels are directly addressable
- Browser back closes a deep-linked overlay
- Responsive layouts at 360, 390, 768, 1024, and 1440 pixels
- Elder mode persists with generous controls and a static tree
- Reduced motion skips the mechanical shutter and uses the SVG tree
- No external data requests, missing photographs, or browser errors
