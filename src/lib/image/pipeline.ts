import { chooseDisplaySize } from "@/lib/domain/displaySize";
import { pickBestCandidate } from "./search";
import type { ImagePipelineInput, ImagePipelineResult } from "./types";

export async function processWishlistImage(input: ImagePipelineInput): Promise<ImagePipelineResult> {
  const upload = input.imageFile ? await input.storage.storeUpload({ file: input.imageFile, name: input.name }) : null;
  const source =
    upload
      ? { url: upload.url, provider: "owner-upload" as const }
      : input.imageUrl
        ? { url: input.imageUrl, provider: "owner-url" as const }
        : null;

  const candidate = source ?? pickBestCandidate(await input.search.search(input.name));

  if (!candidate) {
    return {
      status: "Draft",
      imageOriginalUrl: null,
      imageProcessedUrl: null,
      sourceImageProvider: null,
      displaySize: "standard"
    };
  }

  const storedOriginal =
    source && source.provider === "owner-upload" ? { url: source.url } : source ? await input.storage.storeOriginal({ url: source.url }) : { url: candidate.url };
  const removed = await input.remover.removeBackground({ url: storedOriginal.url });

  if (removed.quality !== "usable" || removed.width < 500 || removed.height < 500) {
    return {
      status: "Draft",
      imageOriginalUrl: storedOriginal.url,
      imageProcessedUrl: null,
      sourceImageProvider: candidate.provider,
      displaySize: "standard"
    };
  }

  const storedProcessed = await input.storage.storeProcessed({ url: removed.processedUrl });

  return {
    status: "Visible",
    imageOriginalUrl: storedOriginal.url,
    imageProcessedUrl: storedProcessed.url,
    sourceImageProvider: candidate.provider,
    displaySize: chooseDisplaySize({ width: removed.width, height: removed.height, index: input.objectIndex })
  };
}
