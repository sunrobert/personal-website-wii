import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";
import { installKeyboardNav } from "./nav.js";

const stage = document.getElementById("stage");
installScaler(stage);

const grid = document.getElementById("channels");
renderGrid(grid);
installKeyboardNav(grid);

grid.querySelector(".channel--active")?.focus();
