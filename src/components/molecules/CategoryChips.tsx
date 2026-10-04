"use client";

import { ObjectCategoryIcon } from "@/components/atoms/ObjectCategoryIcon";
import { ELEMENT_CATEGORIES } from "@/lib/floorplan";
import type { ElementCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * CategoryChips (molecule): what kind of object an "Undocumented Element" is.
 *
 * Shallow on purpose: one tap on a top-level category from magicplan's
 * "All Objects" menu (same names, same isometric glyphs). No dropdowns or
 * sub-menus; the photo carries the specifics. Compact pills in a wrapping
 * row, each at least 40px tall for gloved fingers; labels never wrap.
 * Active pill: blue border and blue fill.
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
    <div role="radiogroup" aria-label="Category" className={cn("flex flex-wrap gap-2", className)}>
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
              "flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-mp-blue bg-mp-blue text-white"
                : "border-mp-line bg-white text-mp-ink active:bg-gray-50",
            )}
          >
            <ObjectCategoryIcon
              category={c.id}
              size={20}
              className={active ? "text-white" : "text-gray-700"}
            />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
