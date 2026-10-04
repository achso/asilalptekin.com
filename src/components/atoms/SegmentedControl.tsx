"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * iOS-style segmented control.
 *
 * Segments are sized by their content (flex: 1 1 auto) and never wrap, as in
 * magicplan, where "Photos & Notes" gets the widest segment. Equal thirds broke
 * that label onto two lines with SF Pro at 350px.
 *
 * The white thumb is measured from the active segment and moved with a CSS
 * transform (compositor-only), so mounting a panel costs no shared-layout
 * animation work.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  /** Accessible name for the tab list. */
  label: string;
  className?: string;
}) {
  const index = Math.max(0, options.indexOf(value));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  // Measure the active segment (and re-measure if fonts or size change it).
  useLayoutEffect(() => {
    const el = refs.current[index];
    if (!el) return;
    const measure = () => setThumb({ x: el.offsetLeft, w: el.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement ?? el);
    return () => ro.disconnect();
  }, [index, options.length]);

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("relative flex rounded-xl bg-[#e3e3e6] p-1", className)}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-0 rounded-lg bg-white shadow-sm will-change-transform",
          thumb ? "transition-[transform,width] duration-200 ease-out" : "opacity-0",
        )}
        style={thumb ? { width: thumb.w, transform: `translateX(${thumb.x}px)` } : undefined}
      />
      {options.map((o, i) => {
        const active = i === index;
        // Hairline between two inactive neighbours, as on iOS
        const hairline = i > 0 && !active && i - 1 !== index;
        return (
          <button
            key={o}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o)}
            className="relative h-10 flex-auto whitespace-nowrap rounded-lg px-3 text-[14px] font-medium"
          >
            {hairline && (
              <span aria-hidden className="absolute inset-y-2.5 left-0 w-px bg-[#c8c8cc]" />
            )}
            <span className="relative">{o}</span>
          </button>
        );
      })}
    </div>
  );
}
