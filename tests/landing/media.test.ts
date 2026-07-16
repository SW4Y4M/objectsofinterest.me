import { describe, expect, it } from "vitest";
import { LANDING_MEDIA } from "@/lib/landing/media";

describe("LANDING_MEDIA", () => {
  it("has at least a dozen cutouts under /landing with positive dimensions", () => {
    expect(LANDING_MEDIA.length).toBeGreaterThanOrEqual(12);
    for (const m of LANDING_MEDIA) {
      expect(m.url.startsWith("/landing/")).toBe(true);
      expect(m.width).toBeGreaterThan(0);
      expect(m.height).toBeGreaterThan(0);
    }
  });
});
