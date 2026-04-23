import { expect, test } from "bun:test";
import { computeScale } from "../scripts/scale.js";

test("fits viewport exactly when aspect ratios match", () => {
  expect(computeScale(1280, 720)).toBe(1);
  expect(computeScale(2560, 1440)).toBe(2);
});

test("letterboxes when viewport is wider than 16:9", () => {
  expect(computeScale(2000, 720)).toBe(1);
});

test("pillarboxes when viewport is taller than 16:9", () => {
  expect(computeScale(1280, 1000)).toBe(1);
});

test("scales down for small viewports", () => {
  expect(computeScale(640, 360)).toBe(0.5);
});
