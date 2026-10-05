export type Point = { x: number; y: number };

/**
 * The plan element a deviation is anchored to: what the contractor tapped.
 * "ghost" is the proposed wall that isn't on the locked plan (placed with
 * Insert): it has no plan geometry, only its ghost position.
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
 * The two hardcoded "Intercept and Propose" paths (Wizard of Oz prototype):
 *   wall-length  → tap the North wall's 4.55 dimension → Propose Correction
 *                  → Dimension Mismatch
 *   missing-wall → Insert → tap the plan → red dashed ghost wall
 *                  → Undocumented Element → Wall
 */
export type DraftIntent = "wall-length" | "missing-wall";

export type Escalation = {
  id: string;
  target: SelectedElement;
  targetLabel: string;
  issueType: IssueType;
  /**
   * What the contractor measured on site: the wall length (dimension-mismatch)
   * or the length of the physical wall that isn't on the plan (undocumented).
   */
  measuredM?: number;
  /** Only for undocumented-element: where the ghost wall is, in plan metres. */
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
