import { expect, test } from "@playwright/test";

test("public page shows the profile identity and view controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Objects of Interest/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Masonry view" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Strict grid view" })).toBeVisible();
});

test("public page can switch wall views", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Strict grid view" }).click();
  await expect(page.locator("[data-testid='strict-grid-wall']")).toBeVisible();
});
