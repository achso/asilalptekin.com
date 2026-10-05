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
  GHOST_ITEM_SIZE,
  lineLength,
  snapWallPoint,
  wallSpotAt,
  wallSpotPx,
} from "@/lib/floorplan";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { EscalationStatus, GhostItem, Point, SelectedElement, Wall, WallLine, WallSpot } from "@/lib/types";
import { sameElement } from "@/store/useDeviationState";
import { CanvasWall, CanvasWallDefs } from "@/components/atoms/CanvasWall";
import { GhostItems } from "./GhostItems";
import { type ObjectProposal, PlanObjects } from "./PlanObjects";

const BLUE = "#64aeea";
const BLUE_STRONG = "#1a7cf5";
const RED = "#e5352b";
const AMBER = "#f59e0b";
const GREEN = "#16a34a";

/** Outer stroke colour per deviation state. In review keeps the red hatch, framed amber. */
const STATUS_STROKE: Record<EscalationStatus, string> = {
  queued: RED,
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
  /** A tap on a wall: select it and mark the exact spot (native blue triangle). */
  onSelectWallAt?: (spot: WallSpot) => void;
  /** The marked spot to draw (on the selected wall, or the draft's tied spot). */
  tapSpot?: WallSpot | null;
  /** ghost_draft: taps inside the room place / move the ghost wall instead of selecting. */
  placing?: boolean;
  /** The open draft's ghost (Insert → Object), drawn red and dashed. */
  draftGhost?: GhostSpec | null;
  /** The draft ghost is selected: magicplan's blue selection around it. */
  ghostSelected?: boolean;
  /** Drag an inserted element along the wall it's attached to (new offset, metres). */
  /** Drawing a wall (two taps): the first tap, once made. */
  wallStart?: Point | null;
  drawingWall?: boolean;
  /** Inserted objects: select / drag / rotate a copy. */
  onSelectItem?: (id: string) => void;
  onMoveItem?: (id: string, center: Point) => void;
  onRotateItem?: (id: string, rotation: number) => void;
  onPlace?: (p: Point) => void;
  /** Ghost walls of submitted proposals, drawn in their status colour. */
  markers?: (GhostSpec & { id: string; status: EscalationStatus })[];
  /** Tapping a wall's dimension label opens the Change Measurement popover. */
  onDimensionTap?: (wallId: string, at: Point) => void;
  /** Proposed size / rotation per object (open draft or sent report). */
  objectProposals?: Record<string, ObjectProposal | undefined>;
  onRotateObject?: (objectId: string, rotation: number) => void;
  onMoveObject?: (objectId: string, center: Point) => void;
  /** Elements proposed for removal ("wall:id" → "draft" | status), drawn crossed out. */
  removals?: Record<string, EscalationStatus | "draft" | undefined>;
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
  onSelectWallAt,
  tapSpot,
  placing,
  draftGhost,
  ghostSelected = false,
  wallStart = null,
  drawingWall = false,
  onSelectItem,
  onMoveItem,
  onRotateItem,
  onPlace,
  markers,
  onDimensionTap,
  objectProposals = {},
  onRotateObject,
  onMoveObject,
  removals = {},
}: Props) {
  // Wall drawing: where the next tap would land (rubber band preview).
  const [hover, setHover] = useState<Point | null>(null);
  const toPlan = (e: React.PointerEvent<SVGSVGElement>) => {
    const ctm = e.currentTarget.getScreenCTM();
    if (!ctm) return null;
    const m = toMetres(new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()));
    // Inside the room, or on a wall (up to 20 cm out): it has to be on this plan.
    const out = 0.2;
    if (m.x < -out || m.y < -out || m.x > ROOM.widthM + out || m.y > ROOM.depthM + out) return null;
    return { x: +m.x.toFixed(2), y: +m.y.toFixed(2) };
  };
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
        const m = toPlan(e);
        if (m) onPlace?.(m);
      }}
      onPointerMove={(e) => drawingWall && setHover(toPlan(e))}
      onPointerLeave={() => setHover(null)}
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
      <PlanObjects
        selected={selected}
        proposals={objectProposals}
        onSelect={onSelect}
        onRotate={(id, r) => onRotateObject?.(id, r)}
        onMove={(id, c) => onMoveObject?.(id, c)}
        removals={Object.fromEntries(
          Object.entries(removals).flatMap(([k, v]) => (k.startsWith("object:") ? [[k.slice(7), v]] : [])),
        )}
      />

      {WALLS.map((w) => (
        <DimensionLine
          key={`dim-${w.id}`}
          wall={w}
          onTap={!placing ? onDimensionTap : undefined}
        />
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
              onSelect={(e) => {
                // Pointer tap: project it onto the wall. Keyboard: the wall's middle.
                const ctm = e && (e.currentTarget as SVGGElement).ownerSVGElement?.getScreenCTM();
                if (!onSelectWallAt) return onSelect(target);
                const px = ctm
                  ? new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
                  : wallGeometry(w).mid;
                onSelectWallAt(wallSpotAt(w, { x: px.x, y: px.y }));
              }}
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

      {tapSpot && <TapTriangle key={`${tapSpot.wallId}-${tapSpot.offsetM}`} spot={tapSpot} />}

      {/* Walls / corners proposed for removal: red dashed overlay (status colour once sent). */}
      {WALLS.map((w) => {
        const r = removals[`wall:${w.id}`];
        if (!r) return null;
        const l = wallLine(w);
        return (
          <line
            key={`rm-${w.id}`}
            data-removal={r}
            {...l}
            stroke={r === "draft" ? GHOST_RED : STATUS_STROKE[r]}
            strokeWidth={WALL_THICKNESS + 6}
            strokeDasharray="10 8"
            strokeOpacity={0.85}
            pointerEvents="none"
          />
        );
      })}
      {CORNERS.map((c) => {
        const r = removals[`corner:${c.id}`];
        if (!r) return null;
        const p = toPx(c.p);
        return (
          <circle
            key={`rm-${c.id}`}
            data-removal={r}
            cx={p.x}
            cy={p.y}
            r={18}
            fill="none"
            stroke={r === "draft" ? GHOST_RED : STATUS_STROKE[r]}
            strokeWidth={3}
            strokeDasharray="5 4"
            pointerEvents="none"
          />
        );
      })}

      {markers?.map((m) =>
        m.items ? (
          <GhostItems
            key={m.id}
            items={m.items}
            size={GHOST_ITEM_SIZE}
            category={m.category}
            color={STATUS_STROKE[m.status]}
          />
        ) : (
          m.line ? (
            <GhostLine key={m.id} line={m.line} color={STATUS_STROKE[m.status]} />
          ) : (
            <GhostWall key={m.id} ghost={m} color={STATUS_STROKE[m.status]} />
          )
        ),
      )}
      {draftGhost?.items ? (
        <GhostItems
          items={draftGhost.items}
          size={GHOST_ITEM_SIZE}
          category={draftGhost.category}
          color={GHOST_RED}
          interactive
          selected={ghostSelected}
          activeId={draftGhost.activeItem}
          onSelect={onSelectItem}
          onMove={onMoveItem}
          onRotate={onRotateItem}
        />
      ) : (
        draftGhost?.line && <GhostLine line={draftGhost.line} color={GHOST_RED} draft selected={ghostSelected} />
      )}
      {drawingWall && <WallPreview start={wallStart} hover={hover} />}
    </svg>
  );
}

const roomTint = cva("pointer-events-none transition-[fill,opacity] duration-300", {
  variants: {
    state: {
      idle: "fill-transparent",
      queued: "fill-[url(#canvas-wall-hatch)] opacity-25",
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

/**
 * Where and how a proposed element is drawn:
 * - a missing wall: a line from start to end, at true length (two taps);
 * - inserted objects: squares, drawn by GhostItems;
 * - older free markers (no line, no items): a 100 × 10 px rect at the point.
 */
export type GhostSpec = {
  point: Point;
  spot?: WallSpot;
  line?: WallLine;
  /** Inserted objects (drag / rotate / duplicate); drawn by GhostItems instead. */
  items?: GhostItem[];
  activeItem?: string;
  category?: string;
};

/**
 * The proposal is not approved geometry, so it's red, dashed and faintly
 * filled, never solid black. Submitted ones keep the dash in their status colour.
 */
const GHOST_RED = "#EF4444";
function GhostWall({ ghost, color }: { ghost: GhostSpec; color: string }) {
  const at = toPx(ghost.point);
  return (
    <rect
      pointerEvents="none"
      data-ghost="submitted"
      data-ghost-kind="free"
      x={at.x - 50}
      y={at.y - 5}
      width={100}
      height={10}
      stroke={color}
      strokeDasharray="4 4"
      strokeWidth={2}
      fill={color}
      fillOpacity={0.12}
    />
  );
}

/**
 * A missing wall as drawn: a red dashed line at true length (status colour
 * once sent), round end points, and its length on a tag beside the middle.
 * Selected (just drawn): magicplan's blue selection under it.
 */
function GhostLine({
  line,
  color,
  draft = false,
  selected = false,
}: {
  line: WallLine;
  color: string;
  draft?: boolean;
  selected?: boolean;
}) {
  const a = toPx(line.a);
  const b = toPx(line.b);
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  // Label offset to the line's side (perpendicular), so it never sits on it.
  const nx = -(b.y - a.y) / len;
  const ny = (b.x - a.x) / len;
  const mid = { x: (a.x + b.x) / 2 + nx * 18, y: (a.y + b.y) / 2 + ny * 18 };
  const vertical = Math.abs(b.y - a.y) > Math.abs(b.x - a.x);
  return (
    <g pointerEvents="none" data-ghost={draft ? "draft" : "submitted"} data-ghost-kind="line" data-selected={selected || undefined}>
      {selected && (
        <line
          data-ghost-selection
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={BLUE}
          strokeOpacity={0.45}
          strokeWidth={WALL_THICKNESS + 8}
          strokeLinecap="round"
        />
      )}
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={WALL_THICKNESS - 4} strokeOpacity={0.15} />
      <line
        data-ghost-line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={color}
        strokeWidth={3}
        strokeDasharray="9 6"
      />
      {[a, b].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill="#fff" stroke={color} strokeWidth={2.5} />
      ))}
      <LengthTag x={mid.x} y={mid.y} text={`${lineLength(line).toFixed(2)} m`} color={color} vertical={vertical} />
    </g>
  );
}

/** While drawing: the start point, and a rubber band to where the next tap would end it. */
function WallPreview({ start, hover }: { start: Point | null; hover: Point | null }) {
  if (!start && !hover) return null;
  const s = start && toPx(start);
  const end = start && hover ? snapWallPoint(hover, start) : null;
  const h = hover && toPx(start ? end! : snapWallPoint(hover));
  return (
    <g pointerEvents="none" data-wall-preview>
      {s && h && (
        <>
          <line x1={s.x} y1={s.y} x2={h.x} y2={h.y} stroke={GHOST_RED} strokeWidth={3} strokeDasharray="9 6" strokeOpacity={0.7} />
          <LengthTag
            x={(s.x + h.x) / 2}
            y={(s.y + h.y) / 2 - 16}
            text={`${lineLength({ a: start!, b: end! }).toFixed(2)} m`}
            color={GHOST_RED}
          />
        </>
      )}
      {s && <circle data-wall-start cx={s.x} cy={s.y} r={6} fill={GHOST_RED} stroke="#fff" strokeWidth={2} />}
      {h && <circle cx={h.x} cy={h.y} r={5} fill="#fff" stroke={GHOST_RED} strokeWidth={2} strokeOpacity={0.8} />}
    </g>
  );
}

function LengthTag({ x, y, text, color, vertical }: { x: number; y: number; text: string; color: string; vertical?: boolean }) {
  const w = text.length * 7.6 + 10;
  return (
    <g transform={vertical ? `rotate(-90 ${x} ${y})` : undefined} stroke="none">
      <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={4} fill="#fff" />
      <text x={x} y={y} fill={color} fontSize={13} fontWeight={600} textAnchor="middle" dominantBaseline="central">
        {text}
      </text>
    </g>
  );
}

/**
 * magicplan's tap marker: the exact spot tapped on a wall gets a blue triangle
 * on the wall's inner face, pointing at it, and a white notch through the
 * wall. Insert then ties the new element to this spot.
 */
function TapTriangle({ spot }: { spot: WallSpot }) {
  const { p, nx, ny, ux, uy } = wallSpotPx(spot);
  const at = (n: number, u: number) => `${p.x + nx * n + ux * u},${p.y + ny * n + uy * u}`;
  // The selected wall's body spans 3 px inside the room to thickness + 3 outside.
  const inner = 3;
  const outer = -(WALL_THICKNESS + 3);
  const mid = (inner + outer) / 2;
  return (
    <motion.g
      data-tap-spot={`${spot.wallId}:${spot.offsetM}`}
      pointerEvents="none"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 26 }}
      style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "view-box" }}
    >
      {/* notch: an hourglass through the wall body */}
      <polygon
        points={`${at(inner, -4)} ${at(inner, 4)} ${at(mid, 0.8)} ${at(outer, 4)} ${at(outer, -4)} ${at(mid, -0.8)}`}
        fill="#fff"
      />
      {/* triangle, tip on the inner face */}
      <polygon
        points={`${at(inner, 0)} ${at(inner + 15, -9)} ${at(inner + 15, 9)}`}
        fill={BLUE_STRONG}
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </motion.g>
  );
}

function DimensionLine({ wall, onTap }: { wall: Wall; onTap?: (wallId: string, at: Point) => void }) {
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
      {/* Label: value + the native lock glyph (locked plan). The North wall's
          label is a button that opens the Change Measurement popover. */}
      <g
        transform={vertical ? `rotate(-90 ${mx} ${my})` : undefined}
        {...(onTap
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": `${wall.label} length ${wall.lengthM.toFixed(2)} m, locked. Change measurement`,
              pointerEvents: "auto",
              className: "cursor-pointer outline-none",
              onClick: () => onTap(wall.id, { x: mx, y: my }),
              onKeyDown: (e: React.KeyboardEvent) =>
                (e.key === "Enter" || e.key === " ") && onTap(wall.id, { x: mx, y: my }),
            }
          : {})}
      >
        {onTap && <rect x={mx - 40} y={my - 22} width={80} height={44} fill="transparent" stroke="none" />}
        <rect
          x={mx - 31}
          y={my - 11}
          width={62}
          height={22}
          rx={onTap ? 6 : 0}
          fill={onTap ? "#e8f1fe" : "#f6f6f6"}
          stroke="none"
        />
        <text
          x={mx - 6}
          y={my}
          fill={BLUE_STRONG}
          stroke="none"
          fontSize={15}
          fontWeight={500}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {wall.lengthM.toFixed(2)}
        </text>
        {/* lock glyph */}
        <g transform={`translate(${mx + 18} ${my - 5})`} stroke="none" fill="#3a3a3c">
          <rect x={0} y={4} width={8} height={6.5} rx={1.2} />
          <path d="M1.6 4.2V2.9a2.4 2.4 0 0 1 4.8 0v1.3" fill="none" stroke="#3a3a3c" strokeWidth={1.3} />
        </g>
      </g>
    </g>
  );
}
