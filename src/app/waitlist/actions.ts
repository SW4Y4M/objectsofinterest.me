"use server";

import { z } from "zod";
import { createWaitlistRepository } from "@/lib/repositories/waitlist";

export type WaitlistActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const emptyWaitlistState: WaitlistActionState = { status: "idle", message: null, fieldErrors: {} };

const schema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

export async function joinWaitlist(_prev: WaitlistActionState, formData: FormData): Promise<WaitlistActionState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldErrors: { email: parsed.error.issues[0]?.message ?? "Invalid email." }
    };
  }
  await createWaitlistRepository().add(parsed.data.email);
  return { status: "success", message: "You're on the list.", fieldErrors: {} };
}
