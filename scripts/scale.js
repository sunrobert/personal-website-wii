export const STAGE_W = 1280;
export const STAGE_H = 720;

// Uniform scale (kept for tests / letterboxed mode).
export function computeScale(viewportW, viewportH) {
  return Math.min(viewportW / STAGE_W, viewportH / STAGE_H);
}

// Fill-mode: two-axis scale that fills the viewport, accepting slight stretch.
export function computeFillScale(viewportW, viewportH) {
  return { sx: viewportW / STAGE_W, sy: viewportH / STAGE_H };
}

export function applyScale(stageEl) {
  const scale = computeScale(window.innerWidth, window.innerHeight);
  stageEl.style.transform = `scale(${scale})`;
}

export function installScaler(stageEl) {
  applyScale(stageEl);
  window.addEventListener("resize", () => applyScale(stageEl));
}
