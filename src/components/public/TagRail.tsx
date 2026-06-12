"use client";

import { EDITORIAL_TAGS, type EditorialTag } from "@/lib/domain/wishlistObject";

export type ActiveTag = EditorialTag | "All";

type TagRailProps = {
  activeTag: ActiveTag;
  onChange: (tag: ActiveTag) => void;
};

export function TagRail({ activeTag, onChange }: TagRailProps) {
  const tags: ActiveTag[] = ["All", ...EDITORIAL_TAGS];

  return (
    <nav aria-label="Editorial tags" className="flex gap-5 overflow-x-auto py-3 text-sm text-muted">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag)}
          className={activeTag === tag ? "border-b border-ink pb-1 text-ink" : "pb-1 opacity-70 hover:opacity-100"}
        >
          {tag}
        </button>
      ))}
    </nav>
  );
}
