import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { ObjectTile } from "./ObjectTile";

type MasonryWallProps = {
  objects: PublicWishlistObject[];
  activeId: string | null;
  interactionMode: "hover" | "pinned" | null;
  onHover: (id: string) => void;
  onToggle: (id: string) => void;
  onDeactivate: (id: string) => void;
};

const sizeClass: Record<PublicWishlistObject["displaySize"], string> = {
  standard: "sm:col-span-1 sm:row-span-1",
  wide: "sm:col-span-2 sm:row-span-1",
  tall: "sm:col-span-1 sm:row-span-2",
  feature: "sm:col-span-2 sm:row-span-2"
};

export function MasonryWall({ objects, activeId, interactionMode, onHover, onToggle, onDeactivate }: MasonryWallProps) {
  return (
    <section data-testid="masonry-wall" className="grid auto-rows-[180px] grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {objects.map((object) => (
        <div key={object.id} className={sizeClass[object.displaySize]}>
          <ObjectTile
            object={object}
            active={activeId === object.id}
            interactionMode={interactionMode}
            onHover={onHover}
            onToggle={onToggle}
            onDeactivate={onDeactivate}
          />
        </div>
      ))}
    </section>
  );
}
