"use client";

import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import type { DeviationState } from "@/store/deviationMachine";
import {
  CORNERS,
  WALLS,
  WALL_THICKNESS,
  PX_PER_M,
  ROOM,
  toMetres,
  toPx,
  wallGeometry,
} from "@/lib/floorplan";
import { cn } from "@/lib/utils";
import type { ElementCategory, EscalationStatus, Point, SelectedElement, Wall } from "@/lib/types";
import { sameElement } from "@/store/useDeviationState";
import { CanvasWall, CanvasWallDefs } from "@/components/atoms/CanvasWall";
import { GhostMarker } from "@/components/atoms/GhostMarker";

const BLUE = "#64aeea";
const BLUE_STRONG = "#1a7cf5";
const RED = "#e5352b";
const AMBER = "#f59e0b";
const GREEN = "#16a34a";

/** Outer stroke colour per deviation state. In review keeps the red hatch, framed amber. */
const STATUS_STROKE: Record<EscalationStatus, string> = {
  sending: RED,
  delivered: RED,
  in_review: AMBER,
  resolved: GREEN,
};

type Props = {
  width: number;
  height: number;
  selected: SelectedElement | null;
  statusFor: (t: SelectedElement) => EscalationStatus | undefined;
  photoCountFor?: (t: SelectedElement) => number;
  onSelect: (t: SelectedElement | null) => void;
  /** ghost_draft: taps inside the room place / move the Ghost Object instead of selecting. */
  placing?: boolean;
  draftMarker?: Point | null;
  draftCategory?: ElementCategory | null;
  onPlace?: (p: Point) => void;
  /** Ghost Objects of submitted proposals, drawn in their status colour. */
  markers?: { id: string; point: Point; status: EscalationStatus; category?: ElementCategory }[];
};

const ROOM_ELEMENT: SelectedElement = { type: "room", id: ROOM.id };

/**
 * FloorPlan (organism): the SVG plan. Room floor, CanvasWall atoms, corner
 * nodes, openings, furniture and dimension lines. Every element is selectable;
 * tapping empty canvas (outside the room) clears the selection. The dot grid
 * behind it is CanvasArea's CSS background, so the SVG background is transparent.
 */
export function FloorPlan({
  width,
  height,
  selected,
  statusFor,
  photoCountFor,
  onSelect,
  placing,
  draftMarker,
  draftCategory,
  onPlace,
  markers,
}: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("absolute inset-0 touch-manipulation", placing && "cursor-crosshair")}
      onPointerDownCapture={(e) => {
        // Placement mode owns the canvas: no element gets the tap, so the
        // draft isn't discarded. Screen → SVG via the CTM, which also undoes
        // the iPad frame's CSS scale.
        if (!placing) return;
        e.stopPropagation();
        const svg = e.currentTarget;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
        const m = toMetres(pt);
        // Only inside the room: the element has to be somewhere on this plan.
        if (m.x < 0 || m.y < 0 || m.x > ROOM.widthM || m.y > ROOM.depthM) return;
        onPlace?.({ x: +m.x.toFixed(2), y: +m.y.toFixed(2) });
      }}
      onPointerDown={(e) => {
        // Tap on empty canvas clears the selection.
        if (e.target === e.currentTarget || (e.target as SVGElement).dataset.bg) onSelect(null);
      }}
    >
      <defs>
        <pattern
          id="grid-room"
          width={PX_PER_M / 4}
          height={PX_PER_M / 4}
          patternUnits="userSpaceOnUse"
          x={toPx({ x: 0, y: 0 }).x}
          y={toPx({ x: 0, y: 0 }).y}
        >
          <path
            d={`M ${PX_PER_M / 4} 0 L 0 0 0 ${PX_PER_M / 4}`}
            fill="none"
            stroke="#f3d9c9"
            strokeWidth="0.8"
          />
        </pattern>
        <CanvasWallDefs />
      </defs>

      {/* Transparent hit area for "tap outside the room to deselect" */}
      <rect data-bg="1" width={width} height={height} fill="transparent" />

      <RoomFloor
        selected={sameElement(selected, ROOM_ELEMENT)}
        deviationState={statusFor(ROOM_ELEMENT) ?? "idle"}
        onSelect={() => onSelect(ROOM_ELEMENT)}
      />
      <Furniture />

      {WALLS.map((w) => (
        <DimensionLine key={`dim-${w.id}`} wall={w} />
      ))}

      {WALLS.map((w) => {
        const target: SelectedElement = { type: "wall", id: w.id };
        return (
          <g key={w.id}>
            <CanvasWall
              {...wallLine(w)}
              thickness={WALL_THICKNESS}
              label={w.label}
              deviationState={statusFor(target) ?? "idle"}
              photoCount={photoCountFor?.(target)}
              selected={sameElement(selected, target)}
              onSelect={() => onSelect(target)}
            />
            {w.openings?.map((o, i) => (
              <OpeningShape key={i} wall={w} opening={o} />
            ))}
          </g>
        );
      })}

      {CORNERS.map((c) => {
        const target: SelectedElement = { type: "corner", id: c.id };
        const p = toPx(c.p);
        const isSel = sameElement(selected, target);
        const status = statusFor(target);
        return (
          <g key={c.id} onPointerDown={() => onSelect(target)} className="cursor-pointer">
            {/* fat-finger hit area */}
            <circle cx={p.x} cy={p.y} r={26} fill="transparent" />
            <motion.circle
              cx={p.x}
              cy={p.y}
              initial={false}
              animate={{ r: isSel ? 13 : 10 }}
              fill={status ? STATUS_STROKE[status] : isSel ? BLUE_STRONG : "#fff"}
              stroke={status ? STATUS_STROKE[status] : isSel ? "#fff" : "#111"}
              strokeWidth={isSel ? 4 : 2}
            />
          </g>
        );
      })}

      {markers?.map((m) => (
        <GhostMarker key={m.id} at={toPx(m.point)} color={STATUS_STROKE[m.status]} category={m.category} />
      ))}
      {draftMarker && <GhostMarker at={toPx(draftMarker)} color={RED} category={draftCategory} draft />}
    </svg>
  );
}

const roomTint = cva("pointer-events-none transition-[fill,opacity] duration-300", {
  variants: {
    state: {
      idle: "fill-transparent",
      sending: "fill-[url(#canvas-wall-hatch)] opacity-25",
      delivered: "fill-[url(#canvas-wall-hatch)] opacity-25",
      in_review: "fill-amber-400/20",
      resolved: "fill-emerald-500/10",
    },
    selected: { true: "", false: "" },
  },
  compoundVariants: [{ state: "idle", selected: true, class: "fill-mp-blue-soft/15" }],
});

/** The floor itself is selectable: deviations can be anchored to the whole room. */
function RoomFloor({
  selected,
  deviationState,
  onSelect,
}: {
  selected: boolean;
  deviationState: DeviationState;
  onSelect: () => void;
}) {
  const a = toPx(CORNERS[0].p);
  const c = toPx(CORNERS[2].p);
  const box = { x: a.x, y: a.y, width: c.x - a.x, height: c.y - a.y };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${ROOM.label}, ${deviationState === "idle" ? "no deviation reported" : deviationState}`}
      aria-pressed={selected}
      onPointerDown={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className="cursor-pointer outline-none"
    >
      <rect {...box} fill="#fff" />
      <rect {...box} fill="url(#grid-room)" pointerEvents="none" />
      <rect {...box} className={roomTint({ state: deviationState, selected })} />
      {selected && (
        <rect
          {...box}
          className="pointer-events-none fill-none stroke-mp-blue"
          strokeWidth={3}
          strokeDasharray="10 8"
        />
      )}
    </g>
  );
}

function Furniture() {
  const t = toPx({ x: 2.6, y: 1.1 });
  return (
    <g pointerEvents="none" stroke="#111" strokeWidth="1.5" fill="#fff">
      {/* table */}
      <rect x={t.x} y={t.y} width={0.95 * PX_PER_M} height={1.2 * PX_PER_M} />
      {/* chair */}
      <path
        d={`M ${t.x - 6} ${t.y + 40} h -28 a 14 14 0 0 0 0 40 h 28 z`}
        fill="#fff"
      />
      <rect x={t.x - 52} y={t.y + 36} width="10" height="48" rx="3" />
      {/* kitchen counter along the north wall */}
      <rect
        x={toPx({ x: 0.1, y: 0 }).x}
        y={toPx({ x: 0, y: 0.08 }).y}
        width={1.6 * PX_PER_M}
        height={0.6 * PX_PER_M}
      />
      <circle cx={toPx({ x: 0.6, y: 0 }).x} cy={toPx({ x: 0, y: 0.38 }).y} r="14" />
      <circle cx={toPx({ x: 1.15, y: 0 }).x} cy={toPx({ x: 0, y: 0.38 }).y} r="14" />
    </g>
  );
}

/**
 * Wall centreline for CanvasWall: extended by half a thickness at both ends so
 * corners overlap cleanly, and shifted outward so the inner face sits exactly
 * on the room outline (magicplan measures interior dimensions).
 */
function wallLine(wall: Wall) {
  const g = wallGeometry(wall);
  const ext = WALL_THICKNESS / 2;
  const ox = -g.nx * ext;
  const oy = -g.ny * ext;
  return {
    x1: g.a.x - g.ux * ext + ox,
    y1: g.a.y - g.uy * ext + oy,
    x2: g.b.x + g.ux * ext + ox,
    y2: g.b.y + g.uy * ext + oy,
  };
}

function OpeningShape({ wall, opening }: { wall: Wall; opening: NonNullable<Wall["openings"]>[number] }) {
  const g = wallGeometry(wall);
  const s = opening.offsetM * PX_PER_M;
  const w = opening.widthM * PX_PER_M;
  const ext = WALL_THICKNESS / 2;
  const p1 = { x: g.a.x + g.ux * s - g.nx * ext, y: g.a.y + g.uy * s - g.ny * ext };
  const p2 = { x: p1.x + g.ux * w, y: p1.y + g.uy * w };

  if (opening.kind === "window") {
    return (
      <g pointerEvents="none">
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#fff" strokeWidth={WALL_THICKNESS + 2} />
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111" strokeWidth={2} strokeDasharray="6 6" />
      </g>
    );
  }

  // Door: gap in the wall + quarter-circle swing into the room.
  const hinge = { x: p2.x + g.nx * ext, y: p2.y + g.ny * ext };
  const leafEnd = { x: hinge.x + g.nx * w, y: hinge.y + g.ny * w };
  const start = { x: p1.x + g.nx * ext, y: p1.y + g.ny * ext };
  return (
    <g pointerEvents="none">
      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#fff" strokeWidth={WALL_THICKNESS + 10} />
      <line x1={hinge.x} y1={hinge.y} x2={leafEnd.x} y2={leafEnd.y} stroke="#111" strokeWidth={1.5} />
      <path
        d={`M ${leafEnd.x} ${leafEnd.y} A ${w} ${w} 0 0 1 ${start.x} ${start.y}`}
        fill="none"
        stroke="#111"
        strokeWidth={1.5}
      />
    </g>
  );
}

function DimensionLine({ wall }: { wall: Wall }) {
  const g = wallGeometry(wall);
  const off = 44;
  const ax = g.a.x - g.nx * off;
  const ay = g.a.y - g.ny * off;
  const bx = g.b.x - g.nx * off;
  const by = g.b.y - g.ny * off;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const vertical = Math.abs(g.uy) > 0.5;
  const tick = 6;

  return (
    <g pointerEvents="none" stroke="#6f6f73" strokeWidth={1}>
      <line x1={ax} y1={ay} x2={bx} y2={by} />
      <line x1={ax - g.nx * tick} y1={ay - g.ny * tick} x2={ax + g.nx * tick} y2={ay + g.ny * tick} />
      <line x1={bx - g.nx * tick} y1={by - g.ny * tick} x2={bx + g.nx * tick} y2={by + g.ny * tick} />
      <line x1={g.a.x} y1={g.a.y} x2={ax} y2={ay} strokeDasharray="3 3" />
      <line x1={g.b.x} y1={g.b.y} x2={bx} y2={by} strokeDasharray="3 3" />
      <rect
        x={mx - (vertical ? 11 : 24)}
        y={my - (vertical ? 24 : 11)}
        width={vertical ? 22 : 48}
        height={vertical ? 48 : 22}
        fill="#f6f6f6"
        stroke="none"
      />
      <text
        x={mx}
        y={my}
        fill={BLUE_STRONG}
        stroke="none"
        fontSize={15}
        fontWeight={500}
        textAnchor="middle"
        dominantBaseline="central"
        transform={vertical ? `rotate(-90 ${mx} ${my})` : undefined}
      >
        {wall.lengthM.toFixed(2)}
      </text>
    </g>
  );
}
