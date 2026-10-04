import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Numbered form step that turns into a green check once complete. */
export function StepLabel({
  n,
  done,
  optional,
  children,
}: {
  n: number;
  done: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-6 place-items-center rounded-full text-[12px] font-bold text-white",
          done ? "bg-emerald-500" : "bg-mp-ink",
        )}
      >
        {done ? <Check size={14} strokeWidth={3} /> : n}
      </span>
      <span className="text-[15px] font-semibold">{children}</span>
      {optional && <span className="text-[12px] text-mp-muted">optional</span>}
    </div>
  );
}
