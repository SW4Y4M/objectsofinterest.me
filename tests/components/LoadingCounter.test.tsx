import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingCounter } from "@/components/landing/LoadingCounter";

const media = [
  { url: "/landing/a.png", width: 10, height: 10 },
  { url: "/landing/b.png", width: 10, height: 10 }
];

describe("LoadingCounter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no matchMedia; reduced motion off so the counter animates.
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  });
  afterEach(() => vi.useRealTimers());

  it("counts up to the media length then unmounts", () => {
    render(<LoadingCounter media={media} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(110));
    expect(screen.getByText("1")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(110));
    expect(screen.getByText("2")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000)); // fade delay + fade
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});
