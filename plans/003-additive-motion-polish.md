# 003 — Additive polish (clock colon blink, social entrance, lightbox dot pill, book hover)

- **Status**: DONE
- **Commit**: c2c79df
- **Severity**: LOW (delight/polish)
- **Category**: Missed opportunities
- **Estimated scope**: 1 JS file, 2 CSS files, 3 HTML style/script blocks

## Target

A. **Clock colon blink (menu bottom bar)** — authentic Wii detail.
   `scripts/clock.js`: render the time as
   `hh<span class="colon">:</span>mm` instead of plain text.
   `styles/bottom-bar.css`:
   ```css
   .clock-time .colon { animation: colon-blink 2s steps(1) infinite; }
   @keyframes colon-blink { 50% { opacity: 0.25; } }
   @media (prefers-reduced-motion: reduce) { .clock-time .colon { animation: none; } }
   ```
   (2s cycle = 1s visible / 1s dim, matching the console's per-second tick.)

B. **Social tiles entrance** — `social.html`: keyframe fade-up on
   `.social-item`, 300ms `var(--ease-out-strong)` `both`, nth-child delays
   0/40/80/120ms, from `opacity 0; transform: translateY(8px) scale(0.98)`,
   reduced-motion: none. Entrance-only → keyframes acceptable (never re-runs).

C. **Lightbox progress pill** — `photography.html`: dots are currently
   rebuilt via `innerHTML` every slide (transitions can't run). Build dots
   once per project open; on slide change toggle `.active` classes only.
   CSS: `.lightbox-progress .dot { transition: width 200ms var(--ease-out-strong), background 200ms ease; }`
   `.dot.active { width: 18px; }` (7px→18px; tiny area, layout cost trivial).

D. **Book cover hover lift** — `books.html`:
   `.book-cover { transition: transform 200ms var(--ease-out-strong), box-shadow 200ms ease; }`
   gated hover: `.book:hover .book-cover { transform: translateY(-4px); }`
   with a deepened shadow. Carousel already pauses on hover.

## Boundaries

- Menu clock only for the blink (subpage mini-clocks stay static).
- No new dependencies; keyframes only where the animation never re-runs.

## Verification

- Colon dims once per second on the menu; static under reduced motion.
- Social page entrance staggers; photography lightbox active dot stretches
  smoothly when advancing; book covers lift on desktop hover only.
- Zero console errors on all pages.
