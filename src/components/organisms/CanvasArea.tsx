"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, X } from "lucide-react";
import { memo } from "react";
import { FloorPicker, UndoRedo } from "@/components/molecules/CanvasControls";
import { ElementBadges } from "@/components/molecules/ElementBadges";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import { categoryLabel } from "@/lib/floorplan";
import type { ElementCategory, EscalationStatus, Point, SelectedElement } from "@/lib/types";
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
 * The canvas handles selection and status. In ghost_draft (after Insert or
 * Add Wall) a tap inside the room drops the Ghost Object instead, and an
 * on-canvas prompt says so until it's placed.
 */
export type CanvasAreaProps = {
  selectedElement: SelectedElement | null;
  statusFor: (el: SelectedElement) => EscalationStatus | undefined;
  /** Standard Photos & Notes count per element (yellow paperclip). */
  photoCountFor: (el: SelectedElement) => number;
  onSelect: (el: SelectedElement | null) => void;
  /** Ghost Object placement (ghost_draft), see FloorPlan. */
  placing?: boolean;
  draftMarker?: Point | null;
  draftCategory?: ElementCategory | null;
  onPlace?: (p: Point) => void;
  /** Leave ghost_draft before anything was placed. */
  onCancelPlacing?: () => void;
  markers?: { id: string; point: Point; status: EscalationStatus; category?: ElementCategory }[];
  className?: string;
};

export const CanvasArea = memo(function CanvasArea({
  selectedElement,
  statusFor,
  photoCountFor,
  onSelect,
  placing,
  draftMarker,
  draftCategory,
  onPlace,
  onCancelPlacing,
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
        draftCategory={draftCategory}
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
            className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-mp-red py-1.5 pl-4 pr-1.5 text-[15px] font-semibold text-white shadow-lg"
          >
            <Crosshair size={18} aria-hidden />
            {draftCategory === "structural"
              ? "Tap where the wall is"
              : draftCategory
                ? `Tap where the ${categoryLabel(draftCategory)} item is`
                : "Tap the plan where it is"}
            <button
              type="button"
              onClick={onCancelPlacing}
              aria-label="Cancel placing"
              className="ml-1 grid size-9 place-items-center rounded-full bg-white/20 active:bg-white/30"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ElementBadges statusFor={statusFor} photoCountFor={photoCountFor} onPress={onSelect} />

      <UndoRedo />
      <FloorPicker />
    </main>
  );
});
