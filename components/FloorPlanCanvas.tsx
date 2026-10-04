"use client";

import { motion } from "framer-motion";
import {
  CORNERS,
  WALLS,
  WALL_THICKNESS,
  PX_PER_M,
  toPx,
  wallGeometry,
} from "@/lib/floorplan";
import type { Escalation, Target, Wall } from "@/lib/types";
import { sameTarget } from "@/lib/useEscalationStore";

const BLUE = "#64aeea";
const BLUE_STRONG = "#1a7cf5";
const RED = "#e5352b";

type Props = {
  width: number;
  height: number;
  selected: Target | null;
  escalationFor: (t: Target) => Escalation | undefined;
  onSelect: (t: Target | null) => void;
};

export function FloorPlanCanvas({ width, height, selected, escalationFor, onSelect }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 touch-manipulation"
      onPointerDown={(e) => {
        // Tap on empty canvas clears the selection.
        if (e.target === e.currentTarget || (e.target as SVGElement).dataset.bg) onSelect(null);
      }}
    >
      <defs>
        <pattern id="grid-dots" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="1.2" fill="#b9c6d6" />
        </pattern>
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
        <pattern
          id="hatch-red"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" fill="#fde3e1" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={RED} strokeWidth="4" />
        </pattern>
      </defs>

      {/* Background: dotted grid outside the room, like magicplan's empty canvas */}
      <rect data-bg="1" width={width} height={height} fill="url(#grid-dots)" />

      <RoomFloor />
      <Furniture />

      {WALLS.map((w) => (
        <DimensionLine key={`dim-${w.id}`} wall={w} />
      ))}

      {WALLS.map((w) => {
        const target: Target = { kind: "wall", id: w.id };
        return (
          <WallShape
            key={w.id}
            wall={w}
            selected={sameTarget(selected, target)}
            escalated={!!escalationFor(target)}
            onSelect={() => onSelect(target)}
          />
        );
      })}

      {CORNERS.map((c) => {
        const target: Target = { kind: "corner", id: c.id };
        const p = toPx(c.p);
        const isSel = sameTarget(selected, target);
        const esc = !!escalationFor(target);
        return (
          <g key={c.id} onPointerDown={() => onSelect(target)} className="cursor-pointer">
            {/* fat-finger hit area */}
            <circle cx={p.x} cy={p.y} r={26} fill="transparent" />
            <motion.circle
              cx={p.x}
              cy={p.y}
              initial={false}
              animate={{ r: isSel ? 13 : 10 }}
              fill={esc ? RED : isSel ? BLUE_STRONG : "#fff"}
              stroke={esc ? RED : isSel ? "#fff" : "#111"}
              strokeWidth={isSel ? 4 : 2}
            />
          </g>
        );
      })}
    </svg>
  );
}

function RoomFloor() {
  const a = toPx(CORNERS[0].p);
  const c = toPx(CORNERS[2].p);
  return (
    <g pointerEvents="none">
      <rect x={a.x} y={a.y} width={c.x - a.x} height={c.y - a.y} fill="#fff" />
      <rect x={a.x} y={a.y} width={c.x - a.x} height={c.y - a.y} fill="url(#grid-room)" />
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

function WallShape({
  wall,
  selected,
  escalated,
  onSelect,
}: {
  wall: Wall;
  selected: boolean;
  escalated: boolean;
  onSelect: () => void;
}) {
  const g = wallGeometry(wall);
  // Extend each wall by half thickness so corners overlap cleanly.
  const ext = WALL_THICKNESS / 2;
  const x1 = g.a.x - g.ux * ext;
  const y1 = g.a.y - g.uy * ext;
  const x2 = g.b.x + g.ux * ext;
  const y2 = g.b.y + g.uy * ext;
  // Offset the wall body outward so the inner face sits on the room line.
  const ox = -g.nx * ext;
  const oy = -g.ny * ext;

  return (
    <g onPointerDown={onSelect} className="cursor-pointer">
      {/* 48px-wide invisible hit target — gloves, dust, one hand */}
      <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} stroke="transparent" strokeWidth={48} />

      <motion.line
        x1={x1 + ox}
        y1={y1 + oy}
        x2={x2 + ox}
        y2={y2 + oy}
        strokeWidth={WALL_THICKNESS + (selected || escalated ? 6 : 0)}
        initial={false}
        animate={{ stroke: escalated ? RED : selected ? BLUE : "#111" }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: "none" }}
      />
      {escalated && (
        <line
          x1={x1 + ox}
          y1={y1 + oy}
          x2={x2 + ox}
          y2={y2 + oy}
          stroke="url(#hatch-red)"
          strokeWidth={WALL_THICKNESS + 2}
          pointerEvents="none"
        />
      )}

      {wall.openings?.map((o, i) => (
        <OpeningShape key={i} wall={wall} opening={o} />
      ))}

      {selected && !escalated && (
        <>
          <circle cx={g.a.x} cy={g.a.y} r={11} fill="#fff" stroke="#111" strokeWidth={2} pointerEvents="none" />
          <circle cx={g.b.x} cy={g.b.y} r={11} fill="#fff" stroke="#111" strokeWidth={2} pointerEvents="none" />
        </>
      )}
    </g>
  );
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
