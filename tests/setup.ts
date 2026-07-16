import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Unit tests run against the in-memory mock repositories (no DB), matching e2e.
process.env.WISHLIST_MODE ??= "mock";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props)
}));
