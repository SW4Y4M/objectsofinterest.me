import { archiveObject, editObject, replaceObjectImage } from "@/app/studio/actions";
import { EDITORIAL_TAGS, type StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { ImageProcessingState } from "./ImageProcessingState";

export function EditObjectForm({ object }: { object: StudioWishlistObject }) {
  return (
    <div className="grid gap-4 border-b border-line py-5 text-sm lg:grid-cols-[1fr_1fr_auto]">
      <form action={editObject} className="grid gap-3">
        <input type="hidden" name="id" value={object.id} />
        <div className="flex items-center gap-3">
          <input name="name" defaultValue={object.name} aria-label={`Name for ${object.name}`} className="w-full border border-line bg-label px-3 py-2" />
          <ImageProcessingState status={object.status} />
        </div>
        <select name="editorialTag" defaultValue={object.editorialTag} aria-label={`Tag for ${object.name}`} className="border border-line bg-label px-3 py-2">
          {EDITORIAL_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <input name="sourceUrl" defaultValue={object.sourceUrl ?? ""} aria-label={`Source URL for ${object.name}`} className="border border-line bg-label px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input name="price" defaultValue={object.price ?? ""} aria-label={`Price for ${object.name}`} className="border border-line bg-label px-3 py-2" />
          <input name="currency" defaultValue={object.currency ?? ""} aria-label={`Currency for ${object.name}`} maxLength={3} className="border border-line bg-label px-3 py-2" />
        </div>
        <textarea name="note" defaultValue={object.note ?? ""} aria-label={`Provenance for ${object.name}`} className="min-h-20 border border-line bg-label px-3 py-2" />
        <button type="submit" className="w-fit border border-ink px-4 py-2">
          Save
        </button>
      </form>
      <form action={replaceObjectImage} encType="multipart/form-data" className="grid content-start gap-3">
        <input type="hidden" name="id" value={object.id} />
        <input type="hidden" name="name" value={object.name} />
        <input name="imageUrl" type="url" aria-label={`Replacement image URL for ${object.name}`} placeholder="Replacement image URL" className="border border-line bg-label px-3 py-2" />
        <input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp" aria-label={`Replacement image file for ${object.name}`} className="border border-line bg-label px-3 py-2" />
        <button type="submit" className="w-fit border border-ink px-4 py-2">
          Replace image
        </button>
      </form>
      {object.status !== "Archived" ? (
        <form action={archiveObject} className="content-start">
          <input type="hidden" name="id" value={object.id} />
          <button type="submit" className="text-muted underline underline-offset-4">
            Archive
          </button>
        </form>
      ) : null}
    </div>
  );
}
