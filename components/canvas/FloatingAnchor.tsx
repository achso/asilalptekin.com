"use client";

import { elementAnchor } from "@/lib/floorplan";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import type { Point, SelectedElement } from "@/lib/types";

const MARGIN_X = 150; // ≈ half-width of the widest floating chip
const MARGIN_Y = 40;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const inBounds = (p: Point) =>
  p.x >= MARGIN_X && p.x <= CANVAS_W - MARGIN_X && p.y >= MARGIN_Y && p.y <= CANVAS_H - MARGIN_Y;

/**
 * Positions HTML next to a plan element (wall, corner or room), centred on a
 * point `distance` px from the element: + into the room, − outside it.
 * Always kept fully on-canvas.
 */
export function FloatingAnchor({
  element,
  distance,
  fallbackDistance,
  children,
}: {
  element: SelectedElement;
  distance: number;
  /** Used instead of `distance` when the preferred spot would leave the canvas. */
  fallbackDistance?: number;
  children: React.ReactNode;
}) {
  const { p, inward } = elementAnchor(element);
  const at = (d: number) => ({ x: p.x + inward.x * d, y: p.y + inward.y * d });
  let pos = at(distance);
  if (fallbackDistance !== undefined && !inBounds(pos)) pos = at(fallbackDistance);

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: clamp(pos.x, MARGIN_X, CANVAS_W - MARGIN_X),
        top: clamp(pos.y, MARGIN_Y, CANVAS_H - MARGIN_Y),
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}
