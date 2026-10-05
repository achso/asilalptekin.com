"use client";

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
  type LucideIcon,
} from "lucide-react";
import { ToolButton } from "@/components/atoms/ToolButton";
import { cn } from "@/lib/utils";

export const LOCKED_MESSAGE =
  "Plan locked for execution. Use Insert to mark a missing wall, or tap the 4.55 dimension to propose a correction.";

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

/**
 * LeftToolbar (organism)
 *
 * The permit is approved, so the plan is in its execution phase. magicplan's
 * tools stay where users expect them and are locked, except one:
 *
 *   + Insert → ghost_draft. The next canvas tap drops a red dashed ghost
 *   wall and opens the EscalationDraftPane ("Undocumented Element → Wall").
 *   Tapping Insert again while placing cancels.
 *
 * Every other tool explains the lock on tap (guided friction).
 */
export function LeftToolbar({
  mode,
  inserting,
  onInsert,
  onLockedTool,
  className,
}: {
  mode: "room" | "element";
  /** ghost_draft is on, or its draft is open: Insert shows pressed. */
  inserting: boolean;
  onInsert: () => void;
  onLockedTool?: () => void;
  className?: string;
}) {
  const tools = mode === "room" ? ROOM_TOOLS : ELEMENT_TOOLS;
  return (
    <nav aria-label={mode === "room" ? "Room tools" : "Drafting tools"} className={cn("flex flex-col gap-2.5", className)}>
      {tools.map((t) =>
        t.insert ? (
          <ToolButton
            key={t.label}
            aria-pressed={inserting}
            onClick={onInsert}
            className={cn(inserting && "border-mp-blue bg-mp-blue-soft/20 text-mp-blue")}
          >
            <t.icon size={20} aria-hidden /> {t.label}
            {t.chevron && <ChevronsUpDown size={16} className="text-mp-muted" aria-hidden />}
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
    </nav>
  );
}
