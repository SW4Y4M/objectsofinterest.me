import { describe, expect, it } from "vitest";
import { createSlug } from "@/lib/domain/slug";

describe("createSlug", () => {
  it("normalizes object names for URLs", () => {
    expect(createSlug("  Aesop Brass Oil Burner!  ")).toBe("aesop-brass-oil-burner");
  });

  it("falls back when a name has no URL-safe characters", () => {
    expect(createSlug("!!!")).toBe("object");
  });
});
