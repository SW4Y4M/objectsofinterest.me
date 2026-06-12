import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { ObjectTile } from "./ObjectTile";

type StrictGridWallProps = {
  objects: PublicWishlistObject[];
  activeId: string | null;
  interactionMode: "hover" | "pinned" | null;
  showDebugOutlines?: boolean;
  onHover: (id: string) => void;
  onToggle: (id: string) => void;
  onDeactivate: (id: string) => void;
};

export function StrictGridWall({
  objects,
  activeId,
  interactionMode,
  showDebugOutlines = false,
  onHover,
  onToggle,
  onDeactivate
}: StrictGridWallProps) {
  return (
    <section data-testid="strict-grid-wall" className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {objects.map((object) => (
        <div
          key={object.id}
          data-debug-outline={showDebugOutlines ? "true" : undefined}
          className={[
            "aspect-square",
            showDebugOutlines ? "outline outline-1 outline-dashed outline-black/30 bg-black/[0.025]" : ""
          ].join(" ")}
        >
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
