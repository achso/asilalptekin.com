"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronsUpDown,
  Columns2,
  Copy,
  Move,
  Plus,
  Scaling,
  Spline,
  SquarePlus,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { ObjectCategoryIcon } from "@/components/atoms/ObjectCategoryIcon";
import { ToolButton } from "@/components/atoms/ToolButton";
import { ELEMENT_CATEGORIES } from "@/lib/floorplan";
import type { ElementCategory, InterceptTool } from "@/lib/types";
import { cn } from "@/lib/utils";

export const LOCKED_MESSAGE =
  "Plan locked for execution. Insert, Add Wall, Set Size and Delete open a proposal for the remote expert.";

/**
 * Tool ids. Intercept tools look and act like magicplan's, but never edit the
 * locked plan: they open an escalation draft instead ("Intercept and Propose").
 * The others stay locked.
 */
type ToolId = "insert" | "set-size" | "edit-layout" | "duplicate" | "delete" | "add-corner" | "add-wall" | "split-room";
type Tool = { id: ToolId; icon: LucideIcon; label: string; chevron?: boolean; danger?: boolean; intercept?: boolean };

/** magicplan's room-level actions (room view: nothing or the floor selected). */
const ROOM_TOOLS: Tool[] = [
  { id: "insert", icon: Plus, label: "Insert", chevron: true, intercept: true },
  { id: "set-size", icon: Scaling, label: "Set Size", intercept: true },
  { id: "edit-layout", icon: Move, label: "Edit Layout" },
  { id: "duplicate", icon: Copy, label: "Duplicate", chevron: true },
  { id: "delete", icon: Trash2, label: "Delete…", danger: true, intercept: true },
];

/** Element-level drafting tools (a wall or corner selected). */
const ELEMENT_TOOLS: Tool[] = [
  { id: "insert", icon: Plus, label: "Insert", chevron: true, intercept: true },
  { id: "add-corner", icon: Spline, label: "Add Corner" },
  { id: "add-wall", icon: SquarePlus, label: "Add Wall", intercept: true },
  { id: "split-room", icon: Columns2, label: "Split Room" },
  { id: "delete", icon: Trash2, label: "Delete…", danger: true, intercept: true },
];

/**
 * LeftToolbar (organism)
 *
 * The permit is approved, so the plan is in its execution phase. magicplan's
 * tools stay where users expect them, and the ones that describe a real
 * on-site discrepancy are live, intercepted into proposals:
 *
 *   Insert → native "All Objects" menu → pick a category → ghost_draft
 *   Add Wall → ghost_draft preset to Structural
 *   (the next canvas tap drops a Ghost Object and opens the draft pane)
 *   Set Size → Dimension Mismatch on the room (width + length)
 *   Delete… → Element Not on Site for the selected wall / corner
 *
 * Edit Layout, Duplicate, Add Corner and Split Room have no on-site meaning
 * and stay locked (a tap explains why).
 */
export function LeftToolbar({
  mode,
  activeTool,
  onInsert,
  onAddWall,
  onSetSize,
  onDelete,
  onLockedTool,
  className,
}: {
  mode: "room" | "element";
  /** The intercept whose draft (or ghost placement) is open: shown pressed. */
  activeTool?: InterceptTool | null;
  onInsert: (category: ElementCategory) => void;
  onAddWall: () => void;
  onSetSize: () => void;
  onDelete: () => void;
  /** Tapping a locked tool explains the lock (guided friction) instead of doing nothing. */
  onLockedTool?: () => void;
  className?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tools = mode === "room" ? ROOM_TOOLS : ELEMENT_TOOLS;

  const handlers: Partial<Record<ToolId, () => void>> = {
    insert: () => setMenuOpen((o) => !o),
    "add-wall": onAddWall,
    "set-size": onSetSize,
    delete: onDelete,
  };

  return (
    <nav
      aria-label={mode === "room" ? "Room tools" : "Drafting tools"}
      className={cn("relative flex flex-col gap-2.5", className)}
    >
      {tools.map((t) =>
        t.intercept ? (
          <ToolButton
            key={t.id}
            tone={t.danger ? "danger" : "default"}
            aria-pressed={activeTool === t.id || (t.id === "insert" && menuOpen)}
            aria-haspopup={t.id === "insert" ? "menu" : undefined}
            aria-expanded={t.id === "insert" ? menuOpen : undefined}
            onClick={() => {
              if (t.id !== "insert") setMenuOpen(false);
              handlers[t.id]?.();
            }}
            className={cn(
              (activeTool === t.id || (t.id === "insert" && menuOpen)) &&
                "border-mp-blue bg-mp-blue-soft/20 text-mp-blue",
            )}
          >
            <t.icon size={20} aria-hidden /> {t.label}
            {t.chevron && <ChevronsUpDown size={16} className="text-mp-muted" aria-hidden />}
          </ToolButton>
        ) : (
          <ToolButton key={t.id} locked onLockedTap={onLockedTool} title={`${t.label} is locked`}>
            <t.icon size={20} aria-hidden /> {t.label}
            {t.chevron && <ChevronsUpDown size={16} className="text-mp-muted" aria-hidden />}
          </ToolButton>
        ),
      )}

      <AnimatePresence>
        {menuOpen && (
          <InsertMenu
            onClose={() => setMenuOpen(false)}
            onPick={(c) => {
              setMenuOpen(false);
              onInsert(c);
            }}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}

/**
 * magicplan's "All Objects" insert menu, top level only: a category is all a
 * proposal needs (the photo carries the specifics), so rows don't drill down.
 */
function InsertMenu({ onPick, onClose }: { onPick: (c: ElementCategory) => void; onClose: () => void }) {
  return (
    <motion.div
      role="menu"
      aria-label="All Objects"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ type: "tween", duration: 0.15 }}
      className="absolute left-full top-1/2 z-20 ml-3 flex max-h-[640px] w-[300px] -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-mp-line bg-mp-panel shadow-xl"
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <span className="w-11" />
        <span className="text-[17px] font-semibold">All Objects</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close insert menu"
          className="grid size-11 place-items-center rounded-full bg-[#e6e6e9] text-[#6b6b70]"
        >
          <X size={20} strokeWidth={2.25} />
        </button>
      </div>
      <p className="px-4 pb-2 text-[12px] leading-snug text-mp-muted">
        Plan locked: pick what you found, then tap where it is. It goes to the remote expert as a proposal.
      </p>
      <div className="min-h-0 overflow-y-auto px-3 pb-3">
        <ul className="divide-y divide-mp-line overflow-hidden rounded-2xl bg-white">
          {ELEMENT_CATEGORIES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="menuitem"
                onClick={() => onPick(c.id)}
                className="flex h-12 w-full items-center gap-3 px-3 text-left active:bg-gray-50"
              >
                <ObjectCategoryIcon category={c.id} size={28} className="text-gray-700" />
                {/* No chevron: there's no deeper level to drill into. */}
                <span className="flex-1 whitespace-nowrap text-[16px]">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
