"use client";

import { cva } from "class-variance-authority";
import type { KeyboardEvent } from "react";
import { type DeviationState, isLockedState } from "@/store/deviationMachine";
import { cn } from "@/lib/utils";

/**
 * CanvasWall (atom)
 *
 * One wall segment on the 2D plan. Purely presentational: geometry in, a
 * `deviationState` in, pixels out. It owns every visual variant of a wall:
 *
 *   idle       → solid black                 (selected: magicplan blue)
 *   sending    → red stroke + red hatch      (same as delivered; upload in progress)
 *   delivered  → red stroke + red hatch
 *   in_review  → amber frame + red hatch + pulse
 *   resolved   → solid green
 *
 * Colour changes are CSS transitions on `stroke`, so swapping the prop is the
 * whole animation; no animation library needed for state changes.
 *
 * Requires <CanvasWallDefs /> once inside the parent <svg>'s <defs>.
 */

export const HATCH_PATTERN_ID = "canvas-wall-hatch";

/** Outer body of the wall. Thickness is set via `style` (it's geometry, not a variant). */
const wallBody = cva("fill-none transition-[stroke] duration-300 ease-out", {
  variants: {
    state: {
      idle: "stroke-mp-ink",
      sending: "stroke-mp-red",
      delivered: "stroke-mp-red",
      in_review: "stroke-amber-500",
      resolved: "stroke-emerald-600",
    },
    selected: { true: "", false: "" },
  },
  compoundVariants: [
    // Selection highlight only applies to an un-escalated wall: an escalated
    // wall keeps its status colour, so state is never hidden by selection.
    { state: "idle", selected: true, class: "stroke-mp-blue-soft" },
  ],
  defaultVariants: { state: "idle", selected: false },
});

/** Hatched inner fill shown while the wall is locked (escalated, not resolved). */
const wallHatch = cva("pointer-events-none fill-none transition-opacity duration-300", {
  variants: {
    visible: { true: "opacity-100", false: "opacity-0" },
  },
});

export type CanvasWallProps = {
  /** Centreline endpoints in canvas px. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Wall thickness in px. */
  thickness?: number;
  deviationState: DeviationState;
  selected?: boolean;
  /** Accessible name, e.g. "North wall". */
  label: string;
  onSelect?: () => void;
  className?: string;
};

export function CanvasWall({
  x1,
  y1,
  x2,
  y2,
  thickness = 14,
  deviationState,
  selected = false,
  label,
  onSelect,
  className,
}: CanvasWallProps) {
  const locked = isLockedState(deviationState);
  const emphasised = selected || deviationState !== "idle";
  const line = { x1, y1, x2, y2 };

  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.();
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${label}, ${STATE_LABEL[deviationState]}`}
      aria-pressed={selected}
      data-state={deviationState}
      onPointerDown={onSelect}
      onKeyDown={onKeyDown}
      className={cn(
        // Keyboard focus ring only; a tap shouldn't leave a box around the wall.
        "cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mp-blue",
        className,
      )}
    >
      {/* 48px invisible hit target: gloves, dust, one free hand */}
      <line {...line} className="stroke-transparent" strokeWidth={48} />

      {/* "Munich is looking at this": expanding amber ring */}
      {deviationState === "in_review" && (
        <line
          {...line}
          strokeLinecap="round"
          className="pointer-events-none animate-wall-pulse stroke-amber-500"
        />
      )}

      {/* Body */}
      <line
        {...line}
        strokeWidth={thickness + (emphasised ? 6 : 0)}
        className={cn("pointer-events-none", wallBody({ state: deviationState, selected }))}
      />

      {/* Hatch (kept mounted so it can fade in/out instead of popping) */}
      <line
        {...line}
        strokeWidth={thickness + 2}
        stroke={`url(#${HATCH_PATTERN_ID})`}
        className={wallHatch({ visible: locked })}
      />

    </g>
  );
}

const STATE_LABEL: Record<DeviationState, string> = {
  idle: "no deviation reported",
  sending: "sending to expert",
  delivered: "escalated to expert",
  in_review: "in review by expert",
  resolved: "resolved",
};

/** SVG paint servers used by CanvasWall. Render once inside the canvas <defs>. */
export function CanvasWallDefs() {
  return (
    <pattern
      id={HATCH_PATTERN_ID}
      width="8"
      height="8"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width="8" height="8" className="fill-red-100" />
      <line x1="0" y1="0" x2="0" y2="8" strokeWidth="4" className="stroke-mp-red" />
    </pattern>
  );
}
