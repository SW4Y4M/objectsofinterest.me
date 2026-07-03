import { expect, test } from "@playwright/test";
import { openAddForm, unlockStudio } from "./helpers";

test("the add drawer reveals the URL preview controls", async ({ page }) => {
  await unlockStudio(page);
  await expect(page.getByLabel("Paste a URL or add an image")).toHaveCount(0);
  await openAddForm(page);
  await expect(page.getByLabel("Paste a URL or add an image")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fetch details" })).toBeVisible();
});

test("fetching with an empty URL asks for a URL", async ({ page }) => {
  await unlockStudio(page);
  await openAddForm(page);

  await page.getByRole("button", { name: "Fetch details" }).click();
  // The message renders both as the field error and the feedback alert; target the alert.
  await expect(page.locator("#add-object-preview-feedback")).toHaveText("Paste a URL first.");
});

test("fetching an unreachable URL reports a recoverable fetch error", async ({ page }) => {
  await unlockStudio(page);
  await openAddForm(page);

  // Loopback is blocked by the SSRF guard and any low port fails fast; both map to the
  // same deterministic message with no external network dependency.
  await page.getByLabel("Paste a URL or add an image").fill("http://127.0.0.1:1/nope");
  await page.getByRole("button", { name: "Fetch details" }).click();

  await expect(
    page.getByText("That URL could not be fetched. Add an image URL or upload an image instead.")
  ).toBeVisible();
});
