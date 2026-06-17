"use server";

import { revalidatePath } from "next/cache";
import { toFieldErrors, type StudioActionState } from "@/app/studio/actionState";
import { createSlug } from "@/lib/domain/slug";
import { createWishlistObjectInputSchema, type CreateWishlistObjectInput } from "@/lib/domain/wishlistObject";
import { FakeBackgroundRemovalProvider, HttpBackgroundRemovalProvider } from "@/lib/image/backgroundRemoval";
import { processWishlistImage } from "@/lib/image/pipeline";
import { FakeImageSearchProvider, HttpImageSearchProvider } from "@/lib/image/search";
import { FakeObjectStorageProvider, VercelBlobStorageProvider } from "@/lib/image/storage";
import type { ImagePipelineResult } from "@/lib/image/types";
import { createObjectRepository } from "@/lib/repositories/objects";
import { requireStudioSession } from "@/lib/studio/auth";
import { previewStateFromUrlIntakeResult, type UrlIntakePreviewState } from "@/app/studio/urlIntakeState";
import { UrlIntakeService } from "@/lib/urlIntake/service";

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

function wishlistObjectFormDataInput(formData: FormData) {
  return {
    name: fieldValue(formData, "name"),
    editorialTag: fieldValue(formData, "editorialTag"),
    imageUrl: fieldValue(formData, "imageUrl"),
    sourceUrl: fieldValue(formData, "sourceUrl"),
    price: fieldValue(formData, "price"),
    currency: fieldValue(formData, "currency"),
    note: fieldValue(formData, "note")
  };
}

function parseWishlistObjectFormData(formData: FormData) {
  return createWishlistObjectInputSchema.parse(wishlistObjectFormDataInput(formData));
}

function toStudioCreateInput(parsed: CreateWishlistObjectInput, imageResult: ImagePipelineResult) {
  const sourceUrl = parsed.sourceUrl ?? parsed.imageUrl ?? null;

  return {
    name: parsed.name,
    slug: createSlug(parsed.name),
    editorialTag: parsed.editorialTag,
    sourceUrl,
    price: parsed.price || null,
    currency: parsed.currency || null,
    note: parsed.note || null,
    status: imageResult.status,
    imageOriginalUrl: imageResult.imageOriginalUrl,
    imageProcessedUrl: imageResult.imageProcessedUrl,
    displaySize: imageResult.displaySize,
    sourceImageProvider: imageResult.sourceImageProvider
  };
}

function toStudioUpdateInput(parsed: CreateWishlistObjectInput) {
  return {
    name: parsed.name,
    slug: createSlug(parsed.name),
    editorialTag: parsed.editorialTag,
    sourceUrl: parsed.sourceUrl ?? null,
    price: parsed.price || null,
    currency: parsed.currency || null,
    note: parsed.note || null
  };
}

async function processImageForStudioObject(formData: FormData, name: string, objectIndex: number) {
  const imageFile = formData.get("imageFile");
  const services = createImageServices();

  return processWishlistImage({
    name,
    imageUrl: fieldValue(formData, "imageUrl"),
    imageFile: imageFile instanceof File ? imageFile : undefined,
    ...services,
    objectIndex
  });
}

function revalidateStudioViews() {
  revalidatePath("/");
  revalidatePath("/studio");
}

function validationErrorState(fieldErrors: Record<string, string>): StudioActionState {
  return {
    status: "error",
    message: "Check the highlighted fields.",
    fieldErrors
  };
}

async function createObjectFromFormData(formData: FormData) {
  const parsed = parseWishlistObjectFormData(formData);
  const repository = createObjectRepository();
  const existing = await repository.listStudio();
  const imageResult = await processImageForStudioObject(formData, parsed.name, existing.length);

  await repository.createForStudio(toStudioCreateInput(parsed, imageResult));
}

async function updateObjectFromFormData(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = parseWishlistObjectFormData(formData);
  const repository = createObjectRepository();

  await repository.updateObject(id, toStudioUpdateInput(parsed));
}

async function replaceObjectImageFromFormData(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const repository = createObjectRepository();
  const existing = await repository.listStudio();
  const imageResult = await processImageForStudioObject(
    formData,
    name,
    existing.findIndex((object) => object.id === id)
  );

  await repository.updateObject(id, {
    status: imageResult.status,
    imageOriginalUrl: imageResult.imageOriginalUrl,
    imageProcessedUrl: imageResult.imageProcessedUrl,
    displaySize: imageResult.displaySize,
    sourceImageProvider: imageResult.sourceImageProvider
  });
}

async function archiveObjectFromFormData(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const repository = createObjectRepository();
  await repository.archiveObject(id);
}

export async function addObject(formData: FormData) {
  await requireStudioSession();
  await createObjectFromFormData(formData);
  revalidateStudioViews();
}

export async function editObject(formData: FormData) {
  await requireStudioSession();
  await updateObjectFromFormData(formData);
  revalidateStudioViews();
}

export async function replaceObjectImage(formData: FormData) {
  await requireStudioSession();
  await replaceObjectImageFromFormData(formData);
  revalidateStudioViews();
}

export async function archiveObject(formData: FormData) {
  await requireStudioSession();
  await archiveObjectFromFormData(formData);
  revalidateStudioViews();
}

export async function addObjectWithState(_previousState: StudioActionState, formData: FormData): Promise<StudioActionState> {
  await requireStudioSession();
  const parsed = createWishlistObjectInputSchema.safeParse(wishlistObjectFormDataInput(formData));
  if (!parsed.success) {
    return validationErrorState(toFieldErrors(parsed.error));
  }

  await createObjectFromFormData(formData);
  revalidateStudioViews();

  return {
    status: "success",
    message: "Object added.",
    fieldErrors: {}
  };
}

export async function previewUrlIntakeWithState(
  _previousState: UrlIntakePreviewState,
  formData: FormData
): Promise<UrlIntakePreviewState> {
  await requireStudioSession();
  const url = fieldValue(formData, "captureUrl");

  if (!url) {
    return {
      status: "error",
      message: "Paste a URL first.",
      fieldErrors: { captureUrl: "Paste a URL first." },
      values: {}
    };
  }

  const service = new UrlIntakeService();
  return previewStateFromUrlIntakeResult(await service.intake(url));
}

export async function editObjectWithState(_previousState: StudioActionState, formData: FormData): Promise<StudioActionState> {
  await requireStudioSession();
  const parsed = createWishlistObjectInputSchema.safeParse(wishlistObjectFormDataInput(formData));
  if (!parsed.success) {
    return validationErrorState(toFieldErrors(parsed.error));
  }

  await updateObjectFromFormData(formData);
  revalidateStudioViews();

  return {
    status: "success",
    message: "Changes saved.",
    fieldErrors: {}
  };
}

export async function replaceObjectImageWithState(_previousState: StudioActionState, formData: FormData): Promise<StudioActionState> {
  await requireStudioSession();
  await replaceObjectImageFromFormData(formData);
  revalidateStudioViews();

  return {
    status: "success",
    message: "Image replacement saved.",
    fieldErrors: {}
  };
}

export async function archiveObjectWithState(_previousState: StudioActionState, formData: FormData): Promise<StudioActionState> {
  await requireStudioSession();
  await archiveObjectFromFormData(formData);
  revalidateStudioViews();

  return {
    status: "success",
    message: "Object archived.",
    fieldErrors: {}
  };
}
