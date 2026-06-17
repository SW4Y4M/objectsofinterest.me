"use client";

import { useActionState, useEffect, useState } from "react";
import { emptyStudioActionState, type StudioActionState } from "@/app/studio/actionState";
import { addObjectWithState, previewUrlIntakeWithState } from "@/app/studio/actions";
import { emptyUrlIntakePreviewState, type UrlIntakePreviewState } from "@/app/studio/urlIntakeState";
import { EDITORIAL_TAGS } from "@/lib/domain/wishlistObject";
import { StudioFeedback } from "./StudioFeedback";

const inputClassName = "border border-line bg-label px-3 py-2";

export function AddObjectFields({
  state,
  previewState
}: {
  state: StudioActionState;
  previewState: UrlIntakePreviewState;
}) {
  const nameError = state.fieldErrors.name;
  const previewValues = previewState.values;

  return (
    <>
      <div className="grid gap-2">
        <label htmlFor="add-name" className="text-sm text-muted">
          Object name
        </label>
        <input
          id="add-name"
          name="name"
          defaultValue={previewValues.name ?? ""}
          required
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "add-name-error" : undefined}
          className={inputClassName}
        />
        {nameError ? (
          <p id="add-name-error" className="text-sm text-muted">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label htmlFor="add-editorial-tag" className="text-sm text-muted">
          Editorial tag
        </label>
        <select id="add-editorial-tag" name="editorialTag" required className={inputClassName}>
          {EDITORIAL_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="grid gap-3">
        <legend className="text-sm text-muted">Image source</legend>
        <p className="text-sm text-muted">Use either an image URL or an upload.</p>
        <label htmlFor="add-image-url" className="text-sm text-muted">
          Image URL
        </label>
        <input
          id="add-image-url"
          name="imageUrl"
          type="url"
          defaultValue={previewValues.imageUrl ?? ""}
          className={inputClassName}
        />
        <label htmlFor="add-image-file" className="text-sm text-muted">
          Image upload
        </label>
        <input
          id="add-image-file"
          name="imageFile"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className={inputClassName}
        />
      </fieldset>
      <div className="grid gap-2">
        <label htmlFor="add-source-url" className="text-sm text-muted">
          Source URL
        </label>
        <input
          id="add-source-url"
          name="sourceUrl"
          type="url"
          defaultValue={previewValues.sourceUrl ?? ""}
          className={inputClassName}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label htmlFor="add-price" className="text-sm text-muted">
            Price
          </label>
          <input id="add-price" name="price" defaultValue={previewValues.price ?? ""} className={inputClassName} />
        </div>
        <div className="grid gap-2">
          <label htmlFor="add-currency" className="text-sm text-muted">
            Currency
          </label>
          <input
            id="add-currency"
            name="currency"
            maxLength={3}
            defaultValue={previewValues.currency ?? ""}
            className={inputClassName}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="add-note" className="text-sm text-muted">
          Note or provenance
        </label>
        <textarea id="add-note" name="note" className="min-h-24 border border-line bg-label px-3 py-2" />
      </div>
    </>
  );
}

export function AddObjectForm({ defaultOpen }: { defaultOpen: boolean }) {
  const [previewState, previewFormAction, isPreviewPending] = useActionState(
    previewUrlIntakeWithState,
    emptyUrlIntakePreviewState
  );
  const [state, formAction, isPending] = useActionState(addObjectWithState, emptyStudioActionState);
  const [open, setOpen] = useState(defaultOpen);
  const previewInputError = previewState.fieldErrors.captureUrl;
  const previewFormKey = JSON.stringify(previewState.values);

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
    }
  }, [state.status]);

  if (!open) {
    return (
      <div data-state="collapsed" data-testid="add-object-form" className="grid gap-3 border-y border-line py-6">
        <StudioFeedback state={state} id="add-object-feedback" />
        <p className="text-sm text-muted">Name, tag, and image URL or upload</p>
        <button type="button" onClick={() => setOpen(true)} className="w-fit bg-ink px-5 py-2 text-wall">
          Add object
        </button>
      </div>
    );
  }

  return (
    <div data-state="open" data-testid="add-object-form" className="grid gap-4 border-y border-line py-6">
      <form action={previewFormAction} className="grid gap-2">
        <label htmlFor="capture-url" className="text-sm text-muted">
          Paste a URL or add an image
        </label>
        <input
          id="capture-url"
          name="captureUrl"
          type="url"
          aria-invalid={Boolean(previewInputError)}
          aria-describedby={previewInputError ? "capture-url-error" : undefined}
          className={inputClassName}
        />
        {previewInputError ? (
          <p id="capture-url-error" className="text-sm text-muted">
            {previewInputError}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPreviewPending} className="w-fit border border-ink px-4 py-2">
            Fetch details
          </button>
          <StudioFeedback state={previewState} id="add-object-preview-feedback" />
        </div>
      </form>
      <form action={formAction} encType="multipart/form-data" key={previewFormKey} className="grid gap-4">
        <AddObjectFields state={state} previewState={previewState} />
        <StudioFeedback state={state} id="add-object-feedback" />
        <button type="submit" disabled={isPending} className="w-fit bg-ink px-5 py-2 text-wall">
          Add object
        </button>
      </form>
    </div>
  );
}
