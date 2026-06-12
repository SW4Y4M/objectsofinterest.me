import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const STUDIO_COOKIE_NAME = "wishlist_studio";

export function verifyOwnerPasscode(input: string, expected: string): boolean {
  return input.length > 0 && expected.length > 0 && input === expected;
}

export async function createStudioSessionValue(secret: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256").update(`${secret}:${day}`).digest("hex");
  return `studio:${day}:${digest}`;
}

export async function isValidStudioSession(value: string | undefined, secret: string): Promise<boolean> {
  if (!value) {
    return false;
  }

  return value === (await createStudioSessionValue(secret));
}

export async function requireStudioSession() {
  const cookieStore = await cookies();
  const secret = process.env.STUDIO_COOKIE_SECRET ?? process.env.OWNER_PASSCODE ?? "";
  const valid = await isValidStudioSession(cookieStore.get(STUDIO_COOKIE_NAME)?.value, secret);

  if (!valid) {
    redirect("/studio/unlock");
  }
}
