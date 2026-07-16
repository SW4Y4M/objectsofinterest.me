"use client";

import { LANDING_MEDIA } from "@/lib/landing/media";
import { InfiniteCanvasScene } from "./infiniteCanvas/scene";

export function InfiniteCanvasLanding() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "#f8f7f4" }}>
      <InfiniteCanvasScene media={LANDING_MEDIA} />
    </div>
  );
}
