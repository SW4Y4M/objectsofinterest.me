import { describe, expect, it } from "vitest";
import { chooseDisplaySize } from "@/lib/domain/displaySize";

describe("chooseDisplaySize", () => {
  it("uses feature size for very recent high-resolution square objects", () => {
    expect(chooseDisplaySize({ width: 1600, height: 1500, index: 0 })).toBe("feature");
  });

  it("uses wide size for wide images", () => {
    expect(chooseDisplaySize({ width: 1800, height: 900, index: 4 })).toBe("wide");
  });

  it("uses tall size for tall images", () => {
    expect(chooseDisplaySize({ width: 800, height: 1600, index: 4 })).toBe("tall");
  });

  it("uses standard size for small or balanced images outside feature positions", () => {
    expect(chooseDisplaySize({ width: 900, height: 900, index: 5 })).toBe("standard");
  });
});
