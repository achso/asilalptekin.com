"use client";

import { AnimatePresence } from "framer-motion";
import { FloorPicker, UndoRedo } from "@/components/molecules/CanvasControls";
import { EscalationBadges } from "@/components/molecules/EscalationBadge";
import { ReportDeviationAction } from "@/components/molecules/ReportDeviationAction";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import type { Escalation, EscalationStatus, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { DeviationState } from "@/store/deviationMachine";
import { FloorPlan } from "./FloorPlan";

/**
 * CanvasArea (organism): the main work surface. A dot-grid background (CSS),
 * the SVG FloorPlan, and everything pinned to plan geometry: status badges
 * and the floating Report Deviation action. magicplan's canvas chrome
 * (undo/redo, floor picker) sits on top.
 */
export type CanvasAreaProps = {
  selectedElement: SelectedElement | null;
  escalations: Escalation[];
  statusFor: (el: SelectedElement) => EscalationStatus | undefined;
  /** Element the floating action is offered for (null hides it). */
  actionElement: SelectedElement | null;
  actionState: DeviationState;
  onSelect: (el: SelectedElement | null) => void;
  onReport: (anchor: SelectedElement) => void;
  className?: string;
};

export function CanvasArea({
  selectedElement,
  escalations,
  statusFor,
  actionElement,
  actionState,
  onSelect,
  onReport,
  className,
}: CanvasAreaProps) {
  return (
    <main
      aria-label="Floor plan"
      style={{ width: CANVAS_W, height: CANVAS_H }}
      className={cn(
        "relative overflow-hidden bg-mp-canvas",
        // magicplan's empty-canvas dot grid
        "bg-[radial-gradient(circle,#b9c6d6_1.2px,transparent_1.4px)] bg-[size:44px_44px] bg-[position:0_0]",
        className,
      )}
    >
      <FloorPlan
        width={CANVAS_W}
        height={CANVAS_H}
        selected={selectedElement}
        statusFor={statusFor}
        onSelect={onSelect}
      />

      <EscalationBadges escalations={escalations} onPress={onSelect} />

      <AnimatePresence>
        {actionElement && (
          <ReportDeviationAction
            key={`${actionElement.type}:${actionElement.id}`}
            placement="canvas"
            selectedElement={actionElement}
            deviationState={actionState}
            onReport={onReport}
          />
        )}
      </AnimatePresence>

      <UndoRedo />
      <FloorPicker />
    </main>
  );
}
