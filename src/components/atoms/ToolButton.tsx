import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Toolbar button.
 *
 * `locked`: the button itself is `disabled` + `pointer-events-none
 * opacity-50` and can never act. A wrapper behind it catches the tap
 * (`onLockedTap`) so the app can explain the lock instead of silently doing
 * nothing, and shows the not-allowed cursor on desktop.
 */
const toolButton = cva(
  "flex h-12 w-fit items-center gap-2.5 rounded-xl border border-mp-line bg-white px-4 text-[16px] font-semibold shadow-sm",
  {
    variants: {
      tone: { default: "text-mp-ink", danger: "text-mp-red" },
      locked: {
        true: "pointer-events-none cursor-not-allowed opacity-50",
        false: "active:bg-mp-panel",
      },
    },
    defaultVariants: { tone: "default", locked: false },
  },
);

type ToolButtonProps = VariantProps<typeof toolButton> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Locked only: called when the user taps the locked tool. */
    onLockedTap?: () => void;
  };

export function ToolButton({ tone, locked, onLockedTap, className, children, ...rest }: ToolButtonProps) {
  const button = (
    <button
      type="button"
      disabled={locked || undefined}
      aria-disabled={locked || undefined}
      className={cn(toolButton({ tone, locked }), className)}
      {...rest}
    >
      {children}
    </button>
  );
  if (!locked) return button;
  return (
    <div onClick={onLockedTap} className="w-fit cursor-not-allowed rounded-xl">
      {button}
    </div>
  );
}
