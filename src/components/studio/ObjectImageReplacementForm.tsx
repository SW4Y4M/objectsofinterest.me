"use client";

import { useActionState } from "react";
import { emptyStudioActionState } from "@/app/studio/actionState";
import { replaceObjectImageWithState } from "@/app/studio/actions";
import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { StudioFeedback } from "./StudioFeedback";

const inputClassName = "border border-line bg-label px-3 py-2";

export function ObjectImageReplacementForm({ object }: { object: StudioWishlistObject }) {
  const [state, formAction, isPending] = useActionState(replaceObjectImageWithState, emptyStudioActionState);
  const feedbackId = `replacement-feedback-${object.id}`;
  const imageUrl = object.imageProcessedUrl ?? object.imageOriginalUrl;

  return (
    <form action={formAction} aria-describedby={feedbackId} className="grid gap-3 text-sm" encType="multipart/form-data">
      <input type="hidden" name="id" value={object.id} />
      <input type="hidden" name="name" value={object.name} />
      <fieldset className="grid gap-3">
        <legend className="pb-2 text-sm font-normal text-muted">Replace image</legend>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${object.name} current image`}
            className="h-36 w-36 border border-line object-contain"
          />
        ) : (
          <div className="grid h-36 w-36 place-items-center border border-line text-sm text-muted">No current image</div>
        )}
        <div className="grid gap-2">
          <label htmlFor={`replacement-image-url-${object.id}`} className="text-sm text-muted">
            Replacement image URL
          </label>
          <input id={`replacement-image-url-${object.id}`} name="imageUrl" type="url" className={inputClassName} />
        </div>
        <div className="grid gap-2">
          <label htmlFor={`replacement-image-upload-${object.id}`} className="text-sm text-muted">
            Replacement image upload
          </label>
          <input
            id={`replacement-image-upload-${object.id}`}
            name="imageFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={inputClassName}
          />
        </div>
      </fieldset>
      <StudioFeedback id={feedbackId} state={state} />
      <button type="submit" disabled={isPending} className="w-fit border border-ink px-4 py-2">
        Replace image
      </button>
    </form>
  );
}
