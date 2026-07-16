import { describe, expect, it } from "vitest";
import { emptyWaitlistState, joinWaitlist } from "@/app/waitlist/actions";

function form(email: string) {
  const fd = new FormData();
  fd.set("email", email);
  return fd;
}

describe("joinWaitlist", () => {
  it("rejects an invalid email with a field error", async () => {
    const result = await joinWaitlist(emptyWaitlistState, form("not-an-email"));
    expect(result.status).toBe("error");
    expect(result.fieldErrors.email).toBeTruthy();
  });

  it("accepts a valid email", async () => {
    const result = await joinWaitlist(emptyWaitlistState, form("a@b.com"));
    expect(result.status).toBe("success");
    expect(result.message).toMatch(/list/i);
  });
});
