import { formatLocalTime } from "..";

describe("formatLocalTime", () => {
  it("formats UTC time + positive offset correctly", () => {
    // 2025-08-14 12:00 UTC
    const unix = Date.UTC(2025, 7, 14, 12, 0) / 1000;
    const offset = 3600; // +1 hour
    expect(formatLocalTime(unix, offset)).toBe("1:00 PM");
  });

  it("formats UTC time + negative offset correctly", () => {
    const unix = Date.UTC(2025, 7, 14, 12, 0) / 1000;
    const offset = -18000; // -5 hours
    expect(formatLocalTime(unix, offset)).toBe("7:00 AM");
  });

  it("handles midnight correctly", () => {
    const unix = Date.UTC(2025, 7, 14, 0, 0) / 1000;
    const offset = 0; // UTC
    expect(formatLocalTime(unix, offset)).toBe("12:00 AM");
  });

  it("handles noon correctly", () => {
    const unix = Date.UTC(2025, 7, 14, 12, 0) / 1000;
    const offset = 0;
    expect(formatLocalTime(unix, offset)).toBe("12:00 PM");
  });

  it("pads minutes with zero", () => {
    const unix = Date.UTC(2025, 7, 14, 5, 5) / 1000;
    const offset = 0;
    expect(formatLocalTime(unix, offset)).toBe("5:05 AM");
  });
});
