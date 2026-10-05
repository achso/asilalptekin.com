"use client";

import { useRef, useState } from "react";
import { PX_PER_M, toPx } from "@/lib/floorplan";
import type { GhostItem, Point } from "@/lib/types";
import { RotateHandle } from "./PlanObjects";

const SELECT_BLUE = "#64aeea";
const GHOST_RED = "#EF4444";

/**
 * GhostItems: inserted (proposed) objects, one per copy. They behave like the
 * plan's own objects (PlanObjects): tap selects, drag moves, the native rotate
 * arrow turns them with a 45° snap. Unlike plan objects they don't exist yet,
 * so they're red dashed squares (a wall segment for Structural), never solid.
 *
 * Submitted ones are drawn in their status colour and don't react to touch.
 */
export function GhostItems({
  items,
  size,
  category,
  color,
  interactive = false,
  selected = false,
  activeId,
  onSelect,
  onMove,
  onRotate,
}: {
  items: GhostItem[];
  size: { widthM: number; depthM: number };
  category?: string;
  color: string;
  interactive?: boolean;
  /** The inserted element is the selection: the active copy gets the frame + rotate arrow. */
  selected?: boolean;
  activeId?: string;
  onSelect?: (id: string) => void;
  onMove?: (id: string, center: Point) => void;
  onRotate?: (id: string, rotation: number) => void;
}) {
  return (
    <g data-ghost-items={interactive ? "draft" : "submitted"}>
      {items.map((it) => (
        <GhostItemView
          key={it.id}
          item={it}
          size={size}
          category={category}
          color={color}
          interactive={interactive}
          selected={selected && it.id === activeId}
          onSelect={() => onSelect?.(it.id)}
          onMove={(c) => onMove?.(it.id, c)}
          onRotate={(r) => onRotate?.(it.id, r)}
        />
      ))}
    </g>
  );
}

function GhostItemView({
  item,
  size,
  category,
  color,
  interactive,
  selected,
  onSelect,
  onMove,
  onRotate,
}: {
  item: GhostItem;
  size: { widthM: number; depthM: number };
  category?: string;
  color: string;
  interactive: boolean;
  selected: boolean;
  onSelect: () => void;
  onMove: (center: Point) => void;
  onRotate: (rotation: number) => void;
}) {
  const c = toPx(item.center);
  const w = size.widthM * PX_PER_M;
  const h = size.depthM * PX_PER_M;
  const square = size.depthM > 0.2;
  const [rotating, setRotating] = useState(false);
  const [moving, setMoving] = useState(false);
  const move = useRef<{ x: number; y: number; from: Point; moved: boolean } | null>(null);
  const draft = color === GHOST_RED;

  const svgPoint = (e: React.PointerEvent<SVGElement>) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement!;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const end = () => {
    move.current = null;
    setMoving(false);
  };

  return (
    <g
      data-ghost-item={item.id}
      data-selected={selected || undefined}
      pointerEvents={interactive ? "auto" : "none"}
      className={interactive ? (moving ? "cursor-grabbing" : "cursor-grab") : undefined}
      style={{ touchAction: "none" }}
      {...(interactive && {
        role: "button",
        "aria-label": `Proposed ${category ?? "element"}${selected ? ", selected" : ""}`,
        "aria-pressed": selected,
        onPointerDown: (e: React.PointerEvent<SVGGElement>) => {
          // Its own gesture: no deselect, no discard prompt.
          e.stopPropagation();
          onSelect();
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = svgPoint(e);
          move.current = { x: p.x, y: p.y, from: item.center, moved: false };
        },
        onPointerMove: (e: React.PointerEvent<SVGGElement>) => {
          const m = move.current;
          if (!m) return;
          const p = svgPoint(e);
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          if (!m.moved && Math.hypot(dx, dy) < 6) return; // a tap, not a drag
          if (!m.moved) setMoving(true);
          m.moved = true;
          onMove({ x: m.from.x + dx / PX_PER_M, y: m.from.y + dy / PX_PER_M });
        },
        onPointerUp: end,
        onPointerCancel: end,
      })}
    >
      <g transform={`translate(${c.x} ${c.y}) rotate(${item.rotation})`}>
        {/* fat-finger hit area */}
        {interactive && <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} fill="transparent" />}
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          stroke={color}
          strokeDasharray="4 4"
          strokeWidth={2}
          fill={draft ? "rgba(239, 68, 68, 0.1)" : color}
          fillOpacity={draft ? 1 : 0.12}
        />
        {square && category && (
          <text
            y={0}
            fill={color}
            fontSize={10}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="central"
            pointerEvents="none"
          >
            {category.length > 9 ? `${category.slice(0, 8)}…` : category}
          </text>
        )}
      </g>

      {selected && (
        <g transform={`translate(${c.x} ${c.y})`}>
          {rotating && (
            <circle
              r={Math.hypot(w, h) / 2 + 4}
              fill="none"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              pointerEvents="none"
            />
          )}
          <g transform={`rotate(${item.rotation})`}>
            <rect
              data-ghost-selection
              x={-w / 2 - 6}
              y={-h / 2 - 6}
              width={w + 12}
              height={h + 12}
              fill="none"
              stroke={SELECT_BLUE}
              strokeWidth={2}
              pointerEvents="none"
            />
            <RotateHandle
              x={w / 2 + 24}
              center={c}
              rotation={item.rotation}
              label={`Rotate proposed ${category ?? "element"}`}
              snapped={rotating && item.rotation % 45 === 0}
              onDragging={setRotating}
              onRotate={onRotate}
            />
          </g>
        </g>
      )}
    </g>
  );
}
