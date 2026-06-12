import { describe, expect, it } from "vitest";
import { createStudioSessionValue, isValidStudioSession, verifyOwnerPasscode } from "@/lib/studio/auth";

describe("studio auth", () => {
  it("accepts the configured owner passcode", () => {
    expect(verifyOwnerPasscode("open-sesame", "open-sesame")).toBe(true);
  });

  it("rejects incorrect passcodes", () => {
    expect(verifyOwnerPasscode("wrong", "open-sesame")).toBe(false);
  });

  it("creates a deterministic session value for a configured secret", async () => {
    const value = await createStudioSessionValue("secret-value");
    expect(value).toMatch(/^studio:\d{4}-\d{2}-\d{2}:/);
    await expect(isValidStudioSession(value, "secret-value")).resolves.toBe(true);
  });
});
