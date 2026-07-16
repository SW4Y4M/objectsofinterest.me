import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaitlistPanel } from "@/components/landing/WaitlistPanel";

describe("WaitlistPanel", () => {
  it("renders the wordmark, heading, and email capture", () => {
    render(<WaitlistPanel />);
    expect(screen.getByText("Objects of Interest")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build your objectsofinterest" })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument();
  });
});
