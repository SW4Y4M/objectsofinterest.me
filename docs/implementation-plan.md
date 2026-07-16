# Wishlist Implementation Plan

Status: Draft v0.1
Spec: `docs/wishlist-spec.md`

> **Direction update (2026-07-03).** Pre-launch, `/` is the **infinite-canvas waitlist landing**
> (see `docs/superpowers/specs/2026-07-03-infinite-canvas-waitlist-landing-design.md`), and the
> public object wall described under Routes below moves to **`/wall`**. Studio routes are unchanged.
> The wall, Studio, image pipeline, and URL intake in this plan remain the design for the product
> after launch.

## Build Goal

Build a production-polished v1 of Wishlist: a one-person public object wall with a hidden owner Studio, automatic image sourcing, background removal, and two public view modes.

The first release should optimize for a finished-feeling core experience, not breadth.

## Recommended Stack

- App: Next.js
- Database: Neon Postgres
- ORM/query layer: Drizzle
- Image/object storage: Vercel Blob, Cloudflare R2, or S3-compatible storage
- Deployment: Vercel
- Studio protection: environment-configured owner password/passcode
- Image search provider: selected during implementation
- Background removal provider/model: selected during implementation

## Routes

### Public

- `/`
  - Public object wall.
  - Masonry default.
  - Strict grid alternate.
  - Editorial tag rail.
  - Hover/focus/tap annotations.
  - Shows only `Visible` objects.

### Studio

- `/studio`
  - Password gate.
  - Owner view of the same wall.
  - Add object entry point.
  - Draft/private objects.
  - Edit, replace image, archive.

## Data Model

### `objects`

Suggested fields:

- `id`
- `name`
- `slug`
- `image_original_url`
- `image_processed_url`
- `source_url`
- `editorial_tag`
- `price`
- `currency`
- `note`
- `status`
- `display_size`
- `source_image_provider`
- `created_at`
- `updated_at`

Enums:

- `status`: `draft`, `visible`, `archived`
- `editorial_tag`: `wear`, `work`, `home`, `read`, `make`, `move`, `care`, `collect`
- `display_size`: `standard`, `wide`, `tall`, `feature`

Rules:

- Only `visible` objects appear publicly.
- `visible` objects require `name`, `editorial_tag`, and `image_processed_url`.
- Failed image sourcing or background removal creates/keeps a `draft`.
- Price is optional and never used for v1 filtering/sorting.

## API / Server Actions

### Studio Auth

- `POST /studio/unlock`
  - Verifies owner passcode from environment.
  - Sets an owner session cookie.

### Objects

- `GET /api/objects`
  - Public list of visible objects.
  - Supports `editorialTag`.
  - Ordered newest-first.

- `GET /api/studio/objects`
  - Owner list including drafts and archived objects.

- `POST /api/studio/objects`
  - Creates an object from name, required editorial tag, and optional fields.
  - Triggers image pipeline.

- `PATCH /api/studio/objects/:id`
  - Edits name, editorial tag, provenance note, price, source URL, status.

- `POST /api/studio/objects/:id/replace-image`
  - Uploads or accepts a replacement image URL.
  - Runs background removal.
  - Updates processed image.

- `POST /api/studio/objects/:id/archive`
  - Sets status to `archived`.

## Image Pipeline

### Input Cases

1. Owner provides image upload.
2. Owner provides image URL.
3. Owner provides only object name.

### Processing Flow

1. Resolve image source.
2. If no owner image exists, search for a candidate image using object name.
3. Autopick best candidate.
4. Run background removal for every image source.
5. Store original and processed image in object storage.
6. Assign automatic masonry `display_size`.
7. Publish as `visible` if quality checks pass.
8. Save as `draft` if sourcing, processing, or quality checks fail.

### Quality Checks

Reject or draft when:

- Image is too small or blurry.
- Image has watermark/heavy text.
- Image is unrelated to query.
- Object is obscured.
- Background removal produces unusable edges.
- Processed image is missing transparency or has a broken URL.

## Frontend Components

### Public Surface

- `ProfileHeader`
- `TagRail`
- `ViewSwitcher`
- `ObjectWall`
- `MasonryWall`
- `StrictGridWall`
- `ObjectTile`
- `ObjectAnnotation`

### Studio

- `StudioGate`
- `StudioToolbar`
- `AddObjectForm`
- `EditObjectPanel`
- `ImageProcessingState`
- `DraftObjectTile`

## Interaction Rules

### Public Object Tile

- Default state shows only the processed object cutout.
- Hover/focus reveals annotation on desktop.
- Tap reveals annotation on mobile.
- Tapping another object moves the active annotation.
- Tapping outside closes the active annotation.
- Annotation never shifts layout.
- Source link is quiet and only appears if present.

### View Switching

- Masonry is default.
- Strict grid is alternate.
- Visitor choice persists locally.
- Active editorial tag persists when switching views.

### Studio

- Studio uses the same wall language as public view.
- Studio adds minimal controls only where needed.
- Drafts are visible only in Studio.
- Failed image objects clearly ask for image replacement.

## Build Phases

### Phase 1: Foundation

- Initialize Next.js app.
- Add styling foundation.
- Configure Drizzle + Neon.
- Create object schema and migrations.
- Add seed data with local/static processed images.

Done when:

- Public wall renders seeded objects from Neon.
- Masonry and grid modes switch locally.

### Phase 2: Public Wall Polish

- Build profile header.
- Build editorial tag rail.
- Build masonry editorial block system.
- Build strict grid.
- Build hover/focus/tap annotations.
- Verify desktop and mobile behavior.

Done when:

- Public page feels like the intended white-wall experience.
- No persistent labels/card chrome appear in default wall state.

### Phase 3: Studio

- Add `/studio` route.
- Add password gate.
- Add owner session.
- Build add/edit object UI.
- Show drafts and archived controls only in Studio.

Done when:

- Owner can add/edit/archive objects manually.
- Public route remains browse-only.

### Phase 4: Image Pipeline

- Add image upload/URL handling.
- Add image search provider integration.
- Add background removal provider integration.
- Store original and processed images.
- Add quality failure path to `draft`.

Done when:

- Owner can add an object by name only.
- Successful objects publish immediately.
- Failed image objects remain private drafts.

### Phase 5: Production Hardening

- Add loading, empty, failed, and no-results states.
- Add accessibility pass for keyboard focus and annotation behavior.
- Add responsive QA for mobile, tablet, desktop.
- Add image performance optimization.
- Add environment/config documentation.
- Deploy to Vercel.

Done when:

- Public and Studio flows work end to end.
- The wall remains polished across common viewport sizes.

## Testing Checklist

- Public route never shows drafts or archived objects.
- Studio route requires passcode.
- Object without processed image cannot become visible.
- Object without editorial tag cannot become visible.
- Masonry and grid are both newest-first.
- Tag rail filters objects correctly.
- View switching preserves active tag.
- Desktop hover annotation works.
- Keyboard focus annotation works.
- Mobile tap annotation works.
- Source links inside annotations are tappable.
- Failed image pipeline saves a draft.
- Manual image replacement reruns background removal.
- Public wall has no visible timestamps.

## Deferred

- Multiple users/accounts.
- Multiple wishlists.
- Manual layout overrides.
- Price filtering/sorting/inference.
- Multiple tags per object.
- Detail pages or modals.
- Visitor interactions.
- Gift claiming/reservation.
- Browser extension.
- Price tracking.
