# Infinite-Canvas Waitlist Landing — Design Spec

Status: Draft v1
Date: 2026-07-03
Supersedes (for the public entry only): the bounded editorial wall as the first screen
Related: `docs/wishlist-spec.md`, `docs/implementation-plan.md`

## Context & the pivot

The original spec deliberately avoided "a marketing landing page as the first screen" and an
"infinite / Pinterest-like" layout, favouring a bounded editorial wall. For the **pre-launch
moment** the owner has chosen to override that: ship a **waitlist-first landing** whose hero is a
**truly-infinite, drag-to-explore WebGL canvas** of object cutouts drifting on the warm wall.

This was validated with a throwaway prototype (React Three Fiber, recreating the Codrops
"Infinite Canvas" demo with our object cutouts) before committing. See the prototype's `NOTES.md`.

### Two models, two jobs (the key decision)

- **Pre-launch landing (this spec):** a *truly infinite*, endlessly-repeating field. No real data,
  no ordering — pure wow. Runs on a curated static set of cutout images. Job: capture waitlist emails.
- **The real product wall (already built, unchanged):** *finite & ordered* — the owner's actual
  objects, newest-first, masonry + strict grid. Enhancements like depth-as-recency and an immersive
  view are **product backlog**, not part of this launch.

Forcing one model to be both is the thing we are avoiding. Keeping them separate makes the launch
smaller, because the finite/ordered wall already exists.

## Goal

Ship, in ~1 day, a visually striking waitlist landing at `/` that (a) renders an infinite object-cutout
canvas with a counting loading state, (b) captures emails via "Build your objectsofinterest", and
(c) deploys to Vercel. The existing wall and Studio keep working.

## In scope

1. `/` becomes the **infinite-canvas waitlist landing** (client-rendered WebGL + overlay + loader).
2. **Loading counter**: a number ticks up while cutouts drop onto the wall, then fades to reveal the canvas.
3. **Waitlist capture**: single email field → server action → simplest owned storage.
4. Move the existing public wall from `/` to **`/wall`** (unchanged component), so it's preserved.
5. E2E + unit coverage for the landing and waitlist; Vercel deploy.

## Out of scope (product backlog, not this launch)

- Depth-as-recency (older objects farther) — needs the finite/ordered model + real `createdAt`.
- A clean alt grid view toggle — the app already has masonry + strict grid; refinement later.
- Feeding the canvas from real repository data — pre-launch uses a curated static set.
- Referral / skip-the-line mechanics, email broadcast (Loops etc.) — decide after emails exist.

## Architecture

### Routes
- `/` → `LandingPage` (server component shell) rendering `<InfiniteCanvasLanding />` (client, `ssr:false`)
  plus the waitlist overlay and loader.
- `/wall` → the current `ObjectWallPage` fed by `createObjectRepository().listPublic()` (moved verbatim
  from today's `/`).
- `/studio`, `/studio/unlock` → unchanged.

### Components & files (new)
- `src/components/landing/InfiniteCanvasLanding.tsx` — `"use client"`. The ported R3F engine
  (chunk system, velocity/lerp controller, `MediaPlane`, texture manager). Dynamically imported with
  `next/dynamic` `{ ssr: false }` so it never runs on the server.
- `src/components/landing/infiniteCanvas/` — engine internals split into focused files:
  `scene.tsx` (Canvas + SceneController + Chunk + MediaPlane), `constants.ts`, `chunkPlanes.ts`
  (seeded placement — **centered within chunk**, 9 per chunk), `textureManager.ts`, `types.ts`.
- `src/components/landing/LoadingCounter.tsx` — self-contained counting loader (no drei `useProgress`);
  preloads the curated images, paced count-up + drop-in, fades out.
- `src/components/landing/WaitlistPanel.tsx` — wordmark, hint, "Build your objectsofinterest" heading,
  email input, submit; success + error states via `useActionState`.
- `src/app/page.tsx` — replaced to render the landing.
- `src/app/wall/page.tsx` — the moved wall route.
- `public/landing/*.png` — curated set of ~16 transparent object cutouts (the mock hero imagery).
- `src/lib/landing/media.ts` — the static manifest (url + width/height) for the curated set.

### Waitlist data flow
`WaitlistPanel` (client, `useActionState`) → `joinWaitlist(prev, formData)` server action →
validate email (zod) → `waitlistRepository.add({ email })` → returns `{ status, message }`.
Duplicate emails resolve to success (idempotent), never an error the visitor sees.

### Storage — "easiest owned" (decided)
A single Drizzle table, mirroring the app's existing repository + mock-mode pattern:
- `src/db/schema.ts` → `waitlistSignups` table: `id` (uuid/serial), `email` (text, unique, lowercased),
  `createdAt` (timestamp default now).
- `src/lib/repositories/waitlist.ts` → `WaitlistRepository` interface with `add(email)`; a Drizzle
  implementation for production and an in-memory implementation for `WISHLIST_MODE=mock` / no DB,
  selected exactly like `createObjectRepository()`.
- No new vendor, no email-sending yet. Retrieval is a DB query; the funnel is a later decision.

## Prototype learnings to bake in (non-negotiable in the port)
- **Centered plane placement** (`(rand - 0.5) * CHUNK_SIZE`) + **9 planes/chunk** so the first paint is
  full — no empty opening gap.
- **Brand font**: system sans (`-apple-system, …`), not the demo's monospace.
- **Material**: `meshBasicMaterial` with `transparent` so cutout PNG alpha composites over the wall.
- **Background + fog** = `#f8f7f4`.
- **DPR clamp** (`min(dpr, touch ? 1.25 : 1.5)`), `antialias:false`, distance-fade + cull for perf.
- **No drei `useProgress`** loader (it caused a dev-only infinite `setState` loop); use the
  self-contained `LoadingCounter`.
- **Top-right hint legibility**: give "drag to explore · scroll to zoom" a subtle scrim so it doesn't
  collide with dark cutouts.

## Accessibility & SEO
- The canvas is decorative: `aria-hidden` on the WebGL container.
- Real, crawlable DOM for the wordmark, tagline, and email form (not drawn in WebGL).
- `prefers-reduced-motion`: skip the drift/inertia idle motion and the drop-in animation; show a
  static first frame + the form.
- Page `<title>` / meta describe the product for sharing.

## Testing
- E2E (`tests/e2e/landing.spec.ts`): landing renders wordmark + email field; the loader clears;
  submitting a valid email shows the success state; `/wall` still renders the seed objects.
- Unit: email validation + `WaitlistRepository.add` (dedupe, lowercasing) against the in-memory impl.
- Full suite (`npm run test:e2e`) green on chromium + mobile.

## Deployment
- Vercel, per `docs/deployment.md`.
- Prod env: `DATABASE_URL` (Neon) required for real waitlist capture; `WISHLIST_MODE` unset (live).
- Verify: landing loads, an email submit persists a row, `/wall` and `/studio` still work.

## Risks
- **R3F in Next 16 SSR** → mitigated by `ssr:false` dynamic import (proven pattern).
- **Transparent-PNG texture memory on mobile** → few unique textures + DPR clamp.
- **Bundle size** (three.js ~240kB gz) → isolated to the landing route via dynamic import.
- **Empty DB / missing `DATABASE_URL` in prod** → the mock/in-memory repo must fail loudly, not
  silently drop signups; document the env requirement in the release checklist.
