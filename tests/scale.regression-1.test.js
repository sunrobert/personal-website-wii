// Regression: ISSUE-001 — menu zoom overflowed the viewport width on 16:10 screens, clipping edge tiles
// Found by /qa on 2026-10-25
// Report: .gstack/qa-reports/qa-report-robertsun-vercel-app-2026-10-25.md
import { expect, test } from "bun:test";
import { applyScale, STAGE_W } from "../scripts/scale.js";

function menuScale(innerWidth, innerHeight) {
  globalThis.window = { innerWidth, innerHeight, matchMedia: () => ({ matches: false }) };
  const stage = { id: "stage", style: {} };
  applyScale(stage);
  return Number(stage.style.transform.match(/scale\(([\d.]+)\)/)[1]);
}

test("menu stage never renders wider than the viewport", () => {
  for (const [w, h] of [[1280, 800], [1440, 900], [1512, 982], [1728, 1117], [1024, 768], [2560, 1440], [1280, 720], [1920, 1080]]) {
    expect(STAGE_W * menuScale(w, h)).toBeLessThanOrEqual(w + 0.001);
  }
});

test("menu still zooms when the viewport is wide enough", () => {
  const h = 800;
  const fit = (h - 100) / 554;
  expect(menuScale(3000, h)).toBeCloseTo(fit * 1.2, 5);
});
