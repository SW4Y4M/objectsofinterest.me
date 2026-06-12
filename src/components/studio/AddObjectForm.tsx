import { addObject } from "@/app/studio/actions";
import { EDITORIAL_TAGS } from "@/lib/domain/wishlistObject";

export function AddObjectForm() {
  return (
    <form action={addObject} encType="multipart/form-data" className="grid gap-4 border-y border-line py-6">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm text-muted">
          Object name
        </label>
        <input id="name" name="name" required className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="editorialTag" className="text-sm text-muted">
          Editorial tag
        </label>
        <select id="editorialTag" name="editorialTag" required className="border border-line bg-label px-3 py-2">
          {EDITORIAL_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label htmlFor="imageUrl" className="text-sm text-muted">
          Image URL
        </label>
        <input id="imageUrl" name="imageUrl" type="url" className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="imageFile" className="text-sm text-muted">
          Image upload
        </label>
        <input id="imageFile" name="imageFile" type="file" accept="image/png,image/jpeg,image/webp" className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="sourceUrl" className="text-sm text-muted">
          Source URL
        </label>
        <input id="sourceUrl" name="sourceUrl" type="url" className="border border-line bg-label px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="price" aria-label="Price" placeholder="Price" className="border border-line bg-label px-3 py-2" />
        <input name="currency" aria-label="Currency" placeholder="USD" maxLength={3} className="border border-line bg-label px-3 py-2" />
      </div>
      <textarea
        name="note"
        aria-label="Provenance"
        placeholder="Why this object, where it came from, or who recommended it"
        className="min-h-24 border border-line bg-label px-3 py-2"
      />
      <button type="submit" className="w-fit bg-ink px-5 py-2 text-wall">
        Add object
      </button>
    </form>
  );
}
