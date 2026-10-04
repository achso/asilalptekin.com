import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Toolbar button. `locked` looks disabled (opacity-50, not-allowed cursor) but
 * stays tappable, so the app can explain the lock instead of silently
 * ignoring the tap.
 */
const toolButton = cva(
  "flex h-12 w-fit items-center gap-2.5 rounded-xl border border-mp-line bg-white px-4 text-[16px] font-semibold shadow-sm",
  {
    variants: {
      tone: { default: "text-mp-ink", danger: "text-mp-red" },
      locked: { true: "cursor-not-allowed opacity-50", false: "active:bg-mp-panel" },
    },
    defaultVariants: { tone: "default", locked: false },
  },
);

export function ToolButton({
  tone,
  locked,
  className,
  children,
  ...rest
}: VariantProps<typeof toolButton> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-disabled={locked || undefined}
      className={cn(toolButton({ tone, locked }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}
