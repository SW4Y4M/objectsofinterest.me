import { describe, expect, it } from "vitest";
import { processWishlistImage } from "@/lib/image/pipeline";
import { FakeObjectStorageProvider } from "@/lib/image/storage";
import type { BackgroundRemovalProvider, ImageSearchProvider, ObjectStorageProvider } from "@/lib/image/types";

const storage: ObjectStorageProvider = {
  async storeOriginal(source) {
    return { url: `https://cdn.example.com/original/${encodeURIComponent(source.url)}` };
  },
  async storeUpload(source) {
    return { url: `https://cdn.example.com/uploaded/${encodeURIComponent(source.name)}` };
  },
  async storeProcessed(source) {
    return { url: `https://cdn.example.com/processed/${encodeURIComponent(source.url)}` };
  }
};

describe("processWishlistImage", () => {
  it("uses a provided image URL before searching", async () => {
    const search: ImageSearchProvider = {
      async search() {
        throw new Error("search should not run");
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground(input) {
        return { processedUrl: `${input.url}?cutout=1`, width: 1600, height: 1500, quality: "usable" };
      }
    };

    const result = await processWishlistImage({
      name: "Lamp",
      imageUrl: "https://example.com/lamp.png",
      search,
      remover,
      storage,
      objectIndex: 0
    });

    expect(result.status).toBe("Visible");
    expect(result.imageOriginalUrl).toContain("lamp.png");
    expect(result.displaySize).toBe("feature");
  });

  it("searches by object name when no image URL is supplied", async () => {
    const search: ImageSearchProvider = {
      async search(query) {
        expect(query).toBe("Desk lamp");
        return [{ url: "https://example.com/search-lamp.png", width: 1200, height: 900, score: 0.9, provider: "fake-search" }];
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground(input) {
        return { processedUrl: `${input.url}?cutout=1`, width: 1200, height: 900, quality: "usable" };
      }
    };

    const result = await processWishlistImage({
      name: "Desk lamp",
      search,
      remover,
      storage,
      objectIndex: 2
    });

    expect(result.status).toBe("Visible");
    expect(result.sourceImageProvider).toBe("fake-search");
  });

  it("returns Draft when search finds no candidate", async () => {
    const search: ImageSearchProvider = {
      async search() {
        return [];
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground() {
        throw new Error("remover should not run");
      }
    };

    const result = await processWishlistImage({
      name: "Rare object",
      search,
      remover,
      storage,
      objectIndex: 1
    });

    expect(result.status).toBe("Draft");
    expect(result.imageProcessedUrl).toBeNull();
  });

  it("returns Draft when background removal is low quality", async () => {
    const search: ImageSearchProvider = {
      async search() {
        return [{ url: "https://example.com/object.png", width: 200, height: 200, score: 0.2, provider: "fake-search" }];
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground(input) {
        return { processedUrl: input.url, width: 200, height: 200, quality: "poor" };
      }
    };

    const result = await processWishlistImage({
      name: "Tiny object",
      search,
      remover,
      storage,
      objectIndex: 4
    });

    expect(result.status).toBe("Draft");
    expect(result.imageProcessedUrl).toBeNull();
  });

  it("stores uploaded files as renderable data URLs in local fake storage", async () => {
    const storageProvider = new FakeObjectStorageProvider();
    const upload = await storageProvider.storeUpload({
      file: new File([new Uint8Array([137, 80, 78, 71])], "photo.png", { type: "image/png" }),
      name: "photo"
    });

    expect(upload.url.startsWith("data:image/png;base64,")).toBe(true);
  });
});
