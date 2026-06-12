import { StudioToolbar } from "@/components/studio/StudioToolbar";
import { ObjectWall } from "@/components/wall/ObjectWall";
import { getWishlistMode } from "@/lib/config/wishlistMode";
import { createObjectRepository } from "@/lib/repositories/objects";
import { requireStudioSession } from "@/lib/studio/auth";

export default async function StudioPage() {
  await requireStudioSession();
  const mode = getWishlistMode();
  const repository = createObjectRepository();
  const studioObjects = await repository.listStudio();
  const visibleObjects = await repository.listPublic();

  return (
    <main className="min-h-screen bg-wall text-ink">
      <StudioToolbar objects={studioObjects} mode={mode} />
      <ObjectWall objects={visibleObjects} />
    </main>
  );
}
