"use client";

import { useActionState, useEffect } from "react";
import { emptyStudioActionState } from "@/app/studio/actionState";
import { editObjectWithState } from "@/app/studio/actions";
import { EDITORIAL_TAGS, type StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { StudioFeedback } from "./StudioFeedback";

const inputClassName = "border border-line bg-label px-3 py-2";

type ObjectMetadataFormProps = {
  object: StudioWishlistObject;
  onDirtyChange: (isDirty: boolean) => void;
};

export function ObjectMetadataForm({ object, onDirtyChange }: ObjectMetadataFormProps) {
  const [state, formAction, isPending] = useActionState(editObjectWithState, emptyStudioActionState);
  const feedbackId = `metadata-feedback-${object.id}`;

  useEffect(() => {
    if (state.status === "success") {
      onDirtyChange(false);
    }
  }, [onDirtyChange, state.status]);

  return (
    <form
      action={formAction}
      onChange={() => onDirtyChange(true)}
      aria-describedby={feedbackId}
      className="grid gap-3 text-sm"
    >
      <input type="hidden" name="id" value={object.id} />
      <div className="grid gap-2">
        <label htmlFor={`metadata-name-${object.id}`} className="text-sm text-muted">
          Object name
        </label>
        <input
          id={`metadata-name-${object.id}`}
          name="name"
          defaultValue={object.name}
          required
          className={inputClassName}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor={`metadata-editorial-tag-${object.id}`} className="text-sm text-muted">
          Editorial tag
        </label>
        <select
          id={`metadata-editorial-tag-${object.id}`}
          name="editorialTag"
          defaultValue={object.editorialTag}
          required
          className={inputClassName}
        >
          {EDITORIAL_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label htmlFor={`metadata-source-url-${object.id}`} className="text-sm text-muted">
          Source URL
        </label>
        <input
          id={`metadata-source-url-${object.id}`}
          name="sourceUrl"
          type="url"
          defaultValue={object.sourceUrl ?? ""}
          className={inputClassName}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label htmlFor={`metadata-price-${object.id}`} className="text-sm text-muted">
            Price
          </label>
          <input
            id={`metadata-price-${object.id}`}
            name="price"
            defaultValue={object.price ?? ""}
            className={inputClassName}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor={`metadata-currency-${object.id}`} className="text-sm text-muted">
            Currency
          </label>
          <input
            id={`metadata-currency-${object.id}`}
            name="currency"
            defaultValue={object.currency ?? ""}
            maxLength={3}
            className={inputClassName}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor={`metadata-note-${object.id}`} className="text-sm text-muted">
          Note or provenance
        </label>
        <textarea
          id={`metadata-note-${object.id}`}
          name="note"
          defaultValue={object.note ?? ""}
          className="min-h-24 border border-line bg-label px-3 py-2"
        />
      </div>
      <StudioFeedback id={feedbackId} state={state} />
      <button type="submit" disabled={isPending} className="w-fit border border-ink px-4 py-2">
        Save changes
      </button>
    </form>
  );
}
