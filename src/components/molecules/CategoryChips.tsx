"use client";

import { ObjectCategoryIcon } from "@/components/atoms/ObjectCategoryIcon";
import { ELEMENT_CATEGORIES } from "@/lib/floorplan";
import type { ElementCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * CategoryChips (molecule): quick-select Object Category grid for an
 * "Undocumented Element".
 *
 * magicplan's native "All Objects" top-level categories (same names, same
 * isometric glyphs), flattened into a single-select 3-column grid of rounded
 * squares: 64px tall, so they work with gloves. One tap selects; there are no
 * sub-menus, since the photo carries the specifics. Selected: blue tint and
 * border.
 */
export function CategoryChips({
  value,
  onChange,
  className,
}: {
  value: ElementCategory | null;
  onChange: (v: ElementCategory) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Object Category" className={cn("grid grid-cols-3 gap-1.5", className)}>
      {ELEMENT_CATEGORIES.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.id)}
            className={cn(
              "flex h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border text-sm font-medium transition-colors",
              active
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-gray-50 text-mp-ink active:bg-gray-100",
            )}
          >
            <ObjectCategoryIcon
              category={c.id}
              size={26}
              className={active ? "text-blue-700" : "text-gray-700"}
            />
            <span className="max-w-full truncate whitespace-nowrap leading-tight tracking-tight">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
