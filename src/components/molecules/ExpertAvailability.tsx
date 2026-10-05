"use client";

import { useExpertAvailability } from "@/lib/useMunichCutoff";
import { cn } from "@/lib/utils";

/** "Remote expert · available for 40 more minutes" / "· available from 08:00 tomorrow". */
export function ExpertAvailability() {
  const a = useExpertAvailability();
  if (!a) return null;
  const urgent = a.online && a.minutesLeft <= 60;
  return (
    <div
      role="status"
      className={cn(
        "flex h-11 items-center gap-2.5 whitespace-nowrap rounded-full px-4 text-[15px] font-medium",
        !a.online ? "bg-mp-line text-mp-muted" : urgent ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800",
      )}
    >
      <span className="relative flex size-2.5">
        {a.online && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-50" />}
        <span className="relative inline-flex size-2.5 rounded-full bg-current" />
      </span>
      {a.pill}
    </div>
  );
}
