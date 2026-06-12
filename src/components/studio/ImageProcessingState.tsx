import type { ObjectStatus } from "@/lib/domain/wishlistObject";

export function ImageProcessingState({ status }: { status: ObjectStatus }) {
  if (status === "Visible") {
    return <span className="text-xs text-muted">Visible</span>;
  }

  if (status === "Archived") {
    return <span className="text-xs text-muted">Archived</span>;
  }

  return <span className="text-xs text-muted">Draft awaiting a usable image</span>;
}
