import { describe, expect, it, vi } from "vitest";
import { UrlIntakeService } from "@/lib/urlIntake/service";

function response(body: string, init: ResponseInit) {
  return new Response(body, init);
}

describe("UrlIntakeService", () => {
  it("returns image result for supported image content", async () => {
    const fetchMock = vi.fn(async () =>
      response("image-bytes", {
        status: 200,
        headers: { "content-type": "image/png", "content-length": "1000" }
      })
    );
    const service = new UrlIntakeService({ fetch: fetchMock });

    await expect(service.intake("https://cdn.example.com/lamp")).resolves.toEqual({
      kind: "image",
      originalUrl: "https://cdn.example.com/lamp",
      contentType: "image/png",
      sourceUrl: "https://cdn.example.com/lamp"
    });
  });

  it("extracts page metadata and image candidates from HTML", async () => {
    const fetchMock = vi.fn(async () =>
      response(
        `
          <html>
            <head>
              <meta property="og:title" content="Red kettle" />
              <meta property="og:image" content="/red-kettle.jpg" />
              <link rel="canonical" href="https://shop.example.com/kettle" />
            </head>
          </html>
        `,
        {
          status: 200,
          headers: { "content-type": "text/html", "content-length": "500" }
        }
      )
    );
    const service = new UrlIntakeService({ fetch: fetchMock });

    await expect(service.intake("https://shop.example.com/products/kettle")).resolves.toEqual({
      kind: "page",
      sourceUrl: "https://shop.example.com/products/kettle",
      canonicalUrl: "https://shop.example.com/kettle",
      suggestedName: "Red kettle",
      imageUrl: "https://shop.example.com/red-kettle.jpg"
    });
  });

  it("returns needs_image when page fetch succeeds but no image is found", async () => {
    const fetchMock = vi.fn(async () =>
      response("<html><head><title>Quiet page</title></head></html>", {
        status: 200,
        headers: { "content-type": "text/html", "content-length": "80" }
      })
    );
    const service = new UrlIntakeService({ fetch: fetchMock });

    await expect(service.intake("https://example.com/no-image")).resolves.toEqual({
      kind: "needs_image",
      sourceUrl: "https://example.com/no-image",
      suggestedName: "Quiet page",
      reason: "no_image_found"
    });
  });

  it("rejects unsafe URLs without fetching them", async () => {
    const fetchMock = vi.fn();
    const service = new UrlIntakeService({ fetch: fetchMock });

    await expect(service.intake("http://localhost:3000/private")).resolves.toEqual({
      kind: "needs_image",
      sourceUrl: "http://localhost:3000/private",
      reason: "unsafe_url"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns fetch_failed when the remote request fails", async () => {
    const fetchMock = vi.fn(async () => response("Nope", { status: 500, headers: { "content-type": "text/plain" } }));
    const service = new UrlIntakeService({ fetch: fetchMock });

    await expect(service.intake("https://example.com/broken")).resolves.toEqual({
      kind: "needs_image",
      sourceUrl: "https://example.com/broken",
      reason: "fetch_failed"
    });
  });
});
