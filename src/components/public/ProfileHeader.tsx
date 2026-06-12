"use client";

import type { ActiveTag } from "./TagRail";
import { TagRail } from "./TagRail";
import type { WallView } from "./ViewSwitcher";
import { ViewSwitcher } from "./ViewSwitcher";

type ProfileHeaderProps = {
  activeTag: ActiveTag;
  view: WallView;
  onTagChange: (tag: ActiveTag) => void;
  onViewChange: (view: WallView) => void;
};

export function ProfileHeader({ activeTag, view, onTagChange, onViewChange }: ProfileHeaderProps) {
  const title = process.env.NEXT_PUBLIC_PROFILE_TITLE ?? "@swayam's Objects of Interest";

  return (
    <header className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 pb-8 pt-7 sm:px-8">
      <div className="flex items-start justify-between gap-6">
        <h1 className="max-w-xl text-2xl font-medium leading-tight text-ink sm:text-3xl">{title}</h1>
        <ViewSwitcher view={view} onChange={onViewChange} />
      </div>
      <TagRail activeTag={activeTag} onChange={onTagChange} />
    </header>
  );
}
