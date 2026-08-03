# 001 — Kill the page-load zoom snap; add subpage entrance fade

- **Status**: DONE
- **Commit**: c2c79df
- **Severity**: HIGH
- **Category**: Performance / Physicality (feel-breaking first-paint snap)
- **Estimated scope**: 8 HTML files + 1 CSS file, ~15 lines each

## Problem

Every page's stage is scaled by JavaScript that runs only after two
parser-blocking CDN scripts download. First paint happens at `scale(1)`,
then the transform lands and the page visibly snaps to its real zoom
(menu ≈1.73×, subpages ≈1.125× at 1440×900). Locally the CDN is cached and
the snap is invisible; on the live site cold visitors see the page "zoom in"
on every navigation, and since menu and subpages scale differently, the cut
between them reads as reframing.

```html
<!-- index.html (end of body) — current: parser-blocking, then module scales -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
<script type="module" src="scripts/menu.js?v=1785715000"></script>
```

```js
// scripts/scale.js:29-41 — the scale math that arrives too late for frame 1
const BOTTOM_BAR_H = 100;
const MENU_ZOOM = 1.2;
export function applyScale(stageEl) {
  if (isMobileLayout()) { stageEl.style.transform = ""; return; }
  const onMenu = stageEl.id === "stage";
  const stageW = onMenu ? STAGE_W : stageEl.offsetWidth || STAGE_W;   // 985 / 1280
  const stageH = onMenu ? STAGE_H : stageEl.offsetHeight || STAGE_H;  // 554 / 720
  const h = onMenu ? window.innerHeight - BOTTOM_BAR_H : window.innerHeight;
  const fit = Math.min(window.innerWidth / stageW, h / stageH);
  const scale = onMenu ? fit * MENU_ZOOM : fit;
  stageEl.style.transform = `scale(${scale})`;
}
```

Secondary: subpage arrival is a hard cut (the white flash covers the exit,
nothing covers the entry).

## Target

1. **Pre-paint scaling.** An inline classic `<script>` placed immediately
   after the `#letterbox` closing tag on every stage-scaled page applies the
   exact same transform synchronously during parse — before any paint can
   happen. The module scaler keeps handling resize afterward (idempotent).

```html
<script>
  // Pre-paint scale — mirrors scripts/scale.js applyScale (985/554/100/1.2
  // and 1280/720 constants MUST stay in sync with that file). Runs inline so
  // the first painted frame is already at the correct zoom; without this the
  // page paints at scale(1) until the CDN scripts + modules finish loading.
  (function () {
    if (window.matchMedia("(max-width: 700px)").matches) return;
    var el = document.getElementById("stage") || document.querySelector(".subpage-stage");
    if (!el) return;
    var menu = el.id === "stage";
    var w = menu ? 985 : 1280, h = menu ? 554 : 720;
    var vh = window.innerHeight - (menu ? 100 : 0);
    var fit = Math.min(window.innerWidth / w, vh / h);
    el.style.transform = "scale(" + (menu ? fit * 1.2 : fit) + ")";
  })();
</script>
```

2. **Defer the CDN scripts** on every page: `<script defer src="…gsap…">`,
   `<script defer src="…howler…">`. Both are used only on interaction;
   `defer` preserves execution order ahead of the modules (defer + module
   scripts run in document order before DOMContentLoaded).

3. **Subpage entrance fade** in `styles/subpage.css` — opacity only, no
   scale motion (scale motion would reintroduce the zoom feel):

```css
/* Entrance: pages fade in over the flash cut. Opacity only — the stage
   transform belongs to the scaler. */
.subpage-stage {
  opacity: 1;
  transition: opacity 180ms cubic-bezier(0.23, 1, 0.32, 1);
}
@starting-style {
  .subpage-stage { opacity: 0; }
}
```

## Repo conventions to follow

- Strong ease-out curve `cubic-bezier(0.23, 1, 0.32, 1)` is the site's
  standard (see `bookmarks.html` `.bm-card` transitions, `photography.html`
  `.lightbox`).
- Cache-busting: any changed CSS/JS gets a fresh `?v=` stamp in every HTML
  that references it (see the `?v=1785715000` stamps). `subpage.css` changes
  here → bump its stamp on all 7 pages that link it.
- Mobile (≤700px) never scales — the inline script must no-op there, same as
  `isMobileLayout()` in `scripts/scale.js`.

## Steps

1. `index.html`: insert the inline pre-paint script right after
   `</div>` closing `#letterbox`; add `defer` to the two CDN script tags.
2. Same inline script + `defer` in: `about.html`, `books.html`,
   `bookmarks.html`, `photography.html`, `social.html`, `writings.html`.
   (`messages.html` has no scaled stage — `defer` only, no inline script.)
3. `styles/subpage.css`: append the entrance-fade block above.
4. Bump `styles/subpage.css?v=` to a fresh stamp in the 7 pages linking it.

## Boundaries

- Do NOT touch `scripts/scale.js` logic, `scripts/transitions.js` (the Wii
  zoom in/out is deliberate — `expo.in` into the flash cut is its cinematic
  grammar), or the menu's channel-intro/bar-intro keyframes.
- Do NOT add scale/transform motion to the entrance — opacity only.
- Do NOT add dependencies.
- If the letterbox markup differs from the excerpt (drift), STOP and report.

## Verification

- **Mechanical**: load each page headless; `getComputedStyle(stage).transform`
  must be a matrix (not `none`) immediately at navigation completion, before
  any sleep. Console: zero errors on all 8 pages. Mobile 390×844: transform
  stays `none`, no horizontal overflow.
- **Feel check**: with DevTools network throttled to "Slow 3G" + disabled
  cache, navigate menu → about: the page must never render small-then-snap;
  it should appear already-framed, fading in over ~180ms. Return to menu:
  same. Toggle `prefers-reduced-motion`: entrance fade may remain (opacity
  aids comprehension); no movement is added anywhere.
- **Done when**: no unscaled frame is ever visible under throttling, and the
  menu ↔ subpage cut reads as a fade, not a reframe.

## Revision (post-ship)

The `@starting-style` opacity fade on `.subpage-stage` was REVERTED: with the
whole stage at `opacity: 0`, the page's first frame had no contentful paint,
so Chrome kept holding the previous page's pixels (user-visible as 1–5s of
blank/stale frame before the page "properly loaded"). Replaced with an
**arrival flash**: the inline pre-paint script sets `#flash-overlay` to
opacity 1 (content fully painted beneath it — FCP fires at ~40ms) and fades
it out over 250ms `cubic-bezier(0.23,1,0.32,1)` — symmetric with the
white-out exit. Menu returns hold the white until `zoomOutToMenu` releases it
(with a 2.5s inline safety fade); tile-less returns (`__avatar`) release it in
`scripts/transitions.js`.
