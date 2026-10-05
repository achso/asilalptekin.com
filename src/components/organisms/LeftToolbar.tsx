"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AppWindow,
  Armchair,
  Box,
  BrickWall,
  Camera,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  Droplets,
  Fan,
  Lock,
  SquareDashed,
  StickyNote,
  WashingMachine,
  X,
  Zap,
  ChevronsUpDown,
  Columns2,
  Copy,
  Move,
  Plus,
  Scaling,
  Spline,
  SquarePlus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ToolButton } from "@/components/atoms/ToolButton";
import { cn } from "@/lib/utils";

export const LOCKED_MESSAGE =
  "Plan locked for execution. Use Insert to mark a missing element, or tap the 4.55 dimension to propose a correction.";

type Tool = { icon: LucideIcon; label: string; chevron?: boolean; danger?: boolean; insert?: boolean };

/** magicplan's room-level actions (room view: nothing or the floor selected). */
const ROOM_TOOLS: Tool[] = [
  { icon: Plus, label: "Insert", chevron: true, insert: true },
  { icon: Scaling, label: "Set Size" },
  { icon: Move, label: "Edit Layout" },
  { icon: Copy, label: "Duplicate", chevron: true },
  { icon: Trash2, label: "Delete…", danger: true },
];

/** Element-level drafting tools (a wall or corner selected). */
const ELEMENT_TOOLS: Tool[] = [
  { icon: Plus, label: "Insert", chevron: true, insert: true },
  { icon: Spline, label: "Add Corner" },
  { icon: SquarePlus, label: "Add Wall" },
  { icon: Columns2, label: "Split Room" },
  { icon: Trash2, label: "Delete…", danger: true },
];

/** Object-level actions (a plan object or an inserted one selected). */
const OBJECT_TOOLS: Tool[] = [
  { icon: Plus, label: "Insert", chevron: true, insert: true },
  { icon: Scaling, label: "Set Size" },
  { icon: Copy, label: "Duplicate" },
  { icon: Trash2, label: "Delete…", danger: true },
];

/**
 * LeftToolbar (organism)
 *
 * The permit is approved, so the plan is in its execution phase. magicplan's
 * tools stay where users expect them and are locked, except two:
 *
 *   Delete… (a wall / corner / object selected) → "Element Not on Site" draft;
 *     nothing is deleted, the remote expert reviews the removal.
 *
 *   + Insert → native popover (Room · Object · Note · Photo · Form)
 *     Object → category grid (Structural, Plumbing, …)
 *       any category → the same trapdoor: ghost_draft. The next canvas tap
 *       drops the red dashed ghost and opens the EscalationDraftPane as
 *       "Undocumented Element → <category>".
 *   Tapping Insert again while placing cancels.
 *
 * The menus are a facade (Wizard of Oz): only the category name travels
 * into the draft; Room is locked, Note / Photo / Form point to the sidebar.
 *
 * Every other tool explains the lock on tap (guided friction).
 */
export function LeftToolbar({
  mode,
  inserting,
  draftOpen = false,
  canDelete = false,
  deleting = false,
  onDelete,
  onInsertCategory,
  onCancelInsert,
  onInsertOther,
  onLockedTool,
  spotLabel,
  canDuplicate = false,
  onDuplicate,
  canAddWall = false,
  addingWall = false,
  onAddWall,
  className,
}: {
  mode: "room" | "element" | "object";
  /** ghost_draft is on, or its draft is open: Insert shows pressed. */
  inserting: boolean;
  /** An escalation draft is open: Insert can't start another (only ✕ / Send close it). */
  draftOpen?: boolean;
  /** A wall, corner or object is selected: Delete… proposes its removal. */
  canDelete?: boolean;
  /** Its removal draft is open: Delete… shows pressed. */
  deleting?: boolean;
  onDelete?: () => void;
  /** The universal trapdoor: every category lands here. */
  onInsertCategory: (category: string) => void;
  onCancelInsert: () => void;
  /** Note / Photo / Form: not plan edits; explained, not drafted. */
  onInsertOther: (kind: "note" | "photo" | "form") => void;
  onLockedTool?: () => void;
  /** An inserted object is selected: Duplicate adds a copy to the same report. */
  canDuplicate?: boolean;
  onDuplicate?: () => void;
  /** A wall spot is marked: Add Wall inserts a wall there. */
  canAddWall?: boolean;
  /** That wall's draft is open: Add Wall shows pressed. */
  addingWall?: boolean;
  onAddWall?: () => void;
  /** A wall spot is marked (blue triangle): insertions land there, e.g. "North wall, 1.80 m from the west end". */
  spotLabel?: string | null;
  className?: string;
}) {
  const tools = mode === "room" ? ROOM_TOOLS : mode === "object" ? OBJECT_TOOLS : ELEMENT_TOOLS;
  const [menu, setMenu] = useState<null | "root" | "objects">(null);
  const close = () => setMenu(null);
  const navRef = useRef<HTMLElement>(null);
  // Like the native popover: a tap anywhere else closes it.
  useEffect(() => {
    if (!menu) return;
    const outside = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [menu]);
  const onInsert = () => {
    // Placing → stop placing. Draft open → explained by onCancelInsert, kept.
    if (inserting || draftOpen) return onCancelInsert();
    setMenu((m) => (m ? null : "root"));
  };

  return (
    <nav
      ref={navRef}
      aria-label={mode === "room" ? "Room tools" : mode === "object" ? "Object tools" : "Drafting tools"}
      className={cn("relative flex flex-col gap-2.5", className)}
    >
      {tools.map((t) =>
        t.insert ? (
          <ToolButton
            key={t.label}
            aria-pressed={inserting || !!menu}
            aria-haspopup="menu"
            aria-expanded={!!menu}
            onClick={onInsert}
            className={cn((inserting || menu) && "border-mp-blue bg-mp-blue-soft/20 text-mp-blue")}
          >
            <t.icon size={20} aria-hidden /> {t.label}
            {t.chevron && <ChevronsUpDown size={16} className="text-mp-muted" aria-hidden />}
          </ToolButton>
        ) : t.label === "Add Wall" && (canAddWall || addingWall) ? (
          // A spot is marked on a wall: Add Wall inserts a proposed wall there,
          // perpendicular, as magicplan does. Never a plan edit: a draft opens.
          <ToolButton
            key={t.label}
            aria-pressed={addingWall}
            onClick={onAddWall}
            className={cn(addingWall && "border-mp-blue bg-mp-blue-soft/20 text-mp-blue")}
            title="Propose a wall at the marked spot"
          >
            <t.icon size={20} aria-hidden /> {t.label}
          </ToolButton>
        ) : t.label === "Duplicate" && canDuplicate ? (
          // An inserted object: one more of the same, in the same report.
          <ToolButton key={t.label} onClick={onDuplicate} title="Duplicate the proposed object">
            <t.icon size={20} aria-hidden /> {t.label}
          </ToolButton>
        ) : t.label === "Delete…" && canDelete ? (
          // A wall / corner / object is selected: Delete is live, but it never
          // deletes: it proposes "Element Not on Site" for expert review.
          <ToolButton
            key={t.label}
            tone="danger"
            aria-pressed={deleting}
            onClick={onDelete}
            className={cn(deleting && "border-mp-red bg-red-50")}
            title="Propose removal for expert review"
          >
            <t.icon size={20} aria-hidden /> {t.label}
          </ToolButton>
        ) : (
          <ToolButton
            key={t.label}
            locked
            tone={t.danger ? "danger" : "default"}
            onLockedTap={onLockedTool}
            title={`${t.label} is locked`}
          >
            <t.icon size={20} aria-hidden /> {t.label}
            {t.chevron && <ChevronsUpDown size={16} className="text-mp-muted" aria-hidden />}
          </ToolButton>
        ),
      )}

      <AnimatePresence>
        {menu && (
          <motion.div
            key="insert-menu"
            initial={{ opacity: 0, x: -6, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.98 }}
            transition={{ type: "tween", duration: 0.14 }}
            className="absolute left-full top-0 z-20 ml-3 origin-top-left overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
          >
            {menu === "root" ? (
              <InsertRootMenu
                onObject={() => setMenu("objects")}
                onRoom={() => {
                  close();
                  onLockedTool?.();
                }}
                onOther={(k) => {
                  close();
                  onInsertOther(k);
                }}
              />
            ) : (
              <CategoryGrid
                spotLabel={spotLabel}
                onBack={() => setMenu("root")}
                onClose={close}
                onPick={(c) => {
                  close();
                  onInsertCategory(c);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/** magicplan's Insert popover. Room would change the locked layout, so it shows the lock. */
function InsertRootMenu({
  onObject,
  onRoom,
  onOther,
}: {
  onObject: () => void;
  onRoom: () => void;
  onOther: (k: "note" | "photo" | "form") => void;
}) {
  const rows: { label: string; icon: LucideIcon; onClick: () => void; locked?: boolean; more?: boolean }[] = [
    { label: "Room", icon: SquareDashed, onClick: onRoom, locked: true },
    { label: "Object", icon: Armchair, onClick: onObject, more: true },
    { label: "Note", icon: StickyNote, onClick: () => onOther("note") },
    { label: "Photo", icon: Camera, onClick: () => onOther("photo") },
    { label: "Form", icon: ClipboardList, onClick: () => onOther("form") },
  ];
  return (
    <ul role="menu" aria-label="Insert" className="w-[220px] divide-y divide-mp-line py-1">
      {rows.map((r) => (
        <li key={r.label}>
          <button
            type="button"
            role="menuitem"
            onClick={r.onClick}
            className={cn(
              "flex h-12 w-full items-center gap-3 px-4 text-left text-[16px] active:bg-gray-50",
              r.locked && "text-mp-muted",
            )}
          >
            <r.icon size={20} className={r.locked ? "text-gray-400" : "text-mp-blue"} aria-hidden />
            <span className="flex-1 whitespace-nowrap">{r.label}</span>
            {r.locked && <Lock size={14} className="text-gray-400" aria-label="locked" />}
            {r.more && <ChevronRight size={18} className="text-gray-400" aria-hidden />}
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Object categories, top level, as a compact grid. Every button calls the
 * same handler (the trapdoor); only the label travels into the draft.
 */
const CATEGORIES: { label: string; icon: LucideIcon }[] = [
  { label: "Structural", icon: BrickWall },
  { label: "Doors", icon: DoorOpen },
  { label: "Windows", icon: AppWindow },
  { label: "Plumbing", icon: Droplets },
  { label: "Appliances", icon: WashingMachine },
  { label: "Electrical", icon: Zap },
  { label: "HVAC", icon: Fan },
  { label: "Furniture", icon: Box },
];

function CategoryGrid({
  spotLabel,
  onBack,
  onClose,
  onPick,
}: {
  spotLabel?: string | null;
  onBack: () => void;
  onClose: () => void;
  onPick: (category: string) => void;
}) {
  return (
    <div className="w-[340px] p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Insert"
          className="grid size-10 place-items-center rounded-full bg-[#e6e6e9] text-mp-blue"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <span className="text-center">
          <span className="block text-[16px] font-semibold leading-tight">All Objects</span>
          <span className="block text-[12px] text-mp-muted">{CATEGORIES.length} categories</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close insert menu"
          className="grid size-10 place-items-center rounded-full bg-[#e6e6e9] text-[#6b6b70]"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
      {spotLabel && (
        <p data-spot-hint className="mb-2 flex items-center gap-2 rounded-xl bg-mp-blue-soft/15 px-3 py-2 text-[13px] leading-snug text-mp-ink">
          <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0" aria-hidden>
            <path d="M6 1 L11 10 H1 Z" fill="#1a7cf5" />
          </svg>
          <span className="min-w-0">Inserts at the marked spot: {spotLabel}</span>
        </p>
      )}
      <div role="menu" aria-label="All Objects" className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            role="menuitem"
            onClick={() => onPick(c.label)}
            className="flex h-12 items-center gap-2.5 rounded-xl bg-mp-panel px-3 text-left text-[15px] font-medium active:bg-gray-200"
          >
            <c.icon size={20} className="shrink-0 text-gray-700" aria-hidden />
            <span className="truncate whitespace-nowrap">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
