export type UrlIntakeReason = "no_image_found" | "fetch_failed" | "unsupported_image" | "unsafe_url";

export type UrlIntakePageMetadata = {
  canonicalUrl?: string;
  imageUrl?: string;
  price?: string;
  currency?: string;
};

export type UrlIntakeImageResult = {
  kind: "image";
  originalUrl: string;
  contentType: string;
  suggestedName?: string;
  sourceUrl?: string;
};

export type UrlIntakePageResult = UrlIntakePageMetadata & {
  kind: "page";
  sourceUrl: string;
  suggestedName?: string;
};

export type UrlIntakeNeedsImageResult = {
  kind: "needs_image";
  sourceUrl: string;
  suggestedName?: string;
  reason: UrlIntakeReason;
};

export type UrlIntakeResult = UrlIntakeImageResult | UrlIntakePageResult | UrlIntakeNeedsImageResult;

export type ExtractedPageMetadata = UrlIntakePageMetadata & {
  title?: string;
};
