"use client";

import { useRef, useState } from "react";
import { PLAN_OBJECTS, PX_PER_M, toPx } from "@/lib/floorplan";
import type { EscalationStatus, ObjectDims, PlanObject, SelectedElement } from "@/lib/types";

const SELECT_BLUE = "#64aeea";
const ARROW_BLUE = "#1a7cf5";
const SNAP_GREEN = "#22c55e";
const GHOST_RED = "#EF4444";
const STATUS: Record<EscalationStatus, string> = {
  sending: "#e5352b",
  delivered: "#e5352b",
  in_review: "#f59e0b",
  resolved: "#16a34a",
};

/** A proposed size / rotation drawn over the object: the open draft, or a sent report. */
export type ObjectProposal = { dims: ObjectDims; status: EscalationStatus | "draft" };

/**
 * PlanObjects: the furniture and fixtures on the plan, magicplan-style.
 *
 * - Tap selects (blue frame + curved rotate arrow on the right, like native).
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
}: {
  selected: SelectedElement | null;
  proposals: Record<string, ObjectProposal | undefined>;
  onSelect: (el: SelectedElement) => void;
  onRotate: (objectId: string, rotation: number) => void;
}) {
  return (
    <g>
      {PLAN_OBJECTS.map((o) => (
        <PlanObjectView
          key={o.id}
          object={o}
          proposal={proposals[o.id]}
          selected={selected?.type === "object" && selected.id === o.id}
          onSelect={() => onSelect({ type: "object", id: o.id })}
          onRotate={(r) => onRotate(o.id, r)}
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
}: {
  object: PlanObject;
  proposal?: ObjectProposal;
  selected: boolean;
  onSelect: () => void;
  onRotate: (rotation: number) => void;
}) {
  const c = toPx(o.center);
  // The frame and handle follow what's being proposed in the open draft.
  const current: ObjectDims = proposal?.status === "draft" ? proposal.dims : o;
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ start: number; base: number; moved: boolean } | null>(null);

  const w = current.widthM * PX_PER_M;
  const h = current.depthM * PX_PER_M;
  const snapped = dragging && current.rotation % 45 === 0;

  const angleAt = (e: React.PointerEvent<SVGElement>) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement!;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    return (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI;
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${o.label}${proposal?.status === "draft" ? ", change proposed" : ""}`}
      aria-pressed={selected}
      data-object={o.id}
      className="cursor-pointer outline-none"
      onPointerDown={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
    >
      {/* The plan's object: faded while a change is proposed over it. */}
      <g
        transform={`translate(${c.x} ${c.y}) rotate(${o.rotation})`}
        opacity={proposal ? 0.35 : 1}
        stroke="#111"
        strokeWidth={1.5}
        fill="#fff"
      >
        <ObjectShape kind={o.kind} w={o.widthM * PX_PER_M} h={o.depthM * PX_PER_M} />
      </g>

      {/* The proposal: red dashed while drafting, status colour once sent. */}
      {proposal && (
        <g
          data-proposal={proposal.status}
          transform={`translate(${c.x} ${c.y}) rotate(${proposal.dims.rotation})`}
          stroke={proposal.status === "draft" ? GHOST_RED : STATUS[proposal.status]}
          strokeDasharray="4 4"
          strokeWidth={2}
          fill={proposal.status === "draft" ? "rgba(239, 68, 68, 0.1)" : "transparent"}
          pointerEvents="none"
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
            <g
              role="slider"
              aria-label={`Rotate ${o.label}`}
              aria-valuenow={current.rotation}
              aria-valuemin={0}
              aria-valuemax={359}
              data-rotate-handle
              transform={`translate(${w / 2 + 24} 0)`}
              className="cursor-grab"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
                drag.current = { start: angleAt(e), base: current.rotation, moved: false };
                setDragging(true);
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
                drag.current = null;
                setDragging(false);
                // A tap (no drag) turns it by 45°, to the next snapped angle.
                if (d && !d.moved) onRotate(normalize(Math.floor(d.base / 45) * 45 + 45));
              }}
              onPointerCancel={() => {
                drag.current = null;
                setDragging(false);
              }}
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
          </g>
        </g>
      )}
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
