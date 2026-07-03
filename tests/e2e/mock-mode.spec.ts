import { expect, test } from "@playwright/test";
import { SEED_VISIBLE_NAMES, STUDIO_PASSCODE, tileButton } from "./helpers";

test("mock mode renders the 10-object preview wall", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Objects of Interest/ })).toBeVisible();
  const tiles = page.locator("[data-object-tile]");
  await expect(tiles).toHaveCount(10);

  for (let index = 0; index < 10; index += 1) {
    const tile = tiles.nth(index);
    await tile.scrollIntoViewIfNeeded();
    await expect.poll(async () => {
      return tile.locator("img").evaluate((image) => {
        const element = image as HTMLImageElement;
        return element.complete && element.naturalWidth > 0 && !element.currentSrc.startsWith("data:");
      });
    }).toBe(true);
  }
});

test("grid view keeps each mock image inside its tile", async ({ page }) => {
  await page.goto("/");

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
