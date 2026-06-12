import { afterEach, describe, expect, it, vi } from "vitest";
import { InMemoryObjectRepository } from "@/lib/repositories/objects";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("object repository contract", () => {
  it("lists only visible objects publicly, newest first, filtered by tag", async () => {
    const repository = InMemoryObjectRepository.createSeeded();

    await repository.createForStudio({
      name: "Old chair",
      slug: "old-chair",
      editorialTag: "Home",
      status: "Visible",
      imageOriginalUrl: "https://example.com/chair-original.png",
      imageProcessedUrl: "https://example.com/chair.png",
      displaySize: "standard",
      createdAt: new Date("2026-01-01T00:00:00Z")
    });
    await repository.createForStudio({
      name: "New pen",
      slug: "new-pen",
      editorialTag: "Work",
      status: "Visible",
      imageOriginalUrl: "https://example.com/pen-original.png",
      imageProcessedUrl: "https://example.com/pen.png",
      displaySize: "wide",
      createdAt: new Date("2026-02-01T00:00:00Z")
    });
    await repository.createForStudio({
      name: "Draft lamp",
      slug: "draft-lamp",
      editorialTag: "Home",
      status: "Draft",
      imageOriginalUrl: null,
      imageProcessedUrl: null,
      displaySize: "standard",
      createdAt: new Date("2026-03-01T00:00:00Z")
    });

    const publicObjects = await repository.listPublic({ editorialTag: "Work" });

    expect(publicObjects.map((object) => object.name)).toEqual(["New pen"]);
  });

  it("keeps drafts available in Studio", async () => {
    const repository = new InMemoryObjectRepository([
      {
        id: "draft-1",
        name: "Draft lamp",
        slug: "draft-lamp",
        imageOriginalUrl: null,
        imageProcessedUrl: null,
        sourceUrl: null,
        editorialTag: "Home",
        price: null,
        currency: null,
        note: null,
        status: "Draft",
        displaySize: "standard",
        sourceImageProvider: null,
        createdAt: new Date("2026-03-01T00:00:00Z"),
        updatedAt: new Date("2026-03-01T00:00:00Z")
      }
    ]);

    const studioObjects = await repository.listStudio();

    expect(studioObjects).toHaveLength(1);
    expect(studioObjects[0].status).toBe("Draft");
  });

  it("uses the seeded in-memory repository when DATABASE_URL is the placeholder example", async () => {
    vi.resetModules();
    vi.stubEnv("DATABASE_URL", "postgres://user:password@host:5432/wishlist");

    const { createObjectRepository } = await import("@/lib/repositories/objects");
    const repository = createObjectRepository();
    const studioObjects = await repository.listStudio();

    expect(studioObjects.map((object) => object.name)).toEqual([
      "Brass oil burner",
      "Aluminum drafting pen",
      "Draft ceramic bowl"
    ]);
  });
});
