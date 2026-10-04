"use client";

import {
  BrickWall,
  Check,
  CircleHelp,
  Construction,
  DoorOpen,
  MoveHorizontal,
  Ruler,
} from "lucide-react";
import { ISSUE_TYPES } from "@/lib/floorplan";
import type { IssueType } from "@/lib/types";
import { cn } from "@/lib/utils";

const ISSUE_ICONS: Record<IssueType, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  "wall-missing": BrickWall,
  "dimension-mismatch": Ruler,
  obstacle: Construction,
  "wrong-position": MoveHorizontal,
  "opening-missing": DoorOpen,
  other: CircleHelp,
};

/**
 * IssueTypePicker (molecule): structured choice instead of free text.
 *
 * An iOS grouped list, one row per type, so every label gets the full width
 * and never wraps ("Dimension Mismatch" didn't fit a half-width tile in
 * SF Pro). Rows are 52px tall, for gloved, one-handed taps.
 */
export function IssueTypePicker({
  value,
  onChange,
}: {
  value: IssueType | null;
  onChange: (v: IssueType) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Issue type"
      className="divide-y divide-mp-line overflow-hidden rounded-2xl bg-white"
    >
      {ISSUE_TYPES.map((t) => {
        const Icon = ISSUE_ICONS[t.id];
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex h-[52px] w-full items-center gap-3 px-4 text-left transition-colors",
              active ? "bg-mp-blue/10" : "active:bg-mp-panel",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg",
                active ? "bg-mp-blue text-white" : "bg-mp-panel text-mp-ink",
              )}
            >
              <Icon size={18} strokeWidth={2} />
            </span>
            <span
              className={cn(
                "flex-1 truncate whitespace-nowrap text-[16px]",
                active ? "font-semibold text-mp-blue" : "text-mp-ink",
              )}
            >
              {t.label}
            </span>
            {active && <Check size={20} strokeWidth={2.75} className="shrink-0 text-mp-blue" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
