import type { Escalation, EscalationStatus } from "./types";

/**
 * Lifecycle of a single deviation, seen from the contractor's iPad.
 *
 *            submit                 Munich opens            Munich updates CAD
 *   idle ───────────▶ sending ──▶ delivered ───────────▶ in_review ───────────▶ resolved
 *    ▲     (locked)      │  (sync)     │                       ✕
 *    │                   │             │                 revoke rejected
 *    └──── revoke ───────┴─────────────┘                 (Munich got there first)
 *     (optimistic, confirmed by server after network latency)
 *
 * "idle" is not stored: a wall with no escalation (or a revoked one) is idle.
 *
 * Race condition: revoking is optimistic: the wall goes back to idle instantly.
 * But the revoke has to reach Munich. If the expert opens the ticket while the
 * revoke is still in flight, the server wins: the revoke is rejected and the
 * escalation is restored in "in_review". Once in review, the Revoke button is
 * disabled outright, so the contractor and the expert never edit the same issue.
 */

/** Forward-only transitions the "server" (Munich) may make. */
export const TRANSITIONS: Record<EscalationStatus, EscalationStatus[]> = {
  sending: ["delivered"],
  delivered: ["in_review"],
  in_review: ["resolved"],
  resolved: [],
};

export const canTransition = (from: EscalationStatus, to: EscalationStatus) =>
  TRANSITIONS[from].includes(to);

/** The contractor may only pull back a report Munich hasn't started on. */
export const canRevoke = (s: EscalationStatus) => s === "sending" || s === "delivered";

/** Active = the wall is still locked/blocked on site. */
export const isActive = (e: Escalation | undefined) => !!e && e.status !== "resolved";

export const REVOKE_DISABLED_MESSAGE = "Munich is actively reviewing. Revocation disabled.";

export const STATUS_META: Record<
  EscalationStatus,
  { label: string; badge: string; tone: "red" | "amber" | "green" }
> = {
  sending: { label: "Sending", badge: "Escalated to Munich", tone: "red" },
  delivered: { label: "Delivered", badge: "Escalated to Munich", tone: "red" },
  in_review: { label: "In Review", badge: "Munich is reviewing", tone: "amber" },
  resolved: { label: "Resolved", badge: "Resolved · plan updated", tone: "green" },
};
