import { describe, expect, it } from "vitest";
import {
  EDITORIAL_TAGS,
  createWishlistObjectInputSchema,
  publicWishlistObjectSchema
} from "@/lib/domain/wishlistObject";

describe("wishlist object domain", () => {
  it("keeps the fixed editorial tag set from the spec", () => {
    expect(EDITORIAL_TAGS).toEqual(["Wear", "Work", "Home", "Read", "Make", "Move", "Care", "Collect"]);
  });

  it("requires name and editorial tag for object creation", () => {
    const result = createWishlistObjectInputSchema.safeParse({
      name: "Muji aluminum pen",
      editorialTag: "Work"
    });

    expect(result.success).toBe(true);
  });

  it("rejects visible public objects without a processed image", () => {
    const result = publicWishlistObjectSchema.safeParse({
      id: "obj_1",
      name: "Lamp",
      slug: "lamp",
      imageOriginalUrl: null,
      imageProcessedUrl: "",
      sourceUrl: null,
      editorialTag: "Home",
      price: null,
      currency: null,
      note: null,
      status: "Visible",
      displaySize: "standard",
      sourceImageProvider: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    expect(result.success).toBe(false);
  });

  it("allows optional price, source URL, original image, and note", () => {
    const result = createWishlistObjectInputSchema.safeParse({
      name: "Artek stool",
      editorialTag: "Home",
      price: "345",
      currency: "USD",
      sourceUrl: "https://example.com/stool",
      imageUrl: "https://example.com/stool.png",
      note: "Recommended by a designer friend"
    });

    expect(result.success).toBe(true);
  });
});
