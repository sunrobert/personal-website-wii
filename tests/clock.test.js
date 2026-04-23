import { expect, test } from "bun:test";
import { formatTime, formatDate } from "../scripts/clock.js";

test("formats midnight as 12:00 AM", () => {
  expect(formatTime(new Date("2026-04-22T00:00:00"))).toEqual({ hhmm: "12:00", ampm: "AM" });
});

test("formats noon as 12:00 PM", () => {
  expect(formatTime(new Date("2026-04-22T12:00:00"))).toEqual({ hhmm: "12:00", ampm: "PM" });
});

test("formats 7:52 PM", () => {
  expect(formatTime(new Date("2026-04-22T19:52:00"))).toEqual({ hhmm: "7:52", ampm: "PM" });
});

test("formats 1:05 AM with zero-padded minutes", () => {
  expect(formatTime(new Date("2026-04-22T01:05:00"))).toEqual({ hhmm: "1:05", ampm: "AM" });
});

test("formats date as Wed 4/22", () => {
  expect(formatDate(new Date("2026-04-22T12:00:00"))).toBe("Wed 4/22");
});
