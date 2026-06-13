"use client";

import { useState } from "react";
import type { StudioWishlistObject } from "@/lib/domain/wishlistObject";
import { EditObjectForm } from "./EditObjectForm";
import { ObjectManagementCard, type ObjectManagementExpansionMode } from "./ObjectManagementCard";

export function ObjectManagementList({ objects }: { objects: StudioWishlistObject[] }) {
  const [expandedObjectId, setExpandedObjectId] = useState<string | null>(null);
  const [expansionMode, setExpansionMode] = useState<ObjectManagementExpansionMode>("edit");
  const [dirtyObjectId, setDirtyObjectId] = useState<string | null>(null);
  const [warningObjectId, setWarningObjectId] = useState<string | null>(null);

  if (objects.length === 0) {
    return <p className="py-5 text-sm text-muted">No objects yet. Add the first object above.</p>;
  }

  function expandObject(objectId: string, mode: ObjectManagementExpansionMode) {
    const switchingObjects = expandedObjectId !== null && expandedObjectId !== objectId;
    const showDirtySwitchWarning = switchingObjects && dirtyObjectId === expandedObjectId;

    setWarningObjectId(showDirtySwitchWarning ? objectId : null);
    setExpandedObjectId(objectId);
    setExpansionMode(mode);
    if (switchingObjects) {
      setDirtyObjectId(null);
    }
  }

  return (
    <div className="grid gap-3">
      {objects.map((object) => (
        <ObjectManagementCard
          key={object.id}
          object={object}
          isExpanded={expandedObjectId === object.id}
          expansionMode={expandedObjectId === object.id ? expansionMode : "edit"}
          showDirtySwitchWarning={warningObjectId === object.id}
          onEdit={() => expandObject(object.id, "edit")}
          onReplaceImage={() => expandObject(object.id, "replace")}
        >
          {expandedObjectId === object.id ? (
            <div onChange={() => setDirtyObjectId(object.id)}>
              <EditObjectForm object={object} />
            </div>
          ) : null}
        </ObjectManagementCard>
      ))}
    </div>
  );
}
