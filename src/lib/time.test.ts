import { describe, expect, it } from "vitest";
import { timeAgo } from "./time";

const NOW = new Date("2026-06-10T12:00:00Z").getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe("timeAgo", () => {
  it("says now for the last few seconds", () => {
    expect(timeAgo(ago(10_000), NOW)).toBe("now");
  });
  it("uses minutes, hours and days", () => {
    expect(timeAgo(ago(5 * 60_000), NOW)).toBe("5m");
    expect(timeAgo(ago(3 * 3_600_000), NOW)).toBe("3h");
    expect(timeAgo(ago(2 * 86_400_000), NOW)).toBe("2d");
  });
  it("never goes negative for a message from the future (clock skew)", () => {
    expect(timeAgo(new Date(NOW + 60_000).toISOString(), NOW)).toBe("now");
  });
});
