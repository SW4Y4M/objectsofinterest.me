import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { AddObjectForm } from "./AddObjectForm";
import { EditObjectForm } from "./EditObjectForm";

export function StudioToolbar({
  objects,
  mode
}: {
  objects: StudioWishlistObject[];
  mode: "live" | "mock";
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Studio</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-medium">Objects</h1>
            {mode === "mock" ? (
              <span className="rounded-full border border-line bg-label px-2 py-0.5 text-xs text-muted">
                Mock data
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <AddObjectForm />
      <div className="pt-6">
        {objects.map((object) => (
          <EditObjectForm key={object.id} object={object} />
        ))}
      </div>
    </section>
  );
}
