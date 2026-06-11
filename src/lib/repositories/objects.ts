import { desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { wishlistObjects, type NewWishlistObjectRow, type WishlistObjectRow } from "@/db/schema";
import { chooseDisplaySize } from "@/lib/domain/displaySize";
import { createSlug } from "@/lib/domain/slug";
import { getWishlistMode } from "@/lib/config/wishlistMode";
import {
  publicWishlistObjectSchema,
  type DisplaySize,
  type EditorialTag,
  type ObjectStatus,
  type PublicWishlistObject,
  type StudioWishlistObject
} from "@/lib/domain/wishlistObject";
import { createMockObjectRepository } from "@/lib/repositories/mockObjectRepository";

export type CreateStudioObjectRecord = {
  name: string;
  slug?: string;
  editorialTag: EditorialTag;
  status: ObjectStatus;
  imageOriginalUrl: string | null;
  imageProcessedUrl: string | null;
  sourceUrl?: string | null;
  price?: string | null;
  currency?: string | null;
  note?: string | null;
  displaySize?: DisplaySize;
  sourceImageProvider?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ListPublicOptions = {
  editorialTag?: EditorialTag;
};

export interface ObjectRepository {
  listPublic(options?: ListPublicOptions): Promise<PublicWishlistObject[]>;
  listStudio(): Promise<StudioWishlistObject[]>;
  createForStudio(record: CreateStudioObjectRecord): Promise<StudioWishlistObject>;
  updateObject(
    id: string,
    changes: Partial<
      Pick<
        StudioWishlistObject,
        | "name"
        | "slug"
        | "editorialTag"
        | "sourceUrl"
        | "price"
        | "currency"
        | "note"
        | "status"
        | "imageOriginalUrl"
        | "imageProcessedUrl"
        | "displaySize"
        | "sourceImageProvider"
      >
    >
  ): Promise<StudioWishlistObject>;
  archiveObject(id: string): Promise<StudioWishlistObject>;
  seedIfEmpty(): Promise<void>;
}

type RepositoryRow = {
  id: string;
  name: string;
  slug: string;
  imageOriginalUrl: string | null;
  imageProcessedUrl: string | null;
  sourceUrl: string | null;
  editorialTag: EditorialTag;
  price: string | null;
  currency: string | null;
  note: string | null;
  status: ObjectStatus;
  displaySize: DisplaySize;
  sourceImageProvider: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="white"/><circle cx="600" cy="600" r="270" fill="black" opacity=".12"/><path d="M330 780c110-220 430-220 540 0" fill="none" stroke="black" stroke-opacity=".12" stroke-width="36" stroke-linecap="round"/></svg>'
  );

const seedObjects: RepositoryRow[] = [
  {
    id: "seed-1",
    name: "Brass oil burner",
    slug: createSlug("Brass oil burner"),
    imageOriginalUrl: placeholderImage,
    imageProcessedUrl: placeholderImage,
    sourceUrl: "https://example.com/brass-oil-burner",
    editorialTag: "Home",
    price: "120",
    currency: "USD",
    note: "A small ritual object for a quiet room",
    status: "Visible",
    displaySize: "feature",
    sourceImageProvider: "seed",
    createdAt: new Date("2026-06-11T10:00:00Z"),
    updatedAt: new Date("2026-06-11T10:00:00Z")
  },
  {
    id: "seed-2",
    name: "Aluminum drafting pen",
    slug: createSlug("Aluminum drafting pen"),
    imageOriginalUrl: placeholderImage,
    imageProcessedUrl: placeholderImage,
    sourceUrl: null,
    editorialTag: "Make",
    price: null,
    currency: null,
    note: "A clean line for writing and sketching",
    status: "Visible",
    displaySize: "wide",
    sourceImageProvider: "seed",
    createdAt: new Date("2026-06-11T09:00:00Z"),
    updatedAt: new Date("2026-06-11T09:00:00Z")
  },
  {
    id: "seed-3",
    name: "Draft ceramic bowl",
    slug: createSlug("Draft ceramic bowl"),
    imageOriginalUrl: null,
    imageProcessedUrl: null,
    sourceUrl: null,
    editorialTag: "Home",
    price: null,
    currency: null,
    note: "Needs a better image before it can be published",
    status: "Draft",
    displaySize: "standard",
    sourceImageProvider: null,
    createdAt: new Date("2026-06-11T08:00:00Z"),
    updatedAt: new Date("2026-06-11T08:00:00Z")
  }
];

function toStudioObject(row: RepositoryRow): StudioWishlistObject {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageOriginalUrl: row.imageOriginalUrl,
    imageProcessedUrl: row.imageProcessedUrl,
    sourceUrl: row.sourceUrl,
    editorialTag: row.editorialTag,
    price: row.price,
    currency: row.currency,
    note: row.note,
    status: row.status,
    displaySize: row.displaySize,
    sourceImageProvider: row.sourceImageProvider,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toPublicObject(object: StudioWishlistObject): PublicWishlistObject {
  return publicWishlistObjectSchema.parse({ ...object, status: "Visible" });
}

function cloneRow(row: RepositoryRow): RepositoryRow {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  };
}

function normalizeRecord(record: CreateStudioObjectRecord): RepositoryRow {
  const now = new Date();
  const createdAt = record.createdAt ?? now;
  const updatedAt = record.updatedAt ?? createdAt;
  return {
    id: crypto.randomUUID(),
    name: record.name,
    slug: record.slug ?? createSlug(record.name),
    imageOriginalUrl: record.imageOriginalUrl,
    imageProcessedUrl: record.imageProcessedUrl,
    sourceUrl: record.sourceUrl ?? null,
    editorialTag: record.editorialTag,
    price: record.price ?? null,
    currency: record.currency ?? null,
    note: record.note ?? null,
    status: record.status,
    displaySize: record.displaySize ?? chooseDisplaySize({ width: 1200, height: 1200, index: 0 }),
    sourceImageProvider: record.sourceImageProvider ?? null,
    createdAt,
    updatedAt
  };
}

class InMemoryObjectRepository implements ObjectRepository {
  private records: RepositoryRow[];

  constructor(initialRecords: RepositoryRow[] = seedObjects) {
    this.records = initialRecords.map(cloneRow);
  }

  static createSeeded() {
    return new InMemoryObjectRepository(seedObjects);
  }

  async listPublic(options: ListPublicOptions = {}) {
    return this.records
      .filter((object) => object.status === "Visible" && Boolean(object.imageProcessedUrl))
      .filter((object) => (options.editorialTag ? object.editorialTag === options.editorialTag : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((object) => toPublicObject(toStudioObject(object)));
  }

  async listStudio() {
    return [...this.records].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(toStudioObject);
  }

  async createForStudio(record: CreateStudioObjectRecord) {
    const row = normalizeRecord(record);
    this.records.unshift(row);
    return toStudioObject(row);
  }

  async updateObject(id: string, changes: Partial<StudioWishlistObject>) {
    const index = this.records.findIndex((record) => record.id === id);
    if (index < 0) {
      throw new Error("Object not found");
    }

    const updated: RepositoryRow = {
      ...this.records[index],
      ...changes,
      imageOriginalUrl: changes.imageOriginalUrl ?? this.records[index].imageOriginalUrl,
      imageProcessedUrl: changes.imageProcessedUrl ?? this.records[index].imageProcessedUrl,
      sourceUrl: changes.sourceUrl ?? this.records[index].sourceUrl,
      price: changes.price ?? this.records[index].price,
      currency: changes.currency ?? this.records[index].currency,
      note: changes.note ?? this.records[index].note,
      sourceImageProvider: changes.sourceImageProvider ?? this.records[index].sourceImageProvider,
      updatedAt: new Date()
    };

    this.records[index] = updated;
    return toStudioObject(updated);
  }

  async archiveObject(id: string) {
    return this.updateObject(id, { status: "Archived" });
  }

  async seedIfEmpty() {
    if (this.records.length === 0) {
      this.records = seedObjects.map(cloneRow);
    }
  }
}

export class DrizzleObjectRepository implements ObjectRepository {
  constructor(private readonly database: NonNullable<ReturnType<typeof getDatabase>>) {}

  async listPublic(options: ListPublicOptions = {}) {
    const rows = options.editorialTag
      ? await this.database.select().from(wishlistObjects).where(eq(wishlistObjects.editorialTag, options.editorialTag)).orderBy(desc(wishlistObjects.createdAt))
      : await this.database.select().from(wishlistObjects).orderBy(desc(wishlistObjects.createdAt));

    return rows
      .filter((row) => row.status === "Visible" && Boolean(row.imageProcessedUrl))
      .map((row) => toPublicObject(toStudioObject(row as RepositoryRow)));
  }

  async listStudio() {
    const rows = await this.database.select().from(wishlistObjects).orderBy(desc(wishlistObjects.createdAt));
    return rows.map((row) => toStudioObject(row as RepositoryRow));
  }

  async createForStudio(record: CreateStudioObjectRecord) {
    const values: NewWishlistObjectRow = {
      name: record.name,
      slug: record.slug ?? createSlug(record.name),
      editorialTag: record.editorialTag,
      status: record.status,
      imageOriginalUrl: record.imageOriginalUrl,
      imageProcessedUrl: record.imageProcessedUrl,
      sourceUrl: record.sourceUrl ?? null,
      price: record.price ?? null,
      currency: record.currency ?? null,
      note: record.note ?? null,
      displaySize: record.displaySize ?? chooseDisplaySize({ width: 1200, height: 1200, index: 0 }),
      sourceImageProvider: record.sourceImageProvider ?? null,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt ?? new Date()
    };

    const [row] = await this.database.insert(wishlistObjects).values(values).returning();
    return toStudioObject(row as RepositoryRow);
  }

  async updateObject(
    id: string,
    changes: Partial<
      Pick<
        StudioWishlistObject,
        | "name"
        | "slug"
        | "editorialTag"
        | "sourceUrl"
        | "price"
        | "currency"
        | "note"
        | "status"
        | "imageOriginalUrl"
        | "imageProcessedUrl"
        | "displaySize"
        | "sourceImageProvider"
      >
    >
  ) {
    const [row] = await this.database.update(wishlistObjects).set({ ...changes, updatedAt: new Date() }).where(eq(wishlistObjects.id, id)).returning();
    if (!row) {
      throw new Error("Object not found");
    }
    return toStudioObject(row as RepositoryRow);
  }

  async archiveObject(id: string) {
    return this.updateObject(id, { status: "Archived" });
  }

  async seedIfEmpty() {
    const existing = await this.database.select({ id: wishlistObjects.id }).from(wishlistObjects).limit(1);
    if (existing.length > 0) {
      return;
    }

    await this.database.insert(wishlistObjects).values(
      seedObjects.map((object) => ({
        name: object.name,
        slug: object.slug,
        imageOriginalUrl: object.imageOriginalUrl,
        imageProcessedUrl: object.imageProcessedUrl,
        sourceUrl: object.sourceUrl,
        editorialTag: object.editorialTag,
        price: object.price,
        currency: object.currency,
        note: object.note,
        status: object.status,
        displaySize: object.displaySize,
        sourceImageProvider: object.sourceImageProvider,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt
      }))
    );
  }
}

let memoryRepository: InMemoryObjectRepository | null = null;
let fallbackRepository: InMemoryObjectRepository | null = null;

function getMemoryRepository() {
  if (!memoryRepository) {
    memoryRepository = InMemoryObjectRepository.createSeeded();
  }

  return memoryRepository;
}

function getFallbackRepository() {
  if (!fallbackRepository) {
    fallbackRepository = InMemoryObjectRepository.createSeeded();
  }

  return fallbackRepository;
}

function shouldFallbackToMemory(error: unknown) {
  const messages: string[] = [];
  let current: unknown = error;

  while (current && typeof current === "object") {
    if (current instanceof Error && current.message) {
      messages.push(current.message);
    }

    const cause = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
    if (!cause || cause === current) {
      break;
    }

    current = cause;
  }

  return messages.some((message) => /database|connection|connect|timeout|refused|host|enotfound|getaddrinfo|could not translate host name|network/i.test(message));
}

class ResilientObjectRepository implements ObjectRepository {
  constructor(private readonly primary: ObjectRepository, private readonly fallback: InMemoryObjectRepository) {}

  private async runWithFallback<T>(operation: (repo: ObjectRepository) => Promise<T>): Promise<T> {
    try {
      return await operation(this.primary);
    } catch (error) {
      if (!shouldFallbackToMemory(error)) {
        throw error;
      }

      console.warn("Falling back to in-memory wishlist repository because the database is unavailable.");
      return operation(this.fallback);
    }
  }

  listPublic(options?: ListPublicOptions) {
    return this.runWithFallback((repo) => repo.listPublic(options));
  }

  listStudio() {
    return this.runWithFallback((repo) => repo.listStudio());
  }

  createForStudio(record: CreateStudioObjectRecord) {
    return this.runWithFallback((repo) => repo.createForStudio(record));
  }

  updateObject(id: string, changes: Parameters<ObjectRepository["updateObject"]>[1]) {
    return this.runWithFallback((repo) => repo.updateObject(id, changes));
  }

  archiveObject(id: string) {
    return this.runWithFallback((repo) => repo.archiveObject(id));
  }

  seedIfEmpty() {
    return this.runWithFallback((repo) => repo.seedIfEmpty());
  }
}

export function createObjectRepository() {
  if (getWishlistMode() === "mock") {
    return createMockObjectRepository();
  }

  const database = getDatabase();
  if (database) {
    return new ResilientObjectRepository(new DrizzleObjectRepository(database), getFallbackRepository());
  }

  return getMemoryRepository();
}

export function getObjectRepository() {
  return createObjectRepository();
}

export { InMemoryObjectRepository };
