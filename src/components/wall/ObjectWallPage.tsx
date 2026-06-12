import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { ObjectWall } from "./ObjectWall";

export function ObjectWallPage({
  objects,
  showDebugOutlines = false
}: {
  objects: PublicWishlistObject[];
  showDebugOutlines?: boolean;
}) {
  return (
    <main className="min-h-screen bg-wall text-ink">
      <ObjectWall objects={objects} showDebugOutlines={showDebugOutlines} />
    </main>
  );
}
