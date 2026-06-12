"use client";

import Image from "next/image";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { ObjectAnnotation } from "./ObjectAnnotation";

type ObjectTileProps = {
  object: PublicWishlistObject;
  active: boolean;
  interactionMode: "hover" | "pinned" | null;
  onHover: (id: string) => void;
  onToggle: (id: string) => void;
  onDeactivate: (id: string) => void;
};

export function ObjectTile({ object, active, interactionMode, onHover, onToggle, onDeactivate }: ObjectTileProps) {
  return (
    <article className="relative h-full min-h-44 overflow-hidden" data-object-tile>
      <button
        type="button"
        aria-label={active ? `Hide details for ${object.name}` : `Show details for ${object.name}`}
        onClick={() => onToggle(object.id)}
        onFocus={() => onHover(object.id)}
        onMouseEnter={() => onHover(object.id)}
        onMouseLeave={() => {
          if (interactionMode === "hover") {
            onDeactivate(object.id);
          }
        }}
        onBlur={(event) => {
          const relatedTarget = event.relatedTarget as Node | null;
          if (interactionMode === "hover" && (!relatedTarget || !event.currentTarget.contains(relatedTarget))) {
            onDeactivate(object.id);
          }
        }}
        className="grid h-full w-full place-items-center overflow-hidden bg-transparent p-0 outline-none focus-visible:ring-1 focus-visible:ring-ink"
      >
        <span className="relative block h-full w-full">
          <Image
            src={object.imageProcessedUrl}
            alt={object.name}
            fill
            className="object-contain transition-transform duration-300"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
          />
        </span>
      </button>
      {active ? <ObjectAnnotation object={object} /> : null}
    </article>
  );
}
