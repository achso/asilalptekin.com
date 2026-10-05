export type Point = { x: number; y: number };

/**
 * The plan element a deviation is anchored to: what the contractor tapped.
 * "ghost" is the proposed element that isn't on the locked plan (placed with
 * Insert): it has no plan geometry, only its ghost position.
 */
export type ElementType = "wall" | "corner" | "room" | "ghost" | "object";

/** Size and orientation of a plan object (metres, degrees clockwise). */
export type ObjectDims = { widthM: number; depthM: number; heightM: number; rotation: number };

/** Dims + where it stands (centre, plan metres): what an object proposal holds. */
export type ObjectState = ObjectDims & { center: Point };

/** A piece of furniture / fixture drawn on the plan (selectable, never editable). */
export type PlanObject = ObjectDims & {
  id: string;
  label: string;
  kind: "counter" | "table" | "chair";
  /** Centre, in plan metres. */
  center: Point;
};
export type SelectedElement = { type: ElementType; id: string };


export type Wall = {
  id: string;
  label: string; // human-readable, e.g. "North wall"
  from: string; // corner id
  to: string; // corner id
  lengthM: number; // length as captured in the plan
  openings?: Opening[];
};

export type Opening = {
  kind: "door" | "window";
  /** distance from the wall's `from` corner, metres */
  offsetM: number;
  widthM: number;
  /** door swing side: 1 = into the room (positive normal), -1 = outward */
  swing?: 1 | -1;
};

export type Corner = { id: string; label: string; p: Point };

export type IssueType =
  | "dimension-mismatch"
  | "undocumented-element"
  | "element-not-on-site"
  | "site-condition-hazard";

/**
 * The two hardcoded "Intercept and Propose" paths (Wizard of Oz prototype):
 *   wall-length  → tap the North wall's 4.55 dimension → Propose Correction
 *                  → Dimension Mismatch
 *   missing-element → Insert → Object → any category → tap the plan → red
 *                     dashed ghost → Undocumented Element → <category>
 *                     (every category is the same trapdoor; only its name travels)
 *   remove          → select a wall / corner / object → Delete… → Element Not on
 *                     Site (nothing is deleted; the expert reviews it)
 *   object-change   → select an object → change a value (popover) or rotate it
 *                     → its proposed size / rotation, drawn as a red dashed ghost
 */
export type DraftIntent = "wall-length" | "missing-element" | "object-change" | "remove";

export type Escalation = {
  id: string;
  target: SelectedElement;
  targetLabel: string;
  issueType: IssueType;
  /**
   * What the contractor measured on site: the wall length (dimension-mismatch)
   * or the length of the physical element that isn't on the plan (undocumented).
   */
  measuredM?: number;
  /** Object change: the plan's values and the proposed ones. */
  objectChange?: { from: ObjectState; to: ObjectState };
  /** Only for undocumented-element: the category picked in Insert → Object ("Plumbing"). */
  category?: string;
  /** Only for undocumented-element: where the ghost is, in plan metres. */
  marker?: Point;
  /** The ghost was inserted at a tapped point on a wall (the native blue triangle). */
  markerSpot?: WallSpot;
  /** Inserted objects (squares), one per copy. */
  items?: GhostItem[];
  /** Missing wall: drawn with two taps (start → end), at true length, in plan metres. */
  line?: WallLine;
  plannedM?: number;
  /** Evidence photos (object / data URLs). At least one is required to submit. */
  photoUrls: string[];
  /** Optional free-text note from the evidence step. */
  note?: string;
  voiceMemo?: { url: string; durationS: number };
  blocking: boolean; // "work is stopped until resolved"
  createdAt: number;
  status: EscalationStatus;
  statusChangedAt: number;
};

/**
 * What the EscalationDraftPane submits. The store adds the anchor, id, timestamps
 * and lifecycle status, so the form can't get those wrong.
 */
export type EscalationDraft = Omit<
  Escalation,
  "id" | "target" | "targetLabel" | "createdAt" | "status" | "statusChangedAt"
>;

/** See store/deviationMachine.ts for the full lifecycle. */
export type EscalationStatus = "queued" | "sending" | "delivered" | "in_review" | "resolved";

/** Photos & Notes attached to a plan element (the native tab's content). */
export type ElementMedia = { photos: string[]; note: string };

/**
 * A point on a wall, as magicplan's blue tap triangle marks it: the wall and
 * the distance along it from its start corner, in metres. Insert ties the new
 * element to this spot.
 */
export type WallSpot = { wallId: string; offsetM: number };

/** One inserted (proposed) object on the plan: where it is and how it's turned. */
export type GhostItem = { id: string; center: Point; rotation: number };

/** A drawn wall: start and end in plan metres (gives direction and true length). */
export type WallLine = { a: Point; b: Point };
