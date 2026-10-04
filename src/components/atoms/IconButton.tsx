import { cn } from "@/lib/utils";

/** 48px round icon button (iOS minimum touch target is 44px). */
export function IconButton({
  label,
  children,
  className,
  ...rest
}: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn("grid size-12 place-items-center rounded-full active:bg-black/5", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
