import { expect, test, type Page } from "@playwright/test";

async function unlockStudio(page: Page) {
  await page.goto("/studio/unlock");
  await page.getByLabel("Passcode").fill("12345");
  await page.getByRole("button", { name: "Unlock" }).click();
}

test("studio requires unlock", async ({ page }) => {
  await page.goto("/studio");
  await expect(page).toHaveURL(/\/studio\/unlock/);
  await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();
});

test("unlocked studio shows add, management, and public preview surfaces", async ({ page }) => {
  await unlockStudio(page);

  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByRole("heading", { name: "Add object" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manage objects" })).toBeVisible();
  await expect(page.getByTestId("studio-object-card")).toHaveCount(12);
  await expect(page.getByTestId("masonry-wall")).toBeVisible();
  await expect(page.getByTestId("masonry-wall").getByRole("article")).toHaveCount(10);
});

test("add drawer reveals the URL preview controls", async ({ page }) => {
  await unlockStudio(page);

  await expect(page.getByRole("button", { name: "Add object" })).toBeVisible();
  await page.getByRole("button", { name: "Add object" }).click();
  await expect(page.getByLabel("Paste a URL or add an image")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fetch details" })).toBeVisible();
});

test("only one object editor is expanded at a time", async ({ page }) => {
  await unlockStudio(page);

  await page.getByRole("button", { name: /Edit Brass oil burner/ }).click();
  await expect(page.getByLabel("Object name")).toHaveValue("Brass oil burner");

  await page.getByRole("button", { name: /Edit Aluminum drafting pen/ }).click();
  await expect(page.getByLabel("Object name")).toHaveValue("Aluminum drafting pen");
  await expect(page.locator('input[value="Brass oil burner"]')).toHaveCount(0);
});

test("mobile studio keeps compact cards, replacement controls, and archive confirmation reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await unlockStudio(page);

  const brassCard = page.getByRole("article", { name: "Brass oil burner" });
  const aluminumCard = page.getByRole("article", { name: "Aluminum drafting pen" });

  await expect(brassCard).toBeVisible();
  await expect(aluminumCard).toBeVisible();
  await expect(brassCard.getByRole("button", { name: /Edit Brass oil burner/ })).toBeVisible();
  await expect(aluminumCard.getByRole("button", { name: /Edit Aluminum drafting pen/ })).toBeVisible();

  await brassCard.getByRole("button", { name: /Replace image Brass oil burner/ }).click();
  await expect(brassCard.getByLabel("Replacement image URL")).toBeVisible();
  await expect(brassCard.getByLabel("Replacement image upload")).toBeVisible();
  await expect(aluminumCard.getByLabel("Replacement image URL")).toHaveCount(0);

  await brassCard.getByRole("button", { name: /Archive Brass oil burner/ }).click();
  await expect(brassCard.getByRole("button", { name: /Confirm archive Brass oil burner/ })).toBeVisible();
});
