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
