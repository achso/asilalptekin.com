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
  wallById,
  wallSpotAt,
  wallSpotPx,
} from "@/lib/floorplan";
import { cn } from "@/lib/utils";
import type { EscalationStatus, Point, SelectedElement, Wall, WallSpot } from "@/lib/types";
import { sameElement } from "@/store/useDeviationState";
import { CanvasWall, CanvasWallDefs } from "@/components/atoms/CanvasWall";
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
  onPlace,
  markers,
  onDimensionTap,
  objectProposals = {},
  onRotateObject,
  onMoveObject,
  removals = {},
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

      {markers?.map((m) => (
        <GhostWall key={m.id} ghost={m} color={STATUS_STROKE[m.status]} />
      ))}
      {draftGhost && <GhostWall ghost={draftGhost} color={GHOST_RED} draft selected={ghostSelected} />}
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
 * Where and how a proposed element is drawn. A free ghost (placed by a canvas
 * tap) is a hardcoded 100 × 10 px rect (≈ 0.9 m) centred on the tap. One
 * inserted at a wall's blue triangle is tied to that spot: a Structural one is
 * a new wall running perpendicular from the spot into the room, as magicplan
 * inserts walls (1.50 m until measured); any other category sits against the
 * wall, parallel to it.
 */
export type GhostSpec = {
  point: Point;
  spot?: WallSpot;
  /** Structural at a spot: a wall perpendicular to the host wall. */
  perpendicular?: boolean;
  /** The measured length, once entered (perpendicular walls grow to it). */
  lengthM?: number | null;
};

/** magicplan's default length for an inserted wall. */
const INSERTED_WALL_M = 1.5;

/**
 * The proposal is not approved geometry, so it's red, dashed and faintly
 * filled, never solid black. Submitted ones keep the dash in their status colour.
 */
const GHOST_RED = "#EF4444";
function GhostWall({
  ghost,
  color,
  draft = false,
  selected = false,
}: {
  ghost: GhostSpec;
  color: string;
  draft?: boolean;
  selected?: boolean;
}) {
  const fill = color === GHOST_RED ? "rgba(239, 68, 68, 0.1)" : color;
  const fillOpacity = color === GHOST_RED ? 1 : 0.12;
  const box = ghostBox(ghost);
  const sp = ghost.spot && wallSpotPx(ghost.spot);
  return (
    <g pointerEvents="none" data-ghost={draft ? "draft" : "submitted"} data-selected={selected || undefined} data-ghost-kind={ghost.perpendicular ? "wall" : ghost.spot ? "spot" : "free"}>
      {/* Selected (just inserted): magicplan's blue selection, under the red proposal dash. */}
      {selected && (
        <motion.rect
          data-ghost-selection
          initial={false}
          animate={{ x: box.x - 4, y: box.y - 4, width: box.width + 8, height: box.height + 8 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          rx={3}
          fill={BLUE}
          fillOpacity={0.35}
          stroke={BLUE_STRONG}
          strokeWidth={1.5}
        />
      )}
      <motion.rect
        initial={false}
        animate={box}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        stroke={color}
        strokeDasharray="4 4"
        strokeWidth={2}
        fill={fill}
        fillOpacity={fillOpacity}
      />
      {ghost.perpendicular && sp && (
        <>
          <SpotSplit spot={ghost.spot!} color={color} />
          {ghost.lengthM ? (
            <LengthTag
              x={sp.p.x + sp.nx * (ghost.lengthM * PX_PER_M) / 2 + (Math.abs(sp.ny) > 0.5 ? 22 : 0)}
              y={sp.p.y + sp.ny * (ghost.lengthM * PX_PER_M) / 2 + (Math.abs(sp.nx) > 0.5 ? 18 : 0)}
              text={ghost.lengthM.toFixed(2)}
              color={color}
            />
          ) : null}
        </>
      )}
    </g>
  );
}

/** The ghost's rect in canvas px (walls are axis-aligned, so a plain box). */
function ghostBox(g: GhostSpec) {
  if (g.spot && g.perpendicular) {
    const { p, nx, ny, ux, uy } = wallSpotPx(g.spot);
    const L = (g.lengthM || INSERTED_WALL_M) * PX_PER_M;
    const t = 10;
    const xs = [p.x - (ux * t) / 2, p.x + (ux * t) / 2, p.x + nx * L - (ux * t) / 2, p.x + nx * L + (ux * t) / 2];
    const ys = [p.y - (uy * t) / 2, p.y + (uy * t) / 2, p.y + ny * L - (uy * t) / 2, p.y + ny * L + (uy * t) / 2];
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
  }
  const at = toPx(g.point);
  const v = !!g.spot && Math.abs(wallSpotPx(g.spot).uy) > 0.5;
  return { x: at.x - (v ? 5 : 50), y: at.y - (v ? 50 : 5), width: v ? 10 : 100, height: v ? 100 : 10 };
}

/** The host wall's dimension split at the spot (native: 1.26 | 3.17), just outside the wall. */
function SpotSplit({ spot, color }: { spot: WallSpot; color: string }) {
  const w = wallById(spot.wallId);
  const g = wallGeometry(w);
  const off = 28;
  const pt = (m: number) => ({ x: g.a.x + g.ux * m * PX_PER_M - g.nx * off, y: g.a.y + g.uy * m * PX_PER_M - g.ny * off });
  const a = pt(0);
  const s = pt(spot.offsetM);
  const b = pt(w.lengthM);
  const tick = (q: Point) => (
    <line x1={q.x - g.nx * 5} y1={q.y - g.ny * 5} x2={q.x + g.nx * 5} y2={q.y + g.ny * 5} />
  );
  const segs: [Point, Point, number][] = [
    [a, s, spot.offsetM],
    [s, b, w.lengthM - spot.offsetM],
  ];
  return (
    <g data-spot-split stroke={color} strokeWidth={1}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeDasharray="4 3" />
      {tick(a)}
      {tick(s)}
      {tick(b)}
      {segs.map(([p, q, m], i) =>
        m >= 0.35 ? (
          <LengthTag
            key={i}
            x={(p.x + q.x) / 2}
            y={(p.y + q.y) / 2}
            text={m.toFixed(2)}
            color={color}
            vertical={Math.abs(g.uy) > 0.5}
          />
        ) : null,
      )}
    </g>
  );
}

function LengthTag({ x, y, text, color, vertical }: { x: number; y: number; text: string; color: string; vertical?: boolean }) {
  return (
    <g transform={vertical ? `rotate(-90 ${x} ${y})` : undefined} stroke="none">
      <rect x={x - 19} y={y - 8} width={38} height={16} rx={4} fill="#fff" />
      <text x={x} y={y} fill={color} fontSize={12} fontWeight={600} textAnchor="middle" dominantBaseline="central">
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
