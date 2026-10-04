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
 *   form open for it (`active`)        → same button, pressed and disabled,
 *                                       so the toolbar never shifts.
 *
 * For an exit animation, the parent renders it inside <AnimatePresence>,
 * conditionally on `selectedElement`, with a stable key (not per element) so
 * changing the selection updates it in place instead of remounting.
 */

/** Short tween on transform + opacity only (GPU-composited, no layout work). */
const ENTER = { duration: 0.16, ease: [0.2, 0, 0, 1] } as const;
const EXIT = { duration: 0.12, ease: [0.4, 0, 1, 1] } as const;

/** States from which a (new) report can be started. Resolved elements can be re-reported. */
const REPORTABLE: ReadonlySet<DeviationState> = new Set(["idle", "resolved"]);

export type ReportDeviationActionProps = {
  /** What the contractor tapped on the plan, or null. */
  selectedElement: SelectedElement | null;
  /** Deviation state of that element. */
  deviationState: DeviationState;
  /** Receives the anchor (element type + id) for the DeviationForm. */
  onReport: (anchor: SelectedElement) => void;
  /**
   * The DeviationForm is open for this element: stay mounted (so the toolbar
   * doesn't shift) but render as the pressed, current mode.
   */
  active?: boolean;
  className?: string;
};

export function ReportDeviationAction({
  selectedElement,
  deviationState,
  onReport,
  active = false,
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
      aria-label={active ? `Reporting deviation on ${label}` : `Report deviation on ${label}`}
      aria-pressed={active}
      disabled={active}
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: active ? 0.6 : 1, transition: ENTER }}
      exit={{ x: -12, opacity: 0, transition: EXIT }}
      whileTap={active ? undefined : { scale: 0.96, transition: { duration: 0.08 } }}
      onClick={active ? undefined : () => onReport(selectedElement)}
      className={cn(
        "flex h-14 items-center gap-2.5 whitespace-nowrap rounded-xl bg-mp-red px-4 text-[17px] font-semibold text-white will-change-transform",
        active
          ? // Pressed / current mode: sunk in, no lift shadow, not tappable
            "cursor-default shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]"
          : "shadow-[0_6px_16px_rgba(229,53,43,0.3)] active:brightness-95",
        className,
      )}
    >
      <MapPin size={22} strokeWidth={2.5} aria-hidden />
      Report Deviation
    </motion.button>
  );
}
