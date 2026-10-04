"use client";

import { PROJECT } from "@/lib/floorplan";
import { useMunichCutoff } from "@/lib/useMunichCutoff";
import { cn } from "@/lib/utils";

/** Live "Munich expert · online · 1h 20m left" pill: the constraint that sets urgency. */
export function ExpertAvailability() {
  const munich = useMunichCutoff(PROJECT.expert.cutoffHourCET);
  if (!munich) return null;
  return (
    <div
      role="status"
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-full px-4 text-[14px] font-medium",
        !munich.online
          ? "bg-mp-line text-mp-muted"
          : munich.urgent
            ? "bg-amber-100 text-amber-800"
            : "bg-emerald-50 text-emerald-800",
      )}
    >
      <span className="relative flex size-2.5">
        {munich.online && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-50" />
        )}
        <span className="relative inline-flex size-2.5 rounded-full bg-current" />
      </span>
      Remote expert · {munich.online ? "online" : "offline"}
      <span className="opacity-60">·</span>
      <span className="tabular-nums">{munich.remainingLabel}</span>
    </div>
  );
}
