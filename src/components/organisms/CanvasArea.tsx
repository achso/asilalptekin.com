"use client";

import { memo } from "react";
import { FloorPicker, UndoRedo } from "@/components/molecules/CanvasControls";
import { EscalationBadges } from "@/components/molecules/EscalationBadge";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import type { Escalation, EscalationStatus, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FloorPlan } from "./FloorPlan";

/**
 * CanvasArea (organism): the main work surface. A dot-grid background (CSS),
 * the SVG FloorPlan, and the status badges pinned to escalated geometry.
 * magicplan's canvas chrome (undo/redo, floor picker) sits on top.
 *
 * Memoised: with stable props from page.tsx it re-renders only when the
 * selection or the escalations change, not on toasts or sidebar updates.
 *
 * The canvas only handles selection and status. It never starts a report: the
 * single entry point is ReportDeviationAction at the top of the LeftToolbar,
 * so nothing floats over the element the contractor is looking at.
 */
export type CanvasAreaProps = {
  selectedElement: SelectedElement | null;
  escalations: Escalation[];
  statusFor: (el: SelectedElement) => EscalationStatus | undefined;
  onSelect: (el: SelectedElement | null) => void;
  className?: string;
};

export const CanvasArea = memo(function CanvasArea({
  selectedElement,
  escalations,
  statusFor,
  onSelect,
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

      <UndoRedo />
      <FloorPicker />
    </main>
  );
});
