import { ObjectWallPage } from "@/components/wall/ObjectWallPage";
import { getWishlistMode } from "@/lib/config/wishlistMode";
import { createObjectRepository } from "@/lib/repositories/objects";

export default async function PublicPage() {
  const repository = createObjectRepository();
  const objects = await repository.listPublic();
  const mode = getWishlistMode();

  return <ObjectWallPage objects={objects} showDebugOutlines={mode === "mock"} />;
}
