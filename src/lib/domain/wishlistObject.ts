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
    imageOriginalUrl: z.string().url().nullable(),
    imageProcessedUrl: z.string().url(),
    sourceUrl: z.string().url().nullable(),
    editorialTag: z.enum(EDITORIAL_TAGS),
    price: z.string().nullable(),
    currency: z.string().nullable(),
    note: z.string().nullable(),
    status: z.literal("Visible"),
    displaySize: z.enum(DISPLAY_SIZES),
    sourceImageProvider: z.string().nullable(),
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
