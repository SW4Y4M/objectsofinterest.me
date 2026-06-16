import net from "node:net";

const SUPPORTED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SUPPORTED_IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function parseHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function isPrivateIpv4Address(hostname: string) {
  const [first = 0, second = 0] = hostname.split(".").map(Number);

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254) ||
    first === 0
  );
}

function isPrivateIpv6Address(hostname: string) {
  return hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80");
}

export function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (normalized === "localhost" || normalized.endsWith(".localhost")) {
    return true;
  }

  switch (net.isIP(normalized)) {
    case 4:
      return isPrivateIpv4Address(normalized);
    case 6:
      return isPrivateIpv6Address(normalized);
    default:
      return false;
  }
}

export function isSupportedImagePath(url: URL) {
  const pathname = url.pathname.toLowerCase();
  return Array.from(SUPPORTED_IMAGE_EXTENSIONS).some((extension) => pathname.endsWith(extension));
}

export function isSupportedImageContentType(contentType: string | null) {
  if (!contentType) {
    return false;
  }

  const mimeType = contentType.split(";")[0]?.trim().toLowerCase();
  return SUPPORTED_IMAGE_CONTENT_TYPES.has(mimeType);
}

export function assertSafeHttpUrl(value: string) {
  const url = parseHttpUrl(value);
  if (!url || isPrivateHostname(url.hostname)) {
    return null;
  }

  return url;
}
