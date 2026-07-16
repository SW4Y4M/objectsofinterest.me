import { expect, test } from "@playwright/test";

test("the wall lives at /wall and still renders seed objects", async ({ page }) => {
  await page.goto("/wall");
  await expect(page.getByRole("heading", { name: /Objects of Interest/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show details for Brass oil burner" })).toBeVisible();
});

test("the landing shows the waitlist and accepts an email", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Build your objectsofinterest" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible(); // WebGL hero mounted

  // The loading counter overlay covers the form until it fades; Playwright's
  // actionability check waits it out before the fill/click land.
  await page.getByLabel(/email/i).fill("visitor@example.com");
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText("You're on the list.")).toBeVisible();
});
