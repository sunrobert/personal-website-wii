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
