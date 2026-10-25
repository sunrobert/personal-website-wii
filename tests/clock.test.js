import { expect, test } from "bun:test";
import { formatTime, formatDate, clockHTML } from "../scripts/clock.js";

test("wraps every 1 so CSS can trim its blank left half", () => {
  expect(clockHTML("11:17", "PM")).toBe(
    '<span class="hh"><span class="d1">1</span><span class="d1">1</span></span><span class="colon">:</span>' +
    '<span class="mm"><span class="d1">1</span>7</span><span class="ampm">PM</span>'
  );
});

test("leaves digits other than 1 alone", () => {
  expect(clockHTML("5:20", "AM")).toBe(
    '<span class="hh">5</span><span class="colon">:</span><span class="mm">20</span><span class="ampm">AM</span>'
  );
});

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
