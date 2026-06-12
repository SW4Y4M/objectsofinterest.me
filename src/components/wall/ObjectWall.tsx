"use client";

import { useEffect, useMemo, useState } from "react";
import { ProfileHeader } from "@/components/public/ProfileHeader";
import type { ActiveTag } from "@/components/public/TagRail";
import type { WallView } from "@/components/public/ViewSwitcher";
import type { PublicWishlistObject } from "@/lib/domain/wishlistObject";
import { MasonryWall } from "./MasonryWall";
import { StrictGridWall } from "./StrictGridWall";

type ObjectWallProps = {
  objects: PublicWishlistObject[];
  activeTag?: ActiveTag;
  initialView?: WallView;
  showDebugOutlines?: boolean;
};

type InteractionMode = "hover" | "pinned" | null;

export function ObjectWall({
  objects,
  activeTag: initialTag = "All",
  initialView = "masonry",
  showDebugOutlines = false
}: ObjectWallProps) {
  const [activeTag, setActiveTag] = useState<ActiveTag>(initialTag);
  const [view, setView] = useState<WallView>(initialView);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(null);

  useEffect(() => {
    const storedView = window.localStorage.getItem("wishlist:view");
    if (storedView === "masonry" || storedView === "grid") {
      setView(storedView);
    }
  }, []);

  const filteredObjects = useMemo(
    () => objects.filter((object) => (activeTag === "All" ? true : object.editorialTag === activeTag)),
    [activeTag, objects]
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-object-tile]")) {
        return;
      }

      setActiveId(null);
      setInteractionMode(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function changeView(nextView: WallView) {
    setView(nextView);
    window.localStorage.setItem("wishlist:view", nextView);
  }

  function hoverObject(id: string) {
    setActiveId(id);
    setInteractionMode((current) => (current === "pinned" ? "pinned" : "hover"));
  }

  function toggleObject(id: string) {
    setActiveId((current) => {
      if (current === id && interactionMode === "pinned") {
        setInteractionMode(null);
        return null;
      }

      setInteractionMode("pinned");
      return id;
    });
  }

  function deactivateObject(id: string) {
    setActiveId((current) => (current === id ? null : current));
    setInteractionMode((current) => (current === "hover" ? null : current));
  }

  return (
    <>
      <ProfileHeader activeTag={activeTag} view={view} onTagChange={setActiveTag} onViewChange={changeView} />
      <div className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
        {filteredObjects.length === 0 ? (
          <div className="grid min-h-80 place-items-center border-y border-line text-center">
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {activeTag === "All" ? "The wall is waiting for its first object." : "No objects in this tag yet."}
            </p>
          </div>
        ) : view === "grid" ? (
          <StrictGridWall
            objects={filteredObjects}
            activeId={activeId}
            interactionMode={interactionMode}
            showDebugOutlines={showDebugOutlines}
            onHover={hoverObject}
            onToggle={toggleObject}
            onDeactivate={deactivateObject}
          />
        ) : (
          <MasonryWall
            objects={filteredObjects}
            activeId={activeId}
            interactionMode={interactionMode}
            onHover={hoverObject}
            onToggle={toggleObject}
            onDeactivate={deactivateObject}
          />
        )}
      </div>
    </>
  );
}
