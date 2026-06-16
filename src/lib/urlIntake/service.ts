import { extractPageMetadata } from "./metadata";
import { assertSafeHttpUrl, isSupportedImageContentType, isSupportedImagePath } from "./safety";
import type { UrlIntakeResult } from "./types";

type FetchLike = typeof fetch;

type UrlIntakeServiceOptions = {
  fetch?: FetchLike;
  maxPageBytes?: number;
};

const DEFAULT_MAX_PAGE_BYTES = 3 * 1024 * 1024;
const REQUEST_HEADERS = {
  accept: "text/html,application/xhtml+xml,image/avif,image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.8",
  "user-agent": "ObjectsOfInterestBot/1.0"
};

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
      const response = await this.fetchUrl(parsed);

      if (!response.ok) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
      }

      const imageResult = this.tryImageResult(parsed, response.headers.get("content-type"));
      if (imageResult) {
        return imageResult;
      }

      if (!this.isHtmlResponse(response.headers.get("content-type"))) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "unsupported_image" };
      }

      if (this.isTooLarge(Number(response.headers.get("content-length") ?? "0"))) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
      }

      const html = await response.text();
      if (this.isTooLarge(html.length)) {
        return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
      }

      return this.pageResult(parsed, html);
    } catch {
      return { kind: "needs_image", sourceUrl: parsed.toString(), reason: "fetch_failed" };
    }
  }

  private fetchUrl(url: URL) {
    return this.fetcher(url, {
      redirect: "follow",
      headers: REQUEST_HEADERS,
      signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(8000) : undefined
    });
  }

  private isHtmlResponse(contentType: string | null) {
    return isHtmlContentType(contentType);
  }

  private isTooLarge(size: number) {
    return size > this.maxPageBytes;
  }

  private tryImageResult(url: URL, contentType: string | null): UrlIntakeResult | null {
    if (!isImageResultUrl(url, contentType)) {
      return null;
    }

    return {
      kind: "image",
      originalUrl: url.toString(),
      contentType: normalizedContentType(contentType) ?? "image/jpeg",
      sourceUrl: url.toString()
    };
  }

  private pageResult(url: URL, html: string): UrlIntakeResult {
    const metadata = extractPageMetadata(html, url);

    if (!metadata.imageUrl) {
      return {
        kind: "needs_image",
        sourceUrl: url.toString(),
        ...(metadata.title ? { suggestedName: metadata.title } : {}),
        reason: "no_image_found"
      };
    }

    return {
      kind: "page",
      sourceUrl: url.toString(),
      ...(metadata.canonicalUrl ? { canonicalUrl: metadata.canonicalUrl } : {}),
      ...(metadata.title ? { suggestedName: metadata.title } : {}),
      imageUrl: metadata.imageUrl,
      ...(metadata.price ? { price: metadata.price } : {}),
      ...(metadata.currency ? { currency: metadata.currency } : {})
    };
  }
}
