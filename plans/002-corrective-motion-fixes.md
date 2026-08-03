# 002 — Corrective motion fixes (return-zoom conflict, hover gating, preview enter, easing tokens, mute feedback)

- **Status**: DONE
- **Commit**: c2c79df
- **Severity**: HIGH (finding 1) + MEDIUM/LOW (2-5)
- **Category**: Interruptibility, Accessibility, Easing, Cohesion, Feedback
- **Estimated scope**: 6 CSS files, 3 HTML style blocks, 2 JS files

## Problem

1. **Return-zoom conflict (HIGH).** `styles/channel.css:79-97` applies
   `animation: channel-intro 600ms … both` to every `#channels .channel` on
   every menu load. A running CSS animation on transform/opacity overrides
   inline styles, which is what gsap writes in `zoomOutToMenu`
   (`scripts/transitions.js:73-80`). On every return from a channel the
   signature zoom-out is masked by the slide-in stagger. The bottom bar's
   `bar-intro` (`styles/bottom-bar.css:92-96`) likewise replays on return.
2. **Ungated hover motion (MEDIUM)** at `styles/bottom-bar.css:48`,
   `styles/channel.css:33`, `styles/channel-preview.css:106`,
   `styles/subpage.css:66`, `social.html:86`, `photography.html:70`,
   back-pills in `about.html:56` / `messages.html:57`, `styles/mute.css:15` —
   touch devices get sticky lifted states.
3. **Preview enter (MEDIUM)**: `scripts/channel-preview.js:58` — pure 300ms
   `power1.out` fade, no physicality.
4. **No easing tokens (LOW)**: 22× `cubic-bezier(0.23, 1, 0.32, 1)` and 4×
   `cubic-bezier(0.2, 0.9, 0.3, 1)` literals across 9 files.
5. **Mute has no feedback (LOW)**: `styles/mute.css` — no press state.

## Target

1. The inline pre-paint script on `index.html` (menu branch, where it already
   computes `returning`) adds `document.documentElement.classList.add("returning")`.
   CSS: `html.returning #channels .channel { animation: none; }` in
   channel.css; `html.returning #bottom-bar { animation: none; }` in
   bottom-bar.css. Result: on returns, tiles start at rest and gsap's zoom
   owns the motion; the bar stays put (persistent, like the real Wii).
2. Every `:hover` rule with a transform is wrapped in
   `@media (hover: hover) and (pointer: fine)`; `:focus-visible` equivalents
   stay ungated.
3. `gsap.fromTo(overlay, {opacity 0→1, duration 0.25, ease "expo.out"})` plus
   `.cp-stage` settle `scale(0.985→1, 0.25s, expo.out)`; skipped under
   `prefers-reduced-motion`. Exit unchanged (250ms fade).
4. `styles/main.css :root`:
   `--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);`
   `--ease-menu: cubic-bezier(0.2, 0.9, 0.3, 1);`
   All CSS/style-block literals swapped for `var(--…)`. JS strings in the
   inline pre-paint scripts keep literals (bootstrap must not depend on CSSOM).
5. `.mute-btn { transition: transform 150ms var(--ease-out-strong); }`,
   `:active { transform: scale(0.92); }`, hover gated.

## Boundaries

- Do NOT alter the zoom/flash choreography in `transitions.js` beyond nothing —
  finding 1 is fixed in CSS + the inline script only.
- Do NOT change literals inside inline `<script>` blocks (pre-paint bootstrap).
- Bump `?v=` stamps for every changed CSS/JS file in all referencing pages.

## Verification

- Return from a channel: tile has a gsap inline transform mid-flight
  (computed transform ≠ none ≠ identity within first 300ms), computed
  `animation-name: none` on tiles, bar does not replay.
- Cold load of menu (no return): intro stagger + bar slide still play.
- All pages: zero console errors; grep shows no ungated transform-`:hover`.
- Reduced motion: preview scale settle skipped, fade retained.
