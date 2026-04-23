import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";
import { installKeyboardNav } from "./nav.js";
import { renderBottomBar } from "./bottom-bar.js";
import { startClock } from "./clock.js";

const stage = document.getElementById("stage");
installScaler(stage);

const grid = document.getElementById("channels");
renderGrid(grid);
installKeyboardNav(grid);
grid.querySelector(".channel--active")?.focus();

renderBottomBar(document.getElementById("bottom-bar"));
startClock(document.getElementById("clock-time"), document.getElementById("clock-date"));
