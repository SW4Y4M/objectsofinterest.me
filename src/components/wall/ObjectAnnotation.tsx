import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { formatPrice } from "@/lib/format/price";

type ObjectAnnotationProps = {
  object: PublicWishlistObject;
};

export function ObjectAnnotation({ object }: ObjectAnnotationProps) {
  const price = formatPrice(object.price, object.currency);

  return (
    <div className="absolute left-1/2 top-1/2 z-10 w-64 -translate-x-1/2 translate-y-8 border border-line bg-label px-4 py-3 text-left text-sm shadow-label">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-medium text-ink">{object.name}</h2>
        <span className="text-xs text-muted">{object.editorialTag}</span>
      </div>
      {price ? <p className="mt-2 text-xs text-muted">{price}</p> : null}
      {object.note ? <p className="mt-3 leading-relaxed text-ink">{object.note}</p> : null}
      {object.sourceUrl ? (
        <a className="mt-3 inline-block text-xs text-muted underline underline-offset-4" href={object.sourceUrl} target="_blank" rel="noreferrer">
          Source
        </a>
      ) : null}
    </div>
  );
}
