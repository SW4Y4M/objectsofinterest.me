import { expect, test } from "@playwright/test";
import { SEED_VISIBLE_NAMES, STUDIO_PASSCODE, tileButton } from "./helpers";

test("mock mode renders the seed preview wall with loaded images", async ({ page }) => {
  await page.goto("/wall");

  await expect(page.getByRole("heading", { name: /Objects of Interest/ })).toBeVisible();

  // Seed-scoped: other specs share one mock store and may add objects during the run,
  // so verify each of the 10 seed objects renders a real (non-data) loaded image.
  for (const name of SEED_VISIBLE_NAMES) {
    const image = tileButton(page, name).locator("img");
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => {
        return image.evaluate((el) => {
          const img = el as HTMLImageElement;
          return img.complete && img.naturalWidth > 0 && !img.currentSrc.startsWith("data:");
        });
      })
      .toBe(true);
  }
});

test("grid view keeps each mock image inside its tile", async ({ page }) => {
  await page.goto("/wall");

  await page.evaluate(() => window.localStorage.setItem("wishlist:view", "grid"));
  await page.reload();
  await expect(page.locator("[data-testid='strict-grid-wall']")).toBeVisible();

  const overflowCount = await page.locator("[data-object-tile]").evaluateAll((tiles) => {
    return tiles.filter((tile) => {
      const image = tile.querySelector("img");
      if (!image) return true;

      const tileRect = tile.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      return (
        imageRect.left < tileRect.left - 1 ||
        imageRect.right > tileRect.right + 1 ||
        imageRect.top < tileRect.top - 1 ||
        imageRect.bottom > tileRect.bottom + 1
      );
    }).length;
  });

  expect(overflowCount).toBe(0);
});

test("mock mode studio unlock shows the same preview set", async ({ page }) => {
  await page.goto("/studio/unlock");
  await page.getByLabel("Passcode").fill(STUDIO_PASSCODE);
  await page.getByRole("button", { name: "Unlock" }).click();

  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByText("Mock data")).toBeVisible();
  for (const name of SEED_VISIBLE_NAMES) {
    await expect(tileButton(page, name)).toBeVisible();
  }
});
