import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** "🔒 Locked (Permit Approved)": the plan is in execution state; geometry is read-only. */
export function LockedBadge({ reason = "Permit Approved", className }: { reason?: string; className?: string }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border border-mp-line bg-white px-3 text-[13px] font-semibold text-mp-ink",
        className,
      )}
    >
      <Lock size={14} strokeWidth={2.5} aria-hidden />
      Locked <span className="font-medium text-mp-muted">({reason})</span>
    </span>
  );
}
