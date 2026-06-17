import type { StudioActionState } from "@/app/studio/actionState";
import type { UrlIntakeReason, UrlIntakeResult } from "@/lib/urlIntake/types";

export type UrlIntakePreviewValues = {
  name?: string;
  imageUrl?: string;
  sourceUrl?: string;
  price?: string;
  currency?: string;
};

export type UrlIntakePreviewState = StudioActionState & {
  values: UrlIntakePreviewValues;
};

export const emptyUrlIntakePreviewState: UrlIntakePreviewState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {}
};

function needsImageMessage(reason: UrlIntakeReason) {
  if (reason === "no_image_found") {
    return "I found the page, but not a usable image. Add an image URL or upload one.";
  }

  if (reason === "unsupported_image") {
    return "That link does not look like a supported image. Use JPG, PNG, or WebP.";
  }

  if (reason === "unsafe_url") {
    return "That URL could not be fetched. Add an image URL or upload an image instead.";
  }

  return "That URL could not be fetched. Add an image URL or upload an image instead.";
}

export function previewStateFromUrlIntakeResult(result: UrlIntakeResult): UrlIntakePreviewState {
  if (result.kind === "image") {
    return {
      status: "success",
      message: "Found an image. Review before adding it to the wall.",
      fieldErrors: {},
      values: {
        imageUrl: result.originalUrl,
        sourceUrl: result.sourceUrl ?? result.originalUrl,
        ...(result.suggestedName ? { name: result.suggestedName } : {})
      }
    };
  }

  if (result.kind === "page") {
    return {
      status: "success",
      message: "Found an image. Review before adding it to the wall.",
      fieldErrors: {},
      values: {
        ...(result.suggestedName ? { name: result.suggestedName } : {}),
        ...(result.imageUrl ? { imageUrl: result.imageUrl } : {}),
        sourceUrl: result.canonicalUrl ?? result.sourceUrl,
        ...(result.price ? { price: result.price } : {}),
        ...(result.currency ? { currency: result.currency } : {})
      }
    };
  }

  return {
    status: "error",
    message: needsImageMessage(result.reason),
    fieldErrors: {},
    values: {
      ...(result.suggestedName ? { name: result.suggestedName } : {}),
      sourceUrl: result.sourceUrl
    }
  };
}
