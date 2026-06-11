import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioToolbar } from "@/components/studio/StudioToolbar";

describe("StudioToolbar", () => {
  it("shows a mock data badge when the app is previewing fixture data", () => {
    render(<StudioToolbar objects={[]} mode="mock" />);

    expect(screen.getByText("Mock data")).toBeInTheDocument();
  });

  it("keeps the toolbar clean in live mode", () => {
    render(<StudioToolbar objects={[]} mode="live" />);

    expect(screen.queryByText("Mock data")).not.toBeInTheDocument();
  });
});
