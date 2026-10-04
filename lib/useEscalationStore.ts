"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Escalation, Target } from "./types";

/**
 * Single source of truth for the "Report Deviation" flow.
 *
 *   idle ──tap wall──▶ selected ──"Report Deviation"──▶ capturing (right panel form)
 *     ▲                   │                                │
 *     └──tap empty canvas─┘            submit (fire & forget)
 *                                                          ▼
 *                         locked wall + "Escalated to Munich" badge
 *                         status: queued ──(sync)──▶ delivered
 *
 * The contractor is never blocked: submitting closes the form immediately,
 * and delivery happens in the background.
 *
 * The plan itself is locked (permit approved), so drafting tools only ever
 * produce a "locked" toast that points back to Report Deviation.
 */

export type ToastTone = "success" | "locked" | "hint";

type State = {
  selected: Target | null;
  capturing: boolean;
  escalations: Escalation[];
  toast: { id: number; text: string; tone: ToastTone } | null;
};

type Action =
  | { type: "select"; target: Target | null }
  | { type: "openCapture" }
  | { type: "closeCapture" }
  | { type: "submit"; escalation: Escalation }
  | { type: "delivered"; id: string }
  | { type: "notify"; text: string; tone: ToastTone }
  | { type: "dismissToast" };

const initial: State = { selected: null, capturing: false, escalations: [], toast: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      if (state.capturing) return state;
      return { ...state, selected: action.target };
    case "openCapture":
      return state.selected ? { ...state, capturing: true } : state;
    case "closeCapture":
      return { ...state, capturing: false };
    case "submit":
      return {
        ...state,
        capturing: false,
        selected: null,
        escalations: [action.escalation, ...state.escalations],
        toast: {
          id: Date.now(),
          text: `${action.escalation.targetLabel} sent to Munich. You can move on.`,
          tone: "success",
        },
      };
    case "delivered":
      return {
        ...state,
        escalations: state.escalations.map((e) =>
          e.id === action.id ? { ...e, status: "delivered" } : e,
        ),
      };
    case "notify":
      return { ...state, toast: { id: Date.now(), text: action.text, tone: action.tone } };
    case "dismissToast":
      return { ...state, toast: null };
  }
}

export const sameTarget = (a: Target | null, b: Target | null) =>
  !!a && !!b && a.kind === b.kind && a.id === b.id;

export function useEscalationStore() {
  const [state, dispatch] = useReducer(reducer, initial);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const select = useCallback((target: Target | null) => dispatch({ type: "select", target }), []);
  const openCapture = useCallback(() => dispatch({ type: "openCapture" }), []);
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
    const t = window.setTimeout(() => dispatch({ type: "dismissToast" }), 3800);
    return () => clearTimeout(t);
  }, [toastId]);

  const submit = useCallback((escalation: Escalation) => {
    dispatch({ type: "submit", escalation });
    // Simulated background upload (works offline-first: queued → delivered).
    timers.current.push(
      window.setTimeout(() => dispatch({ type: "delivered", id: escalation.id }), 2200),
    );
  }, []);

  const escalationFor = useCallback(
    (target: Target) => state.escalations.find((e) => sameTarget(e.target, target)),
    [state.escalations],
  );

  return {
    state,
    select,
    openCapture,
    closeCapture,
    submit,
    notify,
    dismissToast,
    escalationFor,
  };
}

export type EscalationStore = ReturnType<typeof useEscalationStore>;
