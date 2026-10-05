import type { Corner, IssueType, ObjectState, PlanObject, Point, SelectedElement, Wall } from "./types";

/**
 * One room, captured in metres. Mirrors the 4.55 × 3.30 m "Music Room" from the
 * magicplan reference screens (door on the west; window, door, window on the east).
 */
export const PROJECT = {
  name: "Music Room Renovation",
  address: "Lindenstraße 14, Augsburg",
  floor: "5th Floor",
  room: "Music Room",
  budgetEur: 40000,
  permit: "Approved last Tuesday",
  previousVisit: "2 years ago (different floor plan)",
  expert: { name: "Remote Expert", city: "Munich", cutoffHourCET: 15 },
};

export const CORNERS: Corner[] = [
  { id: "c-nw", label: "NW corner", p: { x: 0, y: 0 } },
  { id: "c-ne", label: "NE corner", p: { x: 4.55, y: 0 } },
  { id: "c-se", label: "SE corner", p: { x: 4.55, y: 3.3 } },
  { id: "c-sw", label: "SW corner", p: { x: 0, y: 3.3 } },
];

export const WALLS: Wall[] = [
  { id: "w-north", label: "North wall", from: "c-nw", to: "c-ne", lengthM: 4.55 },
  {
    id: "w-east",
    label: "East wall",
    from: "c-ne",
    to: "c-se",
    lengthM: 3.3,
    openings: [
      // 0.88 · window 0.45 · door 0.63 · window 0.45 · 0.88 (from the NE corner)
      { kind: "window", offsetM: 0.88, widthM: 0.45 },
      { kind: "door", offsetM: 1.33, widthM: 0.63, swing: 1 },
      { kind: "window", offsetM: 1.96, widthM: 0.45 },
    ],
  },
  { id: "w-south", label: "South wall", from: "c-se", to: "c-sw", lengthM: 4.55 },
  {
    id: "w-west",
    label: "West wall",
    from: "c-sw",
    to: "c-nw",
    lengthM: 3.3,
    // Door 0.81 wide, 0.73 below the NW corner (offset measured from the SW corner)
    openings: [{ kind: "door", offsetM: 1.76, widthM: 0.81, swing: 1 }],
  },
];

/**
 * Issue types: each title is unambiguous on its own, and the description
 * removes the need for a tooltip.
 */
export const ISSUE_TYPES: { id: IssueType; label: string; description: string }[] = [
  {
    id: "dimension-mismatch",
    label: "Dimension Mismatch",
    description: "Physical length differs from the locked plan.",
  },
  {
    id: "undocumented-element",
    label: "Undocumented Element",
    description: "Found a physical wall or object not shown on the plan.",
  },
  {
    id: "element-not-on-site",
    label: "Element Not on Site",
    description: "An item drawn on the plan is physically missing.",
  },
  {
    // Non-geometric on purpose: physical things (columns, pipes, walls) are
    // Undocumented Element + a category, so the two never overlap.
    id: "site-condition-hazard",
    label: "Site Condition Hazard",
    description: "Unsafe environment, water damage, or incorrect materials.",
  },
];

export const issueLabel = (id: IssueType) =>
  ISSUE_TYPES.find((t) => t.id === id)?.label ?? id;

/**
 * Furniture and fixtures on the plan: selectable (inspector, rotate handle),
 * but locked like the rest of the plan; changes become proposals.
 */
export const PLAN_OBJECTS: PlanObject[] = [
  {
    id: "o-counter",
    label: "Kitchen Counter",
    kind: "counter",
    center: { x: 0.9, y: 0.38 },
    widthM: 1.6,
    depthM: 0.6,
    heightM: 0.9,
    rotation: 0,
  },
  {
    id: "o-table",
    label: "Small table (rectangular)",
    kind: "table",
    center: { x: 3.075, y: 1.7 },
    widthM: 0.95,
    depthM: 1.2,
    heightM: 0.82,
    rotation: 0,
  },
  {
    id: "o-chair",
    label: "Dining chair",
    kind: "chair",
    center: { x: 2.3, y: 1.7 },
    widthM: 0.52,
    depthM: 0.6,
    heightM: 0.83,
    // back to the west, facing the table
    rotation: 270,
  },
];

export const objectById = (id: string) => PLAN_OBJECTS.find((o) => o.id === id)!;
export const objectDims = ({ widthM, depthM, heightM, rotation, center }: ObjectState): ObjectState => ({
  center,
  widthM,
  depthM,
  heightM,
  rotation,
});

export const cornerById = (id: string) => CORNERS.find((c) => c.id === id)!;
export const wallById = (id: string) => WALLS.find((w) => w.id === id)!;

/** Canvas transform: metres → px inside the canvas SVG. */
export const PX_PER_M = 110;
export const ORIGIN: Point = { x: 245, y: 175 };
export const WALL_THICKNESS = 14;

/** Inverse of toPx: canvas px → plan metres. */
export const toMetres = (p: Point): Point => ({
  x: (p.x - ORIGIN.x) / PX_PER_M,
  y: (p.y - ORIGIN.y) / PX_PER_M,
});

export const toPx = (p: Point): Point => ({
  x: ORIGIN.x + p.x * PX_PER_M,
  y: ORIGIN.y + p.y * PX_PER_M,
});

export function wallGeometry(wall: Wall) {
  const a = toPx(cornerById(wall.from).p);
  const b = toPx(cornerById(wall.to).p);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // inward normal for a clockwise room
  const nx = -uy;
  const ny = ux;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return { a, b, ux, uy, nx, ny, len, mid };
}

// ── Selectable elements ─────────────────────────────────────────────────────

export const ROOM = {
  id: "r-music-room",
  label: "Music Room floor",
  widthM: 4.55,
  depthM: 3.3,
  /** Ceiling height in metres: the upper bound for any element's height. */
  ceilingM: 3.12,
  /**
   * Captured statistics as magicplan reports them (perimeter and wall area are
   * net of openings, so they aren't simply derived from width × depth).
   * Single source for the room panel and the floor inspector.
   */
  stats: {
    floorArea: "15.00 m²",
    wallArea: "43.81 m²",
    perimeter: "14.24 m",
    volume: "46.78 m³",
    ceilingHeight: "3.12 m",
  },
};

export type ElementInfo = {
  label: string;
  /** One-line geometry summary for headers ("Length 4.55 m"). */
  summary: string;
  /** Planned length, if the element has one (enables the dimension stepper). */
  plannedM?: number;
  /** Rooms only: planned width (north–south); the room is checked on both axes. */
  plannedWidthM?: number;
};

/** Everything the UI needs to describe a selected element, whatever its type. */
export function elementInfo(el: SelectedElement): ElementInfo {
  switch (el.type) {
    case "wall": {
      const w = wallById(el.id);
      return {
        label: w.label,
        summary: `Length ${w.lengthM.toFixed(2)} m · ${w.openings?.length ?? 0} openings`,
        plannedM: w.lengthM,
      };
    }
    case "corner":
      return { label: cornerById(el.id).label, summary: "Corner · 90°" };
    case "ghost":
      return { label: PROJECT.room, summary: "Proposed element (not on the plan)" };
    case "object": {
      const o = objectById(el.id);
      return { label: o.label, summary: `${o.widthM.toFixed(2)} × ${o.depthM.toFixed(2)} m` };
    }
    case "room": {
      return {
        label: ROOM.label,
        summary: `${ROOM.stats.floorArea} · perimeter ${ROOM.stats.perimeter}`,
        // Length runs east–west, width north–south (4.55 × 3.30 m).
        plannedM: ROOM.widthM,
        plannedWidthM: ROOM.depthM,
      };
    }
  }
}

/**
 * Where floating UI attaches to an element, in canvas px. `inward` is the
 * direction into the room (positive offsets land inside, negative outside).
 */
/** Where a wall's dimension label sits (44 px outside the wall), in canvas px. */
export function dimensionLabelAt(wall: Wall): Point {
  const g = wallGeometry(wall);
  return { x: (g.a.x + g.b.x) / 2 - g.nx * 44, y: (g.a.y + g.b.y) / 2 - g.ny * 44 };
}

export function elementAnchor(el: SelectedElement): { p: Point; inward: Point } {
  const centre = toPx({ x: ROOM.widthM / 2, y: ROOM.depthM / 2 });
  switch (el.type) {
    case "wall": {
      const g = wallGeometry(wallById(el.id));
      return { p: g.mid, inward: { x: g.nx, y: g.ny } };
    }
    case "corner": {
      const p = toPx(cornerById(el.id).p);
      const d = Math.hypot(centre.x - p.x, centre.y - p.y);
      return { p, inward: { x: (centre.x - p.x) / d, y: (centre.y - p.y) / d } };
    }
    case "ghost":
      return { p: centre, inward: { x: 0, y: 1 } };
    case "object":
      return { p: toPx(objectById(el.id).center), inward: { x: 0, y: 1 } };
    case "room":
      // Anchor near the top of the floor so the badge/button sit on open floor.
      return { p: { x: centre.x, y: centre.y - 40 }, inward: { x: 0, y: 1 } };
  }
}

/** Resolve any selectable id (wall, corner or room) to a typed element. */
export function elementById(id: string): SelectedElement | null {
  if (WALLS.some((w) => w.id === id)) return { type: "wall", id };
  if (CORNERS.some((c) => c.id === id)) return { type: "corner", id };
  if (id === ROOM.id) return { type: "room", id };
  if (PLAN_OBJECTS.some((o) => o.id === id)) return { type: "object", id };
  return null;
}
