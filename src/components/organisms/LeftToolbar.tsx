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
  "Plan locked for execution. Use 'Report Deviation' to alert the remote expert.";
/** Same lock, but nothing is selected yet, so the action isn't on screen. */
export const LOCKED_MESSAGE_NO_SELECTION =
  "Plan locked for execution. Tap the wall, corner or floor that's wrong to report a deviation.";

type Tool = { icon: LucideIcon; label: string; chevron?: boolean; danger?: boolean };

/** magicplan's room-level actions (room view: nothing or the floor selected). */
const ROOM_TOOLS: Tool[] = [
  { icon: Plus, label: "Insert", chevron: true },
  { icon: Scaling, label: "Set Size" },
  { icon: Move, label: "Edit Layout" },
  { icon: Copy, label: "Duplicate", chevron: true },
  { icon: Trash2, label: "Delete…", danger: true },
];

/** Element-level drafting tools (a wall or corner selected). */
const ELEMENT_TOOLS: Tool[] = [
  { icon: Plus, label: "Insert", chevron: true },
  { icon: Spline, label: "Add Corner" },
  { icon: SquarePlus, label: "Add Wall" },
  { icon: Columns2, label: "Split Room" },
  { icon: Trash2, label: "Delete…", danger: true },
];

/**
 * LeftToolbar (organism)
 *
 * The permit is approved and the budget locked, so the plan is in its
 * execution phase: magicplan's tools stay where users expect them, but every
 * one is disabled. Which set shows follows magicplan:
 *
 *   mode="room"     Insert · Set Size · Edit Layout · Duplicate · Delete…
 *   mode="element"  Insert · Add Corner · Add Wall · Split Room · Delete…
 *
 * The top slot holds the contextual Report Deviation action, the only
 * enabled control (empty when nothing is selected).
 */
export function LeftToolbar({
  mode,
  reportSlot,
  onLockedTool,
  className,
}: {
  mode: "room" | "element";
  reportSlot?: React.ReactNode;
  /** Tapping a locked tool explains the lock (guided friction) instead of doing nothing. */
  onLockedTool?: () => void;
  className?: string;
}) {
  const tools = mode === "room" ? ROOM_TOOLS : ELEMENT_TOOLS;
  return (
    <nav
      aria-label={mode === "room" ? "Room tools (locked)" : "Drafting tools (locked)"}
      className={cn("flex flex-col gap-2.5", className)}
    >
      {/* Fixed-height slot: the action animates in/out without shifting the tools below. */}
      <div className="mb-2 h-14">{reportSlot}</div>

      {tools.map((t) => (
        <LockedTool key={t.label} tool={t} onTap={onLockedTool} />
      ))}
    </nav>
  );
}

function LockedTool({ tool, onTap }: { tool: Tool; onTap?: () => void }) {
  const { icon: Icon, label, chevron, danger } = tool;
  return (
    <ToolButton locked tone={danger ? "danger" : "default"} onLockedTap={onTap} title={`${label} is locked`}>
      <Icon size={20} aria-hidden /> {label}
      {chevron && <ChevronsUpDown size={16} className="text-mp-muted" aria-hidden />}
    </ToolButton>
  );
}
