import { expect, test } from "@playwright/test";

test("studio requires unlock", async ({ page }) => {
  await page.goto("/studio");
  await expect(page).toHaveURL(/\/studio\/unlock/);
  await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();
});
