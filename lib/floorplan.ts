import type { Corner, IssueType, Point, Wall } from "./types";

/**
 * One room, captured in metres. Mirrors the 4.55 × 3.33 m room from the
 * magicplan reference screens (door on the west, door + window on the east).
 */
export const PROJECT = {
  name: "Kitchen Renovation",
  address: "Lindenstraße 14, Augsburg",
  floor: "Ground Floor",
  room: "Kitchen",
  budgetEur: 40000,
  permit: "Approved last Tuesday",
  previousVisit: "2 years ago (different floor plan)",
  expert: { name: "Remote Expert", city: "Munich", cutoffHourCET: 15 },
};

export const CORNERS: Corner[] = [
  { id: "c-nw", label: "NW corner", p: { x: 0, y: 0 } },
  { id: "c-ne", label: "NE corner", p: { x: 4.55, y: 0 } },
  { id: "c-se", label: "SE corner", p: { x: 4.55, y: 3.33 } },
  { id: "c-sw", label: "SW corner", p: { x: 0, y: 3.33 } },
];

export const WALLS: Wall[] = [
  { id: "w-north", label: "North wall", from: "c-nw", to: "c-ne", lengthM: 4.55 },
  {
    id: "w-east",
    label: "East wall",
    from: "c-ne",
    to: "c-se",
    lengthM: 3.33,
    openings: [
      { kind: "window", offsetM: 0.9, widthM: 0.45 },
      { kind: "door", offsetM: 1.35, widthM: 0.63, swing: 1 },
      { kind: "window", offsetM: 1.98, widthM: 0.45 },
    ],
  },
  { id: "w-south", label: "South wall", from: "c-se", to: "c-sw", lengthM: 4.55 },
  {
    id: "w-west",
    label: "West wall",
    from: "c-sw",
    to: "c-nw",
    lengthM: 3.33,
    openings: [{ kind: "door", offsetM: 1.78, widthM: 0.78, swing: 1 }],
  },
];

export const ISSUE_TYPES: { id: IssueType; label: string; hint: string }[] = [
  { id: "wall-missing", label: "Wall Missing", hint: "Wall on plan doesn't exist on site" },
  { id: "dimension-mismatch", label: "Dimension Mismatch", hint: "Measured length differs" },
  { id: "obstacle", label: "Obstacle", hint: "Pipe, column, duct in the way" },
  { id: "wrong-position", label: "Wrong Position", hint: "Wall is shifted or angled" },
  { id: "opening-missing", label: "Door / Window", hint: "Opening missing or moved" },
  { id: "other", label: "Other", hint: "Explain in voice memo" },
];

export const issueLabel = (id: IssueType) =>
  ISSUE_TYPES.find((t) => t.id === id)?.label ?? id;

export const cornerById = (id: string) => CORNERS.find((c) => c.id === id)!;
export const wallById = (id: string) => WALLS.find((w) => w.id === id)!;

/** Canvas transform: metres → px inside the canvas SVG. */
export const PX_PER_M = 110;
export const ORIGIN: Point = { x: 220, y: 175 };
export const WALL_THICKNESS = 14;

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
