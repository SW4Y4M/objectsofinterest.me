import { describe, expect, it } from "vitest";
import { assertSafeHttpUrl, isPrivateHostname, isSupportedImageContentType, isSupportedImagePath, parseHttpUrl } from "@/lib/urlIntake/safety";

describe("url intake safety helpers", () => {
  it("accepts http and https URLs", () => {
    expect(parseHttpUrl("https://example.com/product")).toEqual(new URL("https://example.com/product"));
    expect(parseHttpUrl("http://example.com/image.jpg")).toEqual(new URL("http://example.com/image.jpg"));
  });

  it("rejects non-http protocols and malformed URLs", () => {
    expect(parseHttpUrl("file:///etc/passwd")).toBeNull();
    expect(parseHttpUrl("data:image/png;base64,abc")).toBeNull();
    expect(parseHttpUrl("not a url")).toBeNull();
  });

  it("detects private or local hostnames", () => {
    expect(isPrivateHostname("localhost")).toBe(true);
    expect(isPrivateHostname("foo.localhost")).toBe(true);
    expect(isPrivateHostname("localhost.evil.com")).toBe(false);
    expect(isPrivateHostname("127.0.0.1")).toBe(true);
    expect(isPrivateHostname("127.0.0.1.example.com")).toBe(false);
    expect(isPrivateHostname("10.1.2.3")).toBe(true);
    expect(isPrivateHostname("172.16.0.2")).toBe(true);
    expect(isPrivateHostname("172.15.255.255")).toBe(false);
    expect(isPrivateHostname("172.31.255.255")).toBe(true);
    expect(isPrivateHostname("172.32.0.1")).toBe(false);
    expect(isPrivateHostname("192.168.1.4")).toBe(true);
    expect(isPrivateHostname("169.254.1.1")).toBe(true);
    expect(isPrivateHostname("::1")).toBe(true);
    expect(isPrivateHostname("example.com")).toBe(false);
  });

  it("returns safe http urls when they are not private", () => {
    expect(assertSafeHttpUrl("https://example.com/path")).toEqual(new URL("https://example.com/path"));
    expect(assertSafeHttpUrl("https://localhost/path")).toBeNull();
  });

  it("detects supported image paths", () => {
    expect(isSupportedImagePath(new URL("https://example.com/a.jpg"))).toBe(true);
    expect(isSupportedImagePath(new URL("https://example.com/a.jpeg?width=900"))).toBe(true);
    expect(isSupportedImagePath(new URL("https://example.com/a.png"))).toBe(true);
    expect(isSupportedImagePath(new URL("https://example.com/a.webp"))).toBe(true);
    expect(isSupportedImagePath(new URL("https://example.com/a.svg"))).toBe(false);
    expect(isSupportedImagePath(new URL("https://example.com/product"))).toBe(false);
  });

  it("detects supported image content types", () => {
    expect(isSupportedImageContentType("image/jpeg")).toBe(true);
    expect(isSupportedImageContentType("image/png; charset=binary")).toBe(true);
    expect(isSupportedImageContentType("image/webp")).toBe(true);
    expect(isSupportedImageContentType("image/svg+xml")).toBe(false);
    expect(isSupportedImageContentType("text/html")).toBe(false);
    expect(isSupportedImageContentType(null)).toBe(false);
  });
});
