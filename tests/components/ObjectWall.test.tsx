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

  it("can expose debug outlines for strict grid cells", () => {
    const { container } = render(<ObjectWall objects={objects} activeTag="All" initialView="grid" showDebugOutlines />);

    expect(container.querySelectorAll("[data-debug-outline='true']")).toHaveLength(objects.length);
  });
});
