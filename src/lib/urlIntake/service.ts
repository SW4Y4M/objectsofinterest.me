import { extractPageMetadata } from "./metadata";
import { assertSafeHttpUrl, isSupportedImageContentType, isSupportedImagePath } from "./safety";
import type { UrlIntakeResult } from "./types";

type FetchLike = typeof fetch;

type UrlIntakeServiceOptions = {
  fetch?: FetchLike;
  maxPageBytes?: number;
};

const DEFAULT_MAX_PAGE_BYTES = 3 * 1024 * 1024;

function normalizedContentType(contentType: string | null) {
  return contentType?.split(";")[0]?.trim().toLowerCase() ?? null;
}

function isHtmlContentType(contentType: string | null) {
  const mimeType = normalizedContentType(contentType);
  return mimeType ? mimeType.includes("html") : false;
}

function isImageResultUrl(url: URL, contentType: string | null) {
  return isSupportedImageContentType(contentType) || isSupportedImagePath(url);
}

export class UrlIntakeService {
  private readonly fetcher: FetchLike;
  private readonly maxPageBytes: number;

  constructor(options: UrlIntakeServiceOptions = {}) {
    this.fetcher = options.fetch ?? fetch;
    this.maxPageBytes = options.maxPageBytes ?? DEFAULT_MAX_PAGE_BYTES;
  }

  async intake(rawUrl: string): Promise<UrlIntakeResult> {
    const parsed = assertSafeHttpUrl(rawUrl);
    if (!parsed) {
      return { kind: "needs_image", sourceUrl: rawUrl, reason: "unsafe_url" };
    }

    try {
      const response = await this.fetcher(parsed, {
        redirect: "follow",
        headers: {
          accept: "text/html,application/xhtml+xml,image/avif,image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.8",
          "user-agent": "ObjectsOfInterestBot/1.0"
        },
        signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(8000) : undefined
      });

      if (!response.ok) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
      }

      const contentType = response.headers.get("content-type");
      if (isImageResultUrl(parsed, contentType)) {
        return {
          kind: "image",
          originalUrl: parsed.toString(),
          contentType: normalizedContentType(contentType) ?? "image/jpeg",
          sourceUrl: parsed.toString()
        };
      }

      if (!isHtmlContentType(contentType)) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "unsupported_image" };
      }

      const contentLength = Number(response.headers.get("content-length") ?? "0");
      if (contentLength > this.maxPageBytes) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
      }

      const html = await response.text();
      if (html.length > this.maxPageBytes) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
      }

      const metadata = extractPageMetadata(html, parsed);
      if (!metadata.imageUrl) {
        return {
          kind: "needs_image",
          sourceUrl: parsed.toString(),
          ...(metadata.title ? { suggestedName: metadata.title } : {}),
          reason: "no_image_found"
        };
      }

      return {
        kind: "page",
        sourceUrl: parsed.toString(),
        ...(metadata.canonicalUrl ? { canonicalUrl: metadata.canonicalUrl } : {}),
        ...(metadata.title ? { suggestedName: metadata.title } : {}),
        imageUrl: metadata.imageUrl,
        ...(metadata.price ? { price: metadata.price } : {}),
        ...(metadata.currency ? { currency: metadata.currency } : {})
      };
    } catch {
      return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
    }
  }
}
