import { StudioToolbar } from "@/components/studio/StudioToolbar";
import { ObjectWall } from "@/components/wall/ObjectWall";
import { createObjectRepository } from "@/lib/repositories/objects";
import { requireStudioSession } from "@/lib/studio/auth";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";

export default async function StudioPage() {
  await requireStudioSession();
  const mode = process.env.WISHLIST_MODE === "mock" ? "mock" : "live";
  const repository = createObjectRepository();
  const studioObjects = await repository.listStudio();
  const visibleObjects: PublicWishlistObject[] = studioObjects
    .filter((object) => object.status === "Visible" && Boolean(object.imageProcessedUrl))
    .map((object) => ({
      ...object,
      status: "Visible",
      imageProcessedUrl: object.imageProcessedUrl as string
    }));

  return (
    <main className="min-h-screen bg-wall text-ink">
      <StudioToolbar objects={studioObjects} mode={mode} />
      <ObjectWall objects={visibleObjects} />
    </main>
  );
}
