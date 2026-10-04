export type Point = { x: number; y: number };

/** A plan element the contractor can select and escalate. */
export type Target =
  | { kind: "wall"; id: string }
  | { kind: "corner"; id: string };

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
  target: Target;
  targetLabel: string;
  issueType: IssueType;
  /** Only for dimension-mismatch: what the contractor measured on site. */
  measuredM?: number;
  plannedM?: number;
  photoUrl: string; // object URL / data URL
  voiceMemo?: { url: string; durationS: number };
  blocking: boolean; // "work is stopped until resolved"
  createdAt: number;
  status: EscalationStatus;
  statusChangedAt: number;
};

/** See lib/deviationMachine.ts for the full lifecycle. */
export type EscalationStatus = "sending" | "delivered" | "in_review" | "resolved";
