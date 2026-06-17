import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyStudioActionState, type StudioActionState } from "@/app/studio/actionState";
import { addObjectWithState, previewUrlIntakeWithState } from "@/app/studio/actions";
import { emptyUrlIntakePreviewState, type UrlIntakePreviewState } from "@/app/studio/urlIntakeState";
import { AddObjectFields, AddObjectForm } from "@/components/studio/AddObjectForm";

const useActionStateMock = vi.hoisted(() => vi.fn());

let previewStateForTest: UrlIntakePreviewState = emptyUrlIntakePreviewState;
let addStateForTest: StudioActionState = emptyStudioActionState;

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useActionState: useActionStateMock
  };
});

describe("AddObjectForm", () => {
  beforeEach(() => {
    previewStateForTest = emptyUrlIntakePreviewState;
    addStateForTest = emptyStudioActionState;
    useActionStateMock.mockImplementation((action, initialState) => {
      if (action === previewUrlIntakeWithState) {
        return [previewStateForTest, vi.fn(), false];
      }

      if (action === addObjectWithState) {
        return [addStateForTest, vi.fn(), false];
      }

      return [initialState, vi.fn(), false];
    });
  });

  it("shows a compact add affordance and summary when collapsed", () => {
    render(<AddObjectForm defaultOpen={false} />);

    expect(screen.getByRole("button", { name: "Add object" })).toBeInTheDocument();
    expect(screen.getByText("Name, tag, and image URL or upload")).toBeInTheDocument();
    expect(screen.queryByLabelText("Object name")).not.toBeInTheDocument();
  });

  it("shows the preview input and fetch button when expanded", () => {
    render(<AddObjectForm defaultOpen={true} />);

    expect(screen.getByLabelText("Paste a URL or add an image")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fetch details" })).toBeInTheDocument();
  });

  it("shows all visible labels when expanded", () => {
    render(<AddObjectFields state={emptyStudioActionState} previewState={emptyUrlIntakePreviewState} />);

    expect(screen.getByLabelText("Object name")).toBeInTheDocument();
    expect(screen.getByLabelText("Editorial tag")).toBeInTheDocument();
    expect(screen.getByText("Image source")).toBeInTheDocument();
    expect(screen.getByLabelText("Image URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Image upload")).toBeInTheDocument();
    expect(screen.getByLabelText("Source URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Currency")).toBeInTheDocument();
    expect(screen.getByLabelText("Note or provenance")).toBeInTheDocument();
  });

  it("uses multipart encoding for the expanded upload form", () => {
    render(<AddObjectForm defaultOpen={true} />);

    expect(screen.getByRole("button", { name: "Add object" }).closest("form")).toHaveAttribute(
      "enctype",
      "multipart/form-data"
    );
  });

  it("hydrates add fields from a successful preview", () => {
    const previewState: UrlIntakePreviewState = {
      status: "success",
      message: "Found an image. Review before adding it to the wall.",
      fieldErrors: {},
      values: {
        name: "Brass oil burner",
        imageUrl: "https://example.com/image.webp",
        sourceUrl: "https://example.com/product",
        price: "44.00",
        currency: "USD"
      }
    };

    previewStateForTest = previewState;

    render(<AddObjectForm defaultOpen={true} />);

    expect(screen.getByLabelText("Object name")).toHaveValue("Brass oil burner");
    expect(screen.getByLabelText("Image URL")).toHaveValue("https://example.com/image.webp");
    expect(screen.getByLabelText("Source URL")).toHaveValue("https://example.com/product");
    expect(screen.getByLabelText("Price")).toHaveValue("44.00");
    expect(screen.getByLabelText("Currency")).toHaveValue("USD");
  });

  it("hydrates source URL and leaves image URL empty after a failed preview", () => {
    const previewState: UrlIntakePreviewState = {
      status: "error",
      message: "That URL could not be fetched. Add an image URL or upload an image instead.",
      fieldErrors: {},
      values: {
        sourceUrl: "https://example.com/page"
      }
    };

    previewStateForTest = previewState;

    render(<AddObjectForm defaultOpen={true} />);

    expect(screen.getByLabelText("Source URL")).toHaveValue("https://example.com/page");
    expect(screen.getByLabelText("Image URL")).toHaveValue("");
  });

  it("renders a synthetic name field error inline", () => {
    const errorState: StudioActionState = {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        name: "Object name is required"
      }
    };

    render(<AddObjectFields state={errorState} previewState={emptyUrlIntakePreviewState} />);

    expect(screen.getByText("Object name is required")).toHaveAttribute("id", "add-name-error");
    expect(screen.getByLabelText("Object name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Object name")).toHaveAttribute("aria-describedby", "add-name-error");
  });
});
