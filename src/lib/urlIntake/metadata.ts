import type { ExtractedPageMetadata } from "./types";

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function firstMatch(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1] ? decodeHtml(match[1]) : undefined;
}

function metaContent(html: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    firstMatch(html, new RegExp(`<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i")) ??
    firstMatch(html, new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`, "i"))
  );
}

function resolveUrl(value: string | undefined, baseUrl: URL) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function documentTitle(html: string) {
  return firstMatch(html, /<title[^>]*>([^<]+)<\/title>/i);
}

function canonicalUrl(html: string, baseUrl: URL) {
  const href = firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  return resolveUrl(href, baseUrl);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function findProductJsonLd(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const graph = record["@graph"];
  if (Array.isArray(graph)) {
    for (const item of graph) {
      const product = findProductJsonLd(item);
      if (product) {
        return product;
      }
    }
  }

  const types = asArray(record["@type"]).map(String);
  return types.includes("Product") ? record : null;
}

function parseJsonLdBlocks(html: string) {
  const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  return Array.from(blocks)
    .map((match) => match[1]?.trim())
    .filter(Boolean)
    .flatMap((block) => {
      try {
        return asArray(JSON.parse(block));
      } catch {
        return [];
      }
    });
}

function productImage(product: Record<string, unknown>, baseUrl: URL) {
  const image = asArray(product.image)[0];
  if (typeof image === "string") {
    return resolveUrl(image, baseUrl);
  }

  if (image && typeof image === "object") {
    const url = (image as Record<string, unknown>).url;
    return typeof url === "string" ? resolveUrl(url, baseUrl) : undefined;
  }

  return undefined;
}

function productOffer(product: Record<string, unknown>) {
  const offer = asArray(product.offers)[0];
  if (!offer || typeof offer !== "object") {
    return {};
  }

  const record = offer as Record<string, unknown>;
  return {
    price: typeof record.price === "string" || typeof record.price === "number" ? String(record.price) : undefined,
    currency: typeof record.priceCurrency === "string" ? record.priceCurrency : undefined
  };
}

export function extractPageMetadata(html: string, pageUrl: URL): ExtractedPageMetadata {
  const product = parseJsonLdBlocks(html)
    .map(findProductJsonLd)
    .find((item): item is Record<string, unknown> => Boolean(item));

  const title =
    (typeof product?.name === "string" ? product.name.trim() : undefined) ??
    metaContent(html, "og:title") ??
    metaContent(html, "twitter:title") ??
    documentTitle(html);

  const imageUrl =
    (product ? productImage(product, pageUrl) : undefined) ??
    resolveUrl(metaContent(html, "og:image"), pageUrl) ??
    resolveUrl(metaContent(html, "twitter:image"), pageUrl);

  const offer = product ? productOffer(product) : {};
  const canonical = canonicalUrl(html, pageUrl);

  return {
    ...(title ? { title } : {}),
    ...(canonical ? { canonicalUrl: canonical } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(offer.price ? { price: offer.price } : {}),
    ...(offer.currency ? { currency: offer.currency } : {})
  };
}
