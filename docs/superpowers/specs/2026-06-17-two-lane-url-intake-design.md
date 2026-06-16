# Two-Lane URL Intake Design

Status: Ready for review
Created: 2026-06-17
Product: Objects of Interest
Owner: Swayam
Scope: V1 capture/transformation intake

## Problem & User Need

Objects of Interest needs a faster way to turn a found object into a wall-ready object. For V1, the owner should be able to paste either a direct image URL or a product/page URL without needing to manually download and re-upload assets.

The product promise for V1 is intentionally constrained:

- Image upload and direct image URL are reliable.
- Product/page URL is best-effort.
- Background removal is outside this spec and should remain a later processing step.

This lets the MVP prove the core transformation without spending the release on scraping edge cases or paid image-processing dependencies.

## Design Approach

The intake system uses two lanes.

### Lane 1: Reliable Image Intake

This lane handles:

- Uploaded image files.
- Direct image URLs.

It is the path the product can promise for V1. If the input is an image, the system validates, downloads, stores, and creates an object draft/visible object from it.

### Lane 2: Best-Effort Page Unfurling

This lane handles:

- Product URLs.
- Article/blog/store URLs that may contain an object image.
- Any non-image URL.

It tries to extract a usable image and metadata from the page. If it succeeds, it hands the discovered image into Lane 1. If it fails, Studio keeps the pasted URL and asks the owner to upload an image or paste a direct image URL.

## What This Spec Does Not Do

- It does not require background removal.
- It does not require screenshot capture.
- It does not guarantee product URLs always work.
- It does not add multi-user support.
- It does not require AI title/tag/price inference beyond simple metadata extraction.
- It does not introduce a paid service dependency.

## UX Questions Answered

- What happens when the owner pastes a direct image URL?
- What happens when the owner pastes a product URL?
- What does the owner see when metadata extraction succeeds?
- What does the owner see when product URL extraction fails?
- Which fields are auto-filled and which remain editable?
- How does the feature avoid blocking object creation on unreliable scraping?

## Entry Point

Studio should expose one primary capture input near the top of the Add flow:

Label: `Paste a URL or add an image`

Accepted inputs:

- Direct image URL
- Product/page URL
- Image upload

The existing manual fields remain available so the owner can correct or fill in metadata.

## Input Classification

When the owner submits a URL, the server classifies it before processing.

### Direct Image URL

A URL is treated as a direct image URL when one or more checks pass:

- The path ends with a supported image extension: `.jpg`, `.jpeg`, `.png`, `.webp`.
- A HEAD or lightweight GET request returns an image content type.
- The URL can be fetched within timeout and decoded as an image.

Supported V1 image formats:

- JPEG
- PNG
- WebP

AVIF, HEIC, SVG, video, and animated GIF are out of scope for V1 unless already supported by the existing image pipeline.

### Product/Page URL

A URL is treated as a page URL when it does not pass direct image checks or when it returns HTML.

The unfurler should attempt to extract:

- Page title
- Open Graph image
- Twitter card image
- JSON-LD product image
- JSON-LD product name
- JSON-LD offer price and currency, when present
- Canonical URL
- Site/domain name

Extraction priority for the object image:

1. JSON-LD product image
2. Open Graph image
3. Twitter card image
4. First large candidate image from the page, only if safe and easy to identify

V1 should avoid brittle DOM scraping beyond this unless needed for one known target site.

## Data Flow

### Upload Flow

1. Owner selects an image file.
2. Server validates file type and size.
3. Server stores the original image.
4. Object draft is created with the stored image.
5. Optional later image processing can update the processed image field.
6. Owner reviews metadata and publishes or saves.

### Direct Image URL Flow

1. Owner pastes an image URL.
2. Server validates that the URL points to an image.
3. Server downloads the image server-side.
4. Server stores the original image.
5. Object draft is created with the stored image.
6. Source URL is set to the pasted URL unless the owner provides a separate source.
7. Optional later image processing can update the processed image field.

### Product/Page URL Success Flow

1. Owner pastes a product/page URL.
2. Server fetches metadata using best-effort page unfurling.
3. Server selects the best candidate image.
4. Server downloads and stores that image through the same reliable image path.
5. Studio pre-fills title, source URL, source domain, price, and currency when available.
6. Object draft is shown for review before publish.

### Product/Page URL Failure Flow

1. Owner pastes a product/page URL.
2. Server cannot find a usable image or cannot fetch the page.
3. Studio keeps the URL in the source field.
4. Studio shows a recoverable message:

   `I couldn't find a usable image from that page. Paste an image URL or upload an image to keep going.`

5. Owner can upload an image or paste a direct image URL without losing the URL.

## Object Field Mapping

When available, metadata maps into object fields as follows:

| Source Data | Object Field | Notes |
| --- | --- | --- |
| Uploaded file | `imageOriginalUrl` | Stored original asset |
| Direct image URL | `imageOriginalUrl` | Downloaded and re-hosted before use |
| Product URL | `sourceUrl` | Canonical URL preferred |
| Page title / product name | `name` | Owner can edit |
| Product image candidate | `imageOriginalUrl` | Downloaded and re-hosted |
| Offer price | `price` | Optional |
| Offer currency | `currency` | Optional |
| Source domain | display-only helper or derived metadata | Optional V1 helper |

Editorial tag is not required to be inferred in this spec. Studio can keep the existing tag selector/default behavior.

## States

### Default

The Add form shows the primary URL/upload input and editable metadata fields.

### Fetching

After submit, Studio shows that it is fetching the image or page. The owner should not lose typed input.

Suggested copy:

`Looking for the object image...`

### Image Found

Studio shows the image preview and any extracted metadata. The owner can edit before saving/publishing.

Suggested copy:

`Found an image. Review before adding it to the wall.`

### Page Found, No Image

Studio keeps extracted text metadata if available, but asks for an image.

Suggested copy:

`I found the page, but not a usable image. Add an image URL or upload one.`

### Fetch Failed

Studio keeps the original URL and lets the owner continue manually.

Suggested copy:

`That URL could not be fetched. Add an image URL or upload an image instead.`

### Invalid Image URL

Studio explains that the URL did not resolve to a supported image.

Suggested copy:

`That link does not look like a supported image. Use JPG, PNG, or WebP.`

## Error Handling

The intake should fail soft. A failed product URL should not wipe form state or block manual creation.

Required safeguards:

- Timeout remote fetches.
- Limit download size.
- Validate content type.
- Avoid following excessive redirects.
- Reject private/local network targets to avoid SSRF.
- Store remote assets before rendering them on the wall.
- Preserve source URL even when image extraction fails.

Recommended V1 limits:

- Max image download size: 10 MB.
- Max page fetch size: 3 MB.
- Fetch timeout: 8 seconds.
- Redirect limit: 3.

## Service & Library Choices

### V1 Recommendation

Use local server-side extraction first:

- Direct image validation with native fetch plus content-type checks.
- Metadata extraction from Open Graph, Twitter card, and JSON-LD.
- A small, testable `UrlIntakeService` that returns normalized results.

This avoids a new paid service dependency and keeps the feature understandable.

### Optional Fallback Later

If product page unfurling is too weak, add a hosted metadata fallback such as Microlink. This should be a later provider behind the same interface, not the core V1 dependency.

## Proposed Internal Interfaces

The implementation should keep URL intake separate from object persistence.

```ts
type IntakeInput =
  | { kind: "upload"; file: File }
  | { kind: "url"; url: string };

type UrlIntakeResult =
  | {
      kind: "image";
      originalUrl: string;
      contentType: string;
      suggestedName?: string;
      sourceUrl?: string;
    }
  | {
      kind: "page";
      sourceUrl: string;
      canonicalUrl?: string;
      suggestedName?: string;
      imageUrl?: string;
      price?: string;
      currency?: string;
    }
  | {
      kind: "needs_image";
      sourceUrl: string;
      suggestedName?: string;
      reason: "no_image_found" | "fetch_failed" | "unsupported_image";
    };
```

Object creation should consume the normalized result and decide whether to create a draft, prefill the form, or ask for a replacement image.

## Measurement

Primary success metric:

- Owner can add an object from upload or direct image URL without manual file manipulation.

Secondary learning metrics:

- Percentage of direct image URLs that succeed.
- Percentage of product URLs that return a usable image.
- Percentage of product URL attempts that recover via manual upload/image URL.
- Median time from paste/upload to object preview.

Counter-metrics:

- Failed URL attempts that lose user-entered data.
- Broken images on the public wall.
- Objects published with missing or incorrect source URL.

## Test Plan

### Unit Tests

Cover URL classification:

- Direct `.jpg` URL.
- Direct image URL without extension but image content type.
- HTML page URL.
- Unsupported content type.
- Timeout/fetch failure.

Cover metadata extraction:

- Open Graph image and title.
- Twitter image fallback.
- JSON-LD product name/image/offer.
- No image found.
- Relative image URL resolved against page URL.

Cover safety:

- Reject localhost/private network URLs.
- Enforce max download size.
- Enforce redirect limit.

### Integration Tests

Cover Studio flows:

- Upload creates preview.
- Direct image URL creates preview.
- Product URL with metadata pre-fills image/name/source.
- Product URL without image asks for image without clearing source URL.
- Invalid URL returns recoverable error.

### Manual QA

Use at least:

- One direct product image URL.
- One product page with Open Graph metadata.
- One product page with JSON-LD Product metadata.
- One page with no usable image.
- One blocked or invalid URL.

## Ethical Review

This feature should support personal collection and attribution, not silent content laundering.

Design constraints:

- Preserve source URL when the object came from a page.
- Let the owner edit inaccurate metadata.
- Do not imply purchase availability or price accuracy.
- Avoid dark patterns that push buying; this is a taste archive, not checkout.

Dark pattern clearance:

- The design does not use deceptive urgency, hidden costs, forced continuity, or manipulative purchase pressure.

## Open Questions

These do not block V1:

- Should Studio publish immediately after successful image intake, or always create a review draft?
- Should source domain be displayed on the public wall annotation?
- Should product URL attempts use screenshot capture later when metadata extraction fails?
- Should background removal run inline, async, or manually triggered in a future spec?

## Acceptance Criteria

- Owner can upload an image and get an object preview.
- Owner can paste a direct JPG/PNG/WebP URL and get an object preview.
- Owner can paste a product/page URL and receive best-effort metadata extraction.
- If a product/page URL yields a usable image, it flows through the same image storage path as direct image URLs.
- If a product/page URL does not yield a usable image, Studio preserves the source URL and asks for upload/direct image URL.
- No paid service is required for V1.
- Background removal remains optional/out of scope for this spec.

## References

- Existing product spec: `docs/wishlist-spec.md`
- Current image pipeline: `src/lib/image/pipeline.ts`
- Current Studio actions: `src/app/studio/actions.ts`
- Current image search/background provider pattern: `src/lib/image/search.ts`, `src/lib/image/backgroundRemoval.ts`
