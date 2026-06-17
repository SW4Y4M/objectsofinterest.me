import { describe, expect, it } from "vitest";
import { previewStateFromUrlIntakeResult } from "@/app/studio/urlIntakeState";

describe("previewStateFromUrlIntakeResult", () => {
  it("maps image results to a success preview", () => {
    expect(
      previewStateFromUrlIntakeResult({
        kind: "image",
        originalUrl: "https://cdn.example.com/mug.png",
        contentType: "image/png",
        sourceUrl: "https://cdn.example.com/mug.png"
      })
    ).toEqual({
      status: "success",
      message: "Found an image. Review before adding it to the wall.",
      fieldErrors: {},
      values: {
        imageUrl: "https://cdn.example.com/mug.png",
        sourceUrl: "https://cdn.example.com/mug.png"
      }
    });
  });

  it("maps page results to editable prefill values", () => {
    expect(
      previewStateFromUrlIntakeResult({
        kind: "page",
        sourceUrl: "https://shop.example.com/raw",
        canonicalUrl: "https://shop.example.com/canonical",
        suggestedName: "Desk lamp",
        imageUrl: "https://shop.example.com/lamp.jpg",
        price: "80",
        currency: "USD"
      })
    ).toEqual({
      status: "success",
      message: "Found an image. Review before adding it to the wall.",
      fieldErrors: {},
      values: {
        name: "Desk lamp",
        imageUrl: "https://shop.example.com/lamp.jpg",
        sourceUrl: "https://shop.example.com/canonical",
        price: "80",
        currency: "USD"
      }
    });
  });

  it("maps no-image page results to a recoverable error with source preserved", () => {
    expect(
      previewStateFromUrlIntakeResult({
        kind: "needs_image",
        sourceUrl: "https://shop.example.com/no-image",
        suggestedName: "Mystery object",
        reason: "no_image_found"
      })
    ).toEqual({
      status: "error",
      message: "I found the page, but not a usable image. Add an image URL or upload one.",
      fieldErrors: {},
      values: {
        name: "Mystery object",
        sourceUrl: "https://shop.example.com/no-image"
      }
    });
  });
});
