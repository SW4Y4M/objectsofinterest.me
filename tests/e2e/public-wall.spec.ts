import { expect, test } from "@playwright/test";
import { tileButton } from "./helpers";

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

test("filtering by a tag shows only that tag's objects", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("navigation", { name: "Editorial tags" }).getByRole("button", { name: "Home" }).click();

  // Home has exactly these three visible seed objects.
  await expect(tileButton(page, "Brass oil burner")).toBeVisible();
  await expect(tileButton(page, "Ceramic mug")).toBeVisible();
  await expect(tileButton(page, "Folding stool")).toBeVisible();
  // A non-Home object is filtered out.
  await expect(tileButton(page, "Merino overcoat")).toHaveCount(0);

  // Returning to "All" restores the filtered-out object.
  await page.getByRole("navigation", { name: "Editorial tags" }).getByRole("button", { name: "All" }).click();
  await expect(tileButton(page, "Merino overcoat")).toBeVisible();
});

test("wall view choice persists across reload via localStorage", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("masonry-wall")).toBeVisible();

  await page.getByRole("button", { name: "Strict grid view" }).click();
  await expect(page.getByTestId("strict-grid-wall")).toBeVisible();
  await expect(await page.evaluate(() => window.localStorage.getItem("wishlist:view"))).toBe("grid");

  await page.reload();
  await expect(page.getByTestId("strict-grid-wall")).toBeVisible();
  await expect(page.getByTestId("masonry-wall")).toHaveCount(0);
});

test("the studio link navigates to the locked studio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open studio" }).click();
  await expect(page).toHaveURL(/\/studio\/unlock/);
  await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();
});

test("draft objects never appear on the public wall", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Blueprint notebook", "Archive tea tin"]) {
    await expect(tileButton(page, name)).toHaveCount(0);
  }
});
