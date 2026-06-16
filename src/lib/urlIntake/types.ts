export type UrlIntakeReason = "no_image_found" | "fetch_failed" | "unsupported_image" | "unsafe_url";

export type UrlIntakeImageResult = {
  kind: "image";
  originalUrl: string;
  contentType: string;
  suggestedName?: string;
  sourceUrl?: string;
};

export type UrlIntakePageResult = {
  kind: "page";
  sourceUrl: string;
  canonicalUrl?: string;
  suggestedName?: string;
  imageUrl?: string;
  price?: string;
  currency?: string;
};

export type UrlIntakeNeedsImageResult = {
  kind: "needs_image";
  sourceUrl: string;
  suggestedName?: string;
  reason: UrlIntakeReason;
};

export type UrlIntakeResult = UrlIntakeImageResult | UrlIntakePageResult | UrlIntakeNeedsImageResult;

export type ExtractedPageMetadata = {
  title?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  price?: string;
  currency?: string;
};
