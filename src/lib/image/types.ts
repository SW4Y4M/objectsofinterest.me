import type { DisplaySize, ObjectStatus } from "@/lib/domain/wishlistObject";

export type ImageCandidate = {
  url: string;
  width: number;
  height: number;
  score: number;
  provider: string;
};

export type StoredImage = {
  url: string;
};

export type BackgroundRemovalResult = {
  processedUrl: string;
  width: number;
  height: number;
  quality: "usable" | "poor";
};

export interface ImageSearchProvider {
  search(query: string): Promise<ImageCandidate[]>;
}

export interface BackgroundRemovalProvider {
  removeBackground(input: { url: string }): Promise<BackgroundRemovalResult>;
}

export interface ObjectStorageProvider {
  storeOriginal(source: { url: string }): Promise<StoredImage>;
  storeUpload(source: { file: File; name: string }): Promise<StoredImage>;
  storeProcessed(source: { url: string }): Promise<StoredImage>;
}

export type ImagePipelineInput = {
  name: string;
  imageUrl?: string;
  imageFile?: File;
  search: ImageSearchProvider;
  remover: BackgroundRemovalProvider;
  storage: ObjectStorageProvider;
  objectIndex: number;
};

export type ImagePipelineResult = {
  status: ObjectStatus;
  imageOriginalUrl: string | null;
  imageProcessedUrl: string | null;
  sourceImageProvider: string | null;
  displaySize: DisplaySize;
};
