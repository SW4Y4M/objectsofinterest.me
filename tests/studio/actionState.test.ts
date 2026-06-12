import { describe, expect, it } from "vitest";
import { toFieldErrors } from "@/app/studio/actionState";
import { createWishlistObjectInputSchema } from "@/lib/domain/wishlistObject";

describe("studio action state", () => {
  it("converts Zod issues into field errors", () => {
    const result = createWishlistObjectInputSchema.safeParse({
      name: "",
      editorialTag: "Home"
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toEqual({ name: "Object name is required" });
    }
  });
});
