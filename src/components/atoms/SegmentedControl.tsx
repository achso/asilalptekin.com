import { cn } from "@/lib/utils";

/**
 * iOS-style segmented control. The white "thumb" slides with a CSS transform
 * (compositor-only), not a shared-layout animation, so mounting a panel that
 * contains it costs no layout measurement.
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
  return (
    <div role="tablist" aria-label={label} className={cn("relative flex rounded-xl bg-[#e3e3e6] p-1", className)}>
      {/* Sliding thumb: one segment wide, moved by translateX(index × 100%) */}
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out will-change-transform"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o, i) => {
        const active = i === index;
        // Hairline between two inactive neighbours, as on iOS
        const hairline = i > 0 && !active && i - 1 !== index;
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o)}
            className="relative h-10 flex-1 rounded-lg text-[14px] font-medium"
          >
            {hairline && <span aria-hidden className="absolute inset-y-2.5 left-0 w-px bg-[#c8c8cc]" />}
            <span className="relative">{o}</span>
          </button>
        );
      })}
    </div>
  );
}
