"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PERMIT_TEXT } from "@/lib/floorplan";
import { cn } from "@/lib/utils";

/**
 * "🔒 Locked (Permit Approved)": the plan is in execution state; geometry is
 * read-only. Tappable: a short explainer for a technician new to locked
 * plans (what it means, what to do when the site differs). Closes on a tap
 * outside, Escape or tapping the badge again.
 */
export function LockedBadge({ reason = "Permit Approved", className }: { reason?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full border border-mp-line bg-white px-3 text-[13px] font-semibold text-mp-ink active:bg-gray-50",
          open && "border-mp-blue",
          className,
        )}
      >
        <Lock size={14} strokeWidth={2.5} aria-hidden />
        Locked <span className="font-medium text-mp-muted">({reason})</span>
        <Info size={14} className="text-mp-muted" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Why the plan is locked"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
            transition={{ type: "tween", duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-[360px] rounded-2xl bg-white p-4 text-left shadow-xl ring-1 ring-black/5"
          >
            <h3 className="flex items-center gap-2 text-[17px] font-semibold text-mp-ink">
              <Lock size={16} strokeWidth={2.5} aria-hidden /> Why is the plan locked?
            </h3>
            <p className="mt-2 text-[15px] leading-snug text-mp-ink">
              The permit was {PERMIT_TEXT}, so this plan is now the version being built. It
              can&apos;t be edited on site.
            </p>
            <p className="mt-2 text-[15px] leading-snug text-mp-ink">
              <span className="font-semibold">Site doesn&apos;t match?</span> Use the tools as usual: tap a
              dimension, Insert, move or Delete. Each one opens a report for the remote expert instead of
              changing the plan.
            </p>
            <p className="mt-2 text-[15px] leading-snug text-mp-muted">
              When the expert updates the plan, it shows in green. Accept it and it becomes the plan.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
