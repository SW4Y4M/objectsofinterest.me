import { describe, expect, it } from "vitest";
import { InMemoryWaitlistRepository } from "@/lib/repositories/waitlist";

describe("InMemoryWaitlistRepository", () => {
  it("stores an email and reports it as created", async () => {
    const repo = new InMemoryWaitlistRepository();
    const result = await repo.add("Person@Example.com");
    expect(result).toEqual({ created: true });
  });

  it("lowercases and de-duplicates the same email", async () => {
    const repo = new InMemoryWaitlistRepository();
    await repo.add("Person@Example.com");
    const again = await repo.add("person@example.com");
    expect(again).toEqual({ created: false });
    expect(repo.emails()).toEqual(["person@example.com"]);
  });
});
