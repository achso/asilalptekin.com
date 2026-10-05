"use client";

import { AnimatePresence } from "framer-motion";
import { AttachmentBadge } from "@/components/atoms/AttachmentBadge";
import { FloatingAnchor } from "@/components/atoms/FloatingAnchor";
import { CORNERS, PLAN_OBJECTS, ROOM, WALLS, WALL_THICKNESS, elementInfo } from "@/lib/floorplan";
import type { EscalationStatus, SelectedElement } from "@/lib/types";
import { canvasBadgeFor } from "@/store/deviationMachine";
import { EscalationPin } from "./EscalationPin";

/**
 * ElementBadges (molecule): the one badge per plan element, in an HTML layer
 * above the SVG so door/window gaps or later geometry can never cover it.
 *
 * Precedence comes from `canvasBadgeFor` (store/deviationMachine.ts):
 *   escalation (red / amber / green pin)  >  yellow paperclip  >  nothing.
 * An element with standard photos AND an escalation shows only the pin.
 */

const ALL_ELEMENTS: SelectedElement[] = [
  ...WALLS.map((w) => ({ type: "wall" as const, id: w.id })),
  ...CORNERS.map((c) => ({ type: "corner" as const, id: c.id })),
  { type: "room", id: ROOM.id },
  ...PLAN_OBJECTS.map((o) => ({ type: "object" as const, id: o.id })),
];

/** Centred on the wall's body (drawn half a thickness outside the room line). */
const OFFSET: Record<SelectedElement["type"], number> = {
  wall: -WALL_THICKNESS / 2,
  corner: 0,
  room: 0,
  ghost: 0,
  object: 0,
};

export function ElementBadges({
  statusFor,
  photoCountFor,
  onPress,
}: {
  statusFor: (el: SelectedElement) => EscalationStatus | undefined;
  photoCountFor: (el: SelectedElement) => number;
  onPress: (el: SelectedElement) => void;
}) {
  return (
    <AnimatePresence>
      {ALL_ELEMENTS.map((el) => {
        const status = statusFor(el);
        const photos = photoCountFor(el);
        const badge = canvasBadgeFor(status, photos);
        if (!badge) return null;
        const label = elementInfo(el).label;
        return (
          <FloatingAnchor
            // Keyed by element + badge kind, so a paperclip → pin swap animates.
            key={`${el.type}:${el.id}:${badge}`}
            element={el}
            distance={OFFSET[el.type]}
            margin={{ x: 22, y: 22 }}
          >
            {badge === "escalation" && status ? (
              <EscalationPin status={status} label={label} onPress={() => onPress(el)} />
            ) : (
              <AttachmentBadge count={photos} label={label} onPress={() => onPress(el)} />
            )}
          </FloatingAnchor>
        );
      })}
    </AnimatePresence>
  );
}
