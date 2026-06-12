"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { archiveObject } from "@/app/studio/actions";
import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { ImageProcessingState } from "./ImageProcessingState";

export type ObjectManagementExpansionMode = "edit" | "replace";

type ObjectManagementCardProps = {
  object: StudioWishlistObject;
  isExpanded: boolean;
  expansionMode: ObjectManagementExpansionMode;
  showDirtySwitchWarning: boolean;
  onEdit: () => void;
  onReplaceImage: () => void;
  children: ReactNode;
};

function sourceLabel(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return sourceUrl;
  }
}

export function ObjectManagementCard({
  object,
  isExpanded,
  expansionMode,
  showDirtySwitchWarning,
  onEdit,
  onReplaceImage,
  children
}: ObjectManagementCardProps) {
  const replacementGroupRef = useRef<HTMLDivElement>(null);
  const thumbnailUrl = object.imageProcessedUrl ?? object.imageOriginalUrl;
  const replacementHeadingId = `studio-object-${object.id}-replace-image`;

  useEffect(() => {
    if (isExpanded && expansionMode === "replace") {
      replacementGroupRef.current?.focus();
    }
  }, [expansionMode, isExpanded]);

  return (
    <article
      data-testid="studio-object-card"
      aria-labelledby={`studio-object-${object.id}-name`}
      className="border border-line bg-wall"
    >
      <div className="grid gap-4 p-3 text-sm sm:grid-cols-[72px_1fr_auto] sm:items-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${object.name}`}
            className="h-18 w-18 border border-line object-contain"
          />
        ) : (
          <div className="grid h-18 w-18 place-items-center border border-line text-xs text-muted" aria-hidden="true">
            No image
          </div>
        )}
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 id={`studio-object-${object.id}-name`} className="text-base font-normal text-ink">
              {object.name}
            </h3>
            <span className="text-xs text-muted">{object.editorialTag}</span>
            <ImageProcessingState status={object.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {object.price && object.currency ? <span>{`${object.currency} ${object.price}`}</span> : null}
            {object.sourceUrl ? (
              <a href={object.sourceUrl} className="underline underline-offset-4">
                {sourceLabel(object.sourceUrl)}
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button type="button" onClick={onEdit} className="border border-ink px-3 py-2">
            {`Edit ${object.name}`}
          </button>
          <button type="button" onClick={onReplaceImage} className="border border-line px-3 py-2">
            {`Replace image ${object.name}`}
          </button>
          {object.status !== "Archived" ? (
            <form action={archiveObject}>
              <input type="hidden" name="id" value={object.id} />
              <button type="submit" className="border border-line px-3 py-2 text-muted">
                {`Archive ${object.name}`}
              </button>
            </form>
          ) : null}
        </div>
      </div>
      {isExpanded ? (
        <div className="border-t border-line p-3">
          {showDirtySwitchWarning ? (
            <p className="pb-3 text-sm text-muted">
              Unsaved local edits will be discarded when you switch objects. Switching is allowed.
            </p>
          ) : null}
          <div ref={replacementGroupRef} tabIndex={-1} aria-labelledby={replacementHeadingId} className="mb-3 outline-none">
            <h4 id={replacementHeadingId} className="text-sm font-normal text-muted">
              Replace image
            </h4>
          </div>
          {children}
        </div>
      ) : null}
    </article>
  );
}
