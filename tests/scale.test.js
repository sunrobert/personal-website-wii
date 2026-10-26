import { expect, test } from "bun:test";
import { computeScale, STAGE_W, STAGE_H } from "../scripts/scale.js";

test("fits viewport exactly when aspect ratios match", () => {
  expect(computeScale(STAGE_W, STAGE_H)).toBe(1);
  expect(computeScale(STAGE_W * 2, STAGE_H * 2)).toBe(2);
});

test("letterboxes when viewport is wider than the stage", () => {
  expect(computeScale(STAGE_W * 2, STAGE_H)).toBe(1);
});

test("pillarboxes when viewport is taller than the stage", () => {
  expect(computeScale(STAGE_W, STAGE_H * 2)).toBe(1);
});

test("scales down for small viewports", () => {
  expect(computeScale(STAGE_W / 2, STAGE_H / 2)).toBe(0.5);
});
