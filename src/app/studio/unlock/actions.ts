"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createStudioSessionValue, STUDIO_COOKIE_NAME, verifyOwnerPasscode } from "@/lib/studio/auth";

export async function unlockStudio(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "");
  const expected = process.env.OWNER_PASSCODE ?? "";

  if (!verifyOwnerPasscode(passcode, expected)) {
    redirect("/studio/unlock?error=1");
  }

  const sessionValue = await createStudioSessionValue(process.env.STUDIO_COOKIE_SECRET ?? expected);
  const cookieStore = await cookies();

  cookieStore.set(STUDIO_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/studio",
    maxAge: 60 * 60 * 24
  });

  redirect("/studio");
}
