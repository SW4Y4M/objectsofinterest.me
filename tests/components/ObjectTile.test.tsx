import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
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
    function Harness() {
      const [active, setActive] = React.useState(false);
      return (
        <ObjectTile
          object={object}
          active={active}
          interactionMode="hover"
          onHover={() => setActive(true)}
          onToggle={() => setActive((value) => !value)}
          onDeactivate={() => setActive(false)}
        />
      );
    }

    render(<Harness />);

    await user.tab();

    expect(screen.getByText("Brass oil burner")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("USD 120")).toBeInTheDocument();
  });

  it("reveals and closes annotation on tap", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [active, setActive] = React.useState(true);
      return (
        <ObjectTile
          object={object}
          active={active}
          interactionMode="pinned"
          onHover={() => setActive(true)}
          onToggle={() => setActive((value) => !value)}
          onDeactivate={() => setActive(false)}
        />
      );
    }

    render(<Harness />);

    expect(screen.getByText("A small ritual object")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide details for Brass oil burner" }));
    expect(screen.queryByText("A small ritual object")).not.toBeInTheDocument();
  });
});
