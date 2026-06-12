import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { AddObjectForm } from "./AddObjectForm";
import { ObjectManagementList } from "./ObjectManagementList";

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
      <section aria-labelledby="studio-add-heading">
        <h2 id="studio-add-heading" className="text-lg font-medium">
          Add object
        </h2>
        <AddObjectForm defaultOpen={objects.length === 0} />
      </section>
      <section aria-labelledby="studio-manage-heading" className="pt-6">
        <h2 id="studio-manage-heading" className="text-lg font-medium">
          Manage objects
        </h2>
        <ObjectManagementList objects={objects} />
      </section>
    </section>
  );
}
