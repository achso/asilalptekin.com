"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair } from "lucide-react";
import { memo } from "react";
import { FloorPicker, UndoRedo } from "@/components/molecules/CanvasControls";
import { ElementBadges } from "@/components/molecules/ElementBadges";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import type { EscalationStatus, Point, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FloorPlan } from "./FloorPlan";

/**
 * CanvasArea (organism): the main work surface. A dot-grid background (CSS),
 * the SVG FloorPlan, and one badge per element (escalation pin or yellow
 * paperclip, see ElementBadges).
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
  statusFor: (el: SelectedElement) => EscalationStatus | undefined;
  /** Standard Photos & Notes count per element (yellow paperclip). */
  photoCountFor: (el: SelectedElement) => number;
  onSelect: (el: SelectedElement | null) => void;
  /** Ghost Marker placement (Undocumented Element), see FloorPlan. */
  placing?: boolean;
  draftMarker?: Point | null;
  onPlace?: (p: Point) => void;
  markers?: { id: string; point: Point; status: EscalationStatus }[];
  className?: string;
};

export const CanvasArea = memo(function CanvasArea({
  selectedElement,
  statusFor,
  photoCountFor,
  onSelect,
  placing,
  draftMarker,
  onPlace,
  markers,
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
        photoCountFor={photoCountFor}
        onSelect={onSelect}
        placing={placing}
        draftMarker={draftMarker}
        onPlace={onPlace}
        markers={markers}
      />

      {/* Placement prompt: the canvas is in a different mode, so say so on the canvas. */}
      <AnimatePresence>
        {placing && !draftMarker && (
          <motion.div
            key="place-hint"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "tween", duration: 0.18 }}
            role="status"
            className="pointer-events-none absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-mp-blue px-4 py-2.5 text-[15px] font-semibold text-white shadow-lg"
          >
            <Crosshair size={18} /> Tap the plan where it is
          </motion.div>
        )}
      </AnimatePresence>

      <ElementBadges statusFor={statusFor} photoCountFor={photoCountFor} onPress={onSelect} />

      <UndoRedo />
      <FloorPicker />
    </main>
  );
});
