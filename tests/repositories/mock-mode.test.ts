import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db/client", () => ({
  getDatabase: vi.fn(() => {
    throw new Error("database should not be touched in mock mode");
  })
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("mock mode repository", () => {
  it("returns the seeded mock dataset instead of touching the database", async () => {
    vi.stubEnv("WISHLIST_MODE", "mock");

    const { createObjectRepository } = await import("@/lib/repositories/objects");
    const repository = createObjectRepository();

    const publicObjects = await repository.listPublic();
    const studioObjects = await repository.listStudio();

    expect(publicObjects).toHaveLength(10);
    expect(studioObjects).toHaveLength(12);
    expect(publicObjects.every((object) => object.imageProcessedUrl.startsWith("data:image/svg+xml;utf8,"))).toBe(true);
  });
});
