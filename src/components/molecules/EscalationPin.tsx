"use client";

import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Lock } from "lucide-react";
import { FloatingAnchor } from "@/components/atoms/FloatingAnchor";
import { WALL_THICKNESS, elementInfo } from "@/lib/floorplan";
import type { Escalation, EscalationStatus, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/store/deviationMachine";

/**
 * EscalationPin (molecule)
 *
 * Compact status marker pinned to escalated geometry, like the small
 * paperclip marker in the native app. A 24px disc instead of a text pill, so
 * the plan stays legible with several reports in one room. The red hatch on
 * the wall itself still carries the "locked" state; the pin marks the spot
 * and opens the report.
 *
 *   sending / delivered → red disc, white lock
 *   in_review           → amber disc, white eye, soft pulse ring
 *   resolved            → green disc, white check
 *
 * The visible disc is 24px, but the button around it is a 44px touch target.
 */

const disc = cva(
  "relative grid size-6 place-items-center rounded-full text-white shadow-md ring-2 ring-white transition-colors duration-300",
  {
    variants: {
      status: {
        sending: "bg-red-500",
        delivered: "bg-red-500",
        in_review: "bg-amber-500",
        resolved: "bg-emerald-600",
      },
    },
  },
);

const ICON: Record<EscalationStatus, React.ReactNode> = {
  sending: <Lock size={12} strokeWidth={3} aria-hidden />,
  delivered: <Lock size={12} strokeWidth={3} aria-hidden />,
  in_review: <Eye size={13} strokeWidth={2.75} aria-hidden />,
  resolved: <Check size={13} strokeWidth={3.5} aria-hidden />,
};

export type EscalationPinProps = {
  status: EscalationStatus;
  /** Accessible name of the anchored element, e.g. "North wall". */
  label: string;
  onPress?: () => void;
  className?: string;
};

/** The pin itself (no positioning). Usable anywhere, e.g. in the sandbox. */
export function EscalationPin({ status, label, onPress, className }: EscalationPinProps) {
  const meta = STATUS_META[status];
  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-label={`${label}: ${meta.badge}, ${meta.label}`}
      title={`${meta.badge} · ${meta.label}`}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, transition: { duration: 0.18, ease: [0.2, 0, 0, 1] } }}
      exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.9 }}
      className={cn("grid size-11 place-items-center rounded-full will-change-transform", className)}
    >
      <span className={disc({ status })}>
        {status === "in_review" && (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-60"
          />
        )}
        <span className="relative">{ICON[status]}</span>
      </span>
    </motion.button>
  );
}

/**
 * Where the pin sits: centred on the wall's body (it's drawn half a thickness
 * outside the room line), on the corner node, or on the room's anchor point.
 */
const PIN_OFFSET: Record<SelectedElement["type"], number> = {
  wall: -WALL_THICKNESS / 2,
  corner: 0,
  room: 0,
};

/** All pins for the canvas, anchored to their elements. */
export function EscalationPins({
  escalations,
  onPress,
}: {
  escalations: Escalation[];
  onPress: (el: SelectedElement) => void;
}) {
  return (
    <AnimatePresence>
      {escalations.map((e) => (
        <FloatingAnchor
          key={e.id}
          element={e.target}
          distance={PIN_OFFSET[e.target.type]}
          margin={{ x: 22, y: 22 }}
        >
          <EscalationPin
            status={e.status}
            label={elementInfo(e.target).label}
            onPress={() => onPress(e.target)}
          />
        </FloatingAnchor>
      ))}
    </AnimatePresence>
  );
}
