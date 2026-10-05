"use client";

import { PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProposableValue (molecule): a locked dimension that can still be challenged.
 *
 * The value stays read-only (the permit is approved), but tapping it doesn't
 * dead-end: it opens an escalation draft for exactly this dimension
 * ("Intercept and Propose"). The pencil and hover tint say it's tappable.
 */
export function ProposableValue({
  label,
  children,
  onPropose,
  className,
}: {
  /** The dimension's name, for the accessible label ("Ceiling Height"). */
  label: string;
  children: React.ReactNode;
  onPropose: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onPropose}
      aria-label={`${label}: ${typeof children === "string" ? children : ""}. Propose a change`}
      className={cn(
        "-mr-2 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 transition-colors hover:bg-gray-100 active:bg-gray-200",
        className,
      )}
    >
      <span className="rounded-lg bg-[#f0f0f2] px-3 py-1.5 text-[15px] tabular-nums text-mp-ink">{children}</span>
      <PencilLine size={16} className="text-mp-blue" aria-hidden />
    </button>
  );
}
