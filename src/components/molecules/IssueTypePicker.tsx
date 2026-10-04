"use client";

import { motion } from "framer-motion";
import {
  BrickWall,
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

/** IssueTypePicker (molecule): radio group of large tiles, structured instead of free text. */
export function IssueTypePicker({
  value,
  onChange,
}: {
  value: IssueType | null;
  onChange: (v: IssueType) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Issue type" className="grid grid-cols-2 gap-2">
      {ISSUE_TYPES.map((t) => {
        const Icon = ISSUE_ICONS[t.id];
        const active = value === t.id;
        return (
          <motion.button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex h-[58px] items-center gap-2.5 rounded-xl border-2 px-3 text-left transition-colors",
              active
                ? "border-mp-blue bg-mp-blue text-white"
                : "border-transparent bg-white text-mp-ink active:bg-mp-line",
            )}
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-[14px] font-semibold leading-tight">{t.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
