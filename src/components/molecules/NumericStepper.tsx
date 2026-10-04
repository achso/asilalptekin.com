"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NumericStepper (molecule): big ± buttons instead of a keyboard, for gloved
 * hands. Shows the difference from a reference value (the planned length).
 */
export type NumericStepperProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  /** Value the plan expects; enables the "−20 cm vs plan" delta line. */
  reference?: number;
  step?: number;
  min?: number;
  unit?: string;
  className?: string;
};

export function NumericStepper({
  label,
  value,
  onChange,
  reference,
  step = 0.05,
  min = 0,
  unit = "m",
  className,
}: NumericStepperProps) {
  const set = (v: number) => onChange(Math.max(min, +v.toFixed(2)));
  const delta = reference !== undefined ? value - reference : 0;

  return (
    <div className={cn("flex items-center gap-2.5 rounded-xl bg-white p-3", className)}>
      <div className="flex-1" aria-live="polite">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-mp-muted">{label}</div>
        <div className="text-[24px] font-semibold leading-tight tabular-nums">
          {value.toFixed(2)} {unit}
        </div>
        {reference !== undefined && (
          <div
            className={cn(
              "text-[12px] font-medium tabular-nums",
              delta === 0 ? "text-mp-muted" : "text-mp-red",
            )}
          >
            {delta === 0
              ? "Same as plan"
              : `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(0)} cm vs plan`}
          </div>
        )}
      </div>
      <StepButton label="Decrease" onClick={() => set(value - step)}>
        <Minus size={24} />
      </StepButton>
      <StepButton label="Increase" onClick={() => set(value + step)}>
        <Plus size={24} />
      </StepButton>
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
      className="grid size-14 place-items-center rounded-xl bg-mp-panel active:bg-mp-line"
    >
      {children}
    </motion.button>
  );
}
