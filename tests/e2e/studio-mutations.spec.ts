import { expect, test, type Page } from "@playwright/test";
import { openAddForm, studioCard, tileButton, uniqueName, unlockStudio } from "./helpers";

test.describe.configure({ mode: "serial" });

async function createObject(page: Page, name: string, tag = "Home") {
  await unlockStudio(page);
  await openAddForm(page);
  const form = page.getByTestId("add-object-form");
  await form.getByLabel("Object name").fill(name);
  await form.getByLabel("Editorial tag").selectOption(tag);
  await form.getByRole("button", { name: "Add object", exact: true }).click();
  await expect(page.getByText("Object added.")).toBeVisible();
  await expect(studioCard(page, name)).toBeVisible();
}

test("editing metadata renames the object", async ({ page }) => {
  const name = uniqueName("Editable");
  const renamed = uniqueName("Renamed");
  await createObject(page, name);

  const card = studioCard(page, name);
  await card.getByRole("button", { name: `Edit ${name}` }).click();
  await expect(card.getByLabel("Object name")).toHaveValue(name);

  await card.getByLabel("Object name").fill(renamed);
  await card.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("Changes saved.")).toBeVisible();
  await expect(studioCard(page, renamed)).toBeVisible();
});

test("replacing an image saves the replacement", async ({ page }) => {
  const name = uniqueName("Replaceable");
  await createObject(page, name);

  const card = studioCard(page, name);
  await card.getByRole("button", { name: `Replace image ${name}`, exact: true }).click();
  await card.getByLabel("Replacement image URL").fill("https://images.example.com/replacement.png");
  await card.getByRole("button", { name: "Replace image", exact: true }).click();

  await expect(page.getByText("Image replacement saved.")).toBeVisible();
});

test("archiving is a two-step action that removes the object from the wall", async ({ page }) => {
  const name = uniqueName("Archivable");
  await createObject(page, name);

  // It starts visible on the public wall.
  await page.goto("/wall");
  await expect(tileButton(page, name)).toBeVisible();
  await page.goBack();

  const card = studioCard(page, name);

  // Cancel path: nothing changes.
  await card.getByRole("button", { name: `Archive ${name}`, exact: true }).click();
  await expect(card.getByRole("button", { name: `Confirm archive ${name}`, exact: true })).toBeVisible();
  await card.getByRole("button", { name: `Cancel archive ${name}`, exact: true }).click();
  await expect(card.getByRole("button", { name: `Archive ${name}`, exact: true })).toBeVisible();

  // Confirm path: object is archived. On success the control collapses to a static
  // "Archived" state and the status badge reads "Archived" (the transient feedback
  // message is replaced by the re-render, so assert the durable state instead).
  await card.getByRole("button", { name: `Archive ${name}`, exact: true }).click();
  await card.getByRole("button", { name: `Confirm archive ${name}`, exact: true }).click();
  await expect(card.getByText("Archived").first()).toBeVisible();

  // It disappears from the public wall.
  await page.goto("/wall");
  await expect(tileButton(page, name)).toHaveCount(0);
});

test("seed drafts are managed in the studio but never public", async ({ page }) => {
  await unlockStudio(page);

  const draft = studioCard(page, "Blueprint notebook");
  await expect(draft).toBeVisible();
  await expect(draft.getByText("Draft awaiting a usable image")).toBeVisible();

  await page.goto("/wall");
  await expect(tileButton(page, "Blueprint notebook")).toHaveCount(0);
});
