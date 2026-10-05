"use client";

import { useRef, useState } from "react";
import { PX_PER_M, ROOM, currentPlanObjects, toPx } from "@/lib/floorplan";
import type { EscalationStatus, ObjectState, PlanObject, Point, SelectedElement } from "@/lib/types";

const SELECT_BLUE = "#64aeea";
const ARROW_BLUE = "#1a7cf5";
const SNAP_GREEN = "#22c55e";
const GHOST_RED = "#EF4444";
const STATUS: Record<EscalationStatus, string> = {
  queued: "#9ca3af",
  sending: "#e5352b",
  delivered: "#e5352b",
  in_review: "#f59e0b",
  resolved: "#16a34a",
};

/** A proposed size / rotation drawn over the object: the open draft, or a sent report. */
export type ObjectProposal = { dims: ObjectState; status: EscalationStatus | "draft" };

/**
 * PlanObjects: the furniture and fixtures on the plan, magicplan-style.
 *
 * - Tap selects (blue frame + curved rotate arrow on the right, like native).
 * - Drag the object to move it (position is shown visually only: the faded
 *   original stays, the ghost follows the finger, a dashed arrow links them).
 * - Drag the arrow to rotate. Rotation is free, with a magnetic snap to every
 *   45°; on a snapped angle the arrow turns green. A dashed circle shows the
 *   rotation path while dragging. A plain tap on the arrow turns it by 45°.
 * - The plan is locked, so nothing here edits the object: the original stays
 *   drawn (faded) and the proposal is drawn on top as a red dashed ghost.
 *   Every rotation goes to `onRotate`, which feeds the escalation draft.
 */
export function PlanObjects({
  selected,
  proposals,
  onSelect,
  onRotate,
  onMove,
  removals = {},
}: {
  selected: SelectedElement | null;
  proposals: Record<string, ObjectProposal | undefined>;
  /** Objects proposed for removal (Delete…): "draft" while drafting, else the report's status. */
  removals?: Record<string, EscalationStatus | "draft" | undefined>;
  onSelect: (el: SelectedElement) => void;
  onRotate: (objectId: string, rotation: number) => void;
  onMove: (objectId: string, center: Point) => void;
}) {
  return (
    <g>
      {/* The plan as it stands: accepted corrections in, accepted removals out. */}
      {currentPlanObjects().map((o) => (
        <PlanObjectView
          key={o.id}
          object={o}
          proposal={proposals[o.id]}
          removal={removals[o.id]}
          selected={selected?.type === "object" && selected.id === o.id}
          onSelect={() => onSelect({ type: "object", id: o.id })}
          onRotate={(r) => onRotate(o.id, r)}
          onMove={(c) => onMove(o.id, c)}
        />
      ))}
    </g>
  );
}

function PlanObjectView({
  object: o,
  proposal,
  selected,
  onSelect,
  onRotate,
  onMove,
  removal,
}: {
  object: PlanObject;
  proposal?: ObjectProposal;
  removal?: EscalationStatus | "draft";
  selected: boolean;
  onSelect: () => void;
  onRotate: (rotation: number) => void;
  onMove: (center: Point) => void;
}) {
  const origin = toPx(o.center);
  // The frame and handle follow what's being proposed in the open draft.
  const current: ObjectState = proposal?.status === "draft" ? proposal.dims : o;
  const c = toPx(current.center);
  const [dragging, setDragging] = useState(false);
  const move = useRef<{ x: number; y: number; from: Point; moved: boolean } | null>(null);
  const [moving, setMoving] = useState(false);

  const svgPoint = (e: React.PointerEvent<SVGElement>) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement!;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
  };

  const w = current.widthM * PX_PER_M;
  const h = current.depthM * PX_PER_M;
  const snapped = dragging && current.rotation % 45 === 0;

  const movedAway = proposal && Math.hypot(proposal.dims.center.x - o.center.x, proposal.dims.center.y - o.center.y) > 0.005;
  const shown = proposal?.dims.center ? toPx(proposal.dims.center) : origin;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${o.label}${proposal?.status === "draft" ? ", change proposed" : ""}`}
      aria-pressed={selected}
      data-object={o.id}
      className={moving ? "cursor-grabbing outline-none" : "cursor-pointer outline-none"}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        onSelect();
        // Press on the object: becomes a move once the finger travels.
        (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
        const p = svgPoint(e);
        move.current = { x: p.x, y: p.y, from: current.center, moved: false };
      }}
      onPointerMove={(e) => {
        const m = move.current;
        if (!m) return;
        const p = svgPoint(e);
        const dx = p.x - m.x;
        const dy = p.y - m.y;
        if (!m.moved && Math.hypot(dx, dy) < 6) return; // a tap, not a drag
        if (!m.moved) setMoving(true);
        m.moved = true;
        onMove({
          x: +Math.min(ROOM.widthM, Math.max(0, m.from.x + dx / PX_PER_M)).toFixed(2),
          y: +Math.min(ROOM.depthM, Math.max(0, m.from.y + dy / PX_PER_M)).toFixed(2),
        });
      }}
      onPointerUp={() => {
        move.current = null;
        setMoving(false);
      }}
      onPointerCancel={() => {
        move.current = null;
        setMoving(false);
      }}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
    >
      {/* The plan's object: faded while a change is proposed over it. */}
      <g
        transform={`translate(${origin.x} ${origin.y}) rotate(${o.rotation})`}
        opacity={proposal ? 0.35 : 1}
        stroke="#111"
        strokeWidth={1.5}
        fill="#fff"
      >
        <ObjectShape kind={o.kind} w={o.widthM * PX_PER_M} h={o.depthM * PX_PER_M} />
      </g>

      {/* Proposed for removal: red dashed outline + cross over the plan's object. */}
      {removal && (
        <g
          data-removal={removal}
          transform={`translate(${origin.x} ${origin.y}) rotate(${o.rotation})`}
          stroke={removal === "draft" ? GHOST_RED : STATUS[removal]}
          strokeWidth={2.5}
          fill="none"
          pointerEvents="none"
        >
          {(() => {
            const w = o.widthM * PX_PER_M + 8;
            const h = o.depthM * PX_PER_M + 8;
            return (
              <>
                <rect x={-w / 2} y={-h / 2} width={w} height={h} strokeDasharray="5 4" />
                <path d={`M${-w / 2} ${-h / 2} L${w / 2} ${h / 2} M${w / 2} ${-h / 2} L${-w / 2} ${h / 2}`} />
              </>
            );
          })()}
        </g>
      )}

      {/* Moved: a dashed arrow from where the plan has it to the proposal. */}
      {proposal && movedAway && (
        <MoveArrow
          from={origin}
          to={shown}
          color={proposal.status === "draft" ? GHOST_RED : STATUS[proposal.status]}
        />
      )}

      {/* The proposal: red dashed while drafting, status colour once sent. */}
      {proposal && (
        <g
          data-proposal={proposal.status}
          transform={`translate(${shown.x} ${shown.y}) rotate(${proposal.dims.rotation})`}
          stroke={proposal.status === "draft" ? GHOST_RED : STATUS[proposal.status]}
          strokeDasharray="4 4"
          strokeWidth={2}
          fill={proposal.status === "draft" ? "rgba(239, 68, 68, 0.1)" : "transparent"}
        >
          <ObjectShape kind={o.kind} w={proposal.dims.widthM * PX_PER_M} h={proposal.dims.depthM * PX_PER_M} />
        </g>
      )}

      {selected && (
        <g transform={`translate(${c.x} ${c.y})`}>
          {dragging && (
            <circle
              r={Math.hypot(w, h) / 2 + 4}
              fill="none"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              pointerEvents="none"
            />
          )}
          <g transform={`rotate(${current.rotation})`}>
            <rect
              x={-w / 2 - 6}
              y={-h / 2 - 6}
              width={w + 12}
              height={h + 12}
              fill="none"
              stroke={SELECT_BLUE}
              strokeWidth={2}
              pointerEvents="none"
            />
            {/* Rotate handle: native curved double arrow, right of the frame. */}
            <RotateHandle
              x={w / 2 + 24}
              center={c}
              rotation={current.rotation}
              label={`Rotate ${o.label}`}
              snapped={snapped}
              onDragging={setDragging}
              onRotate={onRotate}
            />
          </g>
        </g>
      )}
    </g>
  );
}

/**
 * magicplan's rotate arrow, placed `x` px right of the object's centre (in its
 * rotated frame). Drag: free rotation with a 45° magnetic snap; tap: +45°.
 */
export function RotateHandle({
  x,
  center,
  rotation,
  label,
  snapped,
  onDragging,
  onRotate,
}: {
  x: number;
  /** The object's centre in canvas px (the pivot). */
  center: Point;
  rotation: number;
  label: string;
  snapped: boolean;
  onDragging: (dragging: boolean) => void;
  onRotate: (rotation: number) => void;
}) {
  const drag = useRef<{ start: number; base: number; moved: boolean } | null>(null);
  const angleAt = (e: React.PointerEvent<SVGElement>) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement!;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    return (Math.atan2(p.y - center.y, p.x - center.x) * 180) / Math.PI;
  };
  const end = () => {
    drag.current = null;
    onDragging(false);
  };
  return (
    <g
      role="slider"
      aria-label={label}
      aria-valuenow={rotation}
      aria-valuemin={0}
      aria-valuemax={359}
      data-rotate-handle
      transform={`translate(${x} 0)`}
      className="cursor-grab"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
        drag.current = { start: angleAt(e), base: rotation, moved: false };
        onDragging(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const delta = angleAt(e) - d.start;
        if (Math.abs(delta) > 2) d.moved = true;
        if (!d.moved) return;
        onRotate(snapRotation(d.base + delta));
      }}
      onPointerUp={() => {
        const d = drag.current;
        end();
        // A tap (no drag) turns it by 45°, to the next snapped angle.
        if (d && !d.moved) onRotate(normalize(Math.floor(d.base / 45) * 45 + 45));
      }}
      onPointerCancel={end}
    >
      <circle r={22} fill="transparent" />
      <path
        d="M-4 -18 A 20 20 0 0 1 -4 18"
        fill="none"
        stroke={snapped ? SNAP_GREEN : ARROW_BLUE}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path d="M-12 -22 L2 -21 L-6 -10 Z" fill={snapped ? SNAP_GREEN : ARROW_BLUE} />
      <path d="M-12 22 L2 21 L-6 10 Z" fill={snapped ? SNAP_GREEN : ARROW_BLUE} />
    </g>
  );
}

/** Dashed line with an arrowhead, from the plan's position to the proposed one. */
function MoveArrow({ from, to, color }: { from: Point; to: Point; color: string }) {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  if (len < 12) return null;
  const ux = (to.x - from.x) / len;
  const uy = (to.y - from.y) / len;
  const tip = { x: to.x - ux * 10, y: to.y - uy * 10 };
  const head = `M${tip.x} ${tip.y} L${tip.x - ux * 10 - uy * 6} ${tip.y - uy * 10 + ux * 6} L${tip.x - ux * 10 + uy * 6} ${tip.y - uy * 10 - ux * 6} Z`;
  return (
    <g pointerEvents="none" data-move-arrow>
      <circle cx={from.x} cy={from.y} r={3.5} fill={color} />
      <line x1={from.x} y1={from.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={2} strokeDasharray="6 5" />
      <path d={head} fill={color} />
    </g>
  );
}

const normalize = (deg: number) => ((Math.round(deg) % 360) + 360) % 360;

/** Free rotation with a magnetic snap (±5°) to every multiple of 45°. */
function snapRotation(deg: number) {
  const nearest = Math.round(deg / 45) * 45;
  return normalize(Math.abs(deg - nearest) <= 5 ? nearest : deg);
}

/** Top-down symbols in a w × h box centred on 0,0 ("front" faces +y). */
function ObjectShape({ kind, w, h }: { kind: PlanObject["kind"]; w: number; h: number }) {
  switch (kind) {
    case "counter":
      return (
        <>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} />
          <circle cx={-w / 2 + w * (0.5 / 1.6)} cy={0} r={h * 0.21} />
          <circle cx={-w / 2 + w * (1.05 / 1.6)} cy={0} r={h * 0.21} />
        </>
      );
    case "table":
      return <rect x={-w / 2} y={-h / 2} width={w} height={h} />;
    case "chair":
      return (
        <>
          {/* seat with a rounded front */}
          <path
            d={`M${-w * 0.42} ${-h * 0.32} H${w * 0.42} V${h * 0.12} A${w * 0.42} ${h * 0.38} 0 0 1 ${-w * 0.42} ${h * 0.12} Z`}
          />
          {/* backrest */}
          <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.14} rx={h * 0.05} />
        </>
      );
  }
}
