import { expect, test } from "@playwright/test";
import { STUDIO_PASSCODE, unlockStudio } from "./helpers";

test("visiting the studio while locked redirects to unlock", async ({ page }) => {
  await page.goto("/studio");
  await expect(page).toHaveURL(/\/studio\/unlock/);
  await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();
});

test("a wrong passcode shows an error and stays on the unlock page", async ({ page }) => {
  await page.goto("/studio/unlock");
  await page.getByLabel("Passcode").fill("00000");
  await page.getByRole("button", { name: "Unlock" }).click();

  await expect(page).toHaveURL(/\/studio\/unlock\?error=1/);
  await expect(page.getByText("Passcode did not match.")).toBeVisible();
});

test("the correct passcode unlocks the studio", async ({ page }) => {
  await page.goto("/studio/unlock");
  await page.getByLabel("Passcode").fill(STUDIO_PASSCODE);
  await page.getByRole("button", { name: "Unlock" }).click();

  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByRole("heading", { name: "Manage objects" })).toBeVisible();
});

test("the studio session persists across navigation without re-entering the passcode", async ({ page }) => {
  await unlockStudio(page);

  await page.goto("/"); // leave the studio
  await page.goto("/studio"); // return directly

  await expect(page).toHaveURL(/\/studio$/); // no redirect to unlock
  await expect(page.getByRole("heading", { name: "Manage objects" })).toBeVisible();
});
