"use client";

import dynamic from "next/dynamic";

const InfiniteCanvasLanding = dynamic(
  () => import("./InfiniteCanvasLanding").then((m) => m.InfiniteCanvasLanding),
  { ssr: false }
);

export function LandingClient() {
  return <InfiniteCanvasLanding />;
}
