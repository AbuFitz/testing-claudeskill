# BarbersPro, Luton

One-page cinematic site for a Luton barbershop. React + Vite + Three.js.
Built with the OneSimpleSite Web Designer skill (Immersive gear).

## Run

```bash
npm install
npm run dev          # development
npm run build        # production build to dist/
npm run preview      # serve the production build on :4173
npm test             # unit tests (booking/CTA logic, nothing-invented guard)
npm run test:e2e     # Playwright: builds, serves, runs the browser tests at desktop + mobile
```

Playwright uses `CHROMIUM_PATH` if set, otherwise `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

## Idea

The visitor closes a straight razor by scrolling, and the wordmark is cut open along the blade
to reveal LUTON. Everything else is calm: a ledger menu, a pinned strip of photo slots, a booking block.

## How the 3D layer behaves

- The hero is complete without it: a designed SVG razor plus the real HTML headline and CTAs.
- Three.js (about 140 kB gzip) is code-split and fetched only on first interaction, or after 6 s for a passive viewer.
- It is skipped for: no WebGL, software renderers (SwiftShader/llvmpipe), Save-Data. On WebGL context loss it falls back live to the poster.
  `?gl=force` overrides the software check (used by tests).
- Reduced motion: no pinned scroll, no scrubbing, no cue, one static 3D frame, everything else intact.
- Rendering pauses when the hero is off screen or the tab is hidden; DPR is capped; GPU resources are disposed on unmount.

## Verified (production build)

| Check | Result |
|---|---|
| Playwright, desktop 1440 and mobile 390 | all pass: live 3D, no-WebGL, software GL, context loss, reduced motion, choreography, nav, form, keyboard, tap targets, axe |
| axe (WCAG 2.0/2.1 A and AA, best practice) | 0 moderate/serious/critical |
| Lighthouse mobile (3 runs) | Perf 97-98, A11y 100, Best practices 100, SEO 100, CLS 0 |
| Lighthouse desktop (3 runs) | Perf 100, A11y 100, Best practices 100, SEO 100, CLS 0 |
| Console errors, failed requests, horizontal overflow at 320 / 390 / 768 / 1440 / 2200 | none |

Caveat: the audits ran headless with software GL, so Lighthouse measured the poster path. The **live 3D path** was
not profiled on a real GPU or phone. Test on a mid-range Android and an iPhone before launch.

## What the client must supply

Marked on the page with hatched `[BRACKETED]` placeholders. Nothing was invented.
See `PLACEHOLDERS.md`. Real values go in `src/content/site.js`; the UI reconnects itself.
