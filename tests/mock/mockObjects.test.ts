import { describe, expect, it } from "vitest";
import { DISPLAY_SIZES, EDITORIAL_TAGS } from "@/lib/domain/wishlistObject";
import { mockWishlistObjects } from "@/lib/mock/mockObjects";

describe("mockWishlistObjects", () => {
  it("covers the preview matrix", () => {
    expect(mockWishlistObjects).toHaveLength(12);
    expect(mockWishlistObjects.filter((object) => object.status === "Visible")).toHaveLength(10);
    expect(mockWishlistObjects.filter((object) => object.status === "Draft")).toHaveLength(2);

    expect(new Set(mockWishlistObjects.map((object) => object.editorialTag))).toEqual(
      new Set(EDITORIAL_TAGS)
    );
    expect(new Set(mockWishlistObjects.map((object) => object.displaySize))).toEqual(
      new Set(DISPLAY_SIZES)
    );

    expect(mockWishlistObjects.some((object) => object.note === null)).toBe(true);
    expect(mockWishlistObjects.some((object) => object.note !== null)).toBe(true);
    expect(mockWishlistObjects.some((object) => object.sourceUrl === null)).toBe(true);
    expect(mockWishlistObjects.some((object) => object.sourceUrl !== null)).toBe(true);
    expect(mockWishlistObjects.some((object) => object.price === null)).toBe(true);
    expect(mockWishlistObjects.some((object) => object.price !== null)).toBe(true);

    expect(
      mockWishlistObjects.every((object) => object.imageOriginalUrl?.startsWith("https://"))
    ).toBe(true);
    expect(
      mockWishlistObjects.every((object) => object.imageProcessedUrl?.startsWith("https://"))
    ).toBe(true);
    expect(
      mockWishlistObjects.every((object) => {
        return !object.imageProcessedUrl?.startsWith("data:") && !object.imageOriginalUrl?.startsWith("data:");
      })
    ).toBe(true);
  });
});
