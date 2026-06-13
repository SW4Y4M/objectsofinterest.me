"use client";

import { useActionState, useState } from "react";
import { emptyStudioActionState } from "@/app/studio/actionState";
import { archiveObjectWithState } from "@/app/studio/actions";
import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { StudioFeedback } from "./StudioFeedback";

export function ArchiveObjectControl({ object }: { object: StudioWishlistObject }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(archiveObjectWithState, emptyStudioActionState);
  const feedbackState = state.message === "Object archived." ? state : emptyStudioActionState;

  if (object.status === "Archived") {
    return <span className="border border-line px-3 py-2 text-muted">Archived</span>;
  }

  return (
    <div className="grid gap-2">
      {isConfirming ? (
        <form action={formAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={object.id} />
          <button
            type="submit"
            disabled={isPending}
            aria-label={`Confirm archive ${object.name}`}
            className="border border-ink px-3 py-2 text-ink"
          >
            Confirm archive
          </button>
          <button
            type="button"
            disabled={isPending}
            aria-label={`Cancel archive ${object.name}`}
            onClick={() => setIsConfirming(false)}
            className="border border-line px-3 py-2 text-muted"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="border border-line px-3 py-2 text-muted"
        >
          {`Archive ${object.name}`}
        </button>
      )}
      <StudioFeedback id={`archive-feedback-${object.id}`} state={feedbackState} />
    </div>
  );
}
