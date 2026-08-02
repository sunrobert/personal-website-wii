export const STAGE_W = 985;
export const STAGE_H = 554;

// Uniform scale (kept for tests / letterboxed mode).
export function computeScale(viewportW, viewportH) {
  return Math.min(viewportW / STAGE_W, viewportH / STAGE_H);
}

// Fill-mode: two-axis scale that fills the viewport, accepting slight stretch.
export function computeFillScale(viewportW, viewportH) {
  return { sx: viewportW / STAGE_W, sy: viewportH / STAGE_H };
}

// Height of the fixed bottom bar on the main menu; the scaler reserves this space.
const BOTTOM_BAR_H = 100;
// Extra zoom applied to the main menu so the grid fills the viewport snugly.
// Subpages fit-to-viewport without the zoom multiplier.
const MENU_ZOOM = 1.2;

// Below this width the site switches to the phone layout (styles/mobile.css):
// pages flow and scroll natively, so the stage transform must not apply.
export const MOBILE_LAYOUT_QUERY = "(max-width: 700px)";
export function isMobileLayout() {
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches;
}

export function applyScale(stageEl) {
  if (isMobileLayout()) {
    stageEl.style.transform = "";
    return;
  }
  const onMenu = stageEl.id === "stage";
  const stageW = onMenu ? STAGE_W : stageEl.offsetWidth || STAGE_W;
  const stageH = onMenu ? STAGE_H : stageEl.offsetHeight || STAGE_H;
  const h = onMenu ? window.innerHeight - BOTTOM_BAR_H : window.innerHeight;
  const fit = Math.min(window.innerWidth / stageW, h / stageH);
  const scale = onMenu ? fit * MENU_ZOOM : fit;
  stageEl.style.transform = `scale(${scale})`;
}

export function installScaler(stageEl) {
  applyScale(stageEl);
  window.addEventListener("resize", () => applyScale(stageEl));
}
