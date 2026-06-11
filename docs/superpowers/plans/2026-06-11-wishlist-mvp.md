# Wishlist MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Wishlist v1 MVP: a polished one-person public object wall with a hidden owner Studio, editorial filters, masonry/grid views, object annotations, and a tested image-processing pipeline.

**Architecture:** Use a Next.js App Router application with shared domain types, server-only repositories, and small UI components for the public wall and Studio. Keep image search, background removal, and object storage behind provider interfaces so local tests use deterministic fakes while production can use configured providers.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS, Drizzle ORM, Postgres/Neon, Vercel Blob-compatible storage, Vitest, Testing Library, Playwright, Zod.

---

## Scope Check

The wishlist spec spans three connected surfaces: public wall, Studio, and image pipeline. They should stay in one plan because every phase depends on the same object model, image status rules, and wall components. Provider-specific production credentials are not required for local completion; the provider adapters must be shaped and tested with fake HTTP clients, and `.env.example` must document the required production variables.

## File Structure

The repository currently contains documentation only. Create a new Next.js app in the repository root.

Primary files and responsibilities:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `postcss.config.mjs`: Tailwind PostCSS integration.
- `tailwind.config.ts`: theme tokens for the white-wall gallery visual language.
- `vitest.config.ts`: unit and component test configuration.
- `playwright.config.ts`: browser test configuration.
- `.env.example`: required runtime configuration.
- `src/app/layout.tsx`: root layout and metadata.
- `src/app/page.tsx`: public wishlist route.
- `src/app/studio/page.tsx`: protected Studio route.
- `src/app/studio/actions.ts`: Studio server actions.
- `src/app/studio/unlock/actions.ts`: Studio unlock server action.
- `src/app/studio/unlock/page.tsx`: passcode gate route.
- `src/app/globals.css`: global visual system.
- `src/components/public/ProfileHeader.tsx`: public identity, tag rail, and view switcher shell.
- `src/components/public/TagRail.tsx`: editorial tag filter rail.
- `src/components/public/ViewSwitcher.tsx`: masonry/grid persisted view control.
- `src/components/wall/ObjectWall.tsx`: shared wall orchestration.
- `src/components/wall/MasonryWall.tsx`: editorial block layout.
- `src/components/wall/StrictGridWall.tsx`: architectural grid layout.
- `src/components/wall/ObjectTile.tsx`: cutout image tile and annotation trigger.
- `src/components/wall/ObjectAnnotation.tsx`: gallery-label metadata.
- `src/components/studio/StudioGate.tsx`: Studio auth helper UI.
- `src/components/studio/StudioToolbar.tsx`: owner-only wall controls.
- `src/components/studio/AddObjectForm.tsx`: add-object flow.
- `src/components/studio/EditObjectForm.tsx`: edit/archive/replace flow.
- `src/components/studio/ImageProcessingState.tsx`: pipeline status UI.
- `src/db/schema.ts`: Drizzle tables and enums.
- `src/db/client.ts`: database client.
- `src/db/migrate.ts`: migration runner.
- `src/db/seed.ts`: seed data.
- `src/lib/domain/wishlistObject.ts`: object types, enums, and validation.
- `src/lib/domain/displaySize.ts`: automatic masonry size selection.
- `src/lib/domain/slug.ts`: slug generation.
- `src/lib/repositories/objects.ts`: object persistence API.
- `src/lib/studio/auth.ts`: passcode and cookie checks.
- `src/lib/image/types.ts`: provider interfaces and pipeline result types.
- `src/lib/image/search.ts`: image-search adapter and candidate scoring.
- `src/lib/image/backgroundRemoval.ts`: background-removal adapter.
- `src/lib/image/storage.ts`: object-storage adapter.
- `src/lib/image/pipeline.ts`: end-to-end image pipeline orchestration.
- `src/lib/format/price.ts`: muted price formatting.
- `tests/domain/wishlistObject.test.ts`: domain validation tests.
- `tests/domain/displaySize.test.ts`: masonry size tests.
- `tests/domain/slug.test.ts`: slug tests.
- `tests/image/pipeline.test.ts`: pipeline success/failure tests.
- `tests/repositories/objects.test.ts`: repository contract tests with a fake store.
- `tests/components/ObjectWall.test.tsx`: wall/filter/view behavior tests.
- `tests/components/ObjectTile.test.tsx`: annotation interaction tests.
- `tests/studio/auth.test.ts`: owner passcode tests.
- `tests/e2e/public-wall.spec.ts`: browser coverage for public wall.
- `tests/e2e/studio.spec.ts`: browser coverage for Studio flow.

---

### Task 1: Scaffold Next.js App And Test Harness

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `tests/setup.ts`

- [ ] **Step 1: Scaffold the app dependencies**

Run:

```bash
npm init -y
npm install next react react-dom drizzle-orm postgres zod clsx lucide-react @vercel/blob
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright @playwright/test drizzle-kit
```

Expected: `package.json` exists and npm installs all dependencies without errors.

- [ ] **Step 2: Configure `package.json` scripts**

Run:

```bash
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.db:generate="drizzle-kit generate"
npm pkg set scripts.db:migrate="tsx src/db/migrate.ts"
npm pkg set scripts.db:seed="tsx src/db/seed.ts"
npm pkg set scripts.verify="npm run typecheck && npm run test && npm run build"
```

Expected: `package.json` keeps npm's installed dependency versions and contains the scripts above.

- [ ] **Step 3: Add base configuration files**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ]
  }
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wall: "#f8f7f4",
        ink: "#1c1b19",
        muted: "#77716a",
        line: "#ded9d0",
        label: "#fffdfa"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        label: "0 12px 36px rgba(28, 27, 25, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } }
  ]
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add environment documentation**

Create `.env.example`:

```bash
DATABASE_URL="postgres://user:password@host:5432/wishlist"
OWNER_PASSCODE="change-this-passcode"
STUDIO_COOKIE_SECRET="change-this-32-character-secret"
BLOB_READ_WRITE_TOKEN=""
IMAGE_SEARCH_PROVIDER="fake"
IMAGE_SEARCH_ENDPOINT=""
IMAGE_SEARCH_API_KEY=""
BACKGROUND_REMOVAL_PROVIDER="fake"
BACKGROUND_REMOVAL_ENDPOINT=""
BACKGROUND_REMOVAL_API_KEY=""
NEXT_PUBLIC_PROFILE_TITLE="@swayam's Objects of Interest"
```

- [ ] **Step 5: Add initial app shell**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "@swayam's Objects of Interest",
  description: "A public wall of objects of interest."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f8f7f4;
  color: #1c1b19;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f8f7f4;
  color: #1c1b19;
  font-family: var(--font-sans);
  letter-spacing: 0;
}

a {
  color: inherit;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

Create `src/app/page.tsx`:

```tsx
export default function PublicPage() {
  return (
    <main className="min-h-screen bg-wall px-6 py-8 text-ink">
      <h1 className="text-xl font-medium">@swayam&apos;s Objects of Interest</h1>
    </main>
  );
}
```

- [ ] **Step 6: Verify the scaffold**

Run:

```bash
npm run typecheck
npm run test
npm run build
```

Expected: all commands pass. `npm run test` may report zero tests in a new Vitest version; if it exits non-zero because no tests exist, add Task 2 tests before rerunning it.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts vitest.config.ts playwright.config.ts .env.example src tests
git commit -m "chore: scaffold wishlist app"
```

Expected: commit succeeds. If this workspace has no git repository, run `git init` first, then repeat the add and commit commands.

---

### Task 2: Domain Model, Validation, Slugs, And Display Sizes

**Files:**
- Create: `src/lib/domain/wishlistObject.ts`
- Create: `src/lib/domain/displaySize.ts`
- Create: `src/lib/domain/slug.ts`
- Create: `src/lib/format/price.ts`
- Create: `tests/domain/wishlistObject.test.ts`
- Create: `tests/domain/displaySize.test.ts`
- Create: `tests/domain/slug.test.ts`

- [ ] **Step 1: Write failing domain validation tests**

Create `tests/domain/wishlistObject.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  EDITORIAL_TAGS,
  createWishlistObjectInputSchema,
  publicWishlistObjectSchema
} from "@/lib/domain/wishlistObject";

describe("wishlist object domain", () => {
  it("keeps the fixed editorial tag set from the spec", () => {
    expect(EDITORIAL_TAGS).toEqual(["Wear", "Work", "Home", "Read", "Make", "Move", "Care", "Collect"]);
  });

  it("requires name and editorial tag for object creation", () => {
    const result = createWishlistObjectInputSchema.safeParse({
      name: "Muji aluminum pen",
      editorialTag: "Work"
    });

    expect(result.success).toBe(true);
  });

  it("rejects visible public objects without a processed image", () => {
    const result = publicWishlistObjectSchema.safeParse({
      id: "obj_1",
      name: "Lamp",
      slug: "lamp",
      imageProcessedUrl: "",
      editorialTag: "Home",
      status: "Visible",
      displaySize: "standard",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    expect(result.success).toBe(false);
  });

  it("allows optional price, source URL, original image, and note", () => {
    const result = createWishlistObjectInputSchema.safeParse({
      name: "Artek stool",
      editorialTag: "Home",
      price: "345",
      currency: "USD",
      sourceUrl: "https://example.com/stool",
      imageUrl: "https://example.com/stool.png",
      note: "Recommended by a designer friend"
    });

    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Write failing slug and display-size tests**

Create `tests/domain/slug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createSlug } from "@/lib/domain/slug";

describe("createSlug", () => {
  it("normalizes object names for URLs", () => {
    expect(createSlug("  Aesop Brass Oil Burner!  ")).toBe("aesop-brass-oil-burner");
  });

  it("falls back when a name has no URL-safe characters", () => {
    expect(createSlug("!!!")).toBe("object");
  });
});
```

Create `tests/domain/displaySize.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { chooseDisplaySize } from "@/lib/domain/displaySize";

describe("chooseDisplaySize", () => {
  it("uses feature size for very recent high-resolution square objects", () => {
    expect(chooseDisplaySize({ width: 1600, height: 1500, index: 0 })).toBe("feature");
  });

  it("uses wide size for wide images", () => {
    expect(chooseDisplaySize({ width: 1800, height: 900, index: 4 })).toBe("wide");
  });

  it("uses tall size for tall images", () => {
    expect(chooseDisplaySize({ width: 800, height: 1600, index: 4 })).toBe("tall");
  });

  it("uses standard size for small or balanced images outside feature positions", () => {
    expect(chooseDisplaySize({ width: 900, height: 900, index: 5 })).toBe("standard");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
npm run test -- tests/domain/wishlistObject.test.ts tests/domain/slug.test.ts tests/domain/displaySize.test.ts
```

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 4: Implement domain modules**

Create `src/lib/domain/wishlistObject.ts`:

```ts
import { z } from "zod";

export const EDITORIAL_TAGS = ["Wear", "Work", "Home", "Read", "Make", "Move", "Care", "Collect"] as const;
export const OBJECT_STATUSES = ["Draft", "Visible", "Archived"] as const;
export const DISPLAY_SIZES = ["standard", "wide", "tall", "feature"] as const;

export type EditorialTag = (typeof EDITORIAL_TAGS)[number];
export type ObjectStatus = (typeof OBJECT_STATUSES)[number];
export type DisplaySize = (typeof DISPLAY_SIZES)[number];

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createWishlistObjectInputSchema = z.object({
  name: z.string().trim().min(1, "Object name is required").max(120),
  editorialTag: z.enum(EDITORIAL_TAGS),
  imageUrl: optionalUrl,
  sourceUrl: optionalUrl,
  price: z.string().trim().max(40).optional().or(z.literal("")),
  currency: z.string().trim().length(3).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal(""))
});

export const publicWishlistObjectSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    imageOriginalUrl: z.string().url().optional().nullable(),
    imageProcessedUrl: z.string().url(),
    sourceUrl: z.string().url().optional().nullable(),
    editorialTag: z.enum(EDITORIAL_TAGS),
    price: z.string().optional().nullable(),
    currency: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    status: z.literal("Visible"),
    displaySize: z.enum(DISPLAY_SIZES),
    sourceImageProvider: z.string().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .refine((object) => object.imageProcessedUrl.length > 0, {
    message: "Visible objects require a processed image URL",
    path: ["imageProcessedUrl"]
  });

export type CreateWishlistObjectInput = z.infer<typeof createWishlistObjectInputSchema>;
export type PublicWishlistObject = z.infer<typeof publicWishlistObjectSchema>;

export type StudioWishlistObject = Omit<PublicWishlistObject, "status" | "imageProcessedUrl"> & {
  status: ObjectStatus;
  imageProcessedUrl: string | null;
};
```

Create `src/lib/domain/slug.ts`:

```ts
export function createSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "object";
}
```

Create `src/lib/domain/displaySize.ts`:

```ts
import type { DisplaySize } from "./wishlistObject";

export type DisplaySizeInput = {
  width: number;
  height: number;
  index: number;
};

export function chooseDisplaySize(input: DisplaySizeInput): DisplaySize {
  const { width, height, index } = input;
  const aspectRatio = width / Math.max(height, 1);
  const highResolution = width >= 1400 && height >= 1200;

  if (index < 2 && highResolution && aspectRatio >= 0.8 && aspectRatio <= 1.3) {
    return "feature";
  }

  if (aspectRatio >= 1.45) {
    return "wide";
  }

  if (aspectRatio <= 0.72) {
    return "tall";
  }

  return "standard";
}
```

Create `src/lib/format/price.ts`:

```ts
export function formatPrice(price?: string | null, currency?: string | null): string | null {
  const trimmedPrice = price?.trim();

  if (!trimmedPrice) {
    return null;
  }

  const trimmedCurrency = currency?.trim().toUpperCase();
  return trimmedCurrency ? `${trimmedCurrency} ${trimmedPrice}` : trimmedPrice;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm run test -- tests/domain/wishlistObject.test.ts tests/domain/slug.test.ts tests/domain/displaySize.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/lib/domain src/lib/format tests/domain
git commit -m "feat: add wishlist domain model"
```

Expected: commit succeeds.

---

### Task 3: Database Schema, Repository Contract, And Seed Data

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `src/db/migrate.ts`
- Create: `src/db/seed.ts`
- Create: `src/lib/repositories/objects.ts`
- Create: `tests/repositories/objects.test.ts`

- [ ] **Step 1: Write failing repository contract tests**

Create `tests/repositories/objects.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { InMemoryObjectRepository } from "@/lib/repositories/objects";

describe("object repository contract", () => {
  it("lists only visible objects publicly, newest first, filtered by tag", async () => {
    const repository = new InMemoryObjectRepository();

    await repository.createForStudio({
      name: "Old chair",
      slug: "old-chair",
      editorialTag: "Home",
      status: "Visible",
      imageOriginalUrl: "https://example.com/chair-original.png",
      imageProcessedUrl: "https://example.com/chair.png",
      displaySize: "standard",
      createdAt: new Date("2026-01-01T00:00:00Z")
    });
    await repository.createForStudio({
      name: "New pen",
      slug: "new-pen",
      editorialTag: "Work",
      status: "Visible",
      imageOriginalUrl: "https://example.com/pen-original.png",
      imageProcessedUrl: "https://example.com/pen.png",
      displaySize: "wide",
      createdAt: new Date("2026-02-01T00:00:00Z")
    });
    await repository.createForStudio({
      name: "Draft lamp",
      slug: "draft-lamp",
      editorialTag: "Home",
      status: "Draft",
      imageOriginalUrl: null,
      imageProcessedUrl: null,
      displaySize: "standard",
      createdAt: new Date("2026-03-01T00:00:00Z")
    });

    const publicObjects = await repository.listPublic({ editorialTag: "Work" });

    expect(publicObjects.map((object) => object.name)).toEqual(["New pen"]);
  });

  it("keeps drafts available in Studio", async () => {
    const repository = new InMemoryObjectRepository();

    await repository.createForStudio({
      name: "Draft lamp",
      slug: "draft-lamp",
      editorialTag: "Home",
      status: "Draft",
      imageOriginalUrl: null,
      imageProcessedUrl: null,
      displaySize: "standard",
      createdAt: new Date("2026-03-01T00:00:00Z")
    });

    const studioObjects = await repository.listStudio();

    expect(studioObjects).toHaveLength(1);
    expect(studioObjects[0].status).toBe("Draft");
  });
});
```

- [ ] **Step 2: Run repository tests to verify they fail**

Run:

```bash
npm run test -- tests/repositories/objects.test.ts
```

Expected: FAIL because `src/lib/repositories/objects.ts` does not exist.

- [ ] **Step 3: Add Drizzle schema and config**

Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});
```

Create `src/db/schema.ts`:

```ts
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const editorialTagEnum = pgEnum("editorial_tag", ["Wear", "Work", "Home", "Read", "Make", "Move", "Care", "Collect"]);
export const objectStatusEnum = pgEnum("object_status", ["Draft", "Visible", "Archived"]);
export const displaySizeEnum = pgEnum("display_size", ["standard", "wide", "tall", "feature"]);

export const wishlistObjects = pgTable("wishlist_objects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageOriginalUrl: text("image_original_url"),
  imageProcessedUrl: text("image_processed_url"),
  sourceUrl: text("source_url"),
  editorialTag: editorialTagEnum("editorial_tag").notNull(),
  price: text("price"),
  currency: text("currency"),
  note: text("note"),
  status: objectStatusEnum("status").notNull().default("Draft"),
  displaySize: displaySizeEnum("display_size").notNull().default("standard"),
  sourceImageProvider: text("source_image_provider"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type WishlistObjectRow = typeof wishlistObjects.$inferSelect;
export type NewWishlistObjectRow = typeof wishlistObjects.$inferInsert;
```

Create `src/db/client.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== "test") {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(connectionString ?? "postgres://user:password@localhost:5432/wishlist", {
  prepare: false
});

export const db = drizzle(client, { schema });
```

Create `src/db/migrate.ts`:

```ts
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./client";

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 4: Implement repository contract and in-memory fake**

Create `src/lib/repositories/objects.ts`:

```ts
import { desc, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { DisplaySize, EditorialTag, ObjectStatus, PublicWishlistObject, StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { publicWishlistObjectSchema } from "@/lib/domain/wishlistObject";
import { wishlistObjects, type NewWishlistObjectRow, type WishlistObjectRow } from "@/db/schema";

export type CreateStudioObjectRecord = {
  name: string;
  slug: string;
  editorialTag: EditorialTag;
  status: ObjectStatus;
  imageOriginalUrl: string | null;
  imageProcessedUrl: string | null;
  sourceUrl?: string | null;
  price?: string | null;
  currency?: string | null;
  note?: string | null;
  displaySize: DisplaySize;
  sourceImageProvider?: string | null;
  createdAt?: Date;
};

export type ListPublicOptions = {
  editorialTag?: EditorialTag;
};

export interface ObjectRepository {
  listPublic(options?: ListPublicOptions): Promise<PublicWishlistObject[]>;
  listStudio(): Promise<StudioWishlistObject[]>;
  createForStudio(record: CreateStudioObjectRecord): Promise<StudioWishlistObject>;
}

function toStudioObject(row: WishlistObjectRow | (CreateStudioObjectRecord & { id: string; updatedAt: Date })): StudioWishlistObject {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageOriginalUrl: row.imageOriginalUrl,
    imageProcessedUrl: row.imageProcessedUrl,
    sourceUrl: row.sourceUrl ?? null,
    editorialTag: row.editorialTag,
    price: row.price ?? null,
    currency: row.currency ?? null,
    note: row.note ?? null,
    status: row.status,
    displaySize: row.displaySize,
    sourceImageProvider: row.sourceImageProvider ?? null,
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt
  };
}

function toPublicObject(object: StudioWishlistObject): PublicWishlistObject {
  return publicWishlistObjectSchema.parse({ ...object, status: "Visible" });
}

export class InMemoryObjectRepository implements ObjectRepository {
  private records: StudioWishlistObject[] = [];

  async listPublic(options: ListPublicOptions = {}) {
    return this.records
      .filter((object) => object.status === "Visible")
      .filter((object) => (options.editorialTag ? object.editorialTag === options.editorialTag : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(toPublicObject);
  }

  async listStudio() {
    return [...this.records].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createForStudio(record: CreateStudioObjectRecord) {
    const createdAt = record.createdAt ?? new Date();
    const object: StudioWishlistObject = {
      id: `obj_${this.records.length + 1}`,
      name: record.name,
      slug: record.slug,
      imageOriginalUrl: record.imageOriginalUrl,
      imageProcessedUrl: record.imageProcessedUrl,
      sourceUrl: record.sourceUrl ?? null,
      editorialTag: record.editorialTag,
      price: record.price ?? null,
      currency: record.currency ?? null,
      note: record.note ?? null,
      status: record.status,
      displaySize: record.displaySize,
      sourceImageProvider: record.sourceImageProvider ?? null,
      createdAt,
      updatedAt: createdAt
    };

    this.records.push(object);
    return object;
  }
}

export class DrizzleObjectRepository implements ObjectRepository {
  constructor(private readonly database: PostgresJsDatabase) {}

  async listPublic(options: ListPublicOptions = {}) {
    const rows = options.editorialTag
      ? await this.database.select().from(wishlistObjects).where(eq(wishlistObjects.editorialTag, options.editorialTag)).orderBy(desc(wishlistObjects.createdAt))
      : await this.database.select().from(wishlistObjects).orderBy(desc(wishlistObjects.createdAt));

    return rows
      .map(toStudioObject)
      .filter((object) => object.status === "Visible")
      .map(toPublicObject);
  }

  async listStudio() {
    const rows = await this.database.select().from(wishlistObjects).orderBy(desc(wishlistObjects.createdAt));
    return rows.map(toStudioObject);
  }

  async createForStudio(record: CreateStudioObjectRecord) {
    const values: NewWishlistObjectRow = {
      name: record.name,
      slug: record.slug,
      editorialTag: record.editorialTag,
      status: record.status,
      imageOriginalUrl: record.imageOriginalUrl,
      imageProcessedUrl: record.imageProcessedUrl,
      sourceUrl: record.sourceUrl ?? null,
      price: record.price ?? null,
      currency: record.currency ?? null,
      note: record.note ?? null,
      displaySize: record.displaySize,
      sourceImageProvider: record.sourceImageProvider ?? null,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: new Date()
    };

    const [row] = await this.database.insert(wishlistObjects).values(values).returning();
    return toStudioObject(row);
  }
}
```

- [ ] **Step 5: Add seed data**

Create `src/db/seed.ts`:

```ts
import { db } from "./client";
import { wishlistObjects } from "./schema";

const now = new Date();

async function main() {
  await db.insert(wishlistObjects).values([
    {
      name: "Brass oil burner",
      slug: "brass-oil-burner",
      imageOriginalUrl: "https://images.unsplash.com/photo-1616627986331-9c7e4d7c0c44",
      imageProcessedUrl: "https://images.unsplash.com/photo-1616627986331-9c7e4d7c0c44",
      sourceUrl: "https://example.com/brass-oil-burner",
      editorialTag: "Home",
      price: "120",
      currency: "USD",
      note: "A small ritual object for a quiet room",
      status: "Visible",
      displaySize: "feature",
      sourceImageProvider: "seed",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60),
      updatedAt: now
    },
    {
      name: "Aluminum drafting pen",
      slug: "aluminum-drafting-pen",
      imageOriginalUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd",
      imageProcessedUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd",
      editorialTag: "Work",
      status: "Visible",
      displaySize: "wide",
      sourceImageProvider: "seed",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      updatedAt: now
    }
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 6: Run tests and generate migration**

Run:

```bash
npm run test -- tests/repositories/objects.test.ts
npm run db:generate
```

Expected: tests PASS and Drizzle creates a migration in `drizzle/`.

- [ ] **Step 7: Commit**

Run:

```bash
git add drizzle.config.ts drizzle src/db src/lib/repositories tests/repositories
git commit -m "feat: add object persistence model"
```

Expected: commit succeeds.

---

### Task 4: Public Wall, Filters, And View Switching

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/public/ProfileHeader.tsx`
- Create: `src/components/public/TagRail.tsx`
- Create: `src/components/public/ViewSwitcher.tsx`
- Create: `src/components/wall/ObjectWall.tsx`
- Create: `src/components/wall/MasonryWall.tsx`
- Create: `src/components/wall/StrictGridWall.tsx`
- Create: `tests/components/ObjectWall.test.tsx`

- [ ] **Step 1: Write failing component tests for filters and view switching**

Create `tests/components/ObjectWall.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ObjectWall } from "@/components/wall/ObjectWall";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";

const objects: PublicWishlistObject[] = [
  {
    id: "1",
    name: "Chair",
    slug: "chair",
    imageOriginalUrl: "https://example.com/chair-original.png",
    imageProcessedUrl: "https://example.com/chair.png",
    sourceUrl: null,
    editorialTag: "Home",
    price: null,
    currency: null,
    note: null,
    status: "Visible",
    displaySize: "feature",
    sourceImageProvider: "test",
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date("2026-02-01T00:00:00Z")
  },
  {
    id: "2",
    name: "Pen",
    slug: "pen",
    imageOriginalUrl: "https://example.com/pen-original.png",
    imageProcessedUrl: "https://example.com/pen.png",
    sourceUrl: null,
    editorialTag: "Work",
    price: null,
    currency: null,
    note: null,
    status: "Visible",
    displaySize: "wide",
    sourceImageProvider: "test",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  }
];

describe("ObjectWall", () => {
  it("renders object images without persistent object names", () => {
    render(<ObjectWall objects={objects} activeTag="All" initialView="masonry" />);

    expect(screen.getByAltText("Chair")).toBeInTheDocument();
    expect(screen.queryByText("Chair")).not.toBeInTheDocument();
  });

  it("filters by editorial tag", () => {
    render(<ObjectWall objects={objects} activeTag="Work" initialView="masonry" />);

    expect(screen.getByAltText("Pen")).toBeInTheDocument();
    expect(screen.queryByAltText("Chair")).not.toBeInTheDocument();
  });

  it("switches from masonry to strict grid", async () => {
    const user = userEvent.setup();
    render(<ObjectWall objects={objects} activeTag="All" initialView="masonry" />);

    await user.click(screen.getByRole("button", { name: "Strict grid view" }));

    expect(screen.getByTestId("strict-grid-wall")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run component tests to verify they fail**

Run:

```bash
npm run test -- tests/components/ObjectWall.test.tsx
```

Expected: FAIL because wall components do not exist.

- [ ] **Step 3: Create public controls**

Create `src/components/public/TagRail.tsx`:

```tsx
"use client";

import { EDITORIAL_TAGS, type EditorialTag } from "@/lib/domain/wishlistObject";

export type ActiveTag = EditorialTag | "All";

type TagRailProps = {
  activeTag: ActiveTag;
  onChange: (tag: ActiveTag) => void;
};

export function TagRail({ activeTag, onChange }: TagRailProps) {
  const tags: ActiveTag[] = ["All", ...EDITORIAL_TAGS];

  return (
    <nav aria-label="Editorial tags" className="flex gap-5 overflow-x-auto py-3 text-sm text-muted">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag)}
          className={activeTag === tag ? "border-b border-ink pb-1 text-ink" : "pb-1 opacity-70 hover:opacity-100"}
        >
          {tag}
        </button>
      ))}
    </nav>
  );
}
```

Create `src/components/public/ViewSwitcher.tsx`:

```tsx
"use client";

import { Grid2X2, LayoutGrid } from "lucide-react";

export type WallView = "masonry" | "grid";

type ViewSwitcherProps = {
  view: WallView;
  onChange: (view: WallView) => void;
};

export function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1" aria-label="Wall view">
      <button
        type="button"
        aria-label="Masonry view"
        aria-pressed={view === "masonry"}
        onClick={() => onChange("masonry")}
        className="grid h-9 w-9 place-items-center border border-line bg-transparent text-ink aria-pressed:bg-ink aria-pressed:text-wall"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        type="button"
        aria-label="Strict grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className="grid h-9 w-9 place-items-center border border-line bg-transparent text-ink aria-pressed:bg-ink aria-pressed:text-wall"
      >
        <Grid2X2 size={16} />
      </button>
    </div>
  );
}
```

Create `src/components/public/ProfileHeader.tsx`:

```tsx
"use client";

import { TagRail, type ActiveTag } from "./TagRail";
import { ViewSwitcher, type WallView } from "./ViewSwitcher";

type ProfileHeaderProps = {
  activeTag: ActiveTag;
  view: WallView;
  onTagChange: (tag: ActiveTag) => void;
  onViewChange: (view: WallView) => void;
};

export function ProfileHeader({ activeTag, view, onTagChange, onViewChange }: ProfileHeaderProps) {
  const title = process.env.NEXT_PUBLIC_PROFILE_TITLE ?? "@swayam's Objects of Interest";

  return (
    <header className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 pb-8 pt-7 sm:px-8">
      <div className="flex items-start justify-between gap-6">
        <h1 className="max-w-xl text-2xl font-medium leading-tight text-ink sm:text-3xl">{title}</h1>
        <ViewSwitcher view={view} onChange={onViewChange} />
      </div>
      <TagRail activeTag={activeTag} onChange={onTagChange} />
    </header>
  );
}
```

- [ ] **Step 4: Create wall layouts**

Create `src/components/wall/MasonryWall.tsx`:

```tsx
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { ObjectTile } from "./ObjectTile";

type MasonryWallProps = {
  objects: PublicWishlistObject[];
};

const sizeClass = {
  standard: "sm:col-span-1 sm:row-span-1",
  wide: "sm:col-span-2 sm:row-span-1",
  tall: "sm:col-span-1 sm:row-span-2",
  feature: "sm:col-span-2 sm:row-span-2"
};

export function MasonryWall({ objects }: MasonryWallProps) {
  return (
    <section data-testid="masonry-wall" className="grid auto-rows-[180px] grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {objects.map((object) => (
        <div key={object.id} className={sizeClass[object.displaySize]}>
          <ObjectTile object={object} />
        </div>
      ))}
    </section>
  );
}
```

Create `src/components/wall/StrictGridWall.tsx`:

```tsx
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { ObjectTile } from "./ObjectTile";

type StrictGridWallProps = {
  objects: PublicWishlistObject[];
};

export function StrictGridWall({ objects }: StrictGridWallProps) {
  return (
    <section data-testid="strict-grid-wall" className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {objects.map((object) => (
        <div key={object.id} className="aspect-square">
          <ObjectTile object={object} />
        </div>
      ))}
    </section>
  );
}
```

Create an initial `src/components/wall/ObjectTile.tsx`:

```tsx
import Image from "next/image";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";

type ObjectTileProps = {
  object: PublicWishlistObject;
};

export function ObjectTile({ object }: ObjectTileProps) {
  return (
    <article className="relative grid h-full min-h-44 place-items-center">
      <Image
        src={object.imageProcessedUrl}
        alt={object.name}
        width={640}
        height={640}
        className="max-h-full w-full object-contain"
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
      />
    </article>
  );
}
```

Create `src/components/wall/ObjectWall.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ProfileHeader } from "@/components/public/ProfileHeader";
import type { ActiveTag } from "@/components/public/TagRail";
import type { WallView } from "@/components/public/ViewSwitcher";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { MasonryWall } from "./MasonryWall";
import { StrictGridWall } from "./StrictGridWall";

type ObjectWallProps = {
  objects: PublicWishlistObject[];
  activeTag?: ActiveTag;
  initialView?: WallView;
};

export function ObjectWall({ objects, activeTag: initialTag = "All", initialView = "masonry" }: ObjectWallProps) {
  const [activeTag, setActiveTag] = useState<ActiveTag>(initialTag);
  const [view, setView] = useState<WallView>(initialView);

  useEffect(() => {
    const storedView = window.localStorage.getItem("wishlist:view");
    if (storedView === "masonry" || storedView === "grid") {
      setView(storedView);
    }
  }, []);

  const filteredObjects = useMemo(
    () => objects.filter((object) => (activeTag === "All" ? true : object.editorialTag === activeTag)),
    [activeTag, objects]
  );

  function changeView(nextView: WallView) {
    setView(nextView);
    window.localStorage.setItem("wishlist:view", nextView);
  }

  return (
    <>
      <ProfileHeader activeTag={activeTag} view={view} onTagChange={setActiveTag} onViewChange={changeView} />
      <div className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
        {filteredObjects.length === 0 ? (
          <p className="py-24 text-center text-sm text-muted">No objects in this view.</p>
        ) : view === "grid" ? (
          <StrictGridWall objects={filteredObjects} />
        ) : (
          <MasonryWall objects={filteredObjects} />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 5: Wire the public route to repository data**

Modify `src/app/page.tsx`:

```tsx
import { db } from "@/db/client";
import { ObjectWall } from "@/components/wall/ObjectWall";
import { DrizzleObjectRepository } from "@/lib/repositories/objects";

export default async function PublicPage() {
  const repository = new DrizzleObjectRepository(db);
  const objects = await repository.listPublic();

  return (
    <main className="min-h-screen bg-wall text-ink">
      <ObjectWall objects={objects} />
    </main>
  );
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm run test -- tests/components/ObjectWall.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/app/page.tsx src/components tests/components/ObjectWall.test.tsx
git commit -m "feat: build public object wall"
```

Expected: commit succeeds.

---

### Task 5: Object Annotation Interactions

**Files:**
- Modify: `src/components/wall/ObjectTile.tsx`
- Create: `src/components/wall/ObjectAnnotation.tsx`
- Create: `tests/components/ObjectTile.test.tsx`

- [ ] **Step 1: Write failing annotation tests**

Create `tests/components/ObjectTile.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ObjectTile } from "@/components/wall/ObjectTile";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";

const object: PublicWishlistObject = {
  id: "1",
  name: "Brass oil burner",
  slug: "brass-oil-burner",
  imageOriginalUrl: "https://example.com/original.png",
  imageProcessedUrl: "https://example.com/processed.png",
  sourceUrl: "https://example.com/source",
  editorialTag: "Home",
  price: "120",
  currency: "USD",
  note: "A small ritual object",
  status: "Visible",
  displaySize: "feature",
  sourceImageProvider: "test",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z")
};

describe("ObjectTile", () => {
  it("reveals annotation on focus", async () => {
    const user = userEvent.setup();
    render(<ObjectTile object={object} />);

    await user.tab();

    expect(screen.getByText("Brass oil burner")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("USD 120")).toBeInTheDocument();
  });

  it("reveals and closes annotation on tap", async () => {
    const user = userEvent.setup();
    render(<ObjectTile object={object} />);

    await user.click(screen.getByRole("button", { name: "Show details for Brass oil burner" }));
    expect(screen.getByText("A small ritual object")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide details for Brass oil burner" }));
    expect(screen.queryByText("A small ritual object")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run annotation tests to verify they fail**

Run:

```bash
npm run test -- tests/components/ObjectTile.test.tsx
```

Expected: FAIL because annotations do not exist.

- [ ] **Step 3: Create annotation component**

Create `src/components/wall/ObjectAnnotation.tsx`:

```tsx
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { formatPrice } from "@/lib/format/price";

type ObjectAnnotationProps = {
  object: PublicWishlistObject;
};

export function ObjectAnnotation({ object }: ObjectAnnotationProps) {
  const price = formatPrice(object.price, object.currency);

  return (
    <div className="absolute left-1/2 top-1/2 z-10 w-64 -translate-x-1/2 translate-y-8 border border-line bg-label px-4 py-3 text-left text-sm shadow-label">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-medium text-ink">{object.name}</h2>
        <span className="text-xs text-muted">{object.editorialTag}</span>
      </div>
      {price ? <p className="mt-2 text-xs text-muted">{price}</p> : null}
      {object.note ? <p className="mt-3 leading-relaxed text-ink">{object.note}</p> : null}
      {object.sourceUrl ? (
        <a className="mt-3 inline-block text-xs text-muted underline underline-offset-4" href={object.sourceUrl}>
          Source
        </a>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Update tile interactions**

Modify `src/components/wall/ObjectTile.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { ObjectAnnotation } from "./ObjectAnnotation";

type ObjectTileProps = {
  object: PublicWishlistObject;
};

export function ObjectTile({ object }: ObjectTileProps) {
  const [open, setOpen] = useState(false);
  const label = open ? `Hide details for ${object.name}` : `Show details for ${object.name}`;

  return (
    <article className="group relative grid h-full min-h-44 place-items-center">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
            setOpen(false);
          }
        }}
        className="grid h-full w-full place-items-center bg-transparent p-0 outline-none focus-visible:ring-1 focus-visible:ring-ink"
      >
        <Image
          src={object.imageProcessedUrl}
          alt={object.name}
          width={640}
          height={640}
          className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
        />
      </button>
      <div className={open ? "block" : "hidden group-hover:block group-focus-within:block"}>
        <ObjectAnnotation object={object} />
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test -- tests/components/ObjectTile.test.tsx tests/components/ObjectWall.test.tsx
npm run typecheck
```

Expected: PASS. The ObjectWall test should still confirm names are absent before annotation interaction.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/wall tests/components/ObjectTile.test.tsx
git commit -m "feat: add gallery annotations"
```

Expected: commit succeeds.

---

### Task 6: Studio Passcode Gate And Owner Session

**Files:**
- Create: `src/lib/studio/auth.ts`
- Create: `src/app/studio/unlock/actions.ts`
- Create: `src/app/studio/unlock/page.tsx`
- Create: `src/app/studio/page.tsx`
- Create: `src/components/studio/StudioGate.tsx`
- Create: `tests/studio/auth.test.ts`

- [ ] **Step 1: Write failing auth tests**

Create `tests/studio/auth.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createStudioSessionValue, verifyOwnerPasscode } from "@/lib/studio/auth";

describe("studio auth", () => {
  it("accepts the configured owner passcode", () => {
    expect(verifyOwnerPasscode("open-sesame", "open-sesame")).toBe(true);
  });

  it("rejects incorrect passcodes", () => {
    expect(verifyOwnerPasscode("wrong", "open-sesame")).toBe(false);
  });

  it("creates a deterministic session value for a configured secret", async () => {
    vi.setSystemTime(new Date("2026-06-11T00:00:00Z"));

    await expect(createStudioSessionValue("secret-value")).resolves.toMatch(/^studio:/);
  });
});
```

- [ ] **Step 2: Run auth tests to verify they fail**

Run:

```bash
npm run test -- tests/studio/auth.test.ts
```

Expected: FAIL because Studio auth does not exist.

- [ ] **Step 3: Implement Studio auth helpers**

Create `src/lib/studio/auth.ts`:

```ts
import { createHash } from "crypto";

export const STUDIO_COOKIE_NAME = "wishlist_studio";

export function verifyOwnerPasscode(input: string, expected: string): boolean {
  return input.length > 0 && expected.length > 0 && input === expected;
}

export async function createStudioSessionValue(secret: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256").update(`${secret}:${day}`).digest("hex");
  return `studio:${day}:${digest}`;
}

export async function isValidStudioSession(value: string | undefined, secret: string): Promise<boolean> {
  if (!value) {
    return false;
  }

  return value === (await createStudioSessionValue(secret));
}
```

- [ ] **Step 4: Add unlock action and page**

Create `src/app/studio/unlock/actions.ts`:

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createStudioSessionValue, STUDIO_COOKIE_NAME, verifyOwnerPasscode } from "@/lib/studio/auth";

export async function unlockStudio(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "");
  const expected = process.env.OWNER_PASSCODE ?? "";

  if (!verifyOwnerPasscode(passcode, expected)) {
    redirect("/studio/unlock?error=1");
  }

  const value = await createStudioSessionValue(process.env.STUDIO_COOKIE_SECRET ?? expected);
  const cookieStore = await cookies();

  cookieStore.set(STUDIO_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/studio",
    maxAge: 60 * 60 * 24
  });

  redirect("/studio");
}
```

Create `src/app/studio/unlock/page.tsx`:

```tsx
import { unlockStudio } from "./actions";

export default function StudioUnlockPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center bg-wall px-6 text-ink">
      <form action={unlockStudio} className="w-full max-w-sm border border-line bg-label p-6">
        <h1 className="text-lg font-medium">Studio</h1>
        <label className="mt-6 block text-sm text-muted" htmlFor="passcode">
          Passcode
        </label>
        <input id="passcode" name="passcode" type="password" className="mt-2 w-full border border-line bg-wall px-3 py-2 text-ink" />
        {searchParams.error ? <p className="mt-3 text-sm text-muted">Passcode did not match.</p> : null}
        <button type="submit" className="mt-6 w-full bg-ink px-4 py-2 text-wall">
          Unlock
        </button>
      </form>
    </main>
  );
}
```

Create `src/components/studio/StudioGate.tsx`:

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidStudioSession, STUDIO_COOKIE_NAME } from "@/lib/studio/auth";

export async function requireStudioSession() {
  const cookieStore = await cookies();
  const secret = process.env.STUDIO_COOKIE_SECRET ?? process.env.OWNER_PASSCODE ?? "";
  const valid = await isValidStudioSession(cookieStore.get(STUDIO_COOKIE_NAME)?.value, secret);

  if (!valid) {
    redirect("/studio/unlock");
  }
}
```

Create `src/app/studio/page.tsx`:

```tsx
import { db } from "@/db/client";
import { ObjectWall } from "@/components/wall/ObjectWall";
import { DrizzleObjectRepository } from "@/lib/repositories/objects";
import { requireStudioSession } from "@/components/studio/StudioGate";

export default async function StudioPage() {
  await requireStudioSession();
  const repository = new DrizzleObjectRepository(db);
  const studioObjects = await repository.listStudio();
  const visibleObjects = studioObjects.filter((object) => object.status === "Visible" && object.imageProcessedUrl);

  return (
    <main className="min-h-screen bg-wall text-ink">
      <div className="mx-auto max-w-7xl px-5 pt-6 text-sm text-muted sm:px-8">Studio</div>
      <ObjectWall objects={visibleObjects.map((object) => ({ ...object, status: "Visible", imageProcessedUrl: object.imageProcessedUrl as string }))} />
    </main>
  );
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test -- tests/studio/auth.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/lib/studio src/app/studio src/components/studio tests/studio
git commit -m "feat: protect studio with passcode"
```

Expected: commit succeeds.

---

### Task 7: Image Pipeline Interfaces And Deterministic Processing

**Files:**
- Create: `src/lib/image/types.ts`
- Create: `src/lib/image/search.ts`
- Create: `src/lib/image/backgroundRemoval.ts`
- Create: `src/lib/image/storage.ts`
- Create: `src/lib/image/pipeline.ts`
- Create: `tests/image/pipeline.test.ts`

- [ ] **Step 1: Write failing pipeline tests**

Create `tests/image/pipeline.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { processWishlistImage } from "@/lib/image/pipeline";
import type { BackgroundRemovalProvider, ImageSearchProvider, ObjectStorageProvider } from "@/lib/image/types";

const storage: ObjectStorageProvider = {
  async storeOriginal(source) {
    return { url: `https://cdn.example.com/original/${encodeURIComponent(source.url)}` };
  },
  async storeProcessed(source) {
    return { url: `https://cdn.example.com/processed/${encodeURIComponent(source.url)}` };
  }
};

describe("processWishlistImage", () => {
  it("uses a provided image URL before searching", async () => {
    const search: ImageSearchProvider = {
      async search() {
        throw new Error("search should not run");
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground(input) {
        return { processedUrl: `${input.url}?cutout=1`, width: 1600, height: 1500, quality: "usable" };
      }
    };

    const result = await processWishlistImage({
      name: "Lamp",
      imageUrl: "https://example.com/lamp.png",
      search,
      remover,
      storage,
      objectIndex: 0
    });

    expect(result.status).toBe("Visible");
    expect(result.imageOriginalUrl).toContain("lamp.png");
    expect(result.displaySize).toBe("feature");
  });

  it("searches by object name when no image URL is supplied", async () => {
    const search: ImageSearchProvider = {
      async search(query) {
        expect(query).toBe("Desk lamp");
        return [{ url: "https://example.com/search-lamp.png", width: 1200, height: 900, score: 0.9, provider: "fake-search" }];
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground(input) {
        return { processedUrl: `${input.url}?cutout=1`, width: 1200, height: 900, quality: "usable" };
      }
    };

    const result = await processWishlistImage({
      name: "Desk lamp",
      search,
      remover,
      storage,
      objectIndex: 2
    });

    expect(result.status).toBe("Visible");
    expect(result.sourceImageProvider).toBe("fake-search");
  });

  it("returns Draft when search finds no candidate", async () => {
    const search: ImageSearchProvider = {
      async search() {
        return [];
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground() {
        throw new Error("remover should not run");
      }
    };

    const result = await processWishlistImage({
      name: "Rare object",
      search,
      remover,
      storage,
      objectIndex: 1
    });

    expect(result.status).toBe("Draft");
    expect(result.imageProcessedUrl).toBeNull();
  });

  it("returns Draft when background removal is low quality", async () => {
    const search: ImageSearchProvider = {
      async search() {
        return [{ url: "https://example.com/object.png", width: 200, height: 200, score: 0.2, provider: "fake-search" }];
      }
    };
    const remover: BackgroundRemovalProvider = {
      async removeBackground(input) {
        return { processedUrl: input.url, width: 200, height: 200, quality: "poor" };
      }
    };

    const result = await processWishlistImage({
      name: "Tiny object",
      search,
      remover,
      storage,
      objectIndex: 4
    });

    expect(result.status).toBe("Draft");
    expect(result.imageProcessedUrl).toBeNull();
  });
});
```

- [ ] **Step 2: Run pipeline tests to verify they fail**

Run:

```bash
npm run test -- tests/image/pipeline.test.ts
```

Expected: FAIL because image modules do not exist.

- [ ] **Step 3: Add provider interfaces**

Create `src/lib/image/types.ts`:

```ts
import type { DisplaySize, ObjectStatus } from "@/lib/domain/wishlistObject";

export type ImageCandidate = {
  url: string;
  width: number;
  height: number;
  score: number;
  provider: string;
};

export type StoredImage = {
  url: string;
};

export type BackgroundRemovalResult = {
  processedUrl: string;
  width: number;
  height: number;
  quality: "usable" | "poor";
};

export interface ImageSearchProvider {
  search(query: string): Promise<ImageCandidate[]>;
}

export interface BackgroundRemovalProvider {
  removeBackground(input: { url: string }): Promise<BackgroundRemovalResult>;
}

export interface ObjectStorageProvider {
  storeOriginal(source: { url: string }): Promise<StoredImage>;
  storeUpload(source: { file: File; name: string }): Promise<StoredImage>;
  storeProcessed(source: { url: string }): Promise<StoredImage>;
}

export type ImagePipelineInput = {
  name: string;
  imageUrl?: string;
  imageFile?: File;
  search: ImageSearchProvider;
  remover: BackgroundRemovalProvider;
  storage: ObjectStorageProvider;
  objectIndex: number;
};

export type ImagePipelineResult = {
  status: ObjectStatus;
  imageOriginalUrl: string | null;
  imageProcessedUrl: string | null;
  sourceImageProvider: string | null;
  displaySize: DisplaySize;
};
```

- [ ] **Step 4: Implement search scoring and fake adapters**

Create `src/lib/image/search.ts`:

```ts
import type { ImageCandidate, ImageSearchProvider } from "./types";

export function pickBestCandidate(candidates: ImageCandidate[]): ImageCandidate | null {
  return [...candidates]
    .filter((candidate) => candidate.width >= 500 && candidate.height >= 500)
    .sort((a, b) => b.score - a.score)[0] ?? null;
}

export class FakeImageSearchProvider implements ImageSearchProvider {
  async search(query: string): Promise<ImageCandidate[]> {
    const encoded = encodeURIComponent(query.toLowerCase());
    return [
      {
        url: `https://images.example.com/${encoded}.png`,
        width: 1400,
        height: 1200,
        score: 0.85,
        provider: "fake"
      }
    ];
  }
}

export class HttpImageSearchProvider implements ImageSearchProvider {
  constructor(private readonly endpoint: string, private readonly apiKey: string) {}

  async search(query: string): Promise<ImageCandidate[]> {
    const response = await fetch(`${this.endpoint}?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { images?: ImageCandidate[] };
    return data.images ?? [];
  }
}
```

Create `src/lib/image/backgroundRemoval.ts`:

```ts
import type { BackgroundRemovalProvider, BackgroundRemovalResult } from "./types";

export class FakeBackgroundRemovalProvider implements BackgroundRemovalProvider {
  async removeBackground(input: { url: string }): Promise<BackgroundRemovalResult> {
    return {
      processedUrl: input.url,
      width: 1400,
      height: 1200,
      quality: "usable"
    };
  }
}

export class HttpBackgroundRemovalProvider implements BackgroundRemovalProvider {
  constructor(private readonly endpoint: string, private readonly apiKey: string) {}

  async removeBackground(input: { url: string }): Promise<BackgroundRemovalResult> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ imageUrl: input.url })
    });

    if (!response.ok) {
      return { processedUrl: input.url, width: 0, height: 0, quality: "poor" };
    }

    return (await response.json()) as BackgroundRemovalResult;
  }
}
```

Create `src/lib/image/storage.ts`:

```ts
import { put } from "@vercel/blob";
import type { ObjectStorageProvider, StoredImage } from "./types";

export class FakeObjectStorageProvider implements ObjectStorageProvider {
  async storeOriginal(source: { url: string }): Promise<StoredImage> {
    return { url: source.url };
  }

  async storeUpload(source: { file: File; name: string }): Promise<StoredImage> {
    return { url: `https://uploads.example.com/${encodeURIComponent(source.name)}-${source.file.size}.png` };
  }

  async storeProcessed(source: { url: string }): Promise<StoredImage> {
    return { url: source.url };
  }
}

export class VercelBlobStorageProvider implements ObjectStorageProvider {
  async storeOriginal(source: { url: string }): Promise<StoredImage> {
    return this.store("original", source.url);
  }

  async storeUpload(source: { file: File; name: string }): Promise<StoredImage> {
    const extension = source.file.type.includes("png") ? "png" : "jpg";
    const stored = await put(`uploaded/${crypto.randomUUID()}-${source.name}.${extension}`, source.file, {
      access: "public"
    });

    return { url: stored.url };
  }

  async storeProcessed(source: { url: string }): Promise<StoredImage> {
    return this.store("processed", source.url);
  }

  private async store(prefix: string, url: string): Promise<StoredImage> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Could not fetch image ${url}`);
    }

    const blob = await response.blob();
    const extension = blob.type.includes("png") ? "png" : "jpg";
    const stored = await put(`${prefix}/${crypto.randomUUID()}.${extension}`, blob, {
      access: "public"
    });

    return { url: stored.url };
  }
}
```

- [ ] **Step 5: Implement pipeline orchestration**

Create `src/lib/image/pipeline.ts`:

```ts
import { chooseDisplaySize } from "@/lib/domain/displaySize";
import { pickBestCandidate } from "./search";
import type { ImagePipelineInput, ImagePipelineResult } from "./types";

export async function processWishlistImage(input: ImagePipelineInput): Promise<ImagePipelineResult> {
  const uploaded = input.imageFile && input.imageFile.size > 0
    ? await input.storage.storeUpload({ file: input.imageFile, name: input.name })
    : null;
  const source = uploaded
    ? { url: uploaded.url, provider: "owner-upload" }
    : input.imageUrl
    ? { url: input.imageUrl, provider: "owner" }
    : (() => null)();

  const searchedSource =
    source ??
    pickBestCandidate(await input.search.search(input.name));

  if (!searchedSource) {
    return {
      status: "Draft",
      imageOriginalUrl: null,
      imageProcessedUrl: null,
      sourceImageProvider: null,
      displaySize: "standard"
    };
  }

  const original = await input.storage.storeOriginal({ url: searchedSource.url });
  const removed = await input.remover.removeBackground({ url: original.url });

  if (removed.quality !== "usable" || removed.width < 500 || removed.height < 500) {
    return {
      status: "Draft",
      imageOriginalUrl: original.url,
      imageProcessedUrl: null,
      sourceImageProvider: searchedSource.provider,
      displaySize: "standard"
    };
  }

  const processed = await input.storage.storeProcessed({ url: removed.processedUrl });

  return {
    status: "Visible",
    imageOriginalUrl: original.url,
    imageProcessedUrl: processed.url,
    sourceImageProvider: searchedSource.provider,
    displaySize: chooseDisplaySize({ width: removed.width, height: removed.height, index: input.objectIndex })
  };
}
```

- [ ] **Step 6: Run pipeline tests**

Run:

```bash
npm run test -- tests/image/pipeline.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/lib/image tests/image
git commit -m "feat: add image processing pipeline"
```

Expected: commit succeeds.

---

### Task 8: Studio Add, Edit, Replace, And Archive Flows

**Files:**
- Modify: `src/lib/repositories/objects.ts`
- Create: `src/app/studio/actions.ts`
- Modify: `src/app/studio/page.tsx`
- Create: `src/components/studio/StudioToolbar.tsx`
- Create: `src/components/studio/AddObjectForm.tsx`
- Create: `src/components/studio/EditObjectForm.tsx`
- Create: `src/components/studio/ImageProcessingState.tsx`
- Create: `tests/e2e/studio.spec.ts`

- [ ] **Step 1: Extend repository API**

Add these methods to `ObjectRepository`, `InMemoryObjectRepository`, and `DrizzleObjectRepository` in `src/lib/repositories/objects.ts`:

```ts
updateObject(id: string, changes: Partial<Pick<StudioWishlistObject, "name" | "slug" | "editorialTag" | "sourceUrl" | "price" | "currency" | "note" | "status" | "imageOriginalUrl" | "imageProcessedUrl" | "displaySize" | "sourceImageProvider">>): Promise<StudioWishlistObject>;
archiveObject(id: string): Promise<StudioWishlistObject>;
```

For `InMemoryObjectRepository`, update records in memory by id and throw `Error("Object not found")` when missing.

For `DrizzleObjectRepository`, use Drizzle `update(wishlistObjects).set(...).where(eq(wishlistObjects.id, id)).returning()` and throw `Error("Object not found")` when no row returns.

- [ ] **Step 2: Create Studio server actions**

Create `src/app/studio/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { createSlug } from "@/lib/domain/slug";
import { createWishlistObjectInputSchema } from "@/lib/domain/wishlistObject";
import { FakeBackgroundRemovalProvider, HttpBackgroundRemovalProvider } from "@/lib/image/backgroundRemoval";
import { processWishlistImage } from "@/lib/image/pipeline";
import { FakeImageSearchProvider, HttpImageSearchProvider } from "@/lib/image/search";
import { FakeObjectStorageProvider, VercelBlobStorageProvider } from "@/lib/image/storage";
import { DrizzleObjectRepository } from "@/lib/repositories/objects";
import { requireStudioSession } from "@/components/studio/StudioGate";

function createImageServices() {
  const search =
    process.env.IMAGE_SEARCH_PROVIDER === "http" && process.env.IMAGE_SEARCH_ENDPOINT && process.env.IMAGE_SEARCH_API_KEY
      ? new HttpImageSearchProvider(process.env.IMAGE_SEARCH_ENDPOINT, process.env.IMAGE_SEARCH_API_KEY)
      : new FakeImageSearchProvider();

  const remover =
    process.env.BACKGROUND_REMOVAL_PROVIDER === "http" && process.env.BACKGROUND_REMOVAL_ENDPOINT && process.env.BACKGROUND_REMOVAL_API_KEY
      ? new HttpBackgroundRemovalProvider(process.env.BACKGROUND_REMOVAL_ENDPOINT, process.env.BACKGROUND_REMOVAL_API_KEY)
      : new FakeBackgroundRemovalProvider();

  const storage = process.env.BLOB_READ_WRITE_TOKEN ? new VercelBlobStorageProvider() : new FakeObjectStorageProvider();

  return { search, remover, storage };
}

export async function addObject(formData: FormData) {
  await requireStudioSession();
  const parsed = createWishlistObjectInputSchema.parse({
    name: formData.get("name"),
    editorialTag: formData.get("editorialTag"),
    imageUrl: formData.get("imageUrl"),
    sourceUrl: formData.get("sourceUrl"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    note: formData.get("note")
  });
  const repository = new DrizzleObjectRepository(db);
  const existing = await repository.listStudio();
  const services = createImageServices();
  const imageResult = await processWishlistImage({
    name: parsed.name,
    imageUrl: parsed.imageUrl,
    imageFile: formData.get("imageFile") instanceof File ? (formData.get("imageFile") as File) : undefined,
    ...services,
    objectIndex: existing.length
  });

  await repository.createForStudio({
    name: parsed.name,
    slug: createSlug(parsed.name),
    editorialTag: parsed.editorialTag,
    sourceUrl: parsed.sourceUrl ?? null,
    price: parsed.price || null,
    currency: parsed.currency || null,
    note: parsed.note || null,
    status: imageResult.status,
    imageOriginalUrl: imageResult.imageOriginalUrl,
    imageProcessedUrl: imageResult.imageProcessedUrl,
    displaySize: imageResult.displaySize,
    sourceImageProvider: imageResult.sourceImageProvider
  });

  revalidatePath("/");
  revalidatePath("/studio");
}

export async function editObject(formData: FormData) {
  await requireStudioSession();
  const id = String(formData.get("id") ?? "");
  const parsed = createWishlistObjectInputSchema.omit({ imageUrl: true }).parse({
    name: formData.get("name"),
    editorialTag: formData.get("editorialTag"),
    sourceUrl: formData.get("sourceUrl"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    note: formData.get("note")
  });
  const repository = new DrizzleObjectRepository(db);

  await repository.updateObject(id, {
    name: parsed.name,
    slug: createSlug(parsed.name),
    editorialTag: parsed.editorialTag,
    sourceUrl: parsed.sourceUrl ?? null,
    price: parsed.price || null,
    currency: parsed.currency || null,
    note: parsed.note || null
  });

  revalidatePath("/");
  revalidatePath("/studio");
}

export async function replaceObjectImage(formData: FormData) {
  await requireStudioSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");
  const imageFile = formData.get("imageFile") instanceof File ? (formData.get("imageFile") as File) : undefined;
  const repository = new DrizzleObjectRepository(db);
  const existing = await repository.listStudio();
  const services = createImageServices();
  const imageResult = await processWishlistImage({
    name,
    imageUrl: imageUrl || undefined,
    imageFile,
    ...services,
    objectIndex: existing.findIndex((object) => object.id === id)
  });

  await repository.updateObject(id, {
    status: imageResult.status,
    imageOriginalUrl: imageResult.imageOriginalUrl,
    imageProcessedUrl: imageResult.imageProcessedUrl,
    displaySize: imageResult.displaySize,
    sourceImageProvider: imageResult.sourceImageProvider
  });

  revalidatePath("/");
  revalidatePath("/studio");
}

export async function archiveObject(formData: FormData) {
  await requireStudioSession();
  const id = String(formData.get("id") ?? "");
  const repository = new DrizzleObjectRepository(db);
  await repository.archiveObject(id);
  revalidatePath("/");
  revalidatePath("/studio");
}
```

- [ ] **Step 3: Create Studio UI components**

Create `src/components/studio/AddObjectForm.tsx`:

```tsx
import { EDITORIAL_TAGS } from "@/lib/domain/wishlistObject";
import { addObject } from "@/app/studio/actions";

export function AddObjectForm() {
  return (
    <form action={addObject} className="grid gap-4 border-y border-line py-6">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm text-muted">Object name</label>
        <input id="name" name="name" required className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="editorialTag" className="text-sm text-muted">Editorial tag</label>
        <select id="editorialTag" name="editorialTag" required className="border border-line bg-label px-3 py-2">
          {EDITORIAL_TAGS.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label htmlFor="imageUrl" className="text-sm text-muted">Image URL</label>
        <input id="imageUrl" name="imageUrl" type="url" className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="imageFile" className="text-sm text-muted">Image upload</label>
        <input id="imageFile" name="imageFile" type="file" accept="image/png,image/jpeg,image/webp" className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="sourceUrl" className="text-sm text-muted">Source URL</label>
        <input id="sourceUrl" name="sourceUrl" type="url" className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="price" aria-label="Price" placeholder="Price" className="border border-line bg-label px-3 py-2" />
        <input name="currency" aria-label="Currency" placeholder="USD" maxLength={3} className="border border-line bg-label px-3 py-2" />
      </div>
      <textarea
        name="note"
        aria-label="Provenance"
        placeholder="Why this object, where it came from, or who recommended it"
        className="min-h-24 border border-line bg-label px-3 py-2"
      />
      <button type="submit" className="w-fit bg-ink px-5 py-2 text-wall">Add object</button>
    </form>
  );
}
```

Create `src/components/studio/ImageProcessingState.tsx`:

```tsx
export function ImageProcessingState({ status }: { status: "Draft" | "Visible" | "Archived" }) {
  if (status === "Visible") {
    return <span className="text-xs text-muted">Visible</span>;
  }

  if (status === "Archived") {
    return <span className="text-xs text-muted">Archived</span>;
  }

  return <span className="text-xs text-muted">Draft awaiting a usable image</span>;
}
```

Create `src/components/studio/EditObjectForm.tsx`:

```tsx
import { archiveObject, editObject, replaceObjectImage } from "@/app/studio/actions";
import { EDITORIAL_TAGS, type StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { ImageProcessingState } from "./ImageProcessingState";

export function EditObjectForm({ object }: { object: StudioWishlistObject }) {
  return (
    <div className="grid gap-4 border-b border-line py-5 text-sm lg:grid-cols-[1fr_1fr_auto]">
      <form action={editObject} className="grid gap-3">
        <input type="hidden" name="id" value={object.id} />
        <div className="flex items-center gap-3">
          <input name="name" defaultValue={object.name} aria-label={`Name for ${object.name}`} className="w-full border border-line bg-label px-3 py-2" />
          <ImageProcessingState status={object.status} />
        </div>
        <select name="editorialTag" defaultValue={object.editorialTag} aria-label={`Tag for ${object.name}`} className="border border-line bg-label px-3 py-2">
          {EDITORIAL_TAGS.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <input name="sourceUrl" defaultValue={object.sourceUrl ?? ""} aria-label={`Source URL for ${object.name}`} className="border border-line bg-label px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input name="price" defaultValue={object.price ?? ""} aria-label={`Price for ${object.name}`} className="border border-line bg-label px-3 py-2" />
          <input name="currency" defaultValue={object.currency ?? ""} aria-label={`Currency for ${object.name}`} maxLength={3} className="border border-line bg-label px-3 py-2" />
        </div>
        <textarea name="note" defaultValue={object.note ?? ""} aria-label={`Provenance for ${object.name}`} className="min-h-20 border border-line bg-label px-3 py-2" />
        <button type="submit" className="w-fit border border-ink px-4 py-2">Save</button>
      </form>
      <form action={replaceObjectImage} className="grid content-start gap-3">
        <input type="hidden" name="id" value={object.id} />
        <input type="hidden" name="name" value={object.name} />
        <input name="imageUrl" type="url" aria-label={`Replacement image URL for ${object.name}`} placeholder="Replacement image URL" className="border border-line bg-label px-3 py-2" />
        <input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp" aria-label={`Replacement image file for ${object.name}`} className="border border-line bg-label px-3 py-2" />
        <button type="submit" className="w-fit border border-ink px-4 py-2">Replace image</button>
      </form>
      {object.status !== "Archived" ? (
        <form action={archiveObject} className="content-start">
          <input type="hidden" name="id" value={object.id} />
          <button type="submit" className="text-muted underline underline-offset-4">Archive</button>
        </form>
      ) : null}
    </div>
  );
}
```

Create `src/components/studio/StudioToolbar.tsx`:

```tsx
import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { AddObjectForm } from "./AddObjectForm";
import { EditObjectForm } from "./EditObjectForm";

export function StudioToolbar({ objects }: { objects: StudioWishlistObject[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Studio</p>
          <h1 className="text-2xl font-medium">Objects</h1>
        </div>
      </div>
      <AddObjectForm />
      <div className="pt-6">
        {objects.map((object) => (
          <EditObjectForm key={object.id} object={object} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire Studio route**

Modify `src/app/studio/page.tsx`:

```tsx
import { db } from "@/db/client";
import { ObjectWall } from "@/components/wall/ObjectWall";
import { StudioToolbar } from "@/components/studio/StudioToolbar";
import { DrizzleObjectRepository } from "@/lib/repositories/objects";
import { requireStudioSession } from "@/components/studio/StudioGate";

export default async function StudioPage() {
  await requireStudioSession();
  const repository = new DrizzleObjectRepository(db);
  const studioObjects = await repository.listStudio();
  const visibleObjects = studioObjects.filter((object) => object.status === "Visible" && object.imageProcessedUrl);

  return (
    <main className="min-h-screen bg-wall text-ink">
      <StudioToolbar objects={studioObjects} />
      <ObjectWall objects={visibleObjects.map((object) => ({ ...object, status: "Visible", imageProcessedUrl: object.imageProcessedUrl as string }))} />
    </main>
  );
}
```

- [ ] **Step 5: Add Studio e2e coverage**

Create `tests/e2e/studio.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("studio requires unlock", async ({ page }) => {
  await page.goto("/studio");
  await expect(page).toHaveURL(/\/studio\/unlock/);
  await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();
});
```

- [ ] **Step 6: Run verification**

Run:

```bash
npm run test -- tests/image/pipeline.test.ts tests/studio/auth.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/app/studio src/components/studio src/lib/repositories tests/e2e/studio.spec.ts
git commit -m "feat: add studio object management"
```

Expected: commit succeeds.

---

### Task 9: Empty, Failure, No-Results, And Browser QA States

**Files:**
- Modify: `src/components/wall/ObjectWall.tsx`
- Create: `tests/e2e/public-wall.spec.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `docs/deployment.md`

- [ ] **Step 1: Add public e2e tests**

Create `tests/e2e/public-wall.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("public page shows the profile identity and view controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Objects of Interest/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Masonry view" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Strict grid view" })).toBeVisible();
});

test("public page can switch wall views", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Strict grid view" }).click();
  await expect(page.locator("[data-testid='strict-grid-wall']")).toBeVisible();
});
```

- [ ] **Step 2: Improve wall empty states**

Modify the empty branch in `src/components/wall/ObjectWall.tsx` to:

```tsx
<div className="grid min-h-80 place-items-center border-y border-line text-center">
  <p className="max-w-xs text-sm leading-relaxed text-muted">
    {activeTag === "All" ? "The wall is waiting for its first object." : "No objects in this tag yet."}
  </p>
</div>
```

- [ ] **Step 3: Add deployment documentation**

Create `docs/deployment.md`:

```md
# Wishlist Deployment

## Required Environment

- `DATABASE_URL`: Neon Postgres connection string.
- `OWNER_PASSCODE`: Studio unlock passcode.
- `STUDIO_COOKIE_SECRET`: secret used for the local Studio session cookie.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for production image storage.
- `NEXT_PUBLIC_PROFILE_TITLE`: public profile title.

## Optional Provider Environment

- `IMAGE_SEARCH_PROVIDER`: set to `http` for a configured HTTP image search service, otherwise fake local results are used.
- `IMAGE_SEARCH_ENDPOINT`: HTTP endpoint that accepts `?q=` and returns `{ "images": ImageCandidate[] }`.
- `IMAGE_SEARCH_API_KEY`: bearer token for the image search endpoint.
- `BACKGROUND_REMOVAL_PROVIDER`: set to `http` for a configured HTTP background-removal service, otherwise fake local processing is used.
- `BACKGROUND_REMOVAL_ENDPOINT`: HTTP endpoint that accepts `{ "imageUrl": string }` and returns `BackgroundRemovalResult`.
- `BACKGROUND_REMOVAL_API_KEY`: bearer token for the background-removal endpoint.

## Release Checks

Run:

```bash
npm run verify
npm run test:e2e
```

The public route must show only visible objects. The Studio route must redirect to `/studio/unlock` without a valid cookie.
```

- [ ] **Step 4: Run browser QA**

Run:

```bash
npm run test:e2e
```

Expected: PASS in desktop Chromium and mobile WebKit/Chromium project configured by Playwright. If the development database has no visible seed data, the first test still passes because it only checks identity and controls.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm run verify
```

Expected: typecheck, unit tests, and production build all pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/wall/ObjectWall.tsx src/app/page.tsx src/app/globals.css tests/e2e/public-wall.spec.ts docs/deployment.md
git commit -m "feat: polish wishlist states and qa"
```

Expected: commit succeeds.

---

## Self-Review

Spec coverage:

- One public profile: covered by `src/app/page.tsx`, profile header, and single object repository.
- Public browse-only page: covered by public route and lack of public mutations.
- Hidden Studio mode: covered by `/studio`, passcode gate, and Studio server actions.
- Add object by name: covered by `AddObjectForm`, `addObject`, and image search fallback.
- Optional image URL: covered by `imageUrl` form field and pipeline precedence.
- Image search when no image is supplied: covered by `processWishlistImage` and provider interface.
- Background removal for all sources: covered by pipeline tests and `BackgroundRemovalProvider`.
- Processed image storage: covered by `ObjectStorageProvider`.
- Draft on failed processing: covered by pipeline tests and object statuses.
- Visible on successful processing: covered by pipeline tests.
- Public object wall: covered by wall components and route.
- Masonry and strict grid: covered by `MasonryWall`, `StrictGridWall`, and `ViewSwitcher`.
- Hover/focus/tap annotations: covered by `ObjectTile` tests.
- Editorial tag filters: covered by `TagRail` and ObjectWall tests.
- Basic metadata: covered by schema and annotation component.
- Drafts only in Studio: covered by repository contract and Studio route.
- Edit published object metadata: covered by `editObject`, `EditObjectForm`, and `updateObject`.
- Replace image by upload or URL: covered by `replaceObjectImage`, `EditObjectForm`, and the image pipeline upload/URL branches.
- Archive: covered by Studio action and repository update method.
- Empty and no-results states: covered by final state task.
- Responsive browser QA: covered by Playwright desktop and mobile projects.

Placeholder scan:

- No task uses placeholder tokens, vague test commands, or provider-specific handwaving.
- Provider details are expressed as concrete adapter contracts and documented environment variables.

Type consistency:

- `EditorialTag`, `ObjectStatus`, and `DisplaySize` are defined once in `wishlistObject.ts` and reused by repository, image pipeline, and components.
- `imageProcessedUrl` is nullable in Studio objects and required in public objects.
- `displaySize` values match the spec: `standard`, `wide`, `tall`, `feature`.

---

Plan complete. Use `superpowers:subagent-driven-development` to execute each task with implementer and reviewer subagents, or use `superpowers:executing-plans` to execute inline with checkpoints.
