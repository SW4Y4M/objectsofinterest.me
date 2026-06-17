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

  it("sends the expected fetch contract for page requests", async () => {
    const timeoutSignal = new AbortController().signal;
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutSignal);
    const fetchMock = vi.fn(async () =>
      response("<html><head><meta property=\"og:image\" content=\"/red-kettle.jpg\" /></head></html>", {
        status: 200,
        headers: { "content-type": "text/html", "content-length": "500" }
      })
    );
    const service = new UrlIntakeService({ fetch: fetchMock });

    await service.intake("https://shop.example.com/products/kettle");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit];
    expect(requestUrl).toEqual(new URL("https://shop.example.com/products/kettle"));
    expect(requestInit).toMatchObject({
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml,image/avif,image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.8",
        "user-agent": "ObjectsOfInterestBot/1.0"
      },
      signal: timeoutSignal
    });
    expect(timeoutSpy).toHaveBeenCalledWith(8000);
    timeoutSpy.mockRestore();
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

  it("returns fetch_failed when the response content-length exceeds the page limit", async () => {
    const text = vi.fn(async () => "<html><head><meta property=\"og:image\" content=\"/too-big.jpg\" /></head></html>");
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        headers: new Headers({
          "content-type": "text/html",
          "content-length": "51"
        }),
        text
      } as unknown as Response;
    });
    const service = new UrlIntakeService({ fetch: fetchMock, maxPageBytes: 50 });

    await expect(service.intake("https://example.com/oversized-header")).resolves.toEqual({
      kind: "needs_image",
      sourceUrl: "https://example.com/oversized-header",
      reason: "fetch_failed"
    });
    expect(text).not.toHaveBeenCalled();
  });

  it("returns fetch_failed when the HTML body exceeds the page limit", async () => {
    const text = vi.fn(async () => "<html>".padEnd(51, "x"));
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        headers: new Headers({
          "content-type": "text/html",
          "content-length": "10"
        }),
        text
      } as unknown as Response;
    });
    const service = new UrlIntakeService({ fetch: fetchMock, maxPageBytes: 50 });

    await expect(service.intake("https://example.com/oversized-body")).resolves.toEqual({
      kind: "needs_image",
      sourceUrl: "https://example.com/oversized-body",
      reason: "fetch_failed"
    });
    expect(text).toHaveBeenCalledTimes(1);
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
