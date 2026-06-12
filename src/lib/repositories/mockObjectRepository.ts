import { chooseDisplaySize } from "@/lib/domain/displaySize";
import { createSlug } from "@/lib/domain/slug";
import {
  publicWishlistObjectSchema,
  type DisplaySize,
  type EditorialTag,
  type ObjectStatus,
  type PublicWishlistObject,
  type StudioWishlistObject
} from "@/lib/domain/wishlistObject";
import { mockWishlistObjects } from "@/lib/mock/mockObjects";

type MockRow = {
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

type CreateMockObjectRecord = {
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

type MockObjectRepository = {
  listPublic(options?: { editorialTag?: EditorialTag }): Promise<PublicWishlistObject[]>;
  listStudio(): Promise<StudioWishlistObject[]>;
  createForStudio(record: CreateMockObjectRecord): Promise<StudioWishlistObject>;
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
};

function cloneRow(row: MockRow): MockRow {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  };
}

function toStudioObject(row: MockRow): StudioWishlistObject {
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

function normalizeRecord(record: CreateMockObjectRecord): MockRow {
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

class InMemoryMockObjectRepository implements MockObjectRepository {
  private records: MockRow[];

  constructor(initialRecords: MockRow[] = mockWishlistObjects as unknown as MockRow[]) {
    this.records = initialRecords.map(cloneRow);
  }

  async listPublic(options: { editorialTag?: EditorialTag } = {}) {
    return this.records
      .filter((row) => row.status === "Visible" && Boolean(row.imageProcessedUrl))
      .filter((row) => (options.editorialTag ? row.editorialTag === options.editorialTag : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((row) => toPublicObject(toStudioObject(row)));
  }

  async listStudio() {
    return [...this.records].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(toStudioObject);
  }

  async createForStudio(record: CreateMockObjectRecord) {
    const row = normalizeRecord(record);
    this.records.unshift(row);
    return toStudioObject(row);
  }

  async updateObject(id: string, changes: Partial<StudioWishlistObject>) {
    const index = this.records.findIndex((row) => row.id === id);
    if (index < 0) {
      throw new Error("Object not found");
    }

    const updated: MockRow = {
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
      this.records = (mockWishlistObjects as unknown as MockRow[]).map(cloneRow);
    }
  }
}

export function createMockObjectRepository(): MockObjectRepository {
  return new InMemoryMockObjectRepository();
}
