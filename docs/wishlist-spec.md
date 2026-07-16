# Objects of Interest Product Spec

Status: Draft v0.4
Product: Objects of Interest
Audience: One public profile owner, public visitors
Working public identity: @swayam's Objects of Interest

> **Direction update (2026-07-03) — pre-launch waitlist landing.** For the pre-launch moment,
> the public entry `/` is now a **waitlist-first landing** whose hero is a *truly-infinite,
> drag-to-explore WebGL canvas* of object cutouts, with a "Build your objectsofinterest" email
> capture. This deliberately overrides two rules below — "avoid a marketing landing page as the
> first screen" and the "not infinite / not Pinterest-like" layout guidance — **for the landing
> only**. The finite, ordered editorial wall described in this spec remains the design for the
> **real product** (it already exists, now served at `/wall`). Depth-as-recency and an alt grid
> view are product backlog. See `docs/superpowers/specs/2026-07-03-infinite-canvas-waitlist-landing-design.md`.

## Product Summary

Objects of Interest is a polished public profile for personal taste: a self-portrait made of objects someone notices, wants, researches, or aspires to own. The owner can add an object from a name, URL, screenshot, image, or product reference. The product should give back more than the owner put in by turning that rough input into a clean object cutout, a title guess, a source, optional price context, a suggested tag, and a beautiful placement on the wall.

The site should feel minimal, curated, and personal. It is not a spreadsheet of links, a utilitarian gift registry, or a generic shopping wishlist. The main experience is the object wall: a white, gallery-like surface where cutout objects appear arranged by time, like a growing stack of taste.

## Product Positioning

Objects of Interest is a public object moodboard for one person.

The public identity should feel profile-like but editorial. The working title is `@swayam's Objects of Interest`: personal enough to belong to one person, but restrained enough to fit the minimal gallery tone.

It sits between:

- A personal shopping wishlist
- A public profile
- A minimal object gallery
- A lightweight gift inspiration page
- A taste archive

It is not, for now:

- A multi-user wishlist platform
- A shopping marketplace
- A gift claiming or reservation app
- A price tracker
- A social network

## Core User Story

As the wall owner, I want to add a messy object reference and have the site transform it into a clean, beautiful object on my wall, so capturing taste feels fast, pleasurable, and more rewarding than saving a link.

As a public visitor, I want to browse the wall like a boutique gallery, so I can understand the person's taste and explore objects without needing to sign in or interact.

As an interested visitor, I want to join a waitlist, so I can be notified when I can create my own wall.

## Core Transformation

The product's first AHA moment is transformation.

The user gives the system something rough:

- A messy product URL
- A screenshot
- A product name
- An uploaded image
- A pasted image URL

The system gives back something more refined:

- A clean object cutout
- A plausible title
- A source reference when available
- Optional price context when available
- A suggested editorial tag
- A beautiful placement on the public wall

This should feel less like bookmarking and more like dropping a found object onto a personal gallery table. The owner should feel: `I found a thing, and now it belongs to my world.`

The product's later AHA moment is pattern recognition. After several saves, the wall should begin to reflect the owner's taste back to them: repeated materials, categories, moods, use cases, and aspirations.

## Guiding Principles

- Image-first: the object wall is the experience.
- Polished over broad: fewer features, better presentation.
- Frictionless capture: pasting a link, name, screenshot, or image should usually be enough.
- Transformation over storage: the system should turn rough input into a wall-ready object.
- Browse-only public mode: visitors can explore but not modify, reserve, or claim.
- Curated taste: every object should look like it belongs in a designed profile.
- Calm desire: the product should help users notice, save, and reflect before buying, not pressure them into immediate purchase.

## EOD MVP Launch Scope

The EOD MVP can be owner-only. It must prove the public wall, the capture/transformation promise, and the waitlist.

Required for launch:

- One public wall for `@swayam's Objects of Interest`.
- Real object images on the public wall.
- Owner-only Studio for adding and correcting objects.
- Add object from at least object name, image URL, or image upload.
- A processed or clean object image shown on the wall.
- Basic title, tag, source, price, and note metadata.
- A public waitlist form for visitors who want their own wall.

Acceptable launch compromises:

- Studio can remain functional and owner-focused rather than fully polished.
- Automatic title, source, price, and tag inference can be partial or provider-limited.
- Screenshot capture can be deferred if URL/name/image capture proves the transformation.
- Multi-user account creation is deferred behind the waitlist.

## MVP Scope

### In Scope

- One object wall profile.
- Public browse-only page.
- Hidden owner Studio mode for object entry and drafts.
- Add object by name.
- Add object by URL, image URL, or upload when available.
- Optional manual image upload or image URL.
- Automatic image search when no image is supplied.
- Background removal for fetched or uploaded product images.
- Title guess, source capture, optional price context, and suggested editorial tag when available.
- Minimal white-wall object views: strict grid and expressive masonry.
- Hover/focus/tap object annotation state.
- Filters for browsing.
- Basic object metadata.
- Public waitlist signup.

### Out of Scope

- Multiple users/accounts.
- Multiple wishlists.
- Full admin dashboard.
- Full Studio visual redesign or Figma-level component polish.
- Visitor comments, likes, or reactions.
- Gift claiming or reservations.
- Checkout or payments.
- Browser extension.
- Price tracking.
- Automatic inventory or availability checks.
- Social sharing automation beyond a public URL.

## Main Experience

### 1. Public Object Wall

The public page displays all visible objects on a minimal white wall. Objects should feel isolated on a refined surface, not like generic ecommerce cards.

Expected behavior:

- Objects appear as clean cutouts with transparent or visually removed backgrounds.
- The layout should support different object shapes and sizes while still feeling calm and ordered.
- Objects are arranged newest-first, creating a stack-like chronology where recent wants are most visible.
- Newer objects should feel visually discoverable without making the wall chaotic.
- Object surfaces should include no visible metadata by default.
- On hover/focus/tap, objects can reveal contextual details such as tag, optional price, why the object matters to the owner, and a quiet source link if available.
- Visitors can switch between two view modes: strict grid and expressive masonry.
- Filtering should feel lightweight and elegant.
- The public page should be responsive across desktop and mobile.

Primary visible content:

- Object image

Revealed on hover/focus/tap:

- Object name
- Editorial tag
- Optional price
- Owner note/provenance, such as `Recommended by XYZ`
- Quiet source link, if a source URL exists

### 2. Add Object Flow

The owner can add an object with minimal effort from a hidden Studio route, such as `/studio`. The Studio should feel like a private version of the same wall, not a heavy admin dashboard.

Primary capture input:

- One flexible input that can accept a product name, product URL, image URL, or uploaded image.

Required normalized fields:

- Object name
- Editorial tag

Optional fields:

- Image upload
- Image URL
- Source URL
- Price
- Note

Image handling:

1. If the owner uploads or pastes an image, use that image.
2. If the owner pastes a URL, attempt to extract or infer title, source, image, and price.
3. If no image is provided, search for a relevant product image using the object name.
4. Automatically pick the best candidate image.
5. Suggest an editorial tag when enough context exists.
6. Always remove the image background, whether the image was searched, uploaded, or pasted.
7. Store and display the processed object image in the wall.
8. Allow the owner to manually override the image by uploading or pasting a replacement.
9. If processing succeeds with a usable image, publish the object as `Visible` immediately.
10. If processing fails or returns a low-quality result, save the object privately as `Draft`.

The capture flow should not force the owner to complete every metadata field up front. The first action is capture; curation can happen afterward.

### 3. Object Annotation State

The wall itself is the primary experience. V1 should not include a separate object detail page or detail modal.

Expected behavior:

- Desktop users reveal object annotations on hover or keyboard focus.
- Mobile users reveal the same annotation on tap.
- On mobile, first tap reveals the annotation.
- Tapping the same object again closes the annotation.
- Tapping another object moves the annotation to that object.
- Tapping outside the active object closes the annotation.
- Source links inside annotations remain tappable.
- The annotation can include editorial tag, optional price, owner note/provenance, and a quiet source link.
- Object name appears in the annotation state, not persistently on the wall.
- The annotation should feel like a gallery label, not an ecommerce card.
- Visitors cannot edit, reserve, claim, or comment.

### 4. Studio Mode

Studio mode is the owner-only surface for adding, reviewing, and correcting objects.

Expected behavior:

- Studio lives at a private route such as `/studio`.
- Studio is protected by a simple owner password/passcode in v1.
- Studio unlock can persist locally for the owner.
- V1 should not include sign-up, multi-user accounts, or public authentication flows.
- Studio uses the same visual language as the public wall.
- Studio adds minimal owner controls, such as `Add object`, `Edit`, `Replace image`, and `Archive`.
- Drafts and failed image objects appear only in Studio.
- Studio should not feel like a dashboard or CMS.
- Studio allows editing published object name, editorial tag, provenance, price, source URL, image replacement, and archive state.

### 5. Filters

Filters should help visitors browse tastefully without making the interface feel like a dense ecommerce catalog.

MVP filters:

- Editorial tag

Filter presentation:

- Use a quiet horizontal text rail: `All`, `Wear`, `Work`, `Home`, `Read`, `Make`, `Move`, `Care`, `Collect`.
- Place the rail near the profile identity, above the object wall.
- Use underline, opacity, or subtle weight change for the active tag.
- Do not show counts in v1.
- Do not use dropdowns, side panels, or a visible `Filters` label in v1.

### 6. Waitlist

The public page should include a quiet waitlist entry point for visitors who want their own wall.

Expected behavior:

- Waitlist is visible but secondary to the object wall.
- The form captures email address at minimum.
- Optional name or handle can be deferred.
- Submission gives clear success feedback.
- The waitlist should not interrupt browsing with a modal or aggressive prompt.
- Waitlist copy should frame the product as creating your own object wall or public taste profile, not as signing up for a shopping app.

Suggested public copy direction:

- `Want your own object wall?`
- `Join the waitlist for Objects of Interest.`

## View Modes

Objects of Interest supports two public wall views because the product is design-first and browsing mode changes the feel of the collection.

### Strict Grid

- Most ordered and architectural.
- Equal cells with invisible boundaries.
- Best for comparing objects evenly.
- Maintains the white-wall feel without visible cards.
- Object cutouts are centered inside equal cells.
- Images use natural contained sizing with no cropping.
- Use `object-fit: contain` behavior.
- Newest-first left-to-right, top-to-bottom.
- Uses the same hover/focus/tap annotation pattern as masonry.

### Masonry

- Default public view.
- Most expressive, editorial, and object-led.
- Object cutouts can breathe at different sizes.
- Best for making the wall feel curated, magazine-like, and less catalog-like.
- Must remain restrained, not Pinterest-like.
- Use an editorial block system rather than random masonry.
- On desktop, think in a 3-column or 4-column rhythm.
- A row might contain 3 objects, 2 larger objects, or 1 feature object depending on image shape and context.
- A single object can occupy multiple blocks, such as a 2x2 feature placement.
- Expression comes from scale and block span, not rotation, tilt, overlap, or decorative effects.
- No object rotation or tilt in v1.
- No object overlap in v1.
- Annotations must not shift the layout.

View mode behavior:

- Masonry is the default public view.
- Strict grid is the alternate view.
- Public visitors can switch views.
- Studio uses the same view switcher, with additional owner-only controls.
- All views are newest-first.
- Masonry block sizing is automatic in v1.
- Manual owner layout overrides are deferred.
- View switching should not change active tag filters.
- The selected view can persist locally for the visitor.
- The control should be minimal, likely three icons with accessible labels.

Masonry display size values:

- Standard
- Wide
- Tall
- Feature

Automatic sizing can consider image aspect ratio, object silhouette, image clarity, resolution, and recency.

Sorting:

- Newest-first is the default order.
- Manual ordering is out of scope for v1.
- Public timestamps are hidden in v1. Time is implied through newest-first arrangement.

## Object Data Model

Each object record should support:

- id
- name
- slug
- imageOriginalUrl
- imageProcessedUrl
- sourceUrl
- editorialTag
- price
- currency
- note
- status
- displaySize
- sourceImageProvider
- createdAt
- updatedAt

Status values:

- Draft
- Visible
- Archived

Only `Visible` objects appear on the public wall. Objects with failed image search or failed background removal are saved privately as `Draft` so the owner can add or replace the image manually.

Successful image search and background removal should publish immediately without a separate approval step. The owner can replace or archive the object afterward in Studio.

Each `Visible` object must have one required `editorialTag`. Multiple tags are deferred beyond v1.

Price is optional manual metadata. V1 should not infer, filter, or sort by price. When shown in annotations, price should be visually muted.

Editorial tag values:

- Wear
- Work
- Home
- Read
- Make
- Move
- Care
- Collect

## Image Processing Requirements

The image pipeline is central to the experience.

Functional requirements:

- Search for an image when none is provided.
- Prefer product-only images over lifestyle or model shots.
- Prefer white or simple-background product imagery.
- Prefer high-resolution images.
- Avoid watermarks, marketplace collages, and images with heavy text overlays.
- Remove image backgrounds.
- Run background removal for searched, uploaded, and pasted images.
- Preserve product edges cleanly.
- Generate a display-ready asset suitable for the wall.
- Keep the original image reference for replacement or reprocessing.

Quality requirements:

- Avoid blurry, tiny, watermarked, or unrelated images.
- Avoid images where the product is obscured.
- Avoid overly editorial images where background removal will fail.
- Support manual correction by replacing the image.

Potential implementation options:

- Use an image search API for sourcing.
- Use a background removal API or model for cutouts.
- Store processed images in object storage.
- Cache image search results to avoid repeated lookups.
- Autopick one image by default rather than asking the owner to choose from multiple candidates.
- Support owner-provided image override before or after save.
- Keep the exact image search provider unspecified until implementation.

## Visual Direction

The aesthetic should be Aesop-like: minimal, restrained, quiet, and carefully arranged.

Desired qualities:

- White-wall gallery feel.
- Premium but personal.
- Calm, spacious, and tactile.
- Object images should be the visual hero.
- Metadata should feel like an editorial annotation, not ecommerce merchandising.
- Filters should be understated.
- Typography should feel refined but readable.
- The interface should avoid generic ecommerce styling.

Avoid:

- Marketplace clutter.
- Heavy product cards.
- Loud sale-style UI.
- Excessive gradients or decorative blobs.
- A marketing landing page as the first screen.
- Pinterest-like visual noise.
- Fashion-editorial busyness.

## V1 Quality Bar

V1 should feel production-polished, not like a rough prototype.

Non-negotiables:

- The public wall must feel intentional with real spacing, scale, and rhythm.
- Default public browsing must show object cutouts only, with no persistent labels or card chrome.
- Hover/focus/tap annotations must feel like gallery labels, not product cards.
- Masonry must feel expressive and editorial, while strict grid must feel ordered and architectural.
- Mobile interactions must be fully designed, not merely collapsed desktop behavior.
- Failed or low-quality image processing must never leak into the public wall.
- Studio must stay visually close to the public wall and avoid dashboard/CMS styling.

## Screens

### Public Object Wall

Intent: Let anyone browse the owner's taste through a beautiful wall of objects.

Key elements:

- Profile/header area with handle-style editorial identity.
- Filter controls.
- Object wall.
- Hover/focus/tap object annotations.

### Owner Studio

Intent: Let the owner add and refine objects without turning the public profile into an admin interface.

Key elements:

- Same wall layout as public view.
- Minimal owner controls.
- Draft/private object states.
- Add object entry point.
- Replace image action.

### Owner Add/Edit Object

Intent: Let the owner quickly add or correct objects.

Key elements:

- Object name field.
- Optional image upload/URL.
- Optional source URL.
- Metadata fields.
- Optional `Provenance` field for owner context, recommendations, or meaning.
- `Provenance` placeholder: `Why this object, where it came from, or who recommended it`.
- Required fixed editorial tag selector.
- Image processing/loading state.
- Preview of the processed cutout.
- Save action.

### Empty State

Intent: Make the first object feel easy and exciting to add.

Key elements:

- Minimal prompt.
- Add object action.
- No long feature explanation.

## Key States

- Empty object wall.
- Loading image search.
- Background removal in progress.
- Image search failed.
- Background removal failed.
- Private draft awaiting a usable image.
- Object added successfully.
- No filter results.
- Object image missing or broken.

## Success Criteria

The MVP is successful if:

- An object can be added from only a name, URL, image URL, or upload.
- The system can turn rough input into a wall-ready object with a clean image and useful metadata.
- The public wall feels polished, minimal, and visually distinctive.
- Visitors can browse and filter without instruction.
- The owner can replace poor automatic images.
- The design feels like a public profile, not an admin database.
- Visitors can join a waitlist without leaving the wall experience.
- The first save creates a small transformation moment: the object feels cleaned, placed, and owned by the wall.

## Open Questions

No major product questions remain open. Implementation details such as exact image search and background removal providers can be selected during build.

## Recommended Technical Stack

- App: Next.js
- Database: Neon Postgres
- ORM/query layer: Drizzle
- Image/object storage: Vercel Blob, Cloudflare R2, or S3-compatible storage
- Deployment: Vercel
- Studio protection: environment-configured owner password/passcode
- Image search provider: choose during implementation
- Background removal provider/model: choose during implementation

Image files should not be stored in Postgres. Neon should store object metadata, statuses, source URLs, processed image URLs, and display/layout fields.

## Recommended Phase 1 Build

Build a polished single-profile MVP with:

- Public object wall.
- Add object by name, URL, image URL, or upload.
- Hidden owner Studio route.
- Automatic image search, metadata assistance, suggested tag, and background removal where available.
- Manual image replacement.
- Editorial tag filters.
- Hover/focus/tap object annotations.
- Public waitlist capture.
- Responsive design.
- Time-based product arrangement.

Defer everything else until the core object wall feels excellent.
