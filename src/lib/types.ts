export type Point = { x: number; y: number };

/**
 * The plan element a deviation is anchored to: what the contractor tapped.
 * "ghost" is a proposed element that isn't on the locked plan (placed with
 * Add Wall / Insert): it has no geometry, only its Ghost Marker position.
 */
export type ElementType = "wall" | "corner" | "room" | "ghost";
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
 * What kind of thing an "Undocumented Element" is. Mirrors the top-level
 * categories of magicplan's own "All Objects" insert menu, so the expert gets
 * structured data ("undocumented Plumbing here") instead of free text.
 * Deliberately shallow: one level only; the photo carries the specifics.
 */
export type ElementCategory =
  | "annotations"
  | "doors"
  | "windows"
  | "structural"
  | "plumbing"
  | "appliances"
  | "cabinets"
  | "furniture"
  | "electrical"
  | "outdoors"
  | "hvac";

/** Locked CAD tools that open an escalation draft instead of editing. */
export type InterceptTool = "insert" | "add-wall" | "set-size" | "delete" | "sidebar";

/** Dimensions the contractor can propose a change to. */
export type DimensionField = "wall-length" | "ceiling-height" | "room-size";

/**
 * What the contractor tried to do on the locked plan, captured as the
 * proposal's intent ("Intercept and Propose").
 *   insert    → Undocumented Element (Add Wall presets Structural)
 *   delete    → Element Not on Site
 *   dimension → Dimension Mismatch on that field
 */
export type DraftIntent =
  | { kind: "insert"; category: ElementCategory | null; via: "insert" | "add-wall" }
  | { kind: "delete"; via: "delete" }
  | { kind: "dimension"; field: DimensionField; via: "set-size" | "sidebar" };

export type Escalation = {
  id: string;
  target: SelectedElement;
  targetLabel: string;
  issueType: IssueType;
  /** Only for undocumented-element: which object category was found. */
  category?: ElementCategory;
  /**
   * What the contractor measured on site: the wall length for
   * dimension-mismatch, the physical element's length for undocumented-element.
   */
  measuredM?: number;
  /** Rooms only (dimension-mismatch on the floor): the second axis, north–south. */
  plannedWidthM?: number;
  measuredWidthM?: number;
  /** Only for undocumented-element, if its category has a height (see CATEGORY_MEASURES). */
  heightM?: number;
  /** Dimension Mismatch: which dimension was challenged. */
  dimensionField?: DimensionField;
  /** Only for undocumented-element: where it is, in plan metres (Ghost Marker). */
  marker?: Point;
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
export type EscalationStatus = "sending" | "delivered" | "in_review" | "resolved";

/** Photos & Notes attached to a plan element (the native tab's content). */
export type ElementMedia = { photos: string[]; note: string };
