import { ChevronsUpDown, Layers, Redo2, Undo2 } from "lucide-react";
import { PROJECT } from "@/lib/floorplan";
import { cn } from "@/lib/utils";

/** Undo / redo pill (visual only: the plan is locked, so there's nothing to undo). */
/**
 * Undo / redo, top right like magicplan. The plan is locked, so they step
 * through the open escalation draft (moves, rotations, values, ghost
 * placement); with nothing to undo they're shown disabled.
 */
export function UndoRedo({
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: {
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}) {
  const btn = "grid h-12 w-14 place-items-center transition-colors active:bg-gray-100 disabled:active:bg-transparent";
  return (
    <div className="absolute right-4 top-4 z-10 flex overflow-hidden rounded-xl border border-mp-line bg-white shadow-sm">
      <button
        type="button"
        aria-label="Undo"
        disabled={!canUndo}
        onClick={onUndo}
        className={cn(btn, canUndo ? "text-mp-ink" : "text-gray-300")}
      >
        <Undo2 size={22} />
      </button>
      <span className="my-2 w-px bg-mp-line" />
      <button
        type="button"
        aria-label="Redo"
        disabled={!canRedo}
        onClick={onRedo}
        className={cn(btn, canRedo ? "text-mp-ink" : "text-gray-300")}
      >
        <Redo2 size={22} />
      </button>
    </div>
  );
}

/** Floor + view pickers, bottom-left of the canvas (magicplan chrome). */
export function FloorPicker() {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-3">
      <button type="button" className="flex h-12 items-center gap-2.5 rounded-xl border border-mp-line bg-white px-4 text-[16px] font-semibold shadow-sm">
        <Layers size={20} /> {PROJECT.floor} <ChevronsUpDown size={16} className="text-mp-muted" />
      </button>
      <button type="button" className="flex h-12 items-center gap-2.5 rounded-xl border border-mp-line bg-white px-4 text-[16px] font-semibold shadow-sm">
        2D View <ChevronsUpDown size={16} className="text-mp-muted" />
      </button>
    </div>
  );
}
