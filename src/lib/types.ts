export type Point = { x: number; y: number };

/** The plan element a deviation is anchored to: what the contractor tapped. */
export type ElementType = "wall" | "corner" | "room";
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
  | "wall-missing"
  | "dimension-mismatch"
  | "obstacle"
  | "wrong-position"
  | "opening-missing"
  | "other";

export type Escalation = {
  id: string;
  target: SelectedElement;
  targetLabel: string;
  issueType: IssueType;
  /** Only for dimension-mismatch: what the contractor measured on site. */
  measuredM?: number;
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
 * What the DeviationForm submits. The store adds the anchor, id, timestamps
 * and lifecycle status, so the form can't get those wrong.
 */
export type EscalationDraft = Omit<
  Escalation,
  "id" | "target" | "targetLabel" | "createdAt" | "status" | "statusChangedAt"
>;

/** See store/deviationMachine.ts for the full lifecycle. */
export type EscalationStatus = "sending" | "delivered" | "in_review" | "resolved";
