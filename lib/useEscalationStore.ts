"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Escalation, EscalationStatus, Target } from "./types";
import { REVOKE_DISABLED_MESSAGE, canRevoke, canTransition, isActive } from "./deviationMachine";

/**
 * Single source of truth for the "Report Deviation" flow.
 *
 *   idle ──tap wall──▶ selected ──"Report Deviation"──▶ capturing (right panel form)
 *     ▲                   │                                │
 *     └──tap empty canvas─┘            submit (fire & forget)
 *                                                          ▼
 *                    sending ─▶ delivered ─▶ in_review ─▶ resolved
 *                    (see lib/deviationMachine.ts for the lifecycle + revoke race)
 *
 * The contractor is never blocked: submitting closes the form immediately,
 * and delivery happens in the background.
 *
 * The plan itself is locked (permit approved), so drafting tools only ever
 * produce a "locked" toast that points back to Report Deviation.
 */

export type ToastTone = "success" | "locked" | "hint" | "warning";

/** A revoke the iPad has applied optimistically but the server hasn't confirmed. */
type PendingRevoke = { escalation: Escalation; settlesAt: number };

export type DemoSettings = {
  /** Munich opens the ticket after ~6s, resolves after ~12s. */
  autoAdvance: boolean;
  /** Revoke takes 3s to reach Munich, which leaves time to demo the race. */
  slowNetwork: boolean;
};

type State = {
  selected: Target | null;
  /** The element the open DeviationForm is anchored to (null = form closed). */
  captureAnchor: Target | null;
  escalations: Escalation[];
  pendingRevokes: Record<string, PendingRevoke>;
  demo: DemoSettings;
  toast: { id: number; text: string; tone: ToastTone } | null;
};

type Action =
  | { type: "select"; target: Target | null }
  | { type: "openCapture"; anchor: Target }
  | { type: "closeCapture" }
  | { type: "submit"; escalation: Escalation }
  /** Munich / server side. `force` = dev-tools override that ignores the transition table. */
  | { type: "serverStatus"; id: string; status: EscalationStatus; force?: boolean }
  | { type: "revokeRequested"; id: string; settlesAt: number }
  | { type: "revokeSettled"; id: string }
  | { type: "setDemo"; patch: Partial<DemoSettings> }
  | { type: "reset" }
  | { type: "notify"; text: string; tone: ToastTone }
  | { type: "dismissToast" };

const initial: State = {
  selected: null,
  captureAnchor: null,
  escalations: [],
  pendingRevokes: {},
  demo: { autoAdvance: false, slowNetwork: true },
  toast: null,
};

const toast = (text: string, tone: ToastTone) => ({ id: Date.now() + Math.random(), text, tone });

const SERVER_TOASTS: Partial<Record<EscalationStatus, (label: string) => [string, ToastTone]>> = {
  in_review: (l) => [`Munich opened your ${l} report.`, "hint"],
  resolved: (l) => [`Munich updated the plan. ${l} resolved. You're unblocked.`, "success"],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      // Selection is frozen while a report is being written for an element.
      if (state.captureAnchor) return state;
      return { ...state, selected: action.target };

    case "openCapture":
      // Keep selection in sync with the anchor so the canvas highlights it.
      return { ...state, captureAnchor: action.anchor, selected: action.anchor };

    case "closeCapture":
      return { ...state, captureAnchor: null };

    case "submit": {
      const e = action.escalation;
      return {
        ...state,
        captureAnchor: null,
        selected: null,
        // A resolved wall can be reported again; the new report replaces the old one.
        escalations: [
          e,
          ...state.escalations.filter(
            (x) => !(x.target.type === e.target.type && x.target.id === e.target.id),
          ),
        ],
        toast: toast(`${e.targetLabel} sent to Munich. You can move on.`, "success"),
      };
    }

    case "serverStatus": {
      const { id, status, force } = action;

      // The server doesn't know about the optimistic revoke yet: it updates its
      // copy of the escalation, and the revoke is decided when it settles.
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
      // Guard: the button is disabled in review, but a stale tap or a
      // double-tap can still get here, so the reducer enforces the rule too.
      if (!canRevoke(current.status)) {
        return { ...state, toast: toast(REVOKE_DISABLED_MESSAGE, "warning") };
      }
      // Optimistic: wall goes back to idle immediately.
      return {
        ...state,
        escalations: state.escalations.filter((e) => e.id !== action.id),
        pendingRevokes: {
          ...state.pendingRevokes,
          [action.id]: { escalation: current, settlesAt: action.settlesAt },
        },
        selected: current.target,
        toast: toast(`Revoking ${current.targetLabel} report…`, "hint"),
      };
    }

    case "revokeSettled": {
      const pending = state.pendingRevokes[action.id];
      if (!pending) return state;
      const { [action.id]: _, ...rest } = state.pendingRevokes;
      const e = pending.escalation;

      if (canRevoke(e.status)) {
        // Server confirms: Munich never saw it. Nothing else to do.
        return { ...state, pendingRevokes: rest, toast: toast(`${e.targetLabel} report revoked.`, "success") };
      }
      // Server rejects: Munich opened it while the revoke was in flight.
      // Roll back the optimistic update with the server's state.
      return {
        ...state,
        pendingRevokes: rest,
        escalations: [e, ...state.escalations],
        toast: toast(
          `Revoke rejected. Munich opened the ${e.targetLabel} report first. It stays escalated.`,
          "warning",
        ),
      };
    }

    case "setDemo":
      return { ...state, demo: { ...state.demo, ...action.patch } };

    case "reset":
      return { ...initial, demo: state.demo, toast: toast("Demo reset.", "hint") };

    case "notify":
      return { ...state, toast: toast(action.text, action.tone) };

    case "dismissToast":
      return { ...state, toast: null };
  }
}

export const sameTarget = (a: Target | null, b: Target | null) =>
  !!a && !!b && a.type === b.type && a.id === b.id;

export function useEscalationStore() {
  const [state, dispatch] = useReducer(reducer, initial);
  const timers = useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const select = useCallback((target: Target | null) => dispatch({ type: "select", target }), []);
  const openCapture = useCallback(
    (anchor: Target) => dispatch({ type: "openCapture", anchor }),
    [],
  );
  const closeCapture = useCallback(() => dispatch({ type: "closeCapture" }), []);
  const dismissToast = useCallback(() => dispatch({ type: "dismissToast" }), []);
  const notify = useCallback(
    (text: string, tone: ToastTone = "hint") => dispatch({ type: "notify", text, tone }),
    [],
  );

  // Every toast auto-dismisses; a new toast restarts the timer.
  const toastId = state.toast?.id;
  useEffect(() => {
    if (!toastId) return;
    const t = window.setTimeout(() => dispatch({ type: "dismissToast" }), 4200);
    return () => clearTimeout(t);
  }, [toastId]);

  // Read demo settings at call time (timers outlive renders).
  const demoRef = useRef(state.demo);
  demoRef.current = state.demo;

  const submit = useCallback((escalation: Escalation) => {
    dispatch({ type: "submit", escalation });
    const id = escalation.id;
    // Simulated background upload (offline-first: sending → delivered).
    later(1800, () => dispatch({ type: "serverStatus", id, status: "delivered" }));
    if (demoRef.current.autoAdvance) {
      // The transition table rejects these if a revoke landed first.
      later(7000, () => dispatch({ type: "serverStatus", id, status: "in_review" }));
      later(14000, () => dispatch({ type: "serverStatus", id, status: "resolved" }));
    }
  }, []);

  const revoke = useCallback((id: string) => {
    const latency = demoRef.current.slowNetwork ? 3000 : 600;
    dispatch({ type: "revokeRequested", id, settlesAt: Date.now() + latency });
    later(latency, () => dispatch({ type: "revokeSettled", id }));
  }, []);

  /** Dev tools: Munich-side override, may move backwards for the demo. */
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

  const escalationFor = useCallback(
    (target: Target) => state.escalations.find((e) => sameTarget(e.target, target)),
    [state.escalations],
  );
  /** The escalation that currently locks this target (resolved ones don't). */
  const activeEscalationFor = useCallback(
    (target: Target) => {
      const e = escalationFor(target);
      return isActive(e) ? e : undefined;
    },
    [escalationFor],
  );

  return {
    state,
    select,
    openCapture,
    closeCapture,
    submit,
    revoke,
    devSetStatus,
    setDemo,
    reset,
    notify,
    dismissToast,
    escalationFor,
    activeEscalationFor,
  };
}

export type EscalationStore = ReturnType<typeof useEscalationStore>;
