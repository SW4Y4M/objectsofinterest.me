import { expect, type Locator, type Page } from "@playwright/test";

export const STUDIO_PASSCODE = "12345";

export const SEED_VISIBLE_NAMES = [
  "Brass oil burner",
  "Aluminum drafting pen",
  "Merino overcoat",
  "Desk lamp",
  "Ceramic mug",
  "Paperback novel",
  "Bicycle pump",
  "Hand cream",
  "Brass ruler",
  "Folding stool"
] as const;

export const SEED_DRAFT_NAMES = ["Blueprint notebook", "Archive tea tin"] as const;

// Unique across parallel workers + both projects, which all share one mock store.
export function uniqueName(prefix = "E2E object"): string {
  return `${prefix} ${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export async function unlockStudio(page: Page): Promise<void> {
  await page.goto("/studio/unlock");
  await page.getByLabel("Passcode").fill(STUDIO_PASSCODE);
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page).toHaveURL(/\/studio$/);
}

export async function openAddForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Add object" }).click();
}

export function tileButton(page: Page, name: string): Locator {
  return page.getByRole("button", { name: `Show details for ${name}` });
}

export function studioCard(page: Page, name: string): Locator {
  return page.getByRole("article", { name });
}
