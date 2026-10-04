"use client";

import { elementAnchor } from "@/lib/floorplan";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import type { Point, SelectedElement } from "@/lib/types";

/** Default keep-out from the canvas edges, sized for a wide floating chip. */
const DEFAULT_MARGIN = { x: 150, y: 40 };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * Positions HTML next to a plan element (wall, corner or room), centred on a
 * point `distance` px from the element: + into the room, − outside it.
 * Always kept fully on-canvas.
 */
export function FloatingAnchor({
  element,
  distance,
  fallbackDistance,
  margin = DEFAULT_MARGIN,
  children,
}: {
  element: SelectedElement;
  distance: number;
  /** Used instead of `distance` when the preferred spot would leave the canvas. */
  fallbackDistance?: number;
  /** Keep-out from the canvas edges (≈ half the child's size). Small pins need less. */
  margin?: { x: number; y: number };
  children: React.ReactNode;
}) {
  const { p, inward } = elementAnchor(element);
  const at = (d: number) => ({ x: p.x + inward.x * d, y: p.y + inward.y * d });
  const inBounds = (q: Point) =>
    q.x >= margin.x && q.x <= CANVAS_W - margin.x && q.y >= margin.y && q.y <= CANVAS_H - margin.y;
  let pos = at(distance);
  if (fallbackDistance !== undefined && !inBounds(pos)) pos = at(fallbackDistance);

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: clamp(pos.x, margin.x, CANVAS_W - margin.x),
        top: clamp(pos.y, margin.y, CANVAS_H - margin.y),
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}
