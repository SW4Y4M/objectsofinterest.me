import { expect, test } from "@playwright/test";
import { tileButton } from "./helpers";

test.describe("annotation reveal", () => {
  test("focusing a tile reveals its annotation with metadata and source link", async ({ page }) => {
    await page.goto("/");

    const brass = tileButton(page, "Brass oil burner");
    await brass.focus(); // keyboard focus path (works on desktop and mobile projects)

    const annotation = page.getByRole("heading", { level: 2, name: "Brass oil burner" });
    await expect(annotation).toBeVisible();

    // Source link present, opens in a new tab.
    const source = page.getByRole("link", { name: "Source" });
    await expect(source).toBeVisible();
    await expect(source).toHaveAttribute("target", "_blank");
    await expect(source).toHaveAttribute("href", "https://example.com/brass-oil-burner");
  });

  test("an object without a source shows no source link", async ({ page }) => {
    await page.goto("/");
    await tileButton(page, "Aluminum drafting pen").focus();

    await expect(page.getByRole("heading", { level: 2, name: "Aluminum drafting pen" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Source" })).toHaveCount(0);
  });
});

test.describe("annotation pinning", () => {
  test("tapping toggles the annotation and tapping outside dismisses it", async ({ page }) => {
    await page.goto("/");

    const brass = tileButton(page, "Brass oil burner");
    const heading = page.getByRole("heading", { level: 2, name: "Brass oil burner" });

    await brass.click();
    await expect(heading).toBeVisible();

    // Second click on the same tile closes it (aria-label flips to "Hide details for …").
    await page.getByRole("button", { name: "Hide details for Brass oil burner" }).click();
    await expect(heading).toHaveCount(0);

    // Re-open, then click empty page chrome to dismiss.
    await brass.click();
    await expect(heading).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click(); // the profile title, outside any tile
    await expect(heading).toHaveCount(0);
  });
});
