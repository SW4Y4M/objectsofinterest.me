import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioToolbar } from "@/components/studio/StudioToolbar";
import { mockWishlistObjects } from "@/lib/mock/mockObjects";

describe("StudioToolbar", () => {
  it("shows a mock data badge when the app is previewing fixture data", () => {
    render(<StudioToolbar objects={[]} mode="mock" />);

    expect(screen.getByText("Mock data")).toBeInTheDocument();
  });

  it("keeps the toolbar clean in live mode", () => {
    render(<StudioToolbar objects={[]} mode="live" />);

    expect(screen.queryByText("Mock data")).not.toBeInTheDocument();
  });

  it("splits studio controls into add and manage sections", () => {
    render(<StudioToolbar objects={[]} mode="live" />);

    expect(screen.getByRole("heading", { name: "Add object" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Manage objects" })).toBeInTheDocument();
  });

  it("starts the add form open for an empty studio and collapsed when objects exist", () => {
    const { rerender } = render(<StudioToolbar objects={[]} mode="live" />);

    expect(screen.getByTestId("add-object-form")).toHaveAttribute("data-state", "open");

    rerender(<StudioToolbar objects={[mockWishlistObjects[0]]} mode="live" />);

    expect(screen.getByTestId("add-object-form")).toHaveAttribute("data-state", "collapsed");
  });
});
