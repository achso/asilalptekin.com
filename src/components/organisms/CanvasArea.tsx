"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, X } from "lucide-react";
import { memo } from "react";
import { FloorPicker, UndoRedo } from "@/components/molecules/CanvasControls";
import { ElementBadges } from "@/components/molecules/ElementBadges";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import type { EscalationStatus, Point, SelectedElement, WallLine, WallSpot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FloorPlan, type GhostSpec } from "./FloorPlan";
import type { ObjectProposal } from "./PlanObjects";

/**
 * CanvasArea (organism): the main work surface. A dot-grid background (CSS),
 * the SVG FloorPlan, and one badge per element (escalation pin or yellow
 * paperclip, see ElementBadges).
 * magicplan's canvas chrome (undo/redo, floor picker) sits on top.
 *
 * Memoised: with stable props from page.tsx it re-renders only when the
 * selection or the escalations change, not on toasts or sidebar updates.
 *
 * The canvas handles selection and status, plus the intercepts:
 *  - tapping a wall's dimension label reports it (onDimensionTap); the page
 *    shows the Change Measurement popover
 *  - objects are selectable and rotatable; a rotation is a proposal
 *    (onRotateObject) drawn as a red dashed ghost
 *  - in ghost_draft (after Insert → Object → a category) a tap inside the room
 *    drops the red dashed ghost, and an on-canvas banner says so until placed
 */
export type CanvasAreaProps = {
  selectedElement: SelectedElement | null;
  statusFor: (el: SelectedElement) => EscalationStatus | undefined;
  /** Standard Photos & Notes count per element (yellow paperclip). */
  photoCountFor: (el: SelectedElement) => number;
  onSelect: (el: SelectedElement | null) => void;
  /** Wall taps mark their exact spot (blue triangle), see FloorPlan. */
  onSelectWallAt?: (spot: WallSpot) => void;
  tapSpot?: WallSpot | null;
  /** Ghost wall placement (ghost_draft), see FloorPlan. */
  placing?: boolean;
  draftMarker?: Point | null;
  draftGhost?: GhostSpec | null;
  /** The inserted (draft) element is the selection. */
  ghostSelected?: boolean;
  /** Drawing a wall (two taps): the first tap, once made. */
  wallStart?: Point | null;
  onSelectItem?: (id: string) => void;
  onMoveItem?: (id: string, center: Point) => void;
  onRotateItem?: (id: string, rotation: number) => void;
  onLineChange?: (line: WallLine, key: "end" | "move") => void;
  onPlace?: (p: Point) => void;
  /** Leave ghost_draft before anything was placed. */
  onCancelPlacing?: () => void;
  /** Category picked in Insert → Object, shown in the placement banner. */
  ghostCategory?: string | null;
  markers?: (GhostSpec & { id: string; status: EscalationStatus })[];
  onDimensionTap?: (wallId: string, at: Point) => void;
  objectProposals?: Record<string, ObjectProposal | undefined>;
  onRotateObject?: (objectId: string, rotation: number) => void;
  onMoveObject?: (objectId: string, center: Point) => void;
  removals?: Record<string, EscalationStatus | "draft" | undefined>;
  /** Undo / redo for the open draft (the plan itself is locked). */
  undo?: { canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void };
  className?: string;
};

export const CanvasArea = memo(function CanvasArea({
  selectedElement,
  statusFor,
  photoCountFor,
  onSelect,
  onSelectWallAt,
  tapSpot,
  placing,
  draftMarker,
  draftGhost,
  ghostSelected,
  wallStart,
  onSelectItem,
  onMoveItem,
  onRotateItem,
  onLineChange,
  onPlace,
  onCancelPlacing,
  ghostCategory,
  markers,
  onDimensionTap,
  objectProposals,
  onRotateObject,
  onMoveObject,
  removals,
  undo,
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
        onSelectWallAt={onSelectWallAt}
        tapSpot={tapSpot}
        placing={placing}
        draftGhost={draftGhost}
        ghostSelected={ghostSelected}
        wallStart={wallStart}
        drawingWall={placing && ghostCategory === "Wall"}
        onSelectItem={onSelectItem}
        onMoveItem={onMoveItem}
        onRotateItem={onRotateItem}
        onLineChange={onLineChange}
        onPlace={onPlace}
        markers={markers}
        onDimensionTap={onDimensionTap}
        objectProposals={objectProposals}
        onRotateObject={onRotateObject}
        onMoveObject={onMoveObject}
        removals={removals}
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
            className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-black/80 py-1.5 pl-4 pr-1.5 text-[15px] font-semibold text-white shadow-lg"
          >
            <Crosshair size={18} aria-hidden />
            {ghostCategory === "Wall"
              ? wallStart
                ? "Tap where the wall ends"
                : "Tap where the wall starts"
              : "Tap where the missing element is"}
            {ghostCategory && ghostCategory !== "Wall" && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[13px] font-semibold">{ghostCategory}</span>
            )}
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

      <UndoRedo {...undo} />
      <FloorPicker />
    </main>
  );
});
