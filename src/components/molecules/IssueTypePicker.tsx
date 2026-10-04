"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Construction, PackagePlus, Ruler, SearchX } from "lucide-react";
import { ISSUE_TYPES } from "@/lib/floorplan";
import type { IssueType } from "@/lib/types";
import { cn } from "@/lib/utils";

const ISSUE_ICONS: Record<IssueType, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  "dimension-mismatch": Ruler,
  "undocumented-element": PackagePlus,
  "element-not-on-site": SearchX,
  "structural-obstacle": Construction,
};

/**
 * IssueTypePicker (molecule): structured choice instead of free text.
 *
 * iOS grouped list: each row stacks a bold title over a short gray
 * description, so no tooltip is needed. Selected: bg-blue-50, blue icon and a
 * blue check on the right. Unselected: white with gray icons. Titles never
 * wrap; the description may take two lines.
 *
 * Progressive disclosure: `renderDetail(id)` can return a follow-up input
 * (category chips, measured length) that expands directly under the active
 * row, inside the same group, so the question stays next to its answer.
 */
export function IssueTypePicker({
  value,
  onChange,
  renderDetail,
}: {
  value: IssueType | null;
  onChange: (v: IssueType) => void;
  /** Extra input revealed under the active row; return null for none. */
  renderDetail?: (id: IssueType) => React.ReactNode;
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
        const descId = `issue-desc-${t.id}`;
        const detail = active ? renderDetail?.(t.id) : null;
        return (
          <div key={t.id}>
          <button
            type="button"
            role="radio"
            aria-checked={active}
            aria-describedby={descId}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex min-h-[64px] w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
              active ? "bg-blue-50" : "bg-white active:bg-gray-50",
            )}
          >
            <Icon
              size={22}
              strokeWidth={2}
              className={cn("shrink-0", active ? "text-mp-blue" : "text-gray-400")}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate whitespace-nowrap text-[16px] font-semibold text-mp-ink">
                {t.label}
              </span>
              <span id={descId} className="mt-0.5 block text-[13px] leading-snug text-gray-500">
                {t.description}
              </span>
            </span>
            <Check
              size={20}
              strokeWidth={2.75}
              aria-hidden
              className={cn("shrink-0 text-mp-blue transition-opacity", active ? "opacity-100" : "opacity-0")}
            />
          </button>
          <AnimatePresence initial={false}>
            {detail && (
              <motion.div
                key="detail"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden bg-blue-50"
              >
                <div className="px-4 pb-4 pt-1">{detail}</div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
