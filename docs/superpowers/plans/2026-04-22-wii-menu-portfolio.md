# Wii Menu Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal portfolio styled as a pixel-faithful Nintendo Wii Main Menu — grid of channels, bottom bar with avatar/clock/swoosh/envelope, full BGM + SFX + zoom transitions — and 6 sub-pages that zoom back to the menu.

**Architecture:** One `index.html` as the menu, 6 sub-page HTML files, shared CSS in `styles/`, vanilla JS in `scripts/` with GSAP for transitions and Howler for audio. Fixed 1280×720 logical stage scaled to fit any viewport with letterbox. No build step, no framework. Deploy: Vercel.

**Tech Stack:** HTML + CSS + vanilla JS, GSAP 3 (CDN), Howler.js (CDN), DSEG7 font (open-source clock substitute), Wii audio assets.

**Verification approach:** This is a visual/interactive project. Pure functions (clock format, scale math) get tiny `bun test` unit tests. UI behavior is verified at each milestone with the `$B` (gstack browse) tool by taking screenshots and inspecting state. Treat "Run it to verify" steps as `$B` commands.

**Environment setup:** Commands assume you have `bun` installed. If not: `curl -fsSL https://bun.sh/install | bash`. The browse tool path is `$B = ~/.claude/skills/gstack/browse/dist/browse` (set once per task).

---

## Phase 1 — Foundation: assets, scaffold, canvas scaling

### Task 1: Scaffold project directories and the index.html shell

**Files:**
- Create: `index.html`
- Create: `styles/main.css`
- Create: `scripts/menu.js`
- Create: `assets/channels/.gitkeep`
- Create: `assets/audio/.gitkeep`
- Create: `assets/fonts/.gitkeep`

- [ ] **Step 1: Create the directory skeleton**

```bash
mkdir -p styles scripts assets/channels assets/audio assets/fonts
touch assets/channels/.gitkeep assets/audio/.gitkeep assets/fonts/.gitkeep
```

- [ ] **Step 2: Write minimal index.html**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Main Menu</title>
  <link rel="stylesheet" href="styles/main.css" />
</head>
<body>
  <div id="letterbox">
    <div id="stage">
      <main id="channels"></main>
      <footer id="bottom-bar"></footer>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  <script type="module" src="scripts/menu.js"></script>
</body>
</html>
```

- [ ] **Step 3: Write a placeholder main.css**

Create `styles/main.css`:

```css
:root {
  --menu-bg: #e8e8e8;
  --stage-w: 1280px;
  --stage-h: 720px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 100%; height: 100%;
  background: var(--menu-bg);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  overflow: hidden;
}
#letterbox {
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
}
#stage {
  width: var(--stage-w);
  height: var(--stage-h);
  position: relative;
  background: var(--menu-bg);
  transform-origin: center center;
  overflow: hidden;
}
```

- [ ] **Step 4: Write a placeholder menu.js**

Create `scripts/menu.js`:

```js
console.log("Wii Menu boot");
```

- [ ] **Step 5: Verify the page loads**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B screenshot /tmp/task1-shell.png
$B console
kill $SERVER_PID
```

Expected: Screenshot shows a solid light-gray rectangle centered in the viewport. Console shows `Wii Menu boot` and no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold index.html with stage container"
```

---

### Task 2: Canvas scaling (the 1280×720 stage fits any viewport)

**Files:**
- Modify: `scripts/menu.js`
- Create: `scripts/scale.js`
- Create: `tests/scale.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/scale.test.js`:

```js
import { expect, test } from "bun:test";
import { computeScale } from "../scripts/scale.js";

test("fits viewport exactly when aspect ratios match", () => {
  expect(computeScale(1280, 720)).toBe(1);
  expect(computeScale(2560, 1440)).toBe(2);
});

test("letterboxes when viewport is wider than 16:9", () => {
  // 2000x720 viewport: height is the constraint, scale=1
  expect(computeScale(2000, 720)).toBe(1);
});

test("pillarboxes when viewport is taller than 16:9", () => {
  // 1280x1000: width is the constraint, scale=1
  expect(computeScale(1280, 1000)).toBe(1);
});

test("scales down for small viewports", () => {
  expect(computeScale(640, 360)).toBe(0.5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/scale.test.js`
Expected: FAIL — module not found or `computeScale` is not exported.

- [ ] **Step 3: Implement computeScale**

Create `scripts/scale.js`:

```js
export const STAGE_W = 1280;
export const STAGE_H = 720;

export function computeScale(viewportW, viewportH) {
  return Math.min(viewportW / STAGE_W, viewportH / STAGE_H);
}

export function applyScale(stageEl) {
  const scale = computeScale(window.innerWidth, window.innerHeight);
  stageEl.style.transform = `scale(${scale})`;
}

export function installScaler(stageEl) {
  applyScale(stageEl);
  window.addEventListener("resize", () => applyScale(stageEl));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/scale.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire into menu.js**

Replace `scripts/menu.js` with:

```js
import { installScaler } from "./scale.js";

const stage = document.getElementById("stage");
installScaler(stage);
console.log("Wii Menu boot");
```

- [ ] **Step 6: Verify visually at multiple viewport sizes**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B viewport 1920x1080
$B screenshot /tmp/task2-1920.png
$B viewport 1280x720
$B screenshot /tmp/task2-1280.png
$B viewport 375x812
$B screenshot /tmp/task2-mobile.png
kill $SERVER_PID
```

Expected: In all three screenshots the gray stage is centered and proportional; no stretching. On the 375×812 shot the stage is small and centered, letterboxed with the same gray above and below.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 16:9 canvas scaling with resize handling"
```

---

### Task 3: Download channel art from the reference site

**Files:**
- Create: `assets/channels/social.png`
- Create: `assets/channels/writings.png`
- Create: `assets/channels/books.png`
- Create: `assets/channels/mii-out.png`

- [ ] **Step 1: Fetch the reference page and list image URLs**

Run:

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto https://www.maybeltr.com/
$B wait --networkidle
$B media --images > /tmp/maybeltr-images.json
cat /tmp/maybeltr-images.json
```

Expected: JSON list of image URLs used on the page. You are looking for four channel-artwork PNGs — typically named with the channel (social, writings, books, mii-out) or with UUIDs/hashes.

- [ ] **Step 2: Identify and download the four channels**

From the JSON, identify the URL for each of: Social Links, My Writings, Books, Check Mii Out. For each, run:

```bash
$B download <url> assets/channels/social.png
$B download <url> assets/channels/writings.png
$B download <url> assets/channels/books.png
$B download <url> assets/channels/mii-out.png
```

Verify with:

```bash
ls -la assets/channels/
file assets/channels/*.png
```

Expected: Four PNG files present, each nonzero size and identified as PNG.

- [ ] **Step 3: Commit**

```bash
git add assets/channels/
git commit -m "assets: channel art scraped from reference"
```

---

### Task 4: Generate the Photography channel art

**Files:**
- Create: `assets/channels/photography.png`

- [ ] **Step 1: Generate Wii-style channel thumbnail**

Use any image generator available (the environment may have access to `imagen` / `sdxl` tooling; otherwise ask the user to generate one or grab a CC-licensed image). The target specifications:

- Aspect ratio: 16:9 landscape (to match the other channels)
- Background: soft pastel gradient (like the Wii channels — peach/cream bottom fading to light blue top)
- Subject: a stylized camera (Polaroid or SLR), vector/cartoon style
- Add a subtle "sparkle" accent and bubble motif like the reference's Books channel
- Title text will be overlaid via CSS, so leave headroom at the top

Save to `assets/channels/photography.png`. If you cannot generate one, create a placeholder:

```bash
# Placeholder: solid gradient PNG with a camera emoji (requires ImageMagick; skip if unavailable)
magick -size 560x280 gradient:'#ffd9a8'-'#a8d8ff' \
  -gravity center -pointsize 180 -fill '#333' \
  -annotate +0+20 '📷' \
  assets/channels/photography.png
```

If ImageMagick isn't installed, create a 1×1 transparent PNG placeholder and note it in `assets/channels/TODO.md`:

```bash
printf '\x89PNG\r\n\x1a\n' > assets/channels/photography.png
echo "Photography channel art is a placeholder; replace with real artwork before shipping." > assets/channels/TODO.md
```

- [ ] **Step 2: Commit**

```bash
git add assets/channels/
git commit -m "assets: photography channel art"
```

---

### Task 5: Download the Wii audio assets

**Files:**
- Create: `assets/audio/bgm.mp3`
- Create: `assets/audio/hover.mp3`
- Create: `assets/audio/select.mp3`
- Create: `assets/audio/back.mp3`
- Create: `assets/audio/startup.mp3`

- [ ] **Step 1: Acquire the files**

Search the web for the following (these files are widely mirrored on Wii fan sites):

- `Wii Menu Theme` loopable MP3 → `assets/audio/bgm.mp3`
- Wii "Menu Selection" SFX → `assets/audio/hover.mp3`
- Wii "Decide" / channel-open SFX → `assets/audio/select.mp3`
- Wii "Cancel" / back SFX → `assets/audio/back.mp3`
- Wii startup/"Wii Sound" short jingle → `assets/audio/startup.mp3`

Common source: `sounds-resource.com/wii/wiimenu/`. Download each manually or via `curl -L -o <path> <url>`.

- [ ] **Step 2: Verify files play**

```bash
ls -la assets/audio/
file assets/audio/*.mp3
```

Expected: All 5 files present, each identified as an MP3. If one is missing, leave a `TODO` in a comment and proceed — `audio.js` in Task 13 tolerates missing files (it logs a warning rather than crashing).

- [ ] **Step 3: Commit**

```bash
git add assets/audio/
git commit -m "assets: Wii audio (BGM + SFX)"
```

---

### Task 6: Install the DSEG7 clock font

**Files:**
- Create: `assets/fonts/DSEG7Classic-Bold.woff2`
- Modify: `styles/main.css`

- [ ] **Step 1: Download the font**

```bash
curl -L -o /tmp/dseg.zip https://github.com/keshikan/DSEG/releases/download/v0.46/fonts-DSEG_v046.zip
unzip -j /tmp/dseg.zip '*DSEG7Classic-Bold.woff2' -d assets/fonts/ 2>/dev/null || \
  unzip -j /tmp/dseg.zip '*DSEG7Classic-Bold.ttf' -d assets/fonts/
ls assets/fonts/
```

If the woff2 variant isn't in the archive, convert the TTF (or keep the TTF — it works fine in browsers):

```bash
# If only TTF was extracted, rename for consistency
[ -f assets/fonts/DSEG7Classic-Bold.ttf ] && mv assets/fonts/DSEG7Classic-Bold.ttf assets/fonts/DSEG7Classic-Bold.ttf
```

- [ ] **Step 2: Add @font-face declaration**

Append to `styles/main.css`:

```css
@font-face {
  font-family: "DSEG7";
  src: url("../assets/fonts/DSEG7Classic-Bold.woff2") format("woff2"),
       url("../assets/fonts/DSEG7Classic-Bold.ttf") format("truetype");
  font-weight: 700;
  font-display: swap;
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "assets: DSEG7 clock font"
```

---

## Phase 2 — The channel grid

### Task 7: Channel data module and static grid rendering

**Files:**
- Create: `scripts/channels.js`
- Create: `styles/channel.css`
- Modify: `index.html`
- Modify: `scripts/menu.js`

- [ ] **Step 1: Link the channel stylesheet**

In `index.html`, in `<head>`, replace the single `<link>` with:

```html
<link rel="stylesheet" href="styles/main.css" />
<link rel="stylesheet" href="styles/channel.css" />
```

- [ ] **Step 2: Write the channel data module**

Create `scripts/channels.js`:

```js
// 4 columns x 3 rows = 12 slots, row-major (slot 0 is top-left)
export const CHANNELS = [
  { slot: 0, id: "photography", title: "Photography",      href: "photography.html", art: "assets/channels/photography.png" },
  { slot: 1, id: "social",      title: "Social Links",     href: "social.html",      art: "assets/channels/social.png" },
  { slot: 2, id: "writings",    title: "My Writings",      href: "writings.html",    art: "assets/channels/writings.png" },
  { slot: 3, id: "mii-out",     title: "Check Mii Out Channel", href: "mii-out.html", art: "assets/channels/mii-out.png" },
  { slot: 4, id: "books",       title: "Books",            href: "books.html",       art: "assets/channels/books.png" },
];

export function renderGrid(container) {
  container.innerHTML = "";
  for (let slot = 0; slot < 12; slot++) {
    const channel = CHANNELS.find((c) => c.slot === slot);
    const el = document.createElement(channel ? "button" : "div");
    el.className = channel ? "channel channel--active" : "channel channel--empty";
    el.dataset.slot = String(slot);
    if (channel) {
      el.dataset.channelId = channel.id;
      el.setAttribute("aria-label", channel.title);
      el.innerHTML = `
        <img class="channel__art" src="${channel.art}" alt="" />
        <span class="channel__title">${channel.title}</span>
      `;
    } else {
      el.innerHTML = `<span class="channel__watermark">Wii</span>`;
    }
    container.appendChild(el);
  }
}
```

- [ ] **Step 3: Write channel styles**

Create `styles/channel.css`:

```css
#channels {
  display: grid;
  grid-template-columns: repeat(4, 280px);
  grid-template-rows: repeat(3, 140px);
  gap: 20px;
  padding: 40px;
  justify-content: center;
  align-content: start;
}

.channel {
  position: relative;
  width: 280px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 2px solid #fff;
  font: inherit;
  padding: 0;
}

.channel--active {
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.8);
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}

.channel--active:hover,
.channel--active:focus-visible {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 100, 200, 0.25), inset 0 1px 0 rgba(255,255,255,0.8);
  outline: none;
}

.channel__art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.channel__title {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  text-shadow:
    0 1px 0 rgba(0,0,0,0.5),
    0 0 6px rgba(0,0,0,0.3);
  pointer-events: none;
}

.channel--empty {
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%),
    #dedede;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
}

.channel--empty .channel__watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(120, 120, 120, 0.35);
  font-weight: 700;
  font-size: 36px;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 4: Render on load**

Replace `scripts/menu.js` with:

```js
import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";

const stage = document.getElementById("stage");
installScaler(stage);
renderGrid(document.getElementById("channels"));
```

- [ ] **Step 5: Verify visually**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B viewport 1280x720
$B screenshot /tmp/task7-grid.png
$B snapshot -i
kill $SERVER_PID
```

Expected: Screenshot shows a 4×3 grid. Row 1 = Photography, Social Links, My Writings, Check Mii Out Channel. Row 2 = Books, then three empty "Wii" slots. Row 3 = four empty slots. Snapshot shows 5 interactive buttons.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: static channel grid with art and empty slots"
```

---

### Task 8: Keyboard navigation (arrow keys + Enter)

**Files:**
- Create: `scripts/nav.js`
- Modify: `scripts/menu.js`

- [ ] **Step 1: Write the navigation module**

Create `scripts/nav.js`:

```js
// Moves DOM focus between .channel--active elements using arrow keys.
// Up/Down move by 4 slots (row); Left/Right by 1 (col). Wraps within grid.
export function installKeyboardNav(container) {
  const buttons = Array.from(container.querySelectorAll(".channel--active"));
  if (buttons.length === 0) return;

  // Seed initial focus on first active channel.
  buttons[0].setAttribute("tabindex", "0");
  buttons.slice(1).forEach((b) => b.setAttribute("tabindex", "0"));

  container.addEventListener("keydown", (e) => {
    const current = document.activeElement;
    if (!current || !current.classList.contains("channel--active")) return;
    const slot = parseInt(current.dataset.slot, 10);
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }[e.key];
    if (delta === undefined) return;
    e.preventDefault();

    // Find nearest active channel in the delta direction.
    for (let next = slot + delta; next >= 0 && next < 12; next += delta) {
      const target = container.querySelector(`.channel--active[data-slot="${next}"]`);
      if (target) { target.focus(); return; }
    }
  });
}
```

- [ ] **Step 2: Wire into menu.js**

Update `scripts/menu.js`:

```js
import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";
import { installKeyboardNav } from "./nav.js";

const stage = document.getElementById("stage");
installScaler(stage);

const grid = document.getElementById("channels");
renderGrid(grid);
installKeyboardNav(grid);

// Focus the first active channel on load so keyboard works immediately.
grid.querySelector(".channel--active")?.focus();
```

- [ ] **Step 3: Verify keyboard nav**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B press ArrowRight
$B js 'document.activeElement.dataset.channelId'
kill $SERVER_PID
```

Expected: The `js` output is `"social"` (arrow-right from Photography moves to Social Links).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: keyboard navigation between channels"
```

---

## Phase 3 — The bottom bar

### Task 9: Bottom bar static layout (avatar, clock area, envelope, swoosh)

**Files:**
- Create: `styles/bottom-bar.css`
- Create: `scripts/bottom-bar.js`
- Modify: `index.html`
- Modify: `scripts/menu.js`
- Create: `assets/avatar.jpg` (placeholder)

- [ ] **Step 1: Add a placeholder avatar**

Download any small square image, or create a placeholder:

```bash
curl -L -o assets/avatar.jpg "https://placehold.co/256x256/cccccc/666666.jpg?text=You"
```

If that fails, the engineer can drop any JPG at `assets/avatar.jpg` — the layout tolerates any square image.

- [ ] **Step 2: Link the stylesheet**

In `index.html`, in `<head>`:

```html
<link rel="stylesheet" href="styles/bottom-bar.css" />
```

- [ ] **Step 3: Write the styles**

Create `styles/bottom-bar.css`:

```css
#bottom-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100px;
  background: #ffffff;
  border-top: 1px solid #d8d8d8;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.06);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 2;
}

.swoosh {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bb-btn {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #fff;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8);
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: transform 150ms ease-out;
}

.bb-btn:hover, .bb-btn:focus-visible { transform: scale(1.05); outline: none; }

.bb-btn img { width: 100%; height: 100%; object-fit: cover; }

.bb-btn--envelope { display: flex; align-items: center; justify-content: center; font-size: 32px; }

.clock-box {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #888;
}

.clock-time {
  font-family: "DSEG7", "Courier New", monospace;
  font-size: 56px;
  letter-spacing: 0.02em;
  line-height: 1;
}

.clock-time .ampm {
  font-size: 22px;
  margin-left: 8px;
  vertical-align: baseline;
}

.clock-date {
  margin-top: 4px;
  font-size: 16px;
  color: #aaa;
}
```

- [ ] **Step 4: Write the renderer**

Create `scripts/bottom-bar.js`:

```js
export function renderBottomBar(container) {
  container.innerHTML = `
    <svg class="swoosh" viewBox="0 0 1280 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="swoosh-path"
            d="M0,55 Q200,10 400,40 T800,45 T1280,30 L1280,100 L0,100 Z"
            fill="#bfe1ff" opacity="0.7"/>
      <path class="swoosh-line"
            d="M0,55 Q200,10 400,40 T800,45 T1280,30"
            fill="none" stroke="#6fb6ff" stroke-width="2" opacity="0.9"/>
    </svg>
    <button class="bb-btn bb-btn--avatar" aria-label="Profile">
      <img src="assets/avatar.jpg" alt="" />
    </button>
    <div class="clock-box">
      <div class="clock-time" id="clock-time">--:--<span class="ampm">--</span></div>
      <div class="clock-date" id="clock-date">—</div>
    </div>
    <button class="bb-btn bb-btn--envelope" aria-label="Messages">✉</button>
  `;
}
```

- [ ] **Step 5: Wire into menu.js**

Update `scripts/menu.js`:

```js
import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";
import { installKeyboardNav } from "./nav.js";
import { renderBottomBar } from "./bottom-bar.js";

const stage = document.getElementById("stage");
installScaler(stage);

const grid = document.getElementById("channels");
renderGrid(grid);
installKeyboardNav(grid);
grid.querySelector(".channel--active")?.focus();

renderBottomBar(document.getElementById("bottom-bar"));
```

- [ ] **Step 6: Verify visually**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B viewport 1280x720
$B screenshot /tmp/task9-bar.png
kill $SERVER_PID
```

Expected: Bottom bar visible, ~100px tall, avatar circle on left, big "--:-- --" clock center, envelope ✉ on right. The blue swoosh wave is visible behind the content.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: bottom bar with avatar, clock area, envelope, swoosh"
```

---

### Task 10: Live clock (hh:mm AM/PM + date)

**Files:**
- Create: `scripts/clock.js`
- Create: `tests/clock.test.js`
- Modify: `scripts/menu.js`

- [ ] **Step 1: Write the failing test**

Create `tests/clock.test.js`:

```js
import { expect, test } from "bun:test";
import { formatTime, formatDate } from "../scripts/clock.js";

test("formats midnight as 12:00 AM", () => {
  expect(formatTime(new Date("2026-04-22T00:00:00"))).toEqual({ hhmm: "12:00", ampm: "AM" });
});

test("formats noon as 12:00 PM", () => {
  expect(formatTime(new Date("2026-04-22T12:00:00"))).toEqual({ hhmm: "12:00", ampm: "PM" });
});

test("formats 7:52 PM", () => {
  expect(formatTime(new Date("2026-04-22T19:52:00"))).toEqual({ hhmm: "7:52", ampm: "PM" });
});

test("formats 1:05 AM with zero-padded minutes", () => {
  expect(formatTime(new Date("2026-04-22T01:05:00"))).toEqual({ hhmm: "1:05", ampm: "AM" });
});

test("formats date as Wed 4/22", () => {
  expect(formatDate(new Date("2026-04-22T12:00:00"))).toBe("Wed 4/22");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/clock.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement clock.js**

Create `scripts/clock.js`:

```js
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return { hhmm: `${h}:${String(m).padStart(2, "0")}`, ampm };
}

export function formatDate(d) {
  return `${DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
}

export function startClock(timeEl, dateEl) {
  const tick = () => {
    const now = new Date();
    const { hhmm, ampm } = formatTime(now);
    timeEl.innerHTML = `${hhmm}<span class="ampm">${ampm}</span>`;
    dateEl.textContent = formatDate(now);
  };
  tick();
  // Align first tick to the next minute, then every 60s.
  const msToNextMinute = 60_000 - (Date.now() % 60_000);
  setTimeout(() => {
    tick();
    setInterval(tick, 60_000);
  }, msToNextMinute);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/clock.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Start the clock on load**

Update `scripts/menu.js` — add at the bottom:

```js
import { startClock } from "./clock.js";
startClock(document.getElementById("clock-time"), document.getElementById("clock-date"));
```

- [ ] **Step 6: Verify visually**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B js 'document.getElementById("clock-time").textContent'
$B js 'document.getElementById("clock-date").textContent'
$B screenshot /tmp/task10-clock.png
kill $SERVER_PID
```

Expected: The `js` results show the current time (like `"7:52PM"`) and date (like `"Wed 4/22"`). Screenshot shows the clock populated.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: live clock with AM/PM and abbreviated date"
```

---

### Task 11: Swoosh horizontal-drift animation

**Files:**
- Modify: `styles/bottom-bar.css`

- [ ] **Step 1: Add the keyframe animation**

Append to `styles/bottom-bar.css`:

```css
@keyframes swoosh-drift {
  0%   { transform: translateX(-20px); }
  50%  { transform: translateX(20px); }
  100% { transform: translateX(-20px); }
}

.swoosh-path, .swoosh-line {
  transform-box: fill-box;
  transform-origin: center;
  animation: swoosh-drift 20s ease-in-out infinite;
}

.swoosh-line {
  animation-delay: -2s; /* slight parallax between path and line */
}

@media (prefers-reduced-motion: reduce) {
  .swoosh-path, .swoosh-line { animation: none; }
}
```

- [ ] **Step 2: Verify**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B screenshot /tmp/task11-swoosh-a.png
sleep 5
$B screenshot /tmp/task11-swoosh-b.png
kill $SERVER_PID
```

Expected: The two screenshots show the swoosh wave in slightly different horizontal positions (visually subtle but detectable in a diff).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: swoosh drift animation with reduced-motion fallback"
```

---

## Phase 4 — Audio

### Task 12: Audio system (Howler, BGM, SFX, mute toggle)

**Files:**
- Create: `scripts/audio.js`
- Create: `styles/mute.css`
- Modify: `index.html`
- Modify: `scripts/menu.js`
- Modify: `scripts/channels.js`

- [ ] **Step 1: Link the mute stylesheet**

In `index.html`, in `<head>`:

```html
<link rel="stylesheet" href="styles/mute.css" />
```

And inside `#stage`, above `<main>`, add the mute button:

```html
<button id="mute-toggle" class="mute-btn" aria-label="Toggle sound" aria-pressed="false">🔊</button>
```

- [ ] **Step 2: Style the mute button**

Create `styles/mute.css`:

```css
.mute-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.08);
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.mute-btn:hover { background: #fff; }
```

- [ ] **Step 3: Write audio.js**

Create `scripts/audio.js`:

```js
const STORAGE_KEY = "wiiMuted";
const HOVER_COOLDOWN_MS = 50;

let bgm;
const sfx = {};
let lastHoverTs = 0;
let muted = localStorage.getItem(STORAGE_KEY) === "1";
let startedBgm = false;

function mkSfx(src) {
  return new Howl({ src: [src], volume: 0.6, onloaderror: (_, err) => console.warn("SFX load failed", src, err) });
}

export function initAudio() {
  bgm = new Howl({
    src: ["assets/audio/bgm.mp3"],
    loop: true,
    volume: 0,
    onloaderror: (_, err) => console.warn("BGM load failed", err),
  });
  sfx.hover   = mkSfx("assets/audio/hover.mp3");
  sfx.select  = mkSfx("assets/audio/select.mp3");
  sfx.back    = mkSfx("assets/audio/back.mp3");
  sfx.startup = mkSfx("assets/audio/startup.mp3");

  // Unlock on first user gesture and then start BGM (unless muted).
  const unlock = () => {
    if (!startedBgm) {
      startedBgm = true;
      playStartup();
      if (!muted) fadeInBgm();
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  const btn = document.getElementById("mute-toggle");
  btn.textContent = muted ? "🔇" : "🔊";
  btn.setAttribute("aria-pressed", String(muted));
  btn.addEventListener("click", toggleMute);
}

function fadeInBgm() {
  bgm.play();
  bgm.fade(0, 0.4, 2000);
}

function playStartup() {
  try { sfx.startup.play(); } catch (_) {}
}

export function playHover() {
  const now = performance.now();
  if (now - lastHoverTs < HOVER_COOLDOWN_MS) return;
  lastHoverTs = now;
  sfx.hover.play();
}

export function playSelect() { sfx.select.play(); }
export function playBack() { sfx.back.play(); }

export function toggleMute() {
  muted = !muted;
  localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  const btn = document.getElementById("mute-toggle");
  btn.textContent = muted ? "🔇" : "🔊";
  btn.setAttribute("aria-pressed", String(muted));
  if (muted) {
    bgm.fade(bgm.volume(), 0, 400);
  } else {
    if (startedBgm) {
      if (!bgm.playing()) bgm.play();
      bgm.fade(0, 0.4, 800);
    }
  }
}

export function isMuted() { return muted; }
```

- [ ] **Step 4: Hook SFX into channel hovers**

Update `scripts/channels.js` — at the bottom, export a helper and import it into `menu.js`. Replace the entire file with:

```js
export const CHANNELS = [
  { slot: 0, id: "photography", title: "Photography",      href: "photography.html", art: "assets/channels/photography.png" },
  { slot: 1, id: "social",      title: "Social Links",     href: "social.html",      art: "assets/channels/social.png" },
  { slot: 2, id: "writings",    title: "My Writings",      href: "writings.html",    art: "assets/channels/writings.png" },
  { slot: 3, id: "mii-out",     title: "Check Mii Out Channel", href: "mii-out.html", art: "assets/channels/mii-out.png" },
  { slot: 4, id: "books",       title: "Books",            href: "books.html",       art: "assets/channels/books.png" },
];

export function renderGrid(container) {
  container.innerHTML = "";
  for (let slot = 0; slot < 12; slot++) {
    const channel = CHANNELS.find((c) => c.slot === slot);
    const el = document.createElement(channel ? "button" : "div");
    el.className = channel ? "channel channel--active" : "channel channel--empty";
    el.dataset.slot = String(slot);
    if (channel) {
      el.dataset.channelId = channel.id;
      el.dataset.href = channel.href;
      el.setAttribute("aria-label", channel.title);
      el.innerHTML = `
        <img class="channel__art" src="${channel.art}" alt="" />
        <span class="channel__title">${channel.title}</span>
      `;
    } else {
      el.innerHTML = `<span class="channel__watermark">Wii</span>`;
    }
    container.appendChild(el);
  }
}
```

- [ ] **Step 5: Wire audio + hover SFX into menu.js**

Replace `scripts/menu.js`:

```js
import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";
import { installKeyboardNav } from "./nav.js";
import { renderBottomBar } from "./bottom-bar.js";
import { startClock } from "./clock.js";
import { initAudio, playHover } from "./audio.js";

const stage = document.getElementById("stage");
installScaler(stage);

const grid = document.getElementById("channels");
renderGrid(grid);
installKeyboardNav(grid);

renderBottomBar(document.getElementById("bottom-bar"));
startClock(document.getElementById("clock-time"), document.getElementById("clock-date"));
initAudio();

// Channel hover SFX (pointer + keyboard focus both trigger it).
for (const el of grid.querySelectorAll(".channel--active")) {
  el.addEventListener("pointerenter", playHover);
  el.addEventListener("focus", playHover);
}
grid.querySelector(".channel--active")?.focus();
```

- [ ] **Step 6: Verify**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B js 'localStorage.getItem("wiiMuted")'
$B click "#mute-toggle"
$B js 'document.getElementById("mute-toggle").textContent'
$B js 'localStorage.getItem("wiiMuted")'
kill $SERVER_PID
```

Expected: After the click, the button text toggles (🔊 ↔ 🔇) and `localStorage.wiiMuted` is `"1"`. No console errors. Audio itself cannot be verified headlessly — listen manually in a real browser.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: audio system with BGM, SFX, mute toggle"
```

---

## Phase 5 — Transitions

### Task 13: Click-to-sub-page zoom transition

**Files:**
- Create: `scripts/transitions.js`
- Modify: `styles/channel.css`
- Modify: `scripts/menu.js`

- [ ] **Step 1: Add flash overlay style**

Append to `styles/channel.css`:

```css
#flash-overlay {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  z-index: 100;
}
```

- [ ] **Step 2: Add the overlay element to index.html**

In `index.html`, inside `#stage` just before `</div>` of stage, add:

```html
<div id="flash-overlay"></div>
```

- [ ] **Step 3: Write transitions.js**

Create `scripts/transitions.js`:

```js
import { playSelect } from "./audio.js";

// Zooms the clicked channel to fill the stage, flashes white, then navigates.
export function zoomIntoChannel(channelEl, href) {
  playSelect();
  const stage = document.getElementById("stage");
  const flash = document.getElementById("flash-overlay");
  const others = Array.from(document.querySelectorAll(".channel")).filter((e) => e !== channelEl);

  const rect = channelEl.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / rect.width;
  // Compute translation that moves channel center to stage center.
  const dx = (stageRect.left + stageRect.width / 2) - (rect.left + rect.width / 2);
  const dy = (stageRect.top + stageRect.height / 2) - (rect.top + rect.height / 2);

  const tl = gsap.timeline({
    onComplete: () => {
      // Carry which channel we came from so the destination page can echo it back.
      const id = channelEl.dataset.channelId;
      window.location.href = `${href}?from=${encodeURIComponent(id)}`;
    },
  });

  tl.to(others, { opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" }, 0);
  tl.to(channelEl, {
    x: dx,
    y: dy,
    scale: scale,
    duration: 0.35,
    ease: "expo.in",
  }, 0);
  tl.to(flash, { opacity: 1, duration: 0.12, ease: "power1.out" }, 0.3);
}

// When arriving at the menu with ?return=<id>, play the reverse: start zoomed
// on that channel, shrink to grid position, then reveal the rest.
export function zoomOutToMenu(returnId) {
  const channelEl = document.querySelector(`.channel--active[data-channel-id="${returnId}"]`);
  if (!channelEl) return;

  const stage = document.getElementById("stage");
  const flash = document.getElementById("flash-overlay");
  const others = Array.from(document.querySelectorAll(".channel")).filter((e) => e !== channelEl);

  const rect = channelEl.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / rect.width;
  const dx = (stageRect.left + stageRect.width / 2) - (rect.left + rect.width / 2);
  const dy = (stageRect.top + stageRect.height / 2) - (rect.top + rect.height / 2);

  // Snap to fully-zoomed start state.
  gsap.set(channelEl, { x: dx, y: dy, scale });
  gsap.set(others, { opacity: 0, scale: 0.9 });
  gsap.set(flash, { opacity: 1 });

  const tl = gsap.timeline();
  tl.to(flash, { opacity: 0, duration: 0.15, ease: "power1.out" }, 0);
  tl.to(channelEl, { x: 0, y: 0, scale: 1, duration: 0.45, ease: "expo.out" }, 0);
  tl.to(others, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.15);
}
```

- [ ] **Step 4: Wire click handler into menu.js**

Replace `scripts/menu.js` with:

```js
import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";
import { installKeyboardNav } from "./nav.js";
import { renderBottomBar } from "./bottom-bar.js";
import { startClock } from "./clock.js";
import { initAudio, playHover } from "./audio.js";
import { zoomIntoChannel, zoomOutToMenu } from "./transitions.js";

const stage = document.getElementById("stage");
installScaler(stage);

const grid = document.getElementById("channels");
renderGrid(grid);
installKeyboardNav(grid);

renderBottomBar(document.getElementById("bottom-bar"));
startClock(document.getElementById("clock-time"), document.getElementById("clock-date"));
initAudio();

// Hover SFX.
for (const el of grid.querySelectorAll(".channel--active")) {
  el.addEventListener("pointerenter", playHover);
  el.addEventListener("focus", playHover);
}

// Click / Enter to zoom into the channel.
function activateChannel(el) {
  const href = el.dataset.href;
  if (href) zoomIntoChannel(el, href);
}
for (const el of grid.querySelectorAll(".channel--active")) {
  el.addEventListener("click", () => activateChannel(el));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activateChannel(el); }
  });
}

// Handle arrival with ?return=<id> from a sub-page.
const params = new URLSearchParams(location.search);
const returnId = params.get("return");
if (returnId) {
  // Run on the next frame so layout is measured correctly.
  requestAnimationFrame(() => zoomOutToMenu(returnId));
} else {
  grid.querySelector(".channel--active")?.focus();
}
```

- [ ] **Step 5: Verify click transition (goes to a 404 for now — we'll create sub-pages next)**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B screenshot /tmp/task13-before.png
$B click '.channel--active[data-channel-id="social"]'
sleep 1
$B url
kill $SERVER_PID
```

Expected: `$B url` shows `http://localhost:8000/social.html?from=social` (404 since the page doesn't exist yet — that's fine). The before-screenshot shows the menu.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: channel zoom transition with flash and return-param handling"
```

---

## Phase 6 — Sub-pages

### Task 14: Shared sub-page layout and "Wii Menu" back button

**Files:**
- Create: `styles/subpage.css`
- Create: `scripts/subpage.js`

- [ ] **Step 1: Write the shared subpage styles**

Create `styles/subpage.css`:

```css
body.subpage {
  background: var(--menu-bg);
}

.subpage-stage {
  width: 1280px;
  height: 720px;
  margin: 0 auto;
  position: relative;
  background: var(--menu-bg);
  padding: 40px 60px 120px;
  transform-origin: center center;
}

.subpage-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.subpage-icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.subpage-title {
  font-size: 44px;
  font-weight: 700;
  color: #333;
  text-shadow: 0 1px 0 rgba(255,255,255,0.8);
}

.subpage-panel {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  height: calc(100% - 160px);
  overflow-y: auto;
}

.wii-menu-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 48px;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff, #e6e6e6);
  border: 2px solid #fff;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  font-size: 18px;
  font-weight: 700;
  color: #555;
  cursor: pointer;
  transition: transform 150ms ease-out;
}

.wii-menu-btn:hover, .wii-menu-btn:focus-visible {
  transform: translateX(-50%) translateY(-2px) scale(1.03);
  outline: none;
}
```

- [ ] **Step 2: Write subpage.js**

Create `scripts/subpage.js`:

```js
// Shared script for sub-pages: scaling, back button, audio (mute persisted).
import { installScaler } from "./scale.js";

const stage = document.querySelector(".subpage-stage");
if (stage) installScaler(stage);

// Back button: play SFX, flash, then navigate with ?return=<id>.
const STORAGE_KEY = "wiiMuted";
const backBtn = document.querySelector(".wii-menu-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    const id = backBtn.dataset.channelId;
    const muted = localStorage.getItem(STORAGE_KEY) === "1";
    const play = (src) => {
      if (muted) return Promise.resolve();
      return new Promise((resolve) => {
        const h = new Howl({ src: [src], volume: 0.6, onend: resolve, onloaderror: resolve });
        h.play();
      });
    };
    const flash = document.getElementById("flash-overlay");
    play("assets/audio/back.mp3");
    gsap.to(flash, {
      opacity: 1,
      duration: 0.15,
      onComplete: () => {
        window.location.href = `index.html?return=${encodeURIComponent(id)}`;
      },
    });
  });
}
```

No verification this task alone — exercised by Task 15.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: shared subpage layout and back-button"
```

---

### Task 15: Social Links sub-page

**Files:**
- Create: `social.html`

- [ ] **Step 1: Create the page**

Create `social.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Social Links</title>
  <link rel="stylesheet" href="styles/main.css" />
  <link rel="stylesheet" href="styles/subpage.css" />
</head>
<body class="subpage">
  <div id="letterbox">
    <div class="subpage-stage">
      <div id="flash-overlay"></div>
      <header class="subpage-header">
        <img class="subpage-icon" src="assets/channels/social.png" alt="" />
        <h1 class="subpage-title">Social Links</h1>
      </header>
      <section class="subpage-panel">
        <ul class="social-list">
          <li><a href="https://twitter.com/yourhandle" target="_blank" rel="noopener">Twitter / X</a></li>
          <li><a href="https://github.com/yourhandle" target="_blank" rel="noopener">GitHub</a></li>
          <li><a href="https://www.linkedin.com/in/yourhandle" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href="mailto:you@example.com">Email</a></li>
        </ul>
      </section>
      <button class="wii-menu-btn" data-channel-id="social">Wii Menu</button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  <script type="module" src="scripts/subpage.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the round-trip**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B click '.channel--active[data-channel-id="social"]'
sleep 1
$B url
$B screenshot /tmp/task15-social.png
$B click '.wii-menu-btn'
sleep 1
$B url
$B screenshot /tmp/task15-return.png
kill $SERVER_PID
```

Expected: First `$B url` is `/social.html?from=social`. Screenshot shows the Social Links page. Second `$B url` is `/index.html?return=social`. Second screenshot shows the menu (post zoom-out).

- [ ] **Step 3: Commit**

```bash
git add social.html
git commit -m "feat: Social Links sub-page"
```

---

### Task 16: My Writings sub-page

**Files:**
- Create: `writings.html`

- [ ] **Step 1: Create the page**

Create `writings.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Writings</title>
  <link rel="stylesheet" href="styles/main.css" />
  <link rel="stylesheet" href="styles/subpage.css" />
  <style>
    .writing { padding: 18px 0; border-bottom: 1px solid #eee; }
    .writing:last-child { border-bottom: 0; }
    .writing h3 { margin: 0 0 6px; font-size: 22px; }
    .writing .meta { color: #888; font-size: 14px; margin-bottom: 6px; }
    .writing p { color: #444; line-height: 1.5; }
  </style>
</head>
<body class="subpage">
  <div id="letterbox">
    <div class="subpage-stage">
      <div id="flash-overlay"></div>
      <header class="subpage-header">
        <img class="subpage-icon" src="assets/channels/writings.png" alt="" />
        <h1 class="subpage-title">My Writings</h1>
      </header>
      <section class="subpage-panel">
        <article class="writing">
          <h3>First post title</h3>
          <div class="meta">2026-04-22</div>
          <p>One-paragraph teaser of the essay — replace with your own writing.</p>
        </article>
        <article class="writing">
          <h3>Second post title</h3>
          <div class="meta">2026-03-15</div>
          <p>Another teaser — link these to external posts or deepen into full articles later.</p>
        </article>
      </section>
      <button class="wii-menu-btn" data-channel-id="writings">Wii Menu</button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  <script type="module" src="scripts/subpage.js"></script>
</body>
</html>
```

- [ ] **Step 2: Smoke-test**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000/writings.html
$B screenshot /tmp/task16-writings.png
$B console --errors
kill $SERVER_PID
```

Expected: Screenshot shows the Writings page with placeholder posts and a Wii Menu button. No console errors.

- [ ] **Step 3: Commit**

```bash
git add writings.html
git commit -m "feat: My Writings sub-page"
```

---

### Task 17: Books sub-page

**Files:**
- Create: `books.html`

- [ ] **Step 1: Create the page**

Create `books.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Books</title>
  <link rel="stylesheet" href="styles/main.css" />
  <link rel="stylesheet" href="styles/subpage.css" />
  <style>
    .book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px; }
    .book { text-align: center; }
    .book-cover {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: linear-gradient(180deg,#f0d79a,#d9a964);
      border-radius: 6px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; padding: 8px; font-size: 14px;
    }
    .book h3 { margin: 8px 0 2px; font-size: 14px; }
    .book .author { color: #888; font-size: 12px; }
  </style>
</head>
<body class="subpage">
  <div id="letterbox">
    <div class="subpage-stage">
      <div id="flash-overlay"></div>
      <header class="subpage-header">
        <img class="subpage-icon" src="assets/channels/books.png" alt="" />
        <h1 class="subpage-title">Books</h1>
      </header>
      <section class="subpage-panel">
        <div class="book-grid">
          <div class="book"><div class="book-cover">The Dispossessed</div><h3>The Dispossessed</h3><div class="author">Ursula K. Le Guin</div></div>
          <div class="book"><div class="book-cover">Zero to One</div><h3>Zero to One</h3><div class="author">Peter Thiel</div></div>
          <div class="book"><div class="book-cover">Godel, Escher, Bach</div><h3>Gödel, Escher, Bach</h3><div class="author">Douglas Hofstadter</div></div>
        </div>
      </section>
      <button class="wii-menu-btn" data-channel-id="books">Wii Menu</button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  <script type="module" src="scripts/subpage.js"></script>
</body>
</html>
```

- [ ] **Step 2: Smoke-test**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000/books.html
$B screenshot /tmp/task17-books.png
kill $SERVER_PID
```

Expected: Screenshot shows a grid of book-cover placeholders with titles.

- [ ] **Step 3: Commit**

```bash
git add books.html
git commit -m "feat: Books sub-page"
```

---

### Task 18: Check Mii Out (People) sub-page

**Files:**
- Create: `mii-out.html`

- [ ] **Step 1: Create the page**

Create `mii-out.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Check Mii Out Channel</title>
  <link rel="stylesheet" href="styles/main.css" />
  <link rel="stylesheet" href="styles/subpage.css" />
  <style>
    .people-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; }
    .person { text-align: center; }
    .person-avatar {
      width: 96px; height: 96px; border-radius: 50%;
      background: #d8e9ff;
      box-shadow: 0 3px 8px rgba(0,0,0,0.12);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 10px; font-size: 36px; color: #4a7fb0;
    }
    .person h3 { font-size: 16px; margin: 0 0 4px; }
    .person p { font-size: 13px; color: #777; }
  </style>
</head>
<body class="subpage">
  <div id="letterbox">
    <div class="subpage-stage">
      <div id="flash-overlay"></div>
      <header class="subpage-header">
        <img class="subpage-icon" src="assets/channels/mii-out.png" alt="" />
        <h1 class="subpage-title">Check Mii Out Channel</h1>
      </header>
      <section class="subpage-panel">
        <div class="people-grid">
          <div class="person"><div class="person-avatar">🧑</div><h3>Person One</h3><p>One-line note</p></div>
          <div class="person"><div class="person-avatar">👩</div><h3>Person Two</h3><p>One-line note</p></div>
          <div class="person"><div class="person-avatar">🧔</div><h3>Person Three</h3><p>One-line note</p></div>
        </div>
      </section>
      <button class="wii-menu-btn" data-channel-id="mii-out">Wii Menu</button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  <script type="module" src="scripts/subpage.js"></script>
</body>
</html>
```

- [ ] **Step 2: Smoke-test**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000/mii-out.html
$B screenshot /tmp/task18-mii-out.png
kill $SERVER_PID
```

Expected: Page with a grid of three person-placeholder cards.

- [ ] **Step 3: Commit**

```bash
git add mii-out.html
git commit -m "feat: Check Mii Out (People) sub-page"
```

---

### Task 19: Photography sub-page

**Files:**
- Create: `photography.html`

- [ ] **Step 1: Create the page**

Create `photography.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Photography</title>
  <link rel="stylesheet" href="styles/main.css" />
  <link rel="stylesheet" href="styles/subpage.css" />
  <style>
    .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .photo {
      aspect-ratio: 4 / 3;
      background: linear-gradient(135deg,#eee,#ccc);
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
      display: flex; align-items: center; justify-content: center;
      color: #888; font-size: 14px;
    }
  </style>
</head>
<body class="subpage">
  <div id="letterbox">
    <div class="subpage-stage">
      <div id="flash-overlay"></div>
      <header class="subpage-header">
        <img class="subpage-icon" src="assets/channels/photography.png" alt="" />
        <h1 class="subpage-title">Photography</h1>
      </header>
      <section class="subpage-panel">
        <div class="photo-grid">
          <div class="photo">Photo 1</div>
          <div class="photo">Photo 2</div>
          <div class="photo">Photo 3</div>
          <div class="photo">Photo 4</div>
          <div class="photo">Photo 5</div>
          <div class="photo">Photo 6</div>
        </div>
      </section>
      <button class="wii-menu-btn" data-channel-id="photography">Wii Menu</button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  <script type="module" src="scripts/subpage.js"></script>
</body>
</html>
```

- [ ] **Step 2: Smoke-test**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000/photography.html
$B screenshot /tmp/task19-photography.png
kill $SERVER_PID
```

Expected: Page with a 3-column photo-placeholder grid.

- [ ] **Step 3: Commit**

```bash
git add photography.html
git commit -m "feat: Photography sub-page"
```

---

### Task 20: Wii Message Board page (envelope button)

**Files:**
- Create: `messages.html`
- Modify: `scripts/bottom-bar.js`
- Modify: `scripts/menu.js`

- [ ] **Step 1: Create the page**

Create `messages.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wii Message Board</title>
  <link rel="stylesheet" href="styles/main.css" />
  <link rel="stylesheet" href="styles/subpage.css" />
  <style>
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
    .msg-day {
      aspect-ratio: 1; background: #fafafa; border: 1px solid #eee; border-radius: 6px;
      padding: 6px; font-size: 11px; color: #888; position: relative;
    }
    .msg-day.has-msg { background: #fff4d4; border-color: #e9d07a; }
    .msg-day .dot { position: absolute; bottom: 4px; right: 4px; font-size: 14px; }
    .message-feed { margin-top: 20px; }
    .message-feed article {
      padding: 14px 16px; background: #fffdf2; border: 1px solid #f0e3a8;
      border-radius: 10px; margin-bottom: 10px;
    }
    .message-feed h3 { font-size: 15px; margin: 0 0 6px; color: #6a5a1a; }
    .message-feed p { font-size: 14px; color: #555; line-height: 1.4; }
  </style>
</head>
<body class="subpage">
  <div id="letterbox">
    <div class="subpage-stage">
      <div id="flash-overlay"></div>
      <header class="subpage-header">
        <div class="subpage-icon" style="background:#fff; display:flex; align-items:center; justify-content:center; font-size:44px;">✉</div>
        <h1 class="subpage-title">Wii Message Board</h1>
      </header>
      <section class="subpage-panel">
        <div class="calendar-grid" id="calendar"></div>
        <div class="message-feed">
          <article><h3>Welcome</h3><p>This is the Wii Message Board. Announcements, updates, and milestones show up here.</p></article>
          <article><h3>Site launched</h3><p>This Wii-menu portfolio went live. Thanks for stopping by.</p></article>
        </div>
      </section>
      <button class="wii-menu-btn" data-channel-id="__envelope">Wii Menu</button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  <script type="module" src="scripts/subpage.js"></script>
  <script type="module">
    // Populate a simple 7x4 calendar stub. First message-dot on today's day-of-week index.
    const grid = document.getElementById("calendar");
    const today = new Date();
    const markedDay = today.getDay();
    for (let i = 0; i < 28; i++) {
      const d = document.createElement("div");
      d.className = "msg-day" + (i % 7 === markedDay && i < 7 ? " has-msg" : "");
      d.innerHTML = `<span>${i + 1}</span>${i % 7 === markedDay && i < 7 ? '<span class="dot">✉</span>' : ""}`;
      grid.appendChild(d);
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Wire envelope click in the bottom bar**

Append to `scripts/bottom-bar.js` (after the existing `renderBottomBar` function):

```js
export function installBottomBarNav() {
  const envelope = document.querySelector(".bb-btn--envelope");
  envelope?.addEventListener("click", async () => {
    const { playSelect } = await import("./audio.js");
    playSelect();
    const flash = document.getElementById("flash-overlay");
    gsap.to(flash, {
      opacity: 1,
      duration: 0.2,
      onComplete: () => { window.location.href = "messages.html"; },
    });
  });
}
```

- [ ] **Step 3: Call it from menu.js**

Open `scripts/menu.js` and make two edits:

1. **Edit the imports block at the top.** Change the existing line:

   ```js
   import { renderBottomBar } from "./bottom-bar.js";
   ```

   to:

   ```js
   import { renderBottomBar, installBottomBarNav } from "./bottom-bar.js";
   ```

2. **Add one line after the existing `renderBottomBar(...)` call.** Find:

   ```js
   renderBottomBar(document.getElementById("bottom-bar"));
   ```

   and add immediately below it:

   ```js
   installBottomBarNav();
   ```

- [ ] **Step 4: Smoke-test**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B click '.bb-btn--envelope'
sleep 1
$B url
$B screenshot /tmp/task20-messages.png
kill $SERVER_PID
```

Expected: `$B url` is `/messages.html`. Screenshot shows the message board with calendar stub and two announcements.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Wii Message Board and envelope button navigation"
```

---

## Phase 7 — Polish and deploy

### Task 21: Prefers-reduced-motion fallbacks for transitions

**Files:**
- Modify: `scripts/transitions.js`

- [ ] **Step 1: Short-circuit animations when reduced-motion is requested**

Edit `scripts/transitions.js`. At the top of the file, add:

```js
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

Modify `zoomIntoChannel` — replace everything from `const tl = gsap.timeline(...)` through the last `tl.to(flash, ...)` call (i.e., the entire timeline block) with:

```js
  if (prefersReducedMotion()) {
    const id = channelEl.dataset.channelId;
    gsap.to(flash, {
      opacity: 1, duration: 0.15,
      onComplete: () => { window.location.href = `${href}?from=${encodeURIComponent(id)}`; },
    });
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      const id = channelEl.dataset.channelId;
      window.location.href = `${href}?from=${encodeURIComponent(id)}`;
    },
  });
  tl.to(others, { opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" }, 0);
  tl.to(channelEl, { x: dx, y: dy, scale: scale, duration: 0.35, ease: "expo.in" }, 0);
  tl.to(flash, { opacity: 1, duration: 0.12, ease: "power1.out" }, 0.3);
```

Modify `zoomOutToMenu` — after the `if (!channelEl) return;` line, add:

```js
  if (prefersReducedMotion()) {
    const flash = document.getElementById("flash-overlay");
    gsap.to(flash, { opacity: 0, duration: 0.2 });
    return;
  }
```

- [ ] **Step 2: Verify**

Run:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B js 'window.matchMedia && typeof window.matchMedia("(prefers-reduced-motion: reduce)").matches'
$B click '.channel--active[data-channel-id="social"]'
sleep 1
$B url
kill $SERVER_PID
```

Expected: `$B url` still reaches `/social.html?from=social`. The reduced-motion branch simply shortens the transition — this test just confirms no crash.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: prefers-reduced-motion fallback for zoom transitions"
```

---

### Task 22: Favicon and page title polish

**Files:**
- Create: `assets/favicon.svg`
- Modify: `index.html` and all 6 sub-page HTML files

- [ ] **Step 1: Create a simple Wii-style favicon**

Create `assets/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#e8e8e8"/>
  <text x="16" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#999">Wii</text>
</svg>
```

- [ ] **Step 2: Link the favicon**

In each of the 7 HTML files (`index.html`, `social.html`, `writings.html`, `books.html`, `mii-out.html`, `photography.html`, `messages.html`), inside `<head>`, add:

```html
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
```

- [ ] **Step 3: Verify**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B js 'document.querySelector("link[rel=\"icon\"]").href'
kill $SERVER_PID
```

Expected: `$B js` output ends in `assets/favicon.svg`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: favicon"
```

---

### Task 23: End-to-end smoke test (round-trip every channel)

**Files:** none (verification only)

- [ ] **Step 1: Run the full tour**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000

for CHAN in photography social writings mii-out books; do
  echo "--- Visiting $CHAN ---"
  $B goto http://localhost:8000
  sleep 1
  $B click ".channel--active[data-channel-id=\"$CHAN\"]"
  sleep 2
  $B url
  $B console --errors
  $B click '.wii-menu-btn'
  sleep 2
  $B url
done

# Envelope path
$B goto http://localhost:8000
$B click '.bb-btn--envelope'
sleep 2
$B url
$B console --errors

kill $SERVER_PID
```

Expected: For each channel, the forward `$B url` is `/<channel>.html?from=<id>`; after clicking the back button, it becomes `/index.html?return=<id>`. Console has zero errors at every step.

- [ ] **Step 2: Full-tour screenshot gallery (for a visual QA pass)**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:8000
$B viewport 1920x1080
$B screenshot /tmp/final-menu.png
for PAGE in social writings books mii-out photography messages; do
  $B goto "http://localhost:8000/$PAGE.html"
  $B screenshot "/tmp/final-$PAGE.png"
done
kill $SERVER_PID
ls -la /tmp/final-*.png
```

Read each screenshot (Read tool) and visually verify:
- Menu has 4×3 grid, 5 active channels (top-left cluster), 7 empty Wii slots.
- Bottom bar has avatar, clock with live time, envelope, animated swoosh.
- Every sub-page has correct title, icon, content panel, and Wii Menu button.

- [ ] **Step 3: Commit anything that came out of QA**

If QA surfaced bugs, fix them inline and commit. Otherwise no commit needed.

---

### Task 24: Deploy to Vercel

**Files:**
- Create: `vercel.json`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Write vercel.json (static config)**

Create `vercel.json`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

`cleanUrls: true` means `/social` serves `social.html` — nicer URLs. Channel links in `scripts/channels.js` currently include `.html`; the `cleanUrls` setting keeps those working too, so no code change needed.

- [ ] **Step 2: Write .gitignore**

Create `.gitignore`:

```
.DS_Store
node_modules/
.vercel/
```

- [ ] **Step 3: Write a short README**

Create `README.md`:

```markdown
# Wii Menu Portfolio

Personal portfolio styled as the Nintendo Wii Main Menu.

## Local dev

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

```
npx vercel --prod
```

## Structure

- `index.html` — menu
- `<channel>.html` — sub-pages
- `styles/`, `scripts/`, `assets/`
```

- [ ] **Step 4: Deploy**

Install the Vercel CLI if not installed:

```bash
npm i -g vercel
```

Then, in the project root:

```bash
vercel login   # first time only
vercel --prod
```

Vercel will auto-detect a static project. Accept the defaults. Note the production URL it prints.

- [ ] **Step 5: Smoke-test production**

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto <the-vercel-url>
$B screenshot /tmp/prod-menu.png
$B console --errors
$B click '.channel--active[data-channel-id="social"]'
sleep 2
$B url
```

Expected: Menu renders identically to local. No console errors. Click zoom navigates.

- [ ] **Step 6: Commit**

```bash
git add vercel.json .gitignore README.md
git commit -m "chore: vercel config and README"
```

---

## Done

The menu is live. To add real content, hand-edit the relevant sub-page HTML file. To change a channel, edit `scripts/channels.js` and/or replace the PNG in `assets/channels/`. To swap the BGM/SFX, replace the MP3s in `assets/audio/`. No build step.
