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

for (const el of grid.querySelectorAll(".channel--active")) {
  el.addEventListener("pointerenter", playHover);
  el.addEventListener("focus", playHover);
}
grid.querySelector(".channel--active")?.focus();
