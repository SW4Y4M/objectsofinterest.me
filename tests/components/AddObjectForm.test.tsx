import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { emptyStudioActionState, type StudioActionState } from "@/app/studio/actionState";
import { AddObjectFields, AddObjectForm } from "@/components/studio/AddObjectForm";

describe("AddObjectForm", () => {
  it("shows a compact add affordance and summary when collapsed", () => {
    render(<AddObjectForm defaultOpen={false} />);

    expect(screen.getByRole("button", { name: "Add object" })).toBeInTheDocument();
    expect(screen.getByText("Name, tag, and image URL or upload")).toBeInTheDocument();
    expect(screen.queryByLabelText("Object name")).not.toBeInTheDocument();
  });

  it("shows all visible labels when expanded", () => {
    render(<AddObjectFields state={emptyStudioActionState} />);

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

  it("renders a synthetic name field error inline", () => {
    const errorState: StudioActionState = {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        name: "Object name is required"
      }
    };

    render(<AddObjectFields state={errorState} />);

    expect(screen.getByText("Object name is required")).toHaveAttribute("id", "add-name-error");
    expect(screen.getByLabelText("Object name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Object name")).toHaveAttribute("aria-describedby", "add-name-error");
  });
});
