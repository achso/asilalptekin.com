"use client";

import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { DeviationState } from "@/store/deviationMachine";
import { elementInfo } from "@/lib/floorplan";
import type { SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FloatingAnchor } from "@/components/atoms/FloatingAnchor";

/**
 * ReportDeviationAction (molecule)
 *
 * The fat-finger primary action. A deviation must be anchored to geometry, so
 * this only exists while something is selected:
 *
 *   selectedElement === null          → null (nothing rendered)
 *   element already escalated/locked  → null (its EscalationCard takes over)
 *   element idle or resolved          → button; pressing it calls
 *                                       onReport({ type, id }) so the
 *                                       DeviationForm knows its anchor.
 *
 * `placement="canvas"` floats it next to the element; `placement="toolbar"`
 * renders it inline at the top of the left tool palette.
 *
 * For an exit animation, the parent renders it inside <AnimatePresence>,
 * conditionally on `selectedElement` and keyed by the element.
 */

/** States from which a (new) report can be started. Resolved walls can be re-reported. */
const REPORTABLE: ReadonlySet<DeviationState> = new Set(["idle", "resolved"]);

const action = cva(
  "flex items-center whitespace-nowrap bg-mp-red font-semibold text-white active:brightness-95",
  {
    variants: {
      placement: {
        canvas:
          "h-16 gap-3 rounded-2xl pl-4 pr-6 text-[19px] shadow-[0_10px_30px_rgba(229,53,43,0.45)] ring-4 ring-white",
        toolbar: "h-14 gap-2.5 rounded-xl px-4 text-[17px] shadow-[0_6px_16px_rgba(229,53,43,0.3)]",
      },
    },
  },
);

const icon = cva("grid place-items-center", {
  variants: {
    placement: {
      canvas: "size-10 rounded-xl bg-white/20",
      toolbar: "",
    },
  },
});

export type ReportDeviationActionProps = {
  /** What the contractor tapped on the plan, or null. */
  selectedElement: SelectedElement | null;
  /** Deviation state of that element. */
  deviationState: DeviationState;
  placement: "canvas" | "toolbar";
  /** Receives the anchor (element type + id) for the DeviationForm. */
  onReport: (anchor: SelectedElement) => void;
  className?: string;
};

export function ReportDeviationAction({
  selectedElement,
  deviationState,
  placement,
  onReport,
  className,
}: ReportDeviationActionProps) {
  if (!selectedElement) return null;
  if (!REPORTABLE.has(deviationState)) return null;

  const { label } = elementInfo(selectedElement);
  const button = (
    <motion.button
      type="button"
      data-anchor-type={selectedElement.type}
      data-anchor-id={selectedElement.id}
      aria-label={`Report deviation on ${label}`}
      initial={placement === "canvas" ? { scale: 0.6, opacity: 0 } : { x: -24, opacity: 0 }}
      animate={placement === "canvas" ? { scale: 1, opacity: 1 } : { x: 0, opacity: 1 }}
      exit={placement === "canvas" ? { scale: 0.6, opacity: 0 } : { x: -24, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onReport(selectedElement)}
      className={cn(action({ placement }), className)}
    >
      <span className={icon({ placement })}>
        <MapPin size={placement === "canvas" ? 24 : 22} strokeWidth={2.5} />
      </span>
      Report Deviation
    </motion.button>
  );

  return placement === "canvas" ? (
    <FloatingAnchor element={selectedElement} distance={selectedElement.type === "room" ? 0 : 78}>
      {button}
    </FloatingAnchor>
  ) : (
    button
  );
}
