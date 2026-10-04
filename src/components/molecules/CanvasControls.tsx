import { ChevronsUpDown, Layers, Redo2, Undo2 } from "lucide-react";
import { PROJECT } from "@/lib/floorplan";

/** Undo / redo pill (visual only: the plan is locked, so there's nothing to undo). */
export function UndoRedo() {
  return (
    <div className="absolute right-4 top-4 z-10 flex overflow-hidden rounded-xl border border-mp-line bg-white shadow-sm">
      <button type="button" aria-label="Undo" disabled className="grid h-12 w-14 place-items-center text-mp-muted">
        <Undo2 size={22} />
      </button>
      <span className="my-2 w-px bg-mp-line" />
      <button type="button" aria-label="Redo" disabled className="grid h-12 w-14 place-items-center text-mp-muted">
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
