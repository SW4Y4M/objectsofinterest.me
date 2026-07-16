# Infinite-Canvas Waitlist Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a waitlist-first landing at `/` whose hero is a truly-infinite WebGL canvas of object cutouts with a counting loading state and a "Build your objectsofinterest" email capture, while preserving the existing wall (moved to `/wall`) and Studio.

**Architecture:** `/` renders a server shell that mounts a `"use client"` React Three Fiber canvas via `next/dynamic` with `{ ssr: false }`, overlaid with a DOM waitlist panel and a self-contained loading counter. Emails persist through a new `WaitlistRepository` that mirrors the app's existing repository/mock-mode factory pattern (in-memory for `WISHLIST_MODE=mock`, Drizzle/Neon in production). The canvas engine is a direct port of the validated prototype (React Three Fiber recreation of the MIT-licensed Codrops "Infinite Canvas", https://github.com/edoardolunardi/infinite-canvas).

**Tech Stack:** Next.js 16 (App Router, RSC + server actions), React 19, Three.js + `@react-three/fiber` + `@react-three/drei`, Drizzle + Neon Postgres, Zod, Vitest + Testing Library, Playwright.

## Global Constraints

- Node ≥ 20. Package manager: npm. Do not change `playwright.config.ts` boot (`WISHLIST_MODE=mock`, `OWNER_PASSCODE=12345`, `STUDIO_COOKIE_SECRET=12345`, port 4546, projects `chromium` + `mobile`).
- Mode switch is `getWishlistMode()` from `@/lib/config/wishlistMode` returning `"live" | "mock"`. Every repository factory switches on it (see `createObjectRepository()` in `src/lib/repositories/objects.ts`).
- Server actions use the `useActionState` shape already in the codebase: `{ status: "idle" | "success" | "error"; message: string | null; fieldErrors: Record<string, string> }` (see `src/app/studio/actionState.ts`).
- Vitest runs `tests/**/*.test.ts(x)` and excludes `tests/e2e/**`; `tests/setup.ts` mocks `next/image`. Playwright runs `tests/e2e/**`.
- Palette (verbatim): wall `#f8f7f4`, ink `#1c1b19`, muted `#6f6a62`, line `#ddd7cd`, label `#fffdfa`.
- Copy (verbatim): heading `Build your objectsofinterest`; tagline `A quiet wall for the objects you want. Join the waitlist.`; wordmark `Objects of Interest`; hint `drag to explore · scroll to zoom`; submit button `Join`.
- The WebGL canvas is decorative: `aria-hidden`. All real text (wordmark, tagline, email form) lives in the DOM, never in WebGL.
- Reduced motion (`prefers-reduced-motion: reduce`): skip idle drift/inertia and the loader drop-in; show a static first frame + the form.

---

## File Structure

- `src/app/page.tsx` — **Modify.** Replace the wall with the landing shell.
- `src/app/wall/page.tsx` — **Create.** The current public wall, moved verbatim.
- `src/lib/landing/media.ts` — **Create.** Static manifest of the curated cutout set.
- `public/landing/*.png` — **Create.** ~16 transparent object-cutout PNGs (the prototype's curated set).
- `src/components/landing/infiniteCanvas/constants.ts` — **Create.** Engine tuning constants.
- `src/components/landing/infiniteCanvas/types.ts` — **Create.** Engine types.
- `src/components/landing/infiniteCanvas/chunkPlanes.ts` — **Create.** Seeded plane placement (centered, 9/chunk).
- `src/components/landing/infiniteCanvas/textureManager.ts` — **Create.** Cached texture loader.
- `src/components/landing/infiniteCanvas/scene.tsx` — **Create.** Canvas + controller + chunk + plane (ported).
- `src/components/landing/InfiniteCanvasLanding.tsx` — **Create.** Client wrapper (dynamic import target).
- `src/components/landing/LoadingCounter.tsx` — **Create.** Counting loader (no drei `useProgress`).
- `src/components/landing/WaitlistPanel.tsx` — **Create.** Wordmark + hint + email form.
- `src/app/globals.css` — **Modify.** Add the `drop-in` keyframe.
- `src/db/schema.ts` — **Modify.** Add `waitlistSignups` table.
- `src/lib/repositories/waitlist.ts` — **Create.** `WaitlistRepository` interface + in-memory + Drizzle impls + factory.
- `src/app/waitlist/actions.ts` — **Create.** `joinWaitlist` server action + `WaitlistActionState`.
- `tests/landing/media.test.ts`, `tests/landing/waitlist.test.ts`, `tests/components/WaitlistPanel.test.tsx`, `tests/components/LoadingCounter.test.tsx` — **Create.** Unit/component tests.
- `tests/e2e/landing.spec.ts` — **Create.** Landing + waitlist e2e.
- `docs/deployment.md` — **Modify.** Waitlist env + release checklist.

The proven prototype source (this session) lives at:
`/private/tmp/.../scratchpad/infinite-canvas/src/{infinite-canvas,loader,frame}` with `public/products/*.png` and `src/artworks/manifest.json`. Tasks below copy the cutout PNGs and port the engine from it; where the prototype is unavailable, the engine is re-derivable from the MIT repo above plus the adaptations listed in Task 5.

---

### Task 1: Move the public wall to `/wall`

**Files:**
- Create: `src/app/wall/page.tsx`
- Test: `tests/e2e/landing.spec.ts` (the `/wall` case; created here, extended in Task 9)

**Interfaces:**
- Consumes: `ObjectWallPage` from `@/components/wall/ObjectWallPage`, `getWishlistMode`, `createObjectRepository` (all existing).
- Produces: route `/wall` rendering the finite/ordered wall.

- [ ] **Step 1: Write the failing e2e test**

Create `tests/e2e/landing.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("the wall lives at /wall and still renders seed objects", async ({ page }) => {
  await page.goto("/wall");
  await expect(page.getByRole("heading", { name: /Objects of Interest/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show details for Brass oil burner" })).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/landing.spec.ts`
Expected: FAIL — `/wall` 404s (route does not exist yet).

- [ ] **Step 3: Create the `/wall` route**

Create `src/app/wall/page.tsx` (identical body to today's `src/app/page.tsx`):

```tsx
import { ObjectWallPage } from "@/components/wall/ObjectWallPage";
import { getWishlistMode } from "@/lib/config/wishlistMode";
import { createObjectRepository } from "@/lib/repositories/objects";

export default async function WallPage() {
  const repository = createObjectRepository();
  const objects = await repository.listPublic();
  const mode = getWishlistMode();

  return <ObjectWallPage objects={objects} showDebugOutlines={mode === "mock"} />;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx playwright test tests/e2e/landing.spec.ts`
Expected: PASS on `chromium` and `mobile`.

- [ ] **Step 5: Commit**

```bash
git add src/app/wall/page.tsx tests/e2e/landing.spec.ts
git commit -m "feat: serve the public wall at /wall"
```

---

### Task 2: Add React Three Fiber dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `three`, `@react-three/fiber`, `@react-three/drei` runtime deps; `@types/three` dev dep.

- [ ] **Step 1: Install exact versions proven in the prototype**

Run:
```bash
npm install three@0.182.0 @react-three/fiber@9.4.2 @react-three/drei@10.7.7
npm install -D @types/three@0.182.0
```

- [ ] **Step 2: Verify typecheck and build still pass**

Run: `npm run typecheck && npm run build`
Expected: both exit 0 (no usages yet; this only proves the install is clean).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-three-fiber for the landing canvas"
```

---

### Task 3: Curated cutout set + media manifest

**Files:**
- Create: `public/landing/*.png` (16 transparent cutouts)
- Create: `src/lib/landing/media.ts`
- Test: `tests/landing/media.test.ts`

**Interfaces:**
- Produces: `export type LandingMedia = { url: string; width: number; height: number }` and `export const LANDING_MEDIA: LandingMedia[]`.

- [ ] **Step 1: Add the cutout images**

Copy the prototype's curated set into `public/landing/` (16 files): `book.png camera.png chair.png coat.png glasses.png headphones.png lamp.png lantern.png mug.png notebook.png pen.png pump.png sneaker.png sunglasses.png tea.png watch.png`. Each is a transparent-background product PNG. (Prototype source: `scratchpad/infinite-canvas/public/products/`. If unavailable, supply any 16 transparent object cutouts and update the dimensions below to match with `sips -g pixelWidth -g pixelHeight <file>`.)

- [ ] **Step 2: Write the failing test**

Create `tests/landing/media.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LANDING_MEDIA } from "@/lib/landing/media";

describe("LANDING_MEDIA", () => {
  it("has at least a dozen cutouts under /landing with positive dimensions", () => {
    expect(LANDING_MEDIA.length).toBeGreaterThanOrEqual(12);
    for (const m of LANDING_MEDIA) {
      expect(m.url.startsWith("/landing/")).toBe(true);
      expect(m.width).toBeGreaterThan(0);
      expect(m.height).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run tests/landing/media.test.ts`
Expected: FAIL — cannot resolve `@/lib/landing/media`.

- [ ] **Step 4: Create the manifest**

Create `src/lib/landing/media.ts`:

```ts
export type LandingMedia = { url: string; width: number; height: number };

export const LANDING_MEDIA: LandingMedia[] = [
  { url: "/landing/book.png", width: 900, height: 630 },
  { url: "/landing/camera.png", width: 1600, height: 1200 },
  { url: "/landing/chair.png", width: 2028, height: 1604 },
  { url: "/landing/coat.png", width: 732, height: 1106 },
  { url: "/landing/glasses.png", width: 3333, height: 891 },
  { url: "/landing/headphones.png", width: 1005, height: 1005 },
  { url: "/landing/lamp.png", width: 638, height: 1024 },
  { url: "/landing/lantern.png", width: 1222, height: 2385 },
  { url: "/landing/mug.png", width: 447, height: 600 },
  { url: "/landing/notebook.png", width: 1350, height: 821 },
  { url: "/landing/pen.png", width: 890, height: 364 },
  { url: "/landing/pump.png", width: 696, height: 835 },
  { url: "/landing/sneaker.png", width: 1200, height: 1200 },
  { url: "/landing/sunglasses.png", width: 1300, height: 731 },
  { url: "/landing/tea.png", width: 600, height: 473 },
  { url: "/landing/watch.png", width: 2288, height: 2288 }
];
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run tests/landing/media.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/landing src/lib/landing/media.ts tests/landing/media.test.ts
git commit -m "feat: add curated landing cutout set and manifest"
```

---

### Task 4: Waitlist storage (schema + repository)

**Files:**
- Modify: `src/db/schema.ts`
- Create: `src/lib/repositories/waitlist.ts`
- Test: `tests/landing/waitlist.test.ts`
- Migration: generated SQL under `drizzle/`

**Interfaces:**
- Produces:
  - `waitlistSignups` Drizzle table (`id` serial PK, `email` text unique not null, `createdAt` timestamptz default now).
  - `export type WaitlistRepository = { add(email: string): Promise<{ created: boolean }> }`
  - `export function createWaitlistRepository(): WaitlistRepository`
  - `export class InMemoryWaitlistRepository implements WaitlistRepository` (exported for tests).
- Consumes: `getWishlistMode` from `@/lib/config/wishlistMode`; `getDatabase` from `@/lib/repositories/objects` (existing export) or `@/db/client` — use whichever the object repo uses.

- [ ] **Step 1: Write the failing test**

Create `tests/landing/waitlist.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { InMemoryWaitlistRepository } from "@/lib/repositories/waitlist";

describe("InMemoryWaitlistRepository", () => {
  it("stores an email and reports it as created", async () => {
    const repo = new InMemoryWaitlistRepository();
    const result = await repo.add("Person@Example.com");
    expect(result).toEqual({ created: true });
  });

  it("lowercases and de-duplicates the same email", async () => {
    const repo = new InMemoryWaitlistRepository();
    await repo.add("Person@Example.com");
    const again = await repo.add("person@example.com");
    expect(again).toEqual({ created: false });
    expect(repo.emails()).toEqual(["person@example.com"]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/landing/waitlist.test.ts`
Expected: FAIL — cannot resolve `@/lib/repositories/waitlist`.

- [ ] **Step 3: Add the table to the schema**

In `src/db/schema.ts`, add (using the same `pgTable`/column imports already in that file):

```ts
export const waitlistSignups = pgTable("waitlist_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
```

- [ ] **Step 4: Create the repository**

Create `src/lib/repositories/waitlist.ts`:

```ts
import { eq } from "drizzle-orm";
import { getWishlistMode } from "@/lib/config/wishlistMode";
import { getDatabase } from "@/lib/repositories/objects";
import { waitlistSignups } from "@/db/schema";

export type WaitlistRepository = {
  add(email: string): Promise<{ created: boolean }>;
};

const normalize = (email: string) => email.trim().toLowerCase();

export class InMemoryWaitlistRepository implements WaitlistRepository {
  private store = new Set<string>();

  async add(email: string) {
    const key = normalize(email);
    if (this.store.has(key)) return { created: false };
    this.store.add(key);
    return { created: true };
  }

  emails() {
    return [...this.store];
  }
}

class DrizzleWaitlistRepository implements WaitlistRepository {
  constructor(private db: NonNullable<ReturnType<typeof getDatabase>>) {}

  async add(email: string) {
    const key = normalize(email);
    const existing = await this.db
      .select({ id: waitlistSignups.id })
      .from(waitlistSignups)
      .where(eq(waitlistSignups.email, key))
      .limit(1);
    if (existing.length > 0) return { created: false };
    await this.db.insert(waitlistSignups).values({ email: key });
    return { created: true };
  }
}

// Module singleton so mock-mode signups persist for the server's lifetime
// (matches the object mock repository behaviour).
let memoryWaitlist: InMemoryWaitlistRepository | null = null;

export function createWaitlistRepository(): WaitlistRepository {
  if (getWishlistMode() === "mock") {
    if (!memoryWaitlist) memoryWaitlist = new InMemoryWaitlistRepository();
    return memoryWaitlist;
  }
  const db = getDatabase();
  if (db) return new DrizzleWaitlistRepository(db);
  // No DATABASE_URL in a live deploy is a misconfiguration — fail loudly rather
  // than silently dropping signups.
  throw new Error("Waitlist requires DATABASE_URL in live mode");
}
```

> If `getDatabase` is not exported from `@/lib/repositories/objects`, export it there (one-line `export`) or import the Drizzle client from wherever the object repository obtains it — do not create a second client.

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run tests/landing/waitlist.test.ts`
Expected: PASS.

- [ ] **Step 6: Generate the migration**

Run: `npm run db:generate`
Expected: a new SQL file appears under `drizzle/` creating `waitlist_signups`. Do not run `db:migrate` locally (mock mode needs no DB).

- [ ] **Step 7: Commit**

```bash
git add src/db/schema.ts src/lib/repositories/waitlist.ts tests/landing/waitlist.test.ts drizzle/
git commit -m "feat: add waitlist signups table and repository"
```

---

### Task 5: Port the infinite-canvas engine

**Files:**
- Create: `src/components/landing/infiniteCanvas/constants.ts`
- Create: `src/components/landing/infiniteCanvas/types.ts`
- Create: `src/components/landing/infiniteCanvas/chunkPlanes.ts`
- Create: `src/components/landing/infiniteCanvas/textureManager.ts`
- Create: `src/components/landing/infiniteCanvas/scene.tsx`
- Create: `src/components/landing/InfiniteCanvasLanding.tsx`

**Interfaces:**
- Consumes: `LANDING_MEDIA` from `@/lib/landing/media`.
- Produces: `export function InfiniteCanvasLanding(): JSX.Element` — a `"use client"` component rendering the full-viewport canvas.

The engine is a **direct port of the validated prototype** (MIT Codrops recreation). Port these four small files verbatim and `scene.tsx` with the adaptations below.

- [ ] **Step 1: Create `constants.ts`**

```ts
export const CHUNK_SIZE = 110;
export const RENDER_DISTANCE = 2;
export const CHUNK_FADE_MARGIN = 1;
export const MAX_VELOCITY = 3.2;
export const DEPTH_FADE_START = 140;
export const DEPTH_FADE_END = 260;
export const INVIS_THRESHOLD = 0.01;
export const KEYBOARD_SPEED = 0.18;
export const VELOCITY_LERP = 0.16;
export const VELOCITY_DECAY = 0.9;
export const INITIAL_CAMERA_Z = 50;

export type ChunkOffset = { dx: number; dy: number; dz: number; dist: number };

export const CHUNK_OFFSETS: ChunkOffset[] = (() => {
  const maxDist = RENDER_DISTANCE + CHUNK_FADE_MARGIN;
  const offsets: ChunkOffset[] = [];
  for (let dx = -maxDist; dx <= maxDist; dx++)
    for (let dy = -maxDist; dy <= maxDist; dy++)
      for (let dz = -maxDist; dz <= maxDist; dz++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
        if (dist > maxDist) continue;
        offsets.push({ dx, dy, dz, dist });
      }
  return offsets;
})();
```

- [ ] **Step 2: Create `types.ts`**

```ts
import type * as THREE from "three";

export type PlaneData = {
  id: string;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  mediaIndex: number;
};

export type ChunkData = { key: string; cx: number; cy: number; cz: number };

export type CameraGridState = { cx: number; cy: number; cz: number; camZ: number };
```

- [ ] **Step 3: Create `chunkPlanes.ts` (centered placement, 9 per chunk)**

```ts
import * as THREE from "three";
import { CHUNK_SIZE } from "./constants";
import type { PlaneData } from "./types";

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const cache = new Map<string, PlaneData[]>();
const MAX_CACHE = 256;

function generate(cx: number, cy: number, cz: number): PlaneData[] {
  const planes: PlaneData[] = [];
  const seed = hashString(`${cx},${cy},${cz}`);
  for (let i = 0; i < 9; i++) {
    const s = seed + i * 1000;
    const r = (n: number) => seededRandom(s + n);
    const size = 12 + r(4) * 8;
    planes.push({
      id: `${cx}-${cy}-${cz}-${i}`,
      position: new THREE.Vector3(
        cx * CHUNK_SIZE + (r(0) - 0.5) * CHUNK_SIZE,
        cy * CHUNK_SIZE + (r(1) - 0.5) * CHUNK_SIZE,
        cz * CHUNK_SIZE + (r(2) - 0.5) * CHUNK_SIZE
      ),
      scale: new THREE.Vector3(size, size, 1),
      mediaIndex: Math.floor(r(5) * 1_000_000)
    });
  }
  return planes;
}

export function getChunkPlanes(cx: number, cy: number, cz: number): PlaneData[] {
  const key = `${cx},${cy},${cz}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const planes = generate(cx, cy, cz);
  cache.set(key, planes);
  while (cache.size > MAX_CACHE) {
    const first = cache.keys().next().value as string | undefined;
    if (!first) break;
    cache.delete(first);
  }
  return planes;
}
```

- [ ] **Step 4: Create `textureManager.ts`**

```ts
import * as THREE from "three";

const textureCache = new Map<string, THREE.Texture>();
const loadCallbacks = new Map<string, Set<(t: THREE.Texture) => void>>();
const loader = new THREE.TextureLoader();

const isLoaded = (tex: THREE.Texture) => {
  const img = tex.image as HTMLImageElement | undefined;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

export function getTexture(url: string, onLoad?: (t: THREE.Texture) => void): THREE.Texture {
  const existing = textureCache.get(url);
  if (existing) {
    if (onLoad) (isLoaded(existing) ? onLoad(existing) : loadCallbacks.get(url)?.add(onLoad));
    return existing;
  }
  const callbacks = new Set<(t: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(url, callbacks);
  const texture = loader.load(url, (tex) => {
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    loadCallbacks.get(url)?.forEach((cb) => cb(tex));
    loadCallbacks.delete(url);
  });
  textureCache.set(url, texture);
  return texture;
}
```

- [ ] **Step 5: Create `scene.tsx` (port from prototype / MIT repo)**

Port `scene.tsx` from the validated prototype (`scratchpad/infinite-canvas/src/infinite-canvas/scene.tsx`), which is itself the MIT Codrops engine, applying exactly these adaptations:
- Import constants from `./constants`, types from `./types`, `getChunkPlanes` from `./chunkPlanes`, `getTexture` from `./textureManager`.
- `getTexture` takes a **url string** (Task 4 signature), so call `getTexture(LANDING_MEDIA[plane.mediaIndex % LANDING_MEDIA.length].url, cb)`; read plane display aspect from `LANDING_MEDIA[...]`'s `width/height`.
- **Remove** the drei `useProgress` / `onTextureProgress` reporting (the dev-only infinite-loop source). The scene takes only `media: LandingMedia[]`.
- `meshBasicMaterial` keeps `transparent` + `side={THREE.DoubleSide}` so cutout alpha composites over the wall.
- `<Canvas dpr={Math.min(window.devicePixelRatio || 1, isTouch ? 1.25 : 1.5)} flat gl={{ antialias: false, powerPreference: "high-performance" }}>` with `<color attach="background" args={["#f8f7f4"]} />` and `<fog attach="fog" args={["#f8f7f4", 120, 320]} />`.
- Keep the frame-based velocity/lerp controller, the 3×3×3 chunk streaming, and per-plane distance-fade exactly as in the prototype.
- Export `export function InfiniteCanvasScene({ media }: { media: LandingMedia[] }): JSX.Element`.

The full prototype `scene.tsx` is the source of truth; do not re-derive its physics from scratch.

- [ ] **Step 6: Create the client wrapper**

Create `src/components/landing/InfiniteCanvasLanding.tsx`:

```tsx
"use client";

import { LANDING_MEDIA } from "@/lib/landing/media";
import { InfiniteCanvasScene } from "./infiniteCanvas/scene";

export function InfiniteCanvasLanding() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "#f8f7f4" }}>
      <InfiniteCanvasScene media={LANDING_MEDIA} />
    </div>
  );
}
```

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: exit 0 (the component is not yet mounted anywhere; this proves the engine compiles).

- [ ] **Step 8: Commit**

```bash
git add src/components/landing/infiniteCanvas src/components/landing/InfiniteCanvasLanding.tsx
git commit -m "feat: port infinite-canvas engine for the landing"
```

---

### Task 6: Loading counter

**Files:**
- Create: `src/components/landing/LoadingCounter.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/components/LoadingCounter.test.tsx`

**Interfaces:**
- Consumes: `LandingMedia` from `@/lib/landing/media`.
- Produces: `export function LoadingCounter({ media }: { media: LandingMedia[] }): JSX.Element | null`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/LoadingCounter.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingCounter } from "@/components/landing/LoadingCounter";

const media = [
  { url: "/landing/a.png", width: 10, height: 10 },
  { url: "/landing/b.png", width: 10, height: 10 }
];

describe("LoadingCounter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts up to the media length then unmounts", () => {
    render(<LoadingCounter media={media} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(110));
    expect(screen.getByText("1")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(110));
    expect(screen.getByText("2")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000)); // fade delay + fade
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/components/LoadingCounter.test.tsx`
Expected: FAIL — cannot resolve `@/components/landing/LoadingCounter`.

- [ ] **Step 3: Add the keyframe**

Append to `src/app/globals.css`:

```css
@keyframes drop-in {
  from { opacity: 0; transform: translateY(-14px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

- [ ] **Step 4: Create the component**

Create `src/components/landing/LoadingCounter.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { LandingMedia } from "@/lib/landing/media";

function scatter(i: number) {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12543.633;
  const fx = a - Math.floor(a);
  const fy = b - Math.floor(b);
  return { x: 5 + fx * 82, y: 8 + fy * 74, rot: (fx - 0.5) * 12, w: 72 + fy * 70 };
}

export function LoadingCounter({ media }: { media: LandingMedia[] }) {
  const total = media.length;
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const fading = count >= total;

  useEffect(() => {
    for (const m of media) {
      const img = new Image();
      img.src = m.url;
    }
  }, [media]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= total) clearInterval(id);
    }, 110);
    return () => clearInterval(id);
  }, [total]);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [fading]);

  if (gone) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50, background: "#f8f7f4",
        opacity: fading ? 0 : 1, transition: "opacity 650ms ease",
        pointerEvents: fading ? "none" : "auto", overflow: "hidden"
      }}
    >
      {media.slice(0, count).map((m, i) => {
        const p = scatter(i);
        return (
          <img
            key={m.url} src={m.url} alt=""
            style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.w, height: "auto",
              transform: `rotate(${p.rot}deg)`, opacity: 0.9,
              animation: "drop-in 460ms cubic-bezier(0.2,0.7,0.2,1) both", pointerEvents: "none"
            }}
          />
        );
      })}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "clamp(72px,13vw,176px)", fontWeight: 600, lineHeight: 1, color: "#1c1b19", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
            {count}
          </div>
          <div style={{ marginTop: 14, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6f6a62" }}>
            objects of interest
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run tests/components/LoadingCounter.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/LoadingCounter.tsx src/app/globals.css tests/components/LoadingCounter.test.tsx
git commit -m "feat: add counting loading state for the landing"
```

---

### Task 7: Waitlist action + panel

**Files:**
- Create: `src/app/waitlist/actions.ts`
- Create: `src/components/landing/WaitlistPanel.tsx`
- Test: `tests/landing/waitlist-action.test.ts`, `tests/components/WaitlistPanel.test.tsx`

**Interfaces:**
- Consumes: `createWaitlistRepository` (Task 4); `requireStudioSession` NOT used here (public action).
- Produces:
  - `export type WaitlistActionState = { status: "idle" | "success" | "error"; message: string | null; fieldErrors: Record<string, string> }`
  - `export const emptyWaitlistState: WaitlistActionState`
  - `export async function joinWaitlist(prev: WaitlistActionState, formData: FormData): Promise<WaitlistActionState>`
  - `export function WaitlistPanel(): JSX.Element`

- [ ] **Step 1: Write the failing action test**

Create `tests/landing/waitlist-action.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { emptyWaitlistState, joinWaitlist } from "@/app/waitlist/actions";

function form(email: string) {
  const fd = new FormData();
  fd.set("email", email);
  return fd;
}

describe("joinWaitlist", () => {
  it("rejects an invalid email with a field error", async () => {
    const result = await joinWaitlist(emptyWaitlistState, form("not-an-email"));
    expect(result.status).toBe("error");
    expect(result.fieldErrors.email).toBeTruthy();
  });

  it("accepts a valid email", async () => {
    const result = await joinWaitlist(emptyWaitlistState, form("a@b.com"));
    expect(result.status).toBe("success");
    expect(result.message).toMatch(/list/i);
  });
});
```

> This test runs under `WISHLIST_MODE` unset. Add `WISHLIST_MODE=mock` to the vitest env if the action hits `createWaitlistRepository()` in live mode: set it in `tests/setup.ts` via `process.env.WISHLIST_MODE ??= "mock"`.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/landing/waitlist-action.test.ts`
Expected: FAIL — cannot resolve `@/app/waitlist/actions`.

- [ ] **Step 3: Create the action**

Create `src/app/waitlist/actions.ts`:

```ts
"use server";

import { z } from "zod";
import { createWaitlistRepository } from "@/lib/repositories/waitlist";

export type WaitlistActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const emptyWaitlistState: WaitlistActionState = { status: "idle", message: null, fieldErrors: {} };

const schema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

export async function joinWaitlist(_prev: WaitlistActionState, formData: FormData): Promise<WaitlistActionState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) {
    return { status: "error", message: "Check the highlighted field.", fieldErrors: { email: parsed.error.issues[0]?.message ?? "Invalid email." } };
  }
  await createWaitlistRepository().add(parsed.data.email);
  return { status: "success", message: "You're on the list.", fieldErrors: {} };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run tests/landing/waitlist-action.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing panel test**

Create `tests/components/WaitlistPanel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaitlistPanel } from "@/components/landing/WaitlistPanel";

describe("WaitlistPanel", () => {
  it("renders the wordmark, heading, and email capture", () => {
    render(<WaitlistPanel />);
    expect(screen.getByText("Objects of Interest")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build your objectsofinterest" })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run tests/components/WaitlistPanel.test.tsx`
Expected: FAIL — cannot resolve `@/components/landing/WaitlistPanel`.

- [ ] **Step 7: Create the panel**

Create `src/components/landing/WaitlistPanel.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { emptyWaitlistState, joinWaitlist } from "@/app/waitlist/actions";

export function WaitlistPanel() {
  const [state, action, pending] = useActionState(joinWaitlist, emptyWaitlistState);
  const emailError = state.fieldErrors.email;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10, color: "#1c1b19" }}>
      <div style={{ position: "absolute", top: 28, left: 32, fontSize: 15, fontWeight: 500 }}>Objects of Interest</div>
      <div style={{ position: "absolute", top: 30, right: 32, fontSize: 12, color: "#6f6a62", background: "rgba(248,247,244,0.6)", padding: "2px 8px", borderRadius: 2 }}>
        drag to explore · scroll to zoom
      </div>
      <div
        style={{
          position: "absolute", left: "50%", bottom: 40, transform: "translateX(-50%)", pointerEvents: "auto",
          width: "min(440px, calc(100vw - 40px))", background: "#fffdfa", border: "1px solid #ddd7cd",
          boxShadow: "0 18px 44px rgba(28,27,25,0.14)", padding: "22px 24px", textAlign: "center"
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em" }}>Build your objectsofinterest</h1>
        <p style={{ margin: "8px 0 18px", fontSize: 13.5, lineHeight: 1.5, color: "#6f6a62" }}>
          A quiet wall for the objects you want. Join the waitlist.
        </p>
        {state.status === "success" ? (
          <p role="status" style={{ fontSize: 14 }}>{state.message}</p>
        ) : (
          <form action={action} style={{ display: "flex", gap: 8 }}>
            <label htmlFor="waitlist-email" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Email address
            </label>
            <input
              id="waitlist-email" name="email" type="email" placeholder="you@email.com"
              aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "waitlist-email-error" : undefined}
              style={{ flex: 1, border: "1px solid #ddd7cd", background: "#f8f7f4", padding: "10px 12px", fontSize: 14, color: "#1c1b19", outline: "none" }}
            />
            <button type="submit" disabled={pending} style={{ background: "#1c1b19", color: "#f8f7f4", border: "none", padding: "10px 18px", fontSize: 14, cursor: "pointer" }}>
              Join
            </button>
          </form>
        )}
        {emailError ? <p id="waitlist-email-error" style={{ marginTop: 8, fontSize: 12, color: "#6f6a62" }}>{emailError}</p> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run tests/components/WaitlistPanel.test.tsx`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/app/waitlist/actions.ts src/components/landing/WaitlistPanel.tsx tests/landing/waitlist-action.test.ts tests/components/WaitlistPanel.test.tsx
git commit -m "feat: add waitlist server action and capture panel"
```

---

### Task 8: Assemble the landing at `/`

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/e2e/landing.spec.ts` (extend)

**Interfaces:**
- Consumes: `InfiniteCanvasLanding`, `WaitlistPanel`, `LoadingCounter`, `LANDING_MEDIA`.
- Produces: `/` renders the landing.

- [ ] **Step 1: Extend the e2e test**

Append to `tests/e2e/landing.spec.ts`:

```ts
test("the landing shows the waitlist and accepts an email", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Objects of Interest")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build your objectsofinterest" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible(); // WebGL hero mounted
  await page.getByLabel(/email/i).fill("visitor@example.com");
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText("You're on the list.")).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "accepts an email"`
Expected: FAIL — `/` still renders the wall (no email field / canvas).

- [ ] **Step 3: Replace the page**

Replace `src/app/page.tsx`:

```tsx
import dynamic from "next/dynamic";
import { LoadingCounter } from "@/components/landing/LoadingCounter";
import { WaitlistPanel } from "@/components/landing/WaitlistPanel";
import { LANDING_MEDIA } from "@/lib/landing/media";

const InfiniteCanvasLanding = dynamic(
  () => import("@/components/landing/InfiniteCanvasLanding").then((m) => m.InfiniteCanvasLanding),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <main>
      <InfiniteCanvasLanding />
      <WaitlistPanel />
      <LoadingCounter media={LANDING_MEDIA} />
    </main>
  );
}
```

> `next/dynamic` with `{ ssr: false }` in a Server Component is allowed in Next 16; if the build objects, add `"use client"` to a thin wrapper component that holds the three children and render that from `page.tsx`.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx playwright test tests/e2e/landing.spec.ts`
Expected: PASS on `chromium` and `mobile` (both the `/wall` and landing cases).

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx tests/e2e/landing.spec.ts
git commit -m "feat: make the infinite-canvas waitlist landing the home page"
```

---

### Task 9: Reduced motion, full verification, deploy checklist

**Files:**
- Modify: `src/components/landing/InfiniteCanvasLanding.tsx` (reduced-motion static frame)
- Modify: `src/components/landing/LoadingCounter.tsx` (respect reduced motion)
- Modify: `docs/deployment.md`

- [ ] **Step 1: Respect `prefers-reduced-motion` in the loader**

In `LoadingCounter.tsx`, before the count interval effect, short-circuit when reduced motion is preferred so the loader clears immediately:

```tsx
useEffect(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setCount(total);
    return;
  }
  let i = 0;
  const id = setInterval(() => {
    i += 1;
    setCount(i);
    if (i >= total) clearInterval(id);
  }, 110);
  return () => clearInterval(id);
}, [total]);
```

- [ ] **Step 2: Freeze idle drift under reduced motion in the scene**

In `scene.tsx`'s controller `useFrame`, guard the idle drift so it stays at zero when `window.matchMedia("(prefers-reduced-motion: reduce)").matches` is true (drag/scroll still work, but the wall does not auto-drift). Read the flag once into a ref on mount.

- [ ] **Step 3: Run the full unit + build suite**

Run: `npm run verify`
Expected: `typecheck` clean, all vitest tests pass (including the new landing/component tests), `build` succeeds.

- [ ] **Step 4: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: all specs pass on `chromium` + `mobile`, including `landing.spec.ts` and the existing suite (studio, wall).

- [ ] **Step 5: Update the deployment doc**

Append a "Waitlist landing" section to `docs/deployment.md`:

```markdown
## Waitlist landing

- `/` is the pre-launch infinite-canvas waitlist landing; the object wall is at `/wall`.
- Required env in production (live mode): `DATABASE_URL` (Neon) — the waitlist repository
  throws if it is missing, by design, so signups are never silently dropped.
- Run `npm run db:migrate` after deploy (or in the build step) to create `waitlist_signups`.
- Release check: `/` loads and shows the counter → canvas → waitlist card; submitting an email
  returns "You're on the list." and inserts one row into `waitlist_signups`; `/wall` and
  `/studio` still work.
```

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/InfiniteCanvasLanding.tsx src/components/landing/LoadingCounter.tsx src/components/landing/infiniteCanvas/scene.tsx docs/deployment.md
git commit -m "feat: reduced-motion support and waitlist deploy checklist"
```

---

## Self-Review

**Spec coverage:**
- Landing at `/` (infinite canvas + counter + waitlist) → Tasks 5, 6, 7, 8. ✓
- Wall moved to `/wall` → Task 1. ✓
- Loading counter → Task 6. ✓
- Waitlist capture + easiest owned storage → Tasks 4, 7. ✓
- Prototype learnings (centered placement, 9/chunk, brand font via globals, `#f8f7f4` bg/fog, `transparent` material, DPR clamp, no `useProgress`, hint scrim) → Tasks 5, 6, 7. ✓
- A11y/SEO (aria-hidden canvas, DOM text, reduced motion) → Tasks 5, 7, 9. ✓
- Testing (e2e landing + waitlist, unit storage/validation, component loader/panel) → Tasks 3–9. ✓
- Deployment (Vercel, `DATABASE_URL`, checklist) → Task 9. ✓

**Out-of-scope items correctly excluded:** depth-as-recency, alt grid toggle, real-data feed, referral/broadcast — none appear as tasks. ✓

**Type consistency:** `WaitlistRepository.add(email): Promise<{ created: boolean }>` used identically in Tasks 4 and 7; `WaitlistActionState` shape matches the codebase `useActionState` convention; `LandingMedia` (`{ url, width, height }`) consumed consistently in Tasks 3, 5, 6. ✓

**Known assumptions to verify during execution:** `getDatabase` export location (Task 4 Step 4 note); `next/dynamic ssr:false` in a Server Component (Task 8 Step 3 note); brand font — the app's `globals.css` already sets a system sans on `body`, so the landing inherits it (confirm no monospace override).
