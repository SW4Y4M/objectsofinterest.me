import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioActionState } from "@/app/studio/actionState";
import { ObjectManagementList } from "@/components/studio/ObjectManagementList";
import { mockWishlistObjects } from "@/lib/mock/mockObjects";

const useActionStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useActionState: useActionStateMock
  };
});

const objects = mockWishlistObjects.slice(0, 3);

describe("ObjectManagementList", () => {
  beforeEach(() => {
    useActionStateMock.mockImplementation((action, initialState) => [initialState, action, false]);
  });

  it("renders one compact card per object", () => {
    render(<ObjectManagementList objects={objects} />);

    expect(screen.getAllByTestId("studio-object-card")).toHaveLength(3);
    expect(screen.queryByLabelText("Object name")).not.toBeInTheDocument();
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
    expect(screen.getByLabelText("Object name")).toHaveValue("Brass oil burner");

    await user.click(screen.getByRole("button", { name: "Edit Aluminum drafting pen" }));

    expect(screen.queryByDisplayValue("Brass oil burner")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Object name")).toHaveValue("Aluminum drafting pen");
  });

  it("renders metadata labels in the expanded editor", async () => {
    const user = userEvent.setup();
    render(<ObjectManagementList objects={objects} />);

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));

    const firstCard = screen.getByRole("article", { name: "Brass oil burner" });
    expect(within(firstCard).getByLabelText("Object name")).toHaveValue("Brass oil burner");
    expect(within(firstCard).getByLabelText("Editorial tag")).toHaveValue(objects[0].editorialTag);
    expect(within(firstCard).getByLabelText("Source URL")).toHaveValue(objects[0].sourceUrl);
    expect(within(firstCard).getByLabelText("Price")).toHaveValue(objects[0].price);
    expect(within(firstCard).getByLabelText("Currency")).toHaveValue(objects[0].currency);
    expect(within(firstCard).getByLabelText("Note or provenance")).toHaveValue(objects[0].note);
  });

  it("only exposes Save changes for the active object", async () => {
    const user = userEvent.setup();
    render(<ObjectManagementList objects={objects} />);

    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));

    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit Aluminum drafting pen" }));

    expect(screen.getAllByRole("button", { name: "Save changes" })).toHaveLength(1);
    expect(
      within(screen.getByRole("article", { name: "Aluminum drafting pen" })).getByRole("button", {
        name: "Save changes"
      })
    ).toBeInTheDocument();
  });

  it("renders save feedback for the active object", async () => {
    const user = userEvent.setup();
    const savedState: StudioActionState = {
      status: "success",
      message: "Changes saved.",
      fieldErrors: {}
    };
    useActionStateMock.mockImplementation((action) => [savedState, action, false]);
    render(<ObjectManagementList objects={objects} />);

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));

    const firstCard = screen.getByRole("article", { name: "Brass oil burner" });
    expect(within(firstCard).getByRole("status")).toHaveTextContent("Changes saved.");
    expect(within(firstCard).getByText("Changes saved.")).toHaveAttribute("id", "metadata-feedback-mock-1");
  });

  it("shows a dirty switch warning before or during the switch", async () => {
    const user = userEvent.setup();
    render(<ObjectManagementList objects={objects} />);

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));
    await user.type(screen.getByLabelText("Object name"), " edited");
    await user.click(screen.getByRole("button", { name: "Edit Aluminum drafting pen" }));

    const secondCard = screen.getByRole("article", { name: "Aluminum drafting pen" });
    expect(
      within(secondCard).getByText(
        "Unsaved local edits will be discarded when you switch objects. Switching is allowed.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Object name")).toHaveValue("Aluminum drafting pen");
  });

  it("preserves dirty state when a persisted success state rerenders after editing", async () => {
    const user = userEvent.setup();
    const savedState: StudioActionState = {
      status: "success",
      message: "Changes saved.",
      fieldErrors: {}
    };
    useActionStateMock.mockImplementation((action) => [savedState, action, false]);
    render(<ObjectManagementList objects={objects} />);

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));
    await user.type(screen.getByLabelText("Object name"), " edited");
    await user.click(screen.getByRole("button", { name: "Edit Aluminum drafting pen" }));

    const secondCard = screen.getByRole("article", { name: "Aluminum drafting pen" });
    expect(
      within(secondCard).getByText(
        "Unsaved local edits will be discarded when you switch objects. Switching is allowed.",
      ),
    ).toBeInTheDocument();
  });

  it("preserves dirty state across mode changes on the same object", async () => {
    const user = userEvent.setup();
    render(<ObjectManagementList objects={objects} />);

    await user.click(screen.getByRole("button", { name: "Edit Brass oil burner" }));
    await user.type(screen.getByLabelText("Object name"), " edited");
    await user.click(screen.getByRole("button", { name: "Replace image Brass oil burner" }));
    await user.click(screen.getByRole("button", { name: "Edit Aluminum drafting pen" }));

    const secondCard = screen.getByRole("article", { name: "Aluminum drafting pen" });
    expect(
      within(secondCard).getByText(
        "Unsaved local edits will be discarded when you switch objects. Switching is allowed.",
      ),
    ).toBeInTheDocument();
  });
});
