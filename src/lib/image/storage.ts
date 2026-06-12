import { put } from "@vercel/blob";
import type { ObjectStorageProvider, StoredImage } from "./types";

export class FakeObjectStorageProvider implements ObjectStorageProvider {
  async storeOriginal(source: { url: string }): Promise<StoredImage> {
    return { url: source.url };
  }

  async storeUpload(source: { file: File; name: string }): Promise<StoredImage> {
    const mimeType = source.file.type || inferMimeType(source.name);
    const bytes = new Uint8Array(await source.file.arrayBuffer());
    const encoded = Buffer.from(bytes).toString("base64");
    return { url: `data:${mimeType};base64,${encoded}` };
  }

  async storeProcessed(source: { url: string }): Promise<StoredImage> {
    return { url: source.url };
  }
}

function inferMimeType(name: string) {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "jpeg" || extension === "jpg") {
    return "image/jpeg";
  }

  return "image/png";
}

export class VercelBlobStorageProvider implements ObjectStorageProvider {
  async storeOriginal(source: { url: string }): Promise<StoredImage> {
    return this.store("original", source.url);
  }

  async storeUpload(source: { file: File; name: string }): Promise<StoredImage> {
    const extension = source.file.type.includes("png") ? "png" : source.file.type.includes("webp") ? "webp" : "jpg";
    const stored = await put(`uploaded/${crypto.randomUUID()}-${source.name}.${extension}`, source.file, {
      access: "public"
    });

    return { url: stored.url };
  }

  async storeProcessed(source: { url: string }): Promise<StoredImage> {
    return this.store("processed", source.url);
  }

  private async store(prefix: string, url: string): Promise<StoredImage> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not fetch image ${url}`);
    }

    const blob = await response.blob();
    const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    const stored = await put(`${prefix}/${crypto.randomUUID()}.${extension}`, blob, {
      access: "public"
    });

    return { url: stored.url };
  }
}
