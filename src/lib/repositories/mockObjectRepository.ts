import { createSlug } from "@/lib/domain/slug";
import { InMemoryObjectRepository, type ObjectRepository } from "@/lib/repositories/objects";

function createMockImageDataUrl(label: string, tone: string, width: number, height: number) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="${width * 0.08}" y="${height * 0.1}" width="${width * 0.84}" height="${height * 0.8}" rx="${Math.min(width, height) * 0.04}" fill="${tone}" opacity=".10"/>
      <circle cx="${width * 0.5}" cy="${height * 0.48}" r="${Math.min(width, height) * 0.22}" fill="black" opacity=".10"/>
      <text x="${width * 0.08}" y="${height * 0.9}" font-family="ui-sans-serif, system-ui" font-size="${Math.min(width, height) * 0.06}" fill="black" opacity=".45">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const mockWishlistObjects = [
  {
    id: "mock-1",
    name: "Brass oil burner",
    slug: createSlug("Brass oil burner"),
    imageOriginalUrl: createMockImageDataUrl("Burner", "#8a5a44", 1200, 1200),
    imageProcessedUrl: createMockImageDataUrl("Burner", "#8a5a44", 1200, 1200),
    sourceUrl: "https://example.com/brass-oil-burner",
    editorialTag: "Home",
    price: "120",
    currency: "USD",
    note: "A small ritual object for a quiet room",
    status: "Visible",
    displaySize: "feature",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T10:00:00Z"),
    updatedAt: new Date("2026-06-11T10:00:00Z")
  },
  {
    id: "mock-2",
    name: "Aluminum drafting pen",
    slug: createSlug("Aluminum drafting pen"),
    imageOriginalUrl: createMockImageDataUrl("Pen", "#5d6b82", 1400, 900),
    imageProcessedUrl: createMockImageDataUrl("Pen", "#5d6b82", 1400, 900),
    sourceUrl: null,
    editorialTag: "Make",
    price: null,
    currency: null,
    note: "A clean line for writing and sketching",
    status: "Visible",
    displaySize: "wide",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T09:55:00Z"),
    updatedAt: new Date("2026-06-11T09:55:00Z")
  },
  {
    id: "mock-3",
    name: "Merino overcoat",
    slug: createSlug("Merino overcoat"),
    imageOriginalUrl: createMockImageDataUrl("Coat", "#7a6b55", 900, 1400),
    imageProcessedUrl: createMockImageDataUrl("Coat", "#7a6b55", 900, 1400),
    sourceUrl: null,
    editorialTag: "Wear",
    price: "340",
    currency: "USD",
    note: null,
    status: "Visible",
    displaySize: "tall",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T09:40:00Z"),
    updatedAt: new Date("2026-06-11T09:40:00Z")
  },
  {
    id: "mock-4",
    name: "Desk lamp",
    slug: createSlug("Desk lamp"),
    imageOriginalUrl: createMockImageDataUrl("Lamp", "#567a78", 1200, 1200),
    imageProcessedUrl: createMockImageDataUrl("Lamp", "#567a78", 1200, 1200),
    sourceUrl: "https://example.com/desk-lamp",
    editorialTag: "Work",
    price: "89",
    currency: "USD",
    note: null,
    status: "Visible",
    displaySize: "standard",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T09:25:00Z"),
    updatedAt: new Date("2026-06-11T09:25:00Z")
  },
  {
    id: "mock-5",
    name: "Ceramic mug",
    slug: createSlug("Ceramic mug"),
    imageOriginalUrl: createMockImageDataUrl("Mug", "#b48b6e", 1100, 1100),
    imageProcessedUrl: createMockImageDataUrl("Mug", "#b48b6e", 1100, 1100),
    sourceUrl: null,
    editorialTag: "Home",
    price: "28",
    currency: "USD",
    note: "Morning coffee on the west side of the table",
    status: "Visible",
    displaySize: "standard",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T09:10:00Z"),
    updatedAt: new Date("2026-06-11T09:10:00Z")
  },
  {
    id: "mock-6",
    name: "Paperback novel",
    slug: createSlug("Paperback novel"),
    imageOriginalUrl: createMockImageDataUrl("Book", "#8b5c83", 1400, 900),
    imageProcessedUrl: createMockImageDataUrl("Book", "#8b5c83", 1400, 900),
    sourceUrl: null,
    editorialTag: "Read",
    price: null,
    currency: null,
    note: "Something to keep by the bed",
    status: "Visible",
    displaySize: "wide",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T08:55:00Z"),
    updatedAt: new Date("2026-06-11T08:55:00Z")
  },
  {
    id: "mock-7",
    name: "Bicycle pump",
    slug: createSlug("Bicycle pump"),
    imageOriginalUrl: createMockImageDataUrl("Pump", "#61704f", 900, 1400),
    imageProcessedUrl: createMockImageDataUrl("Pump", "#61704f", 900, 1400),
    sourceUrl: "https://example.com/bicycle-pump",
    editorialTag: "Move",
    price: "42",
    currency: "USD",
    note: null,
    status: "Visible",
    displaySize: "tall",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T08:40:00Z"),
    updatedAt: new Date("2026-06-11T08:40:00Z")
  },
  {
    id: "mock-8",
    name: "Hand cream",
    slug: createSlug("Hand cream"),
    imageOriginalUrl: createMockImageDataUrl("Cream", "#a16f7b", 1200, 1200),
    imageProcessedUrl: createMockImageDataUrl("Cream", "#a16f7b", 1200, 1200),
    sourceUrl: null,
    editorialTag: "Care",
    price: "19",
    currency: "USD",
    note: "Small daily ritual, useful and unglamorous",
    status: "Visible",
    displaySize: "feature",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T08:20:00Z"),
    updatedAt: new Date("2026-06-11T08:20:00Z")
  },
  {
    id: "mock-9",
    name: "Brass ruler",
    slug: createSlug("Brass ruler"),
    imageOriginalUrl: createMockImageDataUrl("Ruler", "#9d8a55", 1200, 1200),
    imageProcessedUrl: createMockImageDataUrl("Ruler", "#9d8a55", 1200, 1200),
    sourceUrl: "https://example.com/brass-ruler",
    editorialTag: "Collect",
    price: "36",
    currency: "USD",
    note: null,
    status: "Visible",
    displaySize: "standard",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T08:00:00Z"),
    updatedAt: new Date("2026-06-11T08:00:00Z")
  },
  {
    id: "mock-10",
    name: "Folding stool",
    slug: createSlug("Folding stool"),
    imageOriginalUrl: createMockImageDataUrl("Stool", "#6f7d8a", 1100, 1100),
    imageProcessedUrl: createMockImageDataUrl("Stool", "#6f7d8a", 1100, 1100),
    sourceUrl: null,
    editorialTag: "Home",
    price: null,
    currency: null,
    note: "For extra seating when people stay late",
    status: "Visible",
    displaySize: "wide",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T07:45:00Z"),
    updatedAt: new Date("2026-06-11T07:45:00Z")
  },
  {
    id: "mock-11",
    name: "Blueprint notebook",
    slug: createSlug("Blueprint notebook"),
    imageOriginalUrl: null,
    imageProcessedUrl: null,
    sourceUrl: null,
    editorialTag: "Make",
    price: null,
    currency: null,
    note: "Draft only, keep private until there is a better image",
    status: "Draft",
    displaySize: "standard",
    sourceImageProvider: null,
    createdAt: new Date("2026-06-11T07:20:00Z"),
    updatedAt: new Date("2026-06-11T07:20:00Z")
  },
  {
    id: "mock-12",
    name: "Glass vase",
    slug: createSlug("Glass vase"),
    imageOriginalUrl: createMockImageDataUrl("Vase", "#86a8a1", 900, 1400),
    imageProcessedUrl: null,
    sourceUrl: null,
    editorialTag: "Home",
    price: "64",
    currency: "USD",
    note: "Needs a cleaner cutout before publishing",
    status: "Draft",
    displaySize: "tall",
    sourceImageProvider: "mock",
    createdAt: new Date("2026-06-11T07:10:00Z"),
    updatedAt: new Date("2026-06-11T07:10:00Z")
  }
];

export function createMockObjectRepository(): ObjectRepository {
  return new InMemoryObjectRepository(mockWishlistObjects);
}
