"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { elementById, elementInfo } from "@/lib/floorplan";
import type {
  Escalation,
  EscalationDraft,
  EscalationStatus,
  SelectedElement,
} from "@/lib/types";
import {
  type DeviationState,
  REVOKE_DISABLED_MESSAGE,
  canRevoke,
  canTransition,
  deviationStateOf,
  isActive,
} from "./deviationMachine";

/**
 * useDeviationState: the escalation workflow store.
 *
 * Public API (what the UI talks to):
 *
 *   selectedElement      null | { id, type }       what the contractor tapped
 *   escalationStatus     DeviationState            status for the selected element
 *   selectElement(id)    select a wall / corner / room by id
 *   clearSelection()
 *   startReport(anchor)  open the DeviationForm anchored to { id, type }
 *   cancelReport()       discard the form, keep the selection
 *   submitEscalation(d)  fire-and-forget: closes the form, uploads in background
 *   revokeEscalation()   optimistic; FAILS while in_review (race guard, see below)
 *   mockExpertReview()   Munich opens the selected (or newest) report → in_review
 *
 * Lifecycle and transition rules live in ./deviationMachine.ts. Each element
 * has its own report, so `escalations` is a list, and `escalationStatus` is
 * derived for whatever is selected.
 *
 * Race condition: revoking is optimistic (the element goes back to idle at
 * once) but has to reach Munich first. If the expert opens the report while the
 * revoke is in flight, the server wins: the revoke is rejected and the report
 * comes back "in_review". Once in review, revokeEscalation() refuses up front.
 * The rule is enforced here in the reducer, not only by disabling a button.
 */

export type ToastTone = "success" | "locked" | "hint" | "warning";

/** A revoke applied optimistically on the iPad but not yet confirmed by the server. */
type PendingRevoke = { escalation: Escalation; settlesAt: number };

export type DemoSettings = {
  /** Munich opens the report after ~7s and resolves it after ~14s. */
  autoAdvance: boolean;
  /** Revoke takes 3s to reach Munich, which leaves time to demo the race. */
  slowNetwork: boolean;
};

export type RevokeResult = { ok: true } | { ok: false; reason: string };

type State = {
  selectedElement: SelectedElement | null;
  /** Element the open DeviationForm is anchored to (null = form closed). */
  captureAnchor: SelectedElement | null;
  escalations: Escalation[];
  pendingRevokes: Record<string, PendingRevoke>;
  demo: DemoSettings;
  toast: { id: number; text: string; tone: ToastTone } | null;
};

type Action =
  | { type: "select"; element: SelectedElement | null }
  | { type: "startReport"; anchor: SelectedElement }
  | { type: "cancelReport" }
  | { type: "submit"; escalation: Escalation }
  /** Munich / server side. `force` = dev-tools override that ignores the transition table. */
  | { type: "serverStatus"; id: string; status: EscalationStatus; force?: boolean }
  | { type: "revokeRequested"; id: string; settlesAt: number }
  | { type: "revokeSettled"; id: string }
  | { type: "setDemo"; patch: Partial<DemoSettings> }
  | { type: "reset" }
  | { type: "notify"; text: string; tone: ToastTone }
  | { type: "dismissToast" };

const initialState: State = {
  selectedElement: null,
  captureAnchor: null,
  escalations: [],
  pendingRevokes: {},
  demo: { autoAdvance: false, slowNetwork: true },
  toast: null,
};

const toast = (text: string, tone: ToastTone) => ({ id: Date.now() + Math.random(), text, tone });

export const sameElement = (a: SelectedElement | null, b: SelectedElement | null) =>
  !!a && !!b && a.type === b.type && a.id === b.id;

const SERVER_TOASTS: Partial<Record<EscalationStatus, (label: string) => [string, ToastTone]>> = {
  in_review: (l) => [`The expert opened your ${l} report.`, "hint"],
  resolved: (l) => [`The expert updated the plan. ${l} resolved. You're unblocked.`, "success"],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      // Selection is frozen while a report is being written for an element.
      if (state.captureAnchor) return state;
      return { ...state, selectedElement: action.element };

    case "startReport":
      // Keep selection in sync with the anchor so the canvas highlights it.
      return { ...state, captureAnchor: action.anchor, selectedElement: action.anchor };

    case "cancelReport":
      return { ...state, captureAnchor: null };

    case "submit": {
      const e = action.escalation;
      return {
        ...state,
        captureAnchor: null,
        selectedElement: null,
        // A resolved element can be reported again; the new report replaces the old one.
        escalations: [e, ...state.escalations.filter((x) => !sameElement(x.target, e.target))],
        toast: toast(`${e.targetLabel} sent for review. You can move on.`, "success"),
      };
    }

    case "serverStatus": {
      const { id, status, force } = action;

      // The server doesn't know about the optimistic revoke yet: it updates
      // its copy, and the revoke is decided when it settles.
      const pending = state.pendingRevokes[id];
      if (pending) {
        if (!force && !canTransition(pending.escalation.status, status)) return state;
        return {
          ...state,
          pendingRevokes: {
            ...state.pendingRevokes,
            [id]: {
              ...pending,
              escalation: { ...pending.escalation, status, statusChangedAt: Date.now() },
            },
          },
        };
      }

      const current = state.escalations.find((e) => e.id === id);
      if (!current || current.status === status) return state;
      if (!force && !canTransition(current.status, status)) return state;

      const t = SERVER_TOASTS[status]?.(current.targetLabel);
      return {
        ...state,
        escalations: state.escalations.map((e) =>
          e.id === id ? { ...e, status, statusChangedAt: Date.now() } : e,
        ),
        toast: t ? toast(...t) : state.toast,
      };
    }

    case "revokeRequested": {
      const current = state.escalations.find((e) => e.id === action.id);
      if (!current) return state;
      // Guard: a stale tap or double-tap can still get here after the button
      // is disabled, so the reducer enforces the rule too.
      if (!canRevoke(current.status)) {
        return { ...state, toast: toast(REVOKE_DISABLED_MESSAGE, "warning") };
      }
      // Optimistic: element goes back to idle immediately.
      return {
        ...state,
        escalations: state.escalations.filter((e) => e.id !== action.id),
        pendingRevokes: {
          ...state.pendingRevokes,
          [action.id]: { escalation: current, settlesAt: action.settlesAt },
        },
        selectedElement: current.target,
        toast: toast(`Revoking ${current.targetLabel} report…`, "hint"),
      };
    }

    case "revokeSettled": {
      const pending = state.pendingRevokes[action.id];
      if (!pending) return state;
      const rest = { ...state.pendingRevokes };
      delete rest[action.id];
      const e = pending.escalation;

      if (canRevoke(e.status)) {
        // Server confirms: Munich never opened it.
        return {
          ...state,
          pendingRevokes: rest,
          toast: toast(`${e.targetLabel} report revoked.`, "success"),
        };
      }
      // Server rejects: Munich opened it while the revoke was in flight.
      // Roll back the optimistic update with the server's state.
      return {
        ...state,
        pendingRevokes: rest,
        escalations: [e, ...state.escalations],
        toast: toast(
          `Revoke rejected. The expert opened the ${e.targetLabel} report first. It stays escalated.`,
          "warning",
        ),
      };
    }

    case "setDemo":
      return { ...state, demo: { ...state.demo, ...action.patch } };

    case "reset":
      return { ...initialState, demo: state.demo, toast: toast("Demo reset.", "hint") };

    case "notify":
      return { ...state, toast: toast(action.text, action.tone) };

    case "dismissToast":
      return { ...state, toast: null };
  }
}

export function useDeviationState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Timers outlive renders: keep handles for cleanup and read fresh state via refs.
  const timers = useRef<number[]>([]);
  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Every toast auto-dismisses; a new toast restarts the timer.
  const toastId = state.toast?.id;
  useEffect(() => {
    if (!toastId) return;
    const t = window.setTimeout(() => dispatch({ type: "dismissToast" }), 4200);
    return () => clearTimeout(t);
  }, [toastId]);

  // ── Lookups ───────────────────────────────────────────────────────────────

  const escalationFor = useCallback(
    (el: SelectedElement) => state.escalations.find((e) => sameElement(e.target, el)),
    [state.escalations],
  );

  const pendingRevokeFor = useCallback(
    (el: SelectedElement) =>
      Object.values(state.pendingRevokes).find((p) => sameElement(p.escalation.target, el)),
    [state.pendingRevokes],
  );

  const selectedEscalation = state.selectedElement
    ? escalationFor(state.selectedElement)
    : undefined;
  const escalationStatus: DeviationState = deviationStateOf(selectedEscalation);

  /** The report an action without an explicit id refers to: the selection's, else the newest. */
  const focusedEscalationId = useCallback((): string | undefined => {
    const s = stateRef.current;
    if (s.selectedElement) {
      const sel = s.selectedElement;
      const own =
        s.escalations.find((e) => sameElement(e.target, sel)) ??
        Object.values(s.pendingRevokes).find((p) => sameElement(p.escalation.target, sel))
          ?.escalation;
      if (own) return own.id;
    }
    return [
      ...s.escalations,
      ...Object.values(s.pendingRevokes).map((p) => p.escalation),
    ].sort((a, b) => b.createdAt - a.createdAt)[0]?.id;
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const selectElement = useCallback((id: string) => {
    const element = elementById(id);
    if (element) dispatch({ type: "select", element });
  }, []);

  const clearSelection = useCallback(() => dispatch({ type: "select", element: null }), []);
  const startReport = useCallback(
    (anchor: SelectedElement) => dispatch({ type: "startReport", anchor }),
    [],
  );
  const cancelReport = useCallback(() => dispatch({ type: "cancelReport" }), []);

  const submitEscalation = useCallback(
    (draft: EscalationDraft) => {
      const anchor = stateRef.current.captureAnchor;
      if (!anchor) return;
      const now = Date.now();
      const escalation: Escalation = {
        ...draft,
        id: `esc-${now}`,
        target: anchor,
        targetLabel: elementInfo(anchor).label,
        createdAt: now,
        status: "sending",
        statusChangedAt: now,
      };
      dispatch({ type: "submit", escalation });

      // Simulated background upload (offline-first: sending → delivered).
      const id = escalation.id;
      later(1800, () => dispatch({ type: "serverStatus", id, status: "delivered" }));
      if (stateRef.current.demo.autoAdvance) {
        // The transition table rejects these if a revoke landed first.
        later(7000, () => dispatch({ type: "serverStatus", id, status: "in_review" }));
        later(14000, () => dispatch({ type: "serverStatus", id, status: "resolved" }));
      }
    },
    [later],
  );

  /**
   * Revoke the selected element's report (or a specific one by id).
   * Returns { ok: false } without changing anything if Munich is already
   * reviewing it; otherwise applies optimistically and lets the server settle.
   */
  const revokeEscalation = useCallback(
    (id?: string): RevokeResult => {
      const targetId = id ?? focusedEscalationId();
      const current = stateRef.current.escalations.find((e) => e.id === targetId);
      if (!targetId || !current) return { ok: false, reason: "Nothing to revoke." };
      if (!canRevoke(current.status)) {
        dispatch({ type: "notify", text: REVOKE_DISABLED_MESSAGE, tone: "warning" });
        return { ok: false, reason: REVOKE_DISABLED_MESSAGE };
      }
      const latency = stateRef.current.demo.slowNetwork ? 3000 : 600;
      dispatch({ type: "revokeRequested", id: targetId, settlesAt: Date.now() + latency });
      later(latency, () => dispatch({ type: "revokeSettled", id: targetId }));
      return { ok: true };
    },
    [focusedEscalationId, later],
  );

  /** Mock: the Munich expert opens the report (selected, else newest) → in_review. */
  const mockExpertReview = useCallback(
    (id?: string) => {
      const targetId = id ?? focusedEscalationId();
      if (targetId) dispatch({ type: "serverStatus", id: targetId, status: "in_review" });
    },
    [focusedEscalationId],
  );

  /** Dev tools: Munich-side override; may move backwards for the presentation. */
  const devSetStatus = useCallback(
    (id: string, status: EscalationStatus) =>
      dispatch({ type: "serverStatus", id, status, force: true }),
    [],
  );
  const setDemo = useCallback(
    (patch: Partial<DemoSettings>) => dispatch({ type: "setDemo", patch }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const notify = useCallback(
    (text: string, tone: ToastTone = "hint") => dispatch({ type: "notify", text, tone }),
    [],
  );
  const dismissToast = useCallback(() => dispatch({ type: "dismissToast" }), []);

  const activeCount = useMemo(() => state.escalations.filter(isActive).length, [state.escalations]);

  return {
    // state
    selectedElement: state.selectedElement,
    captureAnchor: state.captureAnchor,
    escalations: state.escalations,
    pendingRevokes: state.pendingRevokes,
    demo: state.demo,
    toast: state.toast,
    // derived
    escalationStatus,
    selectedEscalation,
    activeCount,
    escalationFor,
    pendingRevokeFor,
    // actions
    selectElement,
    clearSelection,
    startReport,
    cancelReport,
    submitEscalation,
    revokeEscalation,
    mockExpertReview,
    devSetStatus,
    setDemo,
    reset,
    notify,
    dismissToast,
  };
}

export type DeviationStore = ReturnType<typeof useDeviationState>;
