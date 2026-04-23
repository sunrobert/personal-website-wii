import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";
import { installKeyboardNav } from "./nav.js";
import { renderBottomBar, installBottomBarNav } from "./bottom-bar.js";
import { startClock } from "./clock.js";
import { initAudio, playHover } from "./audio.js";
import { zoomIntoChannel, zoomOutToMenu } from "./transitions.js";
import { installCursor } from "./cursor.js";

installCursor();

const stage = document.getElementById("stage");
installScaler(stage);

const grid = document.getElementById("channels");
renderGrid(grid);
installKeyboardNav(grid);

renderBottomBar(document.getElementById("bottom-bar"));
installBottomBarNav();
startClock(document.getElementById("clock-time"), document.getElementById("clock-date"));
initAudio();

for (const el of grid.querySelectorAll(".channel--active")) {
  el.addEventListener("pointerenter", playHover);
  el.addEventListener("focus", playHover);
}

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

const params = new URLSearchParams(location.search);
const returnId = params.get("return");
if (returnId) {
  requestAnimationFrame(() => zoomOutToMenu(returnId));
} else {
  grid.querySelector(".channel--active")?.focus();
}

// Restoring from bfcache after a browser back/forward can leave the grid in the
// mid-zoom state (tiles at opacity 0, flash at 1, preview overlay still present).
// Reset everything so the menu is immediately usable.
window.addEventListener("pageshow", (e) => {
  if (!e.persisted) return;
  document.getElementById("channel-preview")?.remove();
  const flash = document.getElementById("flash-overlay");
  if (flash) gsap.set(flash, { opacity: 0 });
  gsap.set(grid.querySelectorAll(".channel"), { x: 0, y: 0, scale: 1, opacity: 1, clearProps: "transform" });
});
