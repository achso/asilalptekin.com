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
    <div className={cn("rounded-xl bg-white p-3", className)}>
      <label htmlFor={id} className="block whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-mp-muted">
        {label}
      </label>

      <div className="mt-2 flex items-center gap-2.5">
        <StepButton label={`Decrease by ${stepLabel}`} onClick={() => nudge(-1)}>
          <Minus size={24} />
        </StepButton>

        {/* Tappable field: gray fill + bottom border affordance, blue on focus */}
        <div className="flex h-14 min-w-0 flex-1 items-center rounded-t-lg border-b-2 border-gray-300 bg-gray-100 px-3 transition-colors focus-within:border-mp-blue focus-within:bg-blue-50/60">
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
            className="min-w-0 placeholder:text-gray-400 flex-1 bg-transparent text-center text-[26px] font-semibold tabular-nums text-mp-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="shrink-0 text-[18px] font-medium text-mp-muted">{unit}</span>
        </div>

        <StepButton label={`Increase by ${stepLabel}`} onClick={() => nudge(1)}>
          <Plus size={24} />
        </StepButton>
      </div>

      {reference === undefined && hint && (
        <div id={subId} className="mt-2 whitespace-nowrap text-center text-[12px] font-medium text-mp-muted">
          {hint}
        </div>
      )}
      {reference !== undefined && (
        <div
          id={subId}
          aria-live="polite"
          className={cn(
            "mt-2 whitespace-nowrap text-center text-[12px] font-medium tabular-nums",
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
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="grid size-14 shrink-0 place-items-center rounded-xl bg-mp-panel active:bg-mp-line"
    >
      {children}
    </motion.button>
  );
}
