import { describe, expect, it } from "vitest";
import { extractPageMetadata } from "@/lib/urlIntake/metadata";

describe("extractPageMetadata", () => {
  it("extracts JSON-LD product metadata before Open Graph metadata", () => {
    const html = `
      <html>
        <head>
          <title>Fallback title</title>
          <link rel="canonical" href="/canonical-product" />
          <meta property="og:title" content="Open Graph title" />
          <meta property="og:image" content="https://cdn.example.com/og.jpg" />
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "JSON-LD lamp",
              "image": ["https://cdn.example.com/jsonld-lamp.png"],
              "offers": {
                "@type": "Offer",
                "price": "120",
                "priceCurrency": "USD"
              }
            }
          </script>
        </head>
      </html>
    `;

    expect(extractPageMetadata(html, new URL("https://shop.example.com/product"))).toEqual({
      title: "JSON-LD lamp",
      canonicalUrl: "https://shop.example.com/canonical-product",
      imageUrl: "https://cdn.example.com/jsonld-lamp.png",
      price: "120",
      currency: "USD"
    });
  });

  it("ignores blank JSON-LD product names and keeps falling back", () => {
    const html = `
      <html>
        <head>
          <title>Desk light</title>
          <meta property="og:title" content="OG desk light" />
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "   "
            }
          </script>
        </head>
      </html>
    `;

    expect(extractPageMetadata(html, new URL("https://example.com/products/light"))).toEqual({
      title: "OG desk light"
    });
  });

  it("uses twitter card metadata when Open Graph metadata is missing", () => {
    const html = `
      <html>
        <head>
          <meta name="twitter:image" content="/twitter-light.webp" />
          <meta name="twitter:title" content="Twitter desk light" />
        </head>
      </html>
    `;

    expect(extractPageMetadata(html, new URL("https://example.com/products/light"))).toEqual({
      title: "Twitter desk light",
      imageUrl: "https://example.com/twitter-light.webp"
    });
  });

  it("falls back to the document title when no richer title metadata exists", () => {
    const html = `
      <html>
        <head>
          <title>Desk light</title>
        </head>
      </html>
    `;

    expect(extractPageMetadata(html, new URL("https://example.com/products/light"))).toEqual({
      title: "Desk light"
    });
  });

  it("returns an empty object when no useful metadata exists", () => {
    expect(extractPageMetadata("<html><body>No metadata</body></html>", new URL("https://example.com"))).toEqual({});
  });
});
