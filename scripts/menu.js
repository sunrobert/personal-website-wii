import { installScaler } from "./scale.js";
import { renderGrid } from "./channels.js";

const stage = document.getElementById("stage");
installScaler(stage);
renderGrid(document.getElementById("channels"));
