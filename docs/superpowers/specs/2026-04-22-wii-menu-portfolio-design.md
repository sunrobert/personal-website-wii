# Wii Menu Portfolio — Design Spec

**Date:** 2026-04-22
**Status:** Approved for planning
**Reference:** [maybeltr.com](https://www.maybeltr.com/) (a Wii Main Menu-styled personal portfolio)

## Summary

A personal portfolio website styled as a pixel-faithful recreation of the Nintendo Wii Main Menu. The landing page is the Wii "Channels" grid; each channel deep-links (with the iconic zoom transition, SFX, and BGM) to a sub-page. Live user-local clock, animated blue swoosh, circular avatar and message buttons on the bottom bar. Letterboxed 16:9 scaling so it looks the same on any viewport.

## Goals

- **Feel like a Wii, not like a website dressed as one.** Sound, animation, and inertia all present.
- **5 working channels + 7 empty slots** that visibly read as "no disc inserted" (the gray "Wii" watermark).
- **Zero build tooling.** Plain files, drop-in deploy to Vercel or Cloudflare Pages.
- **Future-swappable content.** Each sub-page is one HTML file — no CMS, no framework.

## Non-goals

- Full mobile reinvention. The menu scales as a letterboxed 16:9 canvas at every size; no stacked mobile layout.
- A real CMS, blog engine, or backend.
- Multi-user features. Guestbook / dynamic message board is out of scope for v1.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Markup/style | Plain HTML + CSS | No framework needed for a static menu |
| Animation | GSAP | Smoothest option for the channel zoom-into-page transition |
| Audio | Howler.js | Cross-browser autoplay unlock, loop + sprite support |
| Fonts | "Wii Extra" or DSEG7 for the clock; system sans for body | Licensed/open substitutes for Nintendo fonts |
| Hosting | Vercel (free tier) | Free, zero config, drag-and-drop |

## Audio rights

User has opted to use the original Wii Menu BGM + SFX despite Nintendo copyright. Low enforcement risk on a personal site; acknowledged tradeoff.

## Site map

```
/                    index.html      — the Wii channels menu
/social              social.html     — Social Links (icons/URLs to socials)
/writings            writings.html   — My Writings (list of posts/essays)
/books               books.html      — Books (reading list / reviews)
/mii-out             mii-out.html    — Check Mii Out Channel (People page)
/photography         photography.html — Photography gallery
/messages            messages.html   — Wii Message Board (announcements/log)
```

Routing is plain files; no SPA router. Sub-pages open via the zoom transition, land on a matching sub-page layout, and return to the menu via a "Wii Menu" button that reverses the zoom into the originating channel.

## File layout

```
wii-menu/
├── index.html
├── social.html
├── writings.html
├── books.html
├── mii-out.html
├── photography.html
├── messages.html
├── styles/
│   ├── main.css          # canvas, grid, bottom bar, shared tokens
│   ├── channel.css       # channel box + hover/select/empty states
│   └── subpage.css       # sub-page frame and back button
├── scripts/
│   ├── menu.js           # grid behavior, zoom transitions, clock, keyboard nav
│   └── audio.js          # Howler setup, BGM loop, SFX, mute persistence
└── assets/
    ├── avatar.jpg
    ├── channels/
    │   ├── social.png
    │   ├── writings.png
    │   ├── books.png
    │   ├── mii-out.png
    │   └── photography.png
    ├── audio/
    │   ├── bgm.mp3
    │   ├── hover.mp3
    │   ├── select.mp3
    │   ├── back.mp3
    │   └── startup.mp3
    └── fonts/
        └── wii-extra.woff2
```

## Component design

### 1. Canvas scaling

The menu is authored at a fixed logical resolution of **1280 × 720** (16:9). A single outer `<div class="stage">` is scaled with CSS `transform: scale()` to fit the viewport while preserving aspect ratio, centered with letterbox bars (same light-gray as the menu background so bars are invisible when matched).

- On resize, a JS listener recomputes `scale = min(viewportW/1280, viewportH/720)` and applies it.
- All element sizes inside the stage are expressed in px at the 1280×720 reference; no responsive breakpoints inside.

### 2. Channel grid

4 columns × 3 rows = 12 slots. Each slot is ~280×140px with ~20px gutters. Positioned inside the stage, centered horizontally, top-aligned with some margin from the viewport top.

**Channel placement (top-left cluster):**

| Row | Col 1 | Col 2 | Col 3 | Col 4 |
|---|---|---|---|---|
| 1 | Photography | Social Links | My Writings | Check Mii Out |
| 2 | Books | (empty) | (empty) | (empty) |
| 3 | (empty) | (empty) | (empty) | (empty) |

**Channel box (active):**
- Rounded rectangle, `border-radius: 16px`
- White bezel border (2px), box-shadow `0 4px 12px rgba(0,0,0,0.15)`
- Inner artwork fills the box (object-fit: cover)
- Channel title overlaid near top, Wii-style typography (bold, slight drop shadow)
- Default state: neutral
- Hover/focus state: `transform: translateY(-2px) scale(1.03)`, brighter glow, fires `hover.mp3`
- Press state: `scale(0.97)` for 80ms right before the zoom transition begins

**Channel box (empty slot):**
- Same footprint, no bezel shadow
- Background: light gray (`#eaeaea`) with subtle noise/grain texture
- Faint "Wii" watermark in soft gray, centered
- Not focusable, not clickable

### 3. Bottom bar

Fixed height ~100px (about 14% of the 720 canvas), anchored to the bottom of the stage. White background with the iconic blue wavy ribbon sliding horizontally across it.

**Left — avatar button:**
- Circular, ~80px diameter, white bezel, drop shadow
- User-provided photo fills the circle (object-fit: cover)
- On click: opens a small Mii-style profile card modal (name, one-line bio, fun stat)

**Center — clock + date:**
- Digital clock font, ~72px, showing live local time in 12-hour format with AM/PM
- Date below clock, abbreviated format: `Wed 4/22`
- Updates every minute via a `setInterval`

**Right — envelope button:**
- Circular, mirror of avatar
- Mail glyph centered
- On click: Wii zoom transition into `/messages.html`

**Wii swoosh:**
- SVG blue wave overlay on top of the white bar
- Gentle horizontal translation (~20s loop) via CSS keyframe animation
- Purely decorative

### 4. Transitions (the "Wii feel")

**Hover bob:** CSS transition on `transform`, ~150ms ease-out. Fires `hover.mp3` (one-shot, short).

**Zoom-into-channel (click):**
1. Fire `select.mp3`
2. GSAP timeline: channel scales from current position to fill screen (~350ms, `expo.in` ease), other channels fade + scale down slightly
3. White flash overlay fades in (80ms)
4. `window.location.href = '<subpage>.html?from=<channel-id>'`

**Zoom-out-of-channel (sub-page → menu):**
1. User clicks "Wii Menu" button → fires `back.mp3`
2. White flash fades in
3. `window.location.href = 'index.html?return=<channel-id>'`
4. `index.html` reads `return` param; on load, plays the *reverse* timeline — menu starts fullscreen-zoomed on that channel, rapidly shrinks back into its grid slot

**Keyboard navigation:** Arrow keys move focus between active channels; Enter selects. Matches Wii Remote D-pad feel.

### 5. Audio system

**BGM:**
- Wii Menu theme looped via Howler
- Muted until first user gesture (click/keydown) to satisfy browser autoplay policy
- After first gesture: fades in over 2s
- Mute state persisted in `localStorage.wiiMuted`

**Mute control:**
- Small speaker/speaker-mute icon fixed in top-right corner of the stage
- Toggles BGM volume; SFX always play (they're tied to interactions the user initiated)

**SFX (all one-shot):**
- `startup.mp3` — Wii power-on tone, plays once on first page load
- `hover.mp3` — soft beep, debounced to 50ms to prevent machine-gunning on rapid hover
- `select.mp3` — "POP" when a channel is activated
- `back.mp3` — descending boop when returning to menu

### 6. Sub-page template

Shared layout (see `subpage.css`):
- White/light-gray background matching the menu
- Top bar: channel title in Wii font, small channel icon to its left
- Body: rounded-rectangle content panel (`border-radius: 16px`, white, soft shadow)
- Bottom bar: single rounded rectangle button "**Wii Menu**" anchored bottom-center

Per-page bodies are plain HTML — no shared component system. Content can be edited by hand-editing each file. Examples of what each sub-page contains initially:

- **social.html:** a row of large circular icons linking to external profiles
- **writings.html:** a vertical list of post titles + dates + short descriptions
- **books.html:** a grid of book covers with titles/authors
- **mii-out.html:** a grid of "people" cards (photo + name + short note)
- **photography.html:** a responsive photo grid (CSS grid, aspect-ratio cells)
- **messages.html:** a Wii Message Board styled timeline of announcements

Initial content is placeholder / sparse; user fills in over time.

## Assets

| Asset | Source | Status |
|---|---|---|
| `avatar.jpg` | User provides | Pending user |
| `channels/social.png` | Reuse from reference site | Scrape during implementation |
| `channels/writings.png` | Reuse from reference site | Scrape during implementation |
| `channels/books.png` | Reuse from reference site | Scrape during implementation |
| `channels/mii-out.png` | Reuse from reference site | Scrape during implementation |
| `channels/photography.png` | AI-generate Wii-style camera scene | Generate during implementation |
| `audio/*.mp3` | Wii emulation community archives | Download during implementation |
| `fonts/wii-extra.woff2` | Free Wii font substitute | Download during implementation |

## Accessibility

- All channels are `<button>` elements; keyboard navigable.
- Channel titles read by screen readers (visible text, not baked into images).
- Mute toggle has `aria-label`.
- Prefers-reduced-motion: the zoom-into-channel transition falls back to a fast crossfade; hover bob is disabled.

## Open questions (resolve during implementation)

- Actual social URLs, book list, writings list, photography URLs — user-supplied content, doesn't block the structural build.
- Whether to use a custom Wii hand cursor. Default: no (could make the site feel gimmicky on desktop). Revisit after first demo.

## Success criteria

1. On desktop, at 1920×1080, the menu is indistinguishable from a real Wii Main Menu at a glance.
2. Hover a channel → bob + SFX. Click → zoom transition + navigates to sub-page.
3. Clicking "Wii Menu" from a sub-page reverses the zoom and lands back on the origin channel.
4. Clock shows the correct local time, updates every minute.
5. BGM loops and can be muted; mute state survives reload.
6. Viewports from 375×812 (phone) through ultrawide all display the menu letterboxed at 16:9 without distortion.
