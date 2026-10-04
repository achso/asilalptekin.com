"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { elementInfo } from "@/lib/floorplan";
import type { SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { DeviationState } from "@/store/deviationMachine";

/**
 * ReportDeviationAction (molecule)
 *
 * The single entry point to the deviation workflow, at the top of the
 * LeftToolbar. A deviation must be anchored to geometry, so it only exists
 * while something is selected:
 *
 *   selectedElement === null          → null (nothing rendered)
 *   element already escalated/locked  → null (its EscalationCard takes over)
 *   element idle or resolved          → button; pressing it calls
 *                                       onReport({ type, id }) so the
 *                                       DeviationForm knows its anchor.
 *
 * For an exit animation, the parent renders it inside <AnimatePresence>,
 * conditionally on `selectedElement` and keyed by the element.
 */

/** States from which a (new) report can be started. Resolved elements can be re-reported. */
const REPORTABLE: ReadonlySet<DeviationState> = new Set(["idle", "resolved"]);

export type ReportDeviationActionProps = {
  /** What the contractor tapped on the plan, or null. */
  selectedElement: SelectedElement | null;
  /** Deviation state of that element. */
  deviationState: DeviationState;
  /** Receives the anchor (element type + id) for the DeviationForm. */
  onReport: (anchor: SelectedElement) => void;
  className?: string;
};

export function ReportDeviationAction({
  selectedElement,
  deviationState,
  onReport,
  className,
}: ReportDeviationActionProps) {
  if (!selectedElement) return null;
  if (!REPORTABLE.has(deviationState)) return null;

  const { label } = elementInfo(selectedElement);

  return (
    <motion.button
      type="button"
      data-anchor-type={selectedElement.type}
      data-anchor-id={selectedElement.id}
      aria-label={`Report deviation on ${label}`}
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onReport(selectedElement)}
      className={cn(
        "flex h-14 items-center gap-2.5 whitespace-nowrap rounded-xl bg-mp-red px-4 text-[17px] font-semibold text-white shadow-[0_6px_16px_rgba(229,53,43,0.3)] active:brightness-95",
        className,
      )}
    >
      <MapPin size={22} strokeWidth={2.5} aria-hidden />
      Report Deviation
    </motion.button>
  );
}
