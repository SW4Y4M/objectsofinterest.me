import { describe, expect, it } from "vitest";
import { DISPLAY_SIZES, EDITORIAL_TAGS } from "@/lib/domain/wishlistObject";
import { mockWishlistObjects } from "@/lib/mock/mockObjects";

function decodeSvgDataUrl(value: string) {
  expect(value.startsWith("data:image/svg+xml;utf8,")).toBe(true);
  return decodeURIComponent(value.slice("data:image/svg+xml;utf8,".length));
}

function classifyAspectRatio(svg: string) {
  const match = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  expect(match).not.toBeNull();
  const width = Number(match?.[1]);
  const height = Number(match?.[2]);

  if (width === height) {
    return "square";
  }

  return width > height ? "landscape" : "portrait";
}

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

    const aspectRatios = new Set(
      mockWishlistObjects.flatMap((object) => {
        const original = object.imageOriginalUrl ? decodeSvgDataUrl(object.imageOriginalUrl) : "";
        const processed = object.imageProcessedUrl ? decodeSvgDataUrl(object.imageProcessedUrl) : "";
        return [original, processed].filter(Boolean).map(classifyAspectRatio);
      })
    );

    expect(aspectRatios).toEqual(new Set(["square", "landscape", "portrait"]));
    expect(
      mockWishlistObjects.every((object) => object.imageOriginalUrl?.startsWith("data:image/svg+xml;utf8,"))
    ).toBe(true);
    expect(
      mockWishlistObjects.every((object) => object.imageProcessedUrl?.startsWith("data:image/svg+xml;utf8,"))
    ).toBe(true);
  });
});
