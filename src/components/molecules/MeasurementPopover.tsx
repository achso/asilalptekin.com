"use client";

import { motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Point } from "@/lib/types";

/**
 * MeasurementPopover (molecule): magicplan's floating "Change Measurement"
 * popover, intercepted. The value is shown in a disabled field (the plan is
 * locked), and the only action routes the edit attempt into a proposal:
 * "Propose Correction" opens the EscalationDraftPane for this dimension.
 *
 * Positioned in canvas px, below the tapped label with an arrow pointing up
 * at it; closes on ✕, Escape or a tap outside.
 */
export function MeasurementPopover({
  at,
  valueM,
  canvasWidth,
  onPropose,
  onClose,
}: {
  /** The tapped label's centre, in canvas px. */
  at: Point;
  valueM: number;
  canvasWidth: number;
  onPropose: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const W = 280;
  const left = Math.min(Math.max(12, at.x - W / 2), canvasWidth - W - 12);

  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // Next tick: don't catch the tap that opened the popover.
    const t = window.setTimeout(() => document.addEventListener("pointerdown", outside), 0);
    document.addEventListener("keydown", esc);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label="Change Measurement"
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ type: "tween", duration: 0.15 }}
      style={{ left, top: at.y + 22, width: W }}
      className="absolute z-30 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5"
    >
      {/* arrow pointing at the tapped label */}
      <span
        aria-hidden
        style={{ left: at.x - left - 8 }}
        className="absolute -top-2 size-4 rotate-45 rounded-sm bg-white ring-1 ring-black/5 [clip-path:polygon(0_0,100%_0,0_100%)]"
      />

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="w-8 shrink-0" />
        <h3 className="whitespace-nowrap text-[17px] font-semibold">Change Measurement</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e6e6e9] text-[#6b6b70]"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <label className="mb-1 block text-[12px] font-medium text-mp-muted" htmlFor="measurement-locked">
        Length
      </label>
      <div className="mb-3 flex h-12 items-center rounded-xl bg-gray-100 px-3">
        <input
          id="measurement-locked"
          disabled
          readOnly
          value={`${valueM.toFixed(2)} m`}
          className="min-w-0 flex-1 cursor-not-allowed bg-transparent text-[17px] tabular-nums text-gray-400 outline-none"
        />
        <Lock size={16} className="text-gray-400" aria-hidden />
      </div>

      <button
        type="button"
        onClick={onPropose}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-mp-blue text-[16px] font-semibold text-white active:opacity-90"
      >
        <Lock size={18} aria-hidden /> Propose Correction
      </button>
      <p className="mt-2 text-center text-[12px] leading-snug text-mp-muted">
        Plan locked. The remote expert reviews the change.
      </p>
    </motion.div>
  );
}
