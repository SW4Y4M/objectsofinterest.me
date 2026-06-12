"use client";

import { Grid2X2, LayoutGrid } from "lucide-react";

export type WallView = "masonry" | "grid";

type ViewSwitcherProps = {
  view: WallView;
  onChange: (view: WallView) => void;
};

export function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1" aria-label="Wall view">
      <button
        type="button"
        aria-label="Masonry view"
        aria-pressed={view === "masonry"}
        onClick={() => onChange("masonry")}
        className="grid h-9 w-9 place-items-center border border-line bg-transparent text-ink aria-pressed:bg-ink aria-pressed:text-wall"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        type="button"
        aria-label="Strict grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className="grid h-9 w-9 place-items-center border border-line bg-transparent text-ink aria-pressed:bg-ink aria-pressed:text-wall"
      >
        <Grid2X2 size={16} />
      </button>
    </div>
  );
}
