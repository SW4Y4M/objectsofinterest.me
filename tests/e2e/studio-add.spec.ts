import { expect, test } from "@playwright/test";
import { openAddForm, studioCard, tileButton, uniqueName, unlockStudio } from "./helpers";

test.describe.configure({ mode: "serial" });

test("add an object by name only -> Visible, listed, and on the wall", async ({ page }) => {
  const name = uniqueName("Named object");
  await unlockStudio(page);
  await openAddForm(page);

  // Scope to the add form: the studio embeds a preview wall whose "Editorial tags"
  // nav would otherwise collide with the field label.
  const form = page.getByTestId("add-object-form");
  await form.getByLabel("Object name").fill(name);
  await form.getByLabel("Editorial tag").selectOption("Home");
  await form.getByRole("button", { name: "Add object" }).click();

  await expect(page.getByText("Object added.")).toBeVisible();
  const card = studioCard(page, name);
  await expect(card).toBeVisible();
  await expect(card.getByText("Visible")).toBeVisible();

  await page.goto("/wall");
  await expect(tileButton(page, name)).toBeVisible();
});

test("add an object with an image URL -> Visible and listed", async ({ page }) => {
  const name = uniqueName("URL object");
  await unlockStudio(page);
  await openAddForm(page);

  const form = page.getByTestId("add-object-form");
  await form.getByLabel("Object name").fill(name);
  await form.getByLabel("Editorial tag").selectOption("Work");
  await form.getByLabel("Image URL").fill("https://images.example.com/sample.png");
  await form.getByRole("button", { name: "Add object" }).click();

  await expect(page.getByText("Object added.")).toBeVisible();
  const card = studioCard(page, name);
  await expect(card).toBeVisible();
  await expect(card.getByText("Visible")).toBeVisible();
});

test("add an object by uploading an image -> Visible and listed", async ({ page }) => {
  const name = uniqueName("Upload object");
  await unlockStudio(page);
  await openAddForm(page);

  const form = page.getByTestId("add-object-form");
  await form.getByLabel("Object name").fill(name);
  await form.getByLabel("Editorial tag").selectOption("Make");
  // A 1x1 PNG is enough; the fake pipeline reports usable 1400x1200 regardless of bytes.
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  await form
    .getByLabel("Image upload")
    .setInputFiles({ name: "thing.png", mimeType: "image/png", buffer: onePixelPng });
  await form.getByRole("button", { name: "Add object" }).click();

  await expect(page.getByText("Object added.")).toBeVisible();
  const card = studioCard(page, name);
  await expect(card).toBeVisible();
  await expect(card.getByText("Visible")).toBeVisible();
});
