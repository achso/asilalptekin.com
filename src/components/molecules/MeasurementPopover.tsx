"use client";

import { motion } from "framer-motion";
import { Lock, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Point } from "@/lib/types";

/**
 * MeasurementPopover (molecule): magicplan's floating "Change Measurement"
 * popover (Reset · value · primary button), intercepted for the locked plan.
 *
 * One component for every locked value: wall lengths (canvas label or
 * inspector) and object width / depth / height / rotation. The value is
 * editable, but "Propose Correction" never edits the plan: it writes the value
 * into the escalation draft (opening it if needed). Reset puts the plan value
 * back in the field.
 *
 * Positioned in canvas px next to its anchor (flips above when there's no room
 * below); closes on ✕, Escape or a tap outside.
 */
export function MeasurementPopover({
  at,
  label,
  value,
  planValue,
  unit,
  canvasWidth,
  canvasHeight,
  onApply,
  onClose,
}: {
  /** The anchor's centre, in canvas px. */
  at: Point;
  /** What's being measured ("Length", "Width", "Rotation"). */
  label: string;
  /** Current value: the proposal if there is one, else the plan's. */
  value: number;
  planValue: number;
  unit: "m" | "°";
  canvasWidth: number;
  canvasHeight: number;
  onApply: (v: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const deg = unit === "°";
  const fmt = (v: number) => (deg ? String(Math.round(v)) : v.toFixed(2));
  const [text, setText] = useState(fmt(value));

  const W = 300;
  const H = 300;
  const left = Math.min(Math.max(12, at.x - W / 2), canvasWidth - W - 12);
  const below = at.y + 22 + H < canvasHeight;
  const top = below ? at.y + 22 : Math.max(12, at.y - 22 - H);

  const n = Number(text.replace(",", "."));
  const valid = Number.isFinite(n) && (deg ? n >= 0 : n > 0 && n < 100);
  const apply = () => valid && onApply(deg ? ((Math.round(n) % 360) + 360) % 360 : +n.toFixed(2));

  useEffect(() => {
    input.current?.select();
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
      initial={{ opacity: 0, y: below ? -6 : 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: below ? -6 : 6, scale: 0.97 }}
      transition={{ type: "tween", duration: 0.15 }}
      style={{ left, top, width: W }}
      className="absolute z-30 rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
    >
      {/* arrow pointing at the anchor */}
      <span
        aria-hidden
        style={{ left: Math.min(Math.max(16, at.x - left - 8), W - 32) }}
        className={
          below
            ? "absolute -top-2 size-4 rotate-45 bg-white ring-1 ring-black/5 [clip-path:polygon(0_0,100%_0,0_100%)]"
            : "absolute -bottom-2 size-4 rotate-45 bg-white ring-1 ring-black/5 [clip-path:polygon(100%_0,100%_100%,0_100%)]"
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-4">
          <div className="min-w-0">
            <h3 className="whitespace-nowrap text-[17px] font-semibold">Change Measurement</h3>
            <p className="flex items-center gap-1 whitespace-nowrap text-[13px] text-mp-muted">
              <Lock size={12} aria-hidden /> Plan locked · {label}, plan {fmt(planValue)}
              {deg ? "°" : " m"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#ececee] text-[#6b6b70]"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              setText(fmt(planValue));
              input.current?.focus();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-mp-line bg-white text-[15px] font-semibold"
          >
            <RotateCcw size={16} aria-hidden /> Reset
          </button>
        </div>

        <div className="mt-3 border-y border-mp-line bg-mp-panel px-4 py-3">
          <label className="flex h-12 items-center rounded-xl border-2 border-mp-blue bg-white px-3">
            <span className="sr-only">{label}</span>
            <input
              ref={input}
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={!valid}
              className="min-w-0 flex-1 bg-transparent text-[18px] tabular-nums outline-none"
            />
            <span className="text-[16px] text-mp-muted">{unit}</span>
          </label>
        </div>

        <div className="p-4">
          <button
            type="submit"
            disabled={!valid}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-mp-ink text-[16px] font-semibold text-white disabled:opacity-40"
          >
            <Lock size={16} aria-hidden /> Propose Correction
          </button>
        </div>
      </form>
    </motion.div>
  );
}
