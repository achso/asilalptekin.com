import { ChevronsUpDown, Columns2, Plus, Spline, SquarePlus, Trash2 } from "lucide-react";
import { ToolButton } from "@/components/atoms/ToolButton";
import { cn } from "@/lib/utils";

export const LOCKED_MESSAGE =
  "Plan locked for execution. Use 'Report Deviation' to alert the remote expert.";
/** Same lock, but nothing is selected yet, so the action isn't on screen. */
export const LOCKED_MESSAGE_NO_SELECTION =
  "Plan locked for execution. Tap the wall, corner or floor that's wrong to report a deviation.";

const DRAFTING_TOOLS = [
  { icon: Plus, label: "Insert", chevron: true },
  { icon: Spline, label: "Add Corner" },
  { icon: SquarePlus, label: "Add Wall" },
  { icon: Columns2, label: "Split Room" },
] as const;

/**
 * LeftToolbar (organism). The permit is approved, so the plan is in its
 * execution state: magicplan's drafting tools stay where users expect them but
 * are locked. Tapping one explains why. The top slot holds the contextual
 * Report Deviation action (empty when nothing is selected).
 */
export function LeftToolbar({
  reportSlot,
  onLockedTool,
  className,
}: {
  reportSlot?: React.ReactNode;
  onLockedTool: () => void;
  className?: string;
}) {
  return (
    <nav aria-label="Drafting tools" className={cn("flex flex-col gap-2.5", className)}>
      {/* Fixed-height slot: the action animates in/out without shifting the tools below. */}
      <div className="mb-2 h-14">{reportSlot}</div>

      {DRAFTING_TOOLS.map(({ icon: Icon, label, ...t }) => (
        <ToolButton key={label} locked onClick={onLockedTool}>
          <Icon size={20} /> {label}
          {"chevron" in t && <ChevronsUpDown size={16} className="text-mp-muted" />}
        </ToolButton>
      ))}
      <ToolButton locked tone="danger" onClick={onLockedTool}>
        <Trash2 size={20} /> Delete…
      </ToolButton>
    </nav>
  );
}
