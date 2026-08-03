import { installScaler } from "./scale.js?v=1785715000";
import { renderGrid } from "./channels.js?v=1785715000";
import { installKeyboardNav } from "./nav.js?v=1785715000";
import { renderBottomBar, installBottomBarNav } from "./bottom-bar.js?v=1785715000";
import { startClock } from "./clock.js?v=1785715000";
import { initAudio, playHover } from "./audio.js?v=1785715000";
import { zoomIntoChannel, zoomOutToMenu } from "./transitions.js?v=1785715000";
import { installCursor } from "./cursor.js?v=1785715000";

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

// Return id arrives via sessionStorage (see subpage.js — avoids per-query-param
// cache variants of index.html). The ?return= fallback still works for any
// stale cached subpage that navigates the old way.
const params = new URLSearchParams(location.search);
let returnId = params.get("return");
try {
  returnId = returnId || sessionStorage.getItem("wiiReturn");
  sessionStorage.removeItem("wiiReturn");
} catch (_) {}
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
