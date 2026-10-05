"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * NumericStepper (molecule): hybrid measurement input.
 *
 *   [ − ]   [ 4.12  m ]   [ + ]
 *
 * - The centre is a real <input type="number" inputMode="decimal">: tap it and
 *   the iPad shows the numeric keypad, so a laser reading like "4.12" can be
 *   typed directly. A gray fill and bottom border signal it's editable.
 * - The big − / + buttons nudge by `step` (5 cm) for gloved micro-adjustments.
 *
 * While focused, the field keeps a text draft (so "4." isn't reformatted
 * mid-keystroke); valid numbers commit as you type, and the draft snaps back to
 * the formatted value on blur. Values are clamped to [min, max].
 *
 * `value` may be null (nothing measured yet): the field then shows the
 * placeholder ("0.00", or the plan value), and − / + start from the
 * reference if there is one, else from 0. `hint` replaces the plan-delta
 * line when there's no reference (e.g. "Length of physical wall").
 */
export type NumericStepperProps = {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  /** Value the plan expects; enables the "−20 cm vs plan" delta line. */
  reference?: number;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  /** Shown in the field while value is null. */
  placeholder?: string;
  /** Subtext under the field when there's no reference to compare against. */
  hint?: string;
  /**
   * One row (label · − · value · +, difference underneath): about half the
   * height, for several inputs stacked in one grouped card.
   */
  compact?: boolean;
  className?: string;
};

export function NumericStepper({
  label,
  value,
  onChange,
  reference,
  step = 0.05,
  min = 0,
  max = 99.99,
  unit = "m",
  placeholder = "0.00",
  hint,
  compact = false,
  className,
}: NumericStepperProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  // Degrees (rotation) are whole numbers; metres keep 2 decimals.
  const deg = unit === "°";
  const dp = deg ? 0 : 2;
  const fmt = (v: number | null) => (v === null ? "" : v.toFixed(dp));
  const stepLabel = deg ? `${step}°` : `${Math.round(step * 100)} cm`;
  const fmtRef = (v: number) => (deg ? `${v}°` : `${v.toFixed(2)} ${unit}`);
  const [draft, setDraft] = useState(fmt(value));

  // Follow external changes (steppers, resets) unless the user is typing.
  useEffect(() => {
    if (document.activeElement !== input.current) setDraft(fmt(value));
  }, [value]);

  const clamp = (v: number) => Math.min(max, Math.max(min, +v.toFixed(dp)));
  const nudge = (dir: 1 | -1) => {
    const next = clamp((value ?? reference ?? 0) + dir * step);
    onChange(next);
    setDraft(next.toFixed(dp));
  };

  const delta = reference !== undefined && value !== null ? value - reference : 0;
  const subId = `${id}-sub`;

  return (
    <div className={cn(compact ? "px-3 py-2" : "rounded-xl bg-white p-3", className)}>
      {!compact && (
        <label htmlFor={id} className="block whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-mp-muted">
          {label}
        </label>
      )}

      <div className={cn("flex items-center", compact ? "gap-2" : "mt-2 gap-2.5")}>
        {compact && (
          <label htmlFor={id} className="w-[68px] shrink-0 whitespace-nowrap text-[15px] font-medium text-mp-ink">
            {label}
          </label>
        )}
        <StepButton compact={compact} label={`Decrease by ${stepLabel}`} onClick={() => nudge(-1)}>
          <Minus size={compact ? 20 : 24} />
        </StepButton>

        {/* Tappable field: gray fill + bottom border affordance, blue on focus */}
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center rounded-t-lg border-b-2 border-gray-300 bg-gray-100 transition-colors focus-within:border-mp-blue focus-within:bg-blue-50/60",
            compact ? "h-11 px-2" : "h-14 px-3",
          )}
        >
          <input
            ref={input}
            id={id}
            type="number"
            inputMode="decimal"
            enterKeyHint="done"
            step={deg ? 1 : 0.01}
            min={min}
            max={max}
            value={draft}
            placeholder={placeholder}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = e.target.valueAsNumber;
              if (Number.isFinite(n)) onChange(clamp(n));
            }}
            onBlur={() => setDraft(fmt(value))}
            onKeyDown={(e) => {
              // Inside a form: Enter/Done closes the keypad, never submits.
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            aria-describedby={reference !== undefined || hint ? subId : undefined}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-center font-semibold tabular-nums text-mp-ink outline-none placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              compact ? "text-[18px]" : "text-[26px]",
            )}
          />
          <span className={cn("shrink-0 font-medium text-mp-muted", compact ? "text-[15px]" : "text-[18px]")}>
            {unit}
          </span>
        </div>

        <StepButton compact={compact} label={`Increase by ${stepLabel}`} onClick={() => nudge(1)}>
          <Plus size={compact ? 20 : 24} />
        </StepButton>
      </div>

      {reference === undefined && hint && (
        <div
          id={subId}
          className={cn(
            "whitespace-nowrap text-center font-medium text-mp-muted",
            compact ? "ml-[76px] mt-0.5 text-[11px]" : "mt-2 text-[12px]",
          )}
        >
          {hint}
        </div>
      )}
      {reference !== undefined && (
        <div
          id={subId}
          aria-live="polite"
          className={cn(
            "whitespace-nowrap text-center font-medium tabular-nums",
            // compact: centred under the − value + group, past the label column
            compact ? "ml-[76px] mt-0.5 text-[11px]" : "mt-2 text-[12px]",
            value === null || delta === 0 ? "text-mp-muted" : "text-mp-red",
          )}
        >
          {value === null
            ? `Plan ${fmtRef(reference)}`
            : delta === 0
            ? `Same as plan (${fmtRef(reference)})`
            : `${delta > 0 ? "+" : "−"}${deg ? `${Math.abs(Math.round(delta))}°` : `${Math.abs(Math.round(delta * 100))} cm`} vs plan (${fmtRef(reference)})`}
        </div>
      )}
    </div>
  );
}

function StepButton({
  label,
  onClick,
  compact,
  children,
}: {
  label: string;
  onClick: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      // compact keeps a 44 px target: still glove-friendly
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-mp-panel active:bg-mp-line",
        compact ? "size-11" : "size-14",
      )}
    >
      {children}
    </motion.button>
  );
}
