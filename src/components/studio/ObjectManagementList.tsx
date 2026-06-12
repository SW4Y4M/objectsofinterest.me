import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { EditObjectForm } from "./EditObjectForm";

export function ObjectManagementList({ objects }: { objects: StudioWishlistObject[] }) {
  if (objects.length === 0) {
    return <p className="py-5 text-sm text-muted">No objects yet. Add the first object above.</p>;
  }

  return (
    <div>
      {objects.map((object) => (
        <EditObjectForm key={object.id} object={object} />
      ))}
    </div>
  );
}
