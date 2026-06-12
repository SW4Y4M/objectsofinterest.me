"use server";

import { revalidatePath } from "next/cache";
import { createSlug } from "@/lib/domain/slug";
import { createWishlistObjectInputSchema } from "@/lib/domain/wishlistObject";
import { FakeBackgroundRemovalProvider, HttpBackgroundRemovalProvider } from "@/lib/image/backgroundRemoval";
import { processWishlistImage } from "@/lib/image/pipeline";
import { FakeImageSearchProvider, HttpImageSearchProvider } from "@/lib/image/search";
import { FakeObjectStorageProvider, VercelBlobStorageProvider } from "@/lib/image/storage";
import { createObjectRepository } from "@/lib/repositories/objects";
import { requireStudioSession } from "@/lib/studio/auth";

function createImageServices() {
  const search =
    process.env.IMAGE_SEARCH_PROVIDER === "http" && process.env.IMAGE_SEARCH_ENDPOINT && process.env.IMAGE_SEARCH_API_KEY
      ? new HttpImageSearchProvider(process.env.IMAGE_SEARCH_ENDPOINT, process.env.IMAGE_SEARCH_API_KEY)
      : new FakeImageSearchProvider();

  const remover =
    process.env.BACKGROUND_REMOVAL_PROVIDER === "http" && process.env.BACKGROUND_REMOVAL_ENDPOINT && process.env.BACKGROUND_REMOVAL_API_KEY
      ? new HttpBackgroundRemovalProvider(process.env.BACKGROUND_REMOVAL_ENDPOINT, process.env.BACKGROUND_REMOVAL_API_KEY)
      : new FakeBackgroundRemovalProvider();

  const storage = process.env.BLOB_READ_WRITE_TOKEN ? new VercelBlobStorageProvider() : new FakeObjectStorageProvider();

  return { search, remover, storage };
}

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function addObject(formData: FormData) {
  await requireStudioSession();
  const parsed = createWishlistObjectInputSchema.parse({
    name: fieldValue(formData, "name"),
    editorialTag: fieldValue(formData, "editorialTag"),
    imageUrl: fieldValue(formData, "imageUrl"),
    sourceUrl: fieldValue(formData, "sourceUrl"),
    price: fieldValue(formData, "price"),
    currency: fieldValue(formData, "currency"),
    note: fieldValue(formData, "note")
  });
  const repository = createObjectRepository();
  const existing = await repository.listStudio();
  const imageFile = formData.get("imageFile");
  const services = createImageServices();
  const imageResult = await processWishlistImage({
    name: parsed.name,
    imageUrl: parsed.imageUrl,
    imageFile: imageFile instanceof File ? imageFile : undefined,
    ...services,
    objectIndex: existing.length
  });

  await repository.createForStudio({
    name: parsed.name,
    slug: createSlug(parsed.name),
    editorialTag: parsed.editorialTag,
    sourceUrl: parsed.sourceUrl ?? null,
    price: parsed.price || null,
    currency: parsed.currency || null,
    note: parsed.note || null,
    status: imageResult.status,
    imageOriginalUrl: imageResult.imageOriginalUrl,
    imageProcessedUrl: imageResult.imageProcessedUrl,
    displaySize: imageResult.displaySize,
    sourceImageProvider: imageResult.sourceImageProvider
  });

  revalidatePath("/");
  revalidatePath("/studio");
}

export async function editObject(formData: FormData) {
  await requireStudioSession();
  const id = String(formData.get("id") ?? "");
  const parsed = createWishlistObjectInputSchema.parse({
    name: fieldValue(formData, "name"),
    editorialTag: fieldValue(formData, "editorialTag"),
    sourceUrl: fieldValue(formData, "sourceUrl"),
    price: fieldValue(formData, "price"),
    currency: fieldValue(formData, "currency"),
    note: fieldValue(formData, "note")
  });
  const repository = createObjectRepository();

  await repository.updateObject(id, {
    name: parsed.name,
    slug: createSlug(parsed.name),
    editorialTag: parsed.editorialTag,
    sourceUrl: parsed.sourceUrl ?? null,
    price: parsed.price || null,
    currency: parsed.currency || null,
    note: parsed.note || null
  });

  revalidatePath("/");
  revalidatePath("/studio");
}

export async function replaceObjectImage(formData: FormData) {
  await requireStudioSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");
  const imageFile = formData.get("imageFile");
  const repository = createObjectRepository();
  const existing = await repository.listStudio();
  const services = createImageServices();
  const imageResult = await processWishlistImage({
    name,
    imageUrl: imageUrl || undefined,
    imageFile: imageFile instanceof File ? imageFile : undefined,
    ...services,
    objectIndex: existing.findIndex((object) => object.id === id)
  });

  await repository.updateObject(id, {
    status: imageResult.status,
    imageOriginalUrl: imageResult.imageOriginalUrl,
    imageProcessedUrl: imageResult.imageProcessedUrl,
    displaySize: imageResult.displaySize,
    sourceImageProvider: imageResult.sourceImageProvider
  });

  revalidatePath("/");
  revalidatePath("/studio");
}

export async function archiveObject(formData: FormData) {
  await requireStudioSession();
  const id = String(formData.get("id") ?? "");
  const repository = createObjectRepository();
  await repository.archiveObject(id);
  revalidatePath("/");
  revalidatePath("/studio");
}
