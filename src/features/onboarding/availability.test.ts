import { describe, expect, it } from "vitest";
import { cellKey, cellsToSlots, slotsToCells } from "./availability";

describe("cellsToSlots", () => {
  it("merges consecutive hours into one slot", () => {
    expect(cellsToSlots(["1:18", "1:19", "1:20"])).toEqual([
      { dayOfWeek: 1, startMin: 1080, endMin: 1260 },
    ]);
  });

  it("splits on gaps and keeps days apart, sorted", () => {
    expect(cellsToSlots(["3:10", "1:9", "1:11", "1:10", "3:15"])).toEqual([
      { dayOfWeek: 1, startMin: 540, endMin: 720 },
      { dayOfWeek: 3, startMin: 600, endMin: 660 },
      { dayOfWeek: 3, startMin: 900, endMin: 960 },
    ]);
  });

  it("ignores duplicates and malformed cells", () => {
    expect(cellsToSlots(["1:9", "1:9", "x:y", "2:99"])).toEqual([
      { dayOfWeek: 1, startMin: 540, endMin: 600 },
    ]);
    expect(cellsToSlots([])).toEqual([]);
  });

  it("handles the last hour of the day", () => {
    expect(cellsToSlots(["0:23"])).toEqual([
      { dayOfWeek: 0, startMin: 1380, endMin: 1440 },
    ]);
  });
});

describe("slotsToCells", () => {
  it("is the inverse for whole-hour slots", () => {
    const slots = [
      { dayOfWeek: 1, startMin: 540, endMin: 720 },
      { dayOfWeek: 3, startMin: 900, endMin: 960 },
    ];
    expect(cellsToSlots(slotsToCells(slots))).toEqual(slots);
  });

  it("rounds odd slots outwards to whole hours", () => {
    expect(
      slotsToCells([{ dayOfWeek: 2, startMin: 570, endMin: 650 }]).sort(),
    ).toEqual([cellKey(2, 9), cellKey(2, 10)].sort());
  });
});
