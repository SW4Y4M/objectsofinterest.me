import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ObjectManagementList } from "@/components/studio/ObjectManagementList";
import { mockWishlistObjects } from "@/lib/mock/mockObjects";

const objects = mockWishlistObjects.slice(0, 3);

describe("ObjectManagementList", () => {
  it("renders one compact card per object", () => {
    render(<ObjectManagementList objects={objects} />);

    expect(screen.getAllByTestId("studio-object-card")).toHaveLength(3);
    expect(screen.queryByLabelText("Name for Brass oil burner")).not.toBeInTheDocument();
  });

  it("renders thumbnails with accessible names", () => {
    render(<ObjectManagementList objects={objects} />);

    for (const object of objects) {
      expect(screen.getByRole("img", { name: `Thumbnail for ${object.name}` })).toHaveAttribute(
        "src",
        object.imageProcessedUrl ?? object.imageOriginalUrl
      );
    }
  });

  it("makes edit controls distinguishable by object name", () => {
    render(<ObjectManagementList objects={objects} />);

    for (const object of objects) {
      expect(screen.getByRole("button", { name: `Edit ${object.name}` })).toBeInTheDocument();
    }
  });

  it("closes object A when opening object B", async () => {
    const user = userEvent.setup();
    render(<ObjectManagementList objects={objects} />);

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));
    expect(screen.getByLabelText("Name for Brass oil burner")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit Aluminum drafting pen" }));

    expect(screen.queryByLabelText("Name for Brass oil burner")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Name for Aluminum drafting pen")).toBeInTheDocument();
  });

  it("shows a dirty switch warning before or during the switch", async () => {
    const user = userEvent.setup();
    render(<ObjectManagementList objects={objects} />);

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));
    await user.type(screen.getByLabelText("Name for Brass oil burner"), " edited");
    await user.click(screen.getByRole("button", { name: "Edit Aluminum drafting pen" }));

    const secondCard = screen.getByRole("article", { name: "Aluminum drafting pen" });
    expect(within(secondCard).getByText("Unsaved local edits will be discarded when you switch objects.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name for Aluminum drafting pen")).toBeInTheDocument();
  });
});
