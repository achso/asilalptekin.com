"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { PROJECT, elementById, elementInfo, objectById, objectDims, wallSpotGhost } from "@/lib/floorplan";
import type {
  DraftIntent,
  ElementMedia,
  Escalation,
  EscalationDraft,
  EscalationStatus,
  ObjectState,
  Point,
  SelectedElement,
  WallSpot,
} from "@/lib/types";
import { isExpertOnline } from "@/lib/useMunichCutoff";
import {
  type DeviationState,
  nextStatus,
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
 *   selectElement(id)    select a wall / corner / room / object by id. While a
 *                        draft is open, nothing else can be selected: the draft
 *                        closes only via its ✕ (or Send), never by a stray tap
 *   clearSelection()
 *
 * Intercept and Propose (two hardcoded Wizard-of-Oz paths, see DraftIntent):
 *   draft                { anchor, intent, marker? } | null: the open EscalationDraftPane
 *   interactionMode      "select" | "ghost_draft" (canvas taps place / move the ghost wall)
 *   startDraft(a, i, m)  wall length popover → Propose Correction → open the pane
 *                        (m: the value typed in the popover, prefilled in the draft)
 *   proposeObjectChange(id, patch)
 *                        object popover / rotate handle / drag → open (or extend)
 *                        the object's draft with the proposed size / rotation / position
 *   updateDraft(patch)   the pane's inputs edit the same draft values
 *   startGhostDraft(c)   Insert → Object → category c → ghost_draft; the pane opens
 *                        on the first canvas tap ("Undocumented Element → c")
 *   placeGhost(p)        drop (first tap) or move the ghost at p (plan metres)
 *   cancelDraft()        discard the draft (and leave ghost_draft), keep the selection
 *   submitEscalation(d)  fire-and-forget: closes the pane, uploads in background
 *   revokeEscalation()   optimistic; FAILS while in_review (race guard, see below)
 *   mockExpertReview()   the expert opens the selected (or newest) report → in_review
 *   mediaFor(el) / setMediaFor(el, m) / standardPhotoCount(el)
 *                        standard "Photos & Notes" attachments per element, tracked
 *                        independently of escalations (drives the yellow paperclip)
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
  /** The open escalation draft (null = pane closed). */
  draft: Draft | null;
  /** ghost_draft: canvas taps place / move the ghost instead of selecting. */
  interactionMode: InteractionMode;
  /** Category picked in Insert → Object, waiting for the canvas tap. */
  ghostCategory: string | null;
  /** The tapped point on the selected wall (native blue triangle); Insert lands here. */
  wallSpot: WallSpot | null;
  escalations: Escalation[];
  /** Standard Photos & Notes per element ("wall:w-north" → media). Independent of escalations. */
  media: Record<string, ElementMedia>;
  pendingRevokes: Record<string, PendingRevoke>;
  demo: DemoSettings;
  toast: { id: number; text: string; tone: ToastTone } | null;
  /** Undo / redo for the open draft (moves, rotations, values, ghost placement). */
  history: History;
  /** "Discard this draft?" is showing; `next` is what the stray tap wanted to do. */
  discardPrompt: { next?: Action } | null;
};

/** Snapshots of the open draft. One drag / rotation gesture = one step. */
type History = { past: Draft[]; future: Draft[]; lastKey: string | null; lastAt: number };
const EMPTY_HISTORY: History = { past: [], future: [], lastKey: null, lastAt: 0 };

type Action =
  | { type: "select"; element: SelectedElement | null; spot?: WallSpot }
  | { type: "startDraft"; anchor: SelectedElement; intent: DraftIntent; measuredM?: number }
  | { type: "proposeObject"; id: string; patch: Partial<ObjectState> }
  | { type: "updateDraft"; patch: Partial<Pick<Draft, "measuredM" | "proposed">> }
  | { type: "startGhost"; category: string }
  | { type: "placeGhost"; point: Point }
  | { type: "cancelDraft" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "askDiscard" }
  | { type: "confirmDiscard" }
  | { type: "keepDraft" }
  | { type: "submit"; escalation: Escalation }
  /** Munich / server side. `force` = dev-tools override that ignores the transition table. */
  | { type: "serverStatus"; id: string; status: EscalationStatus; force?: boolean }
  | { type: "revokeRequested"; id: string; settlesAt: number }
  | { type: "revokeSettled"; id: string }
  | { type: "setMedia"; key: string; media: ElementMedia }
  | { type: "setDemo"; patch: Partial<DemoSettings> }
  | { type: "reset" }
  | { type: "notify"; text: string; tone: ToastTone }
  | { type: "dismissToast" };

const initialState: State = {
  selectedElement: null,
  draft: null,
  interactionMode: "select",
  ghostCategory: null,
  wallSpot: null,
  escalations: [],
  media: {},
  pendingRevokes: {},
  demo: { autoAdvance: false, slowNetwork: true },
  toast: null,
  history: EMPTY_HISTORY,
  discardPrompt: null,
};

/**
 * Something tapped elsewhere would replace or close the open draft. It never
 * happens silently: the "Discard this draft?" dialog asks first, and on
 * Discard the remembered action runs. Repeats while it shows are ignored
 * (e.g. the pointer moves of a drag).
 */
const askDiscard = (state: State, next?: Action): State =>
  state.discardPrompt ? state : { ...state, discardPrompt: { next } };

/**
 * Apply a change to the open draft and record the previous version for undo.
 * Changes with the same key within 600 ms (one drag or rotation, a run of
 * stepper taps) collapse into one undo step.
 */
function withHistory(state: State, draft: Draft, key: string): State {
  const now = Date.now();
  const h = state.history;
  const same = h.lastKey === key && now - h.lastAt < 600;
  const past = same || !state.draft ? h.past : [...h.past, state.draft].slice(-50);
  return { ...state, draft, history: { past, future: [], lastKey: key, lastAt: now } };
}

/** Closing the pane also ends ghost drafting, its history and any prompt. */
const NO_DRAFT = {
  draft: null,
  interactionMode: "select",
  ghostCategory: null,
  history: EMPTY_HISTORY,
  discardPrompt: null,
} as const;

/**
 * Selection once the draft closes without sending: an inserted (ghost) element
 * no longer exists, so the selection goes back to the wall it was inserted on
 * (its blue triangle shows again), or to nothing.
 */
const selectionAfterDraft = (state: State): SelectedElement | null =>
  state.selectedElement?.type === "ghost"
    ? state.draft?.spot
      ? { type: "wall", id: state.draft.spot.wallId }
      : null
    : state.selectedElement;

export type InteractionMode = "select" | "ghost_draft";
/** The open escalation draft: what was intercepted, where. */
export type Draft = {
  anchor: SelectedElement;
  intent: DraftIntent;
  marker?: Point;
  /** missing-element inserted at the wall's blue triangle: the ghost is tied to that spot. */
  spot?: WallSpot;
  category?: string;
  /** wall-length / missing-element: the reading entered so far. */
  measuredM?: number | null;
  /** object-change: the proposed size and rotation. */
  proposed?: ObjectState;
};

/**
 * Label for a draft's target. A ghost is "in the Music Room", not an element;
 * room-level proposals (ceiling height, room size) use the short room name too.
 */
export const draftLabel = (anchor: SelectedElement) =>
  anchor.type === "ghost" || anchor.type === "room" ? PROJECT.room : elementInfo(anchor).label;

const toast = (text: string, tone: ToastTone) => ({ id: Date.now() + Math.random(), text, tone });

/** Key for per-element maps. The room panel and the floor share the room's key. */
export const elementKey = (el: SelectedElement) => `${el.type}:${el.id}`;
const EMPTY_MEDIA: ElementMedia = { photos: [], note: "" };

export const sameElement = (a: SelectedElement | null, b: SelectedElement | null) =>
  !!a && !!b && a.type === b.type && a.id === b.id;

const SERVER_TOASTS: Partial<Record<EscalationStatus, (label: string) => [string, ToastTone]>> = {
  in_review: (l) => [`The expert opened your ${l} report.`, "hint"],
  resolved: (l) => [`The expert updated the plan. ${l} resolved. You're unblocked.`, "success"],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select": {
      // A draft is only closed with its ✕ (or by sending it): an accidental
      // tap on the canvas, another element or a pin must never throw away
      // the contractor's work. Taps on the draft's own element are fine.
      const anchor = state.draft?.anchor;
      // A tap on a wall marks the exact spot (blue triangle); anything else clears it.
      const wallSpot = action.element?.type === "wall" ? (action.spot ?? null) : null;
      if (anchor) return sameElement(anchor, action.element) ? { ...state, wallSpot } : askDiscard(state, action);
      return { ...state, ...NO_DRAFT, selectedElement: action.element, wallSpot };
    }

    case "startDraft":
      // Another element, or another kind of proposal for this one (e.g. Delete on
      // an object being resized): ask before replacing the open draft.
      if (state.draft && (!sameElement(state.draft.anchor, action.anchor) || state.draft.intent !== action.intent)) {
        return askDiscard(state, action);
      }
      {
        // Keep selection in sync with the anchor so the canvas highlights it.
        const draft: Draft = { anchor: action.anchor, intent: action.intent, measuredM: action.measuredM ?? null };
        return {
          ...state,
          ...NO_DRAFT,
          draft,
          selectedElement: action.anchor,
          // A prefilled reading can be undone back to an empty one.
          history:
            action.measuredM != null
              ? { ...EMPTY_HISTORY, past: [{ ...draft, measuredM: null }] }
              : EMPTY_HISTORY,
        };
      }

    case "proposeObject": {
      const anchor: SelectedElement = { type: "object", id: action.id };
      const open = state.draft;
      // Same object's draft open: keep collecting changes in it.
      const key = `object:${Object.keys(action.patch).sort().join(",")}`;
      if (open && open.intent === "object-change" && sameElement(open.anchor, anchor)) {
        return withHistory(state, { ...open, proposed: { ...open.proposed!, ...action.patch } }, key);
      }
      if (open) return askDiscard(state, action); // another draft is open: ask first
      const plan = objectDims(objectById(action.id));
      const base: Draft = { anchor, intent: "object-change", proposed: plan };
      return {
        ...state,
        ...NO_DRAFT,
        selectedElement: anchor,
        draft: { ...base, proposed: { ...plan, ...action.patch } },
        // Undo can go back to "no changes yet" (the draft stays open).
        history: { past: [base], future: [], lastKey: key, lastAt: Date.now() },
      };
    }

    case "updateDraft":
      if (!state.draft) return state;
      return withHistory(state, { ...state.draft, ...action.patch }, `draft:${Object.keys(action.patch).sort().join(",")}`);

    case "startGhost":
      if (state.draft) return askDiscard(state, action);
      // A wall spot is marked (blue triangle): the insertion is tied to it, so
      // the ghost lands there at once and the pane opens. No second tap needed;
      // a tap on the plan still moves it.
      if (state.wallSpot && state.selectedElement?.type === "wall" && state.selectedElement.id === state.wallSpot.wallId) {
        const anchor: SelectedElement = { type: "ghost", id: `ghost-${Date.now()}` };
        return {
          ...state,
          ...NO_DRAFT,
          interactionMode: "ghost_draft",
          ghostCategory: action.category,
          // Like magicplan: the inserted element is what's selected now.
          selectedElement: anchor,
          draft: {
            anchor,
            intent: "missing-element",
            marker: wallSpotGhost(state.wallSpot),
            spot: state.wallSpot,
            category: action.category,
          },
        };
      }
      // Wait for the canvas tap; the selection stays (the toolbar mustn't jump).
      return { ...state, ...NO_DRAFT, interactionMode: "ghost_draft", ghostCategory: action.category };

    case "placeGhost": {
      if (state.interactionMode !== "ghost_draft") return state;
      // Moving an already placed ghost.
      if (state.draft?.anchor.type === "ghost") {
        // Moved off the wall spot: no longer tied to it.
        return withHistory(state, { ...state.draft, marker: action.point, spot: undefined }, `ghost:${Date.now()}`);
      }
      // First tap: the proposal now has a place, so the pane opens, and the
      // inserted element is selected.
      const anchor: SelectedElement = { type: "ghost", id: `ghost-${Date.now()}` };
      return {
        ...state,
        selectedElement: anchor,
        draft: {
          anchor,
          intent: "missing-element",
          marker: action.point,
          category: state.ghostCategory ?? undefined,
        },
      };
    }

    case "cancelDraft":
      return { ...state, ...NO_DRAFT, selectedElement: selectionAfterDraft(state) };

    case "undo": {
      const { past, future } = state.history;
      if (!state.draft || past.length === 0) return state;
      return {
        ...state,
        draft: past[past.length - 1],
        history: { past: past.slice(0, -1), future: [state.draft, ...future], lastKey: null, lastAt: 0 },
      };
    }

    case "redo": {
      const { past, future } = state.history;
      if (!state.draft || future.length === 0) return state;
      return {
        ...state,
        draft: future[0],
        history: { past: [...past, state.draft], future: future.slice(1), lastKey: null, lastAt: 0 },
      };
    }

    case "askDiscard":
      return state.draft ? askDiscard(state) : state;

    case "keepDraft":
      return { ...state, discardPrompt: null };

    case "confirmDiscard": {
      // Discard, then do what the stray tap meant to do (e.g. select that wall).
      const next = state.discardPrompt?.next;
      const cleared: State = { ...state, ...NO_DRAFT, selectedElement: selectionAfterDraft(state) };
      return next ? reducer(cleared, next) : cleared;
    }

    case "submit": {
      const e = action.escalation;
      return {
        ...state,
        ...NO_DRAFT,
        selectedElement: null,
        // Several open proposals can share an element (e.g. a wall's length and
        // a missing window); a new one only replaces a resolved one there.
        escalations: [
          e,
          ...state.escalations.filter((x) => !(sameElement(x.target, e.target) && x.status === "resolved")),
        ],
        toast: toast(`${e.targetLabel} saved. It sends in the background, you can move on.`, "success"),
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

    case "setMedia":
      return { ...state, media: { ...state.media, [action.key]: action.media } };

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
  /** Tap on a wall: select it and mark the exact spot (blue triangle). */
  const selectWallAt = useCallback(
    (spot: WallSpot) => dispatch({ type: "select", element: { type: "wall", id: spot.wallId }, spot }),
    [],
  );
  const startDraft = useCallback(
    (anchor: SelectedElement, intent: DraftIntent, measuredM?: number) =>
      dispatch({ type: "startDraft", anchor, intent, measuredM }),
    [],
  );
  const proposeObjectChange = useCallback(
    (id: string, patch: Partial<ObjectState>) => dispatch({ type: "proposeObject", id, patch }),
    [],
  );
  const updateDraft = useCallback(
    (patch: Partial<Pick<Draft, "measuredM" | "proposed">>) => dispatch({ type: "updateDraft", patch }),
    [],
  );
  const startGhostDraft = useCallback(
    (category: string) => dispatch({ type: "startGhost", category }),
    [],
  );
  const placeGhost = useCallback((point: Point) => dispatch({ type: "placeGhost", point }), []);
  const cancelDraft = useCallback(() => dispatch({ type: "cancelDraft" }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  // Page-level follow-ups (open a popover, an Insert item…) run after Discard.
  const afterDiscard = useRef<(() => void) | null>(null);
  const requestDiscard = useCallback((then?: () => void) => {
    afterDiscard.current = then ?? null;
    dispatch({ type: "askDiscard" });
  }, []);
  const confirmDiscard = useCallback(() => {
    dispatch({ type: "confirmDiscard" });
    const then = afterDiscard.current;
    afterDiscard.current = null;
    then?.();
  }, []);
  const keepDraftOpen = useCallback(() => {
    afterDiscard.current = null;
    dispatch({ type: "keepDraft" });
  }, []);

  const submitEscalation = useCallback(
    (draft: EscalationDraft) => {
      const open = stateRef.current.draft;
      if (!open) return;
      const anchor = open.anchor;
      const now = Date.now();
      const escalation: Escalation = {
        ...draft,
        marker: open.marker,
        markerSpot: open.spot,
        category: open.category,
        id: `esc-${now}`,
        target: anchor,
        targetLabel: draftLabel(anchor),
        createdAt: now,
        // Offline-first: saved on the iPad before anything leaves it.
        status: "queued",
        statusChangedAt: now,
      };
      dispatch({ type: "submit", escalation });

      // Simulated backend (mock polling):
      //   queued ─1 s (or when back online)─▶ sending ─1.5 s─▶ delivered
      //   ─3 s, if the expert is online (before 15:00 CET)─▶ in_review
      // The transition table rejects any step a revoke got ahead of.
      const id = escalation.id;
      const set = (status: EscalationStatus) => dispatch({ type: "serverStatus", id, status });
      const upload = () => {
        set("sending");
        later(1500, () => {
          set("delivered");
          const demo = stateRef.current.demo;
          if (isExpertOnline() || demo.autoAdvance) later(3000, () => set("in_review"));
          if (demo.autoAdvance) later(10000, () => set("resolved"));
        });
      };
      later(1000, () =>
        navigator.onLine ? upload() : window.addEventListener("online", upload, { once: true }),
      );
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

  /**
   * Cheat for reviewers (double-tap a card's header): force the report to the
   * next lifecycle state now, to see every state without waiting on timers.
   */
  const advanceEscalation = useCallback((id: string) => {
    const e = stateRef.current.escalations.find((x) => x.id === id);
    const next = e && nextStatus(e.status);
    if (next) dispatch({ type: "serverStatus", id, status: next, force: true });
  }, []);

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

  // ── Standard attachments (Photos & Notes) ───────────────────────────────

  const mediaFor = useCallback(
    (el: SelectedElement) => state.media[elementKey(el)] ?? EMPTY_MEDIA,
    [state.media],
  );
  const setMediaFor = useCallback(
    (el: SelectedElement, media: ElementMedia) =>
      dispatch({ type: "setMedia", key: elementKey(el), media }),
    [],
  );
  /** Drives the yellow paperclip badge; independent of escalation state. */
  const standardPhotoCount = useCallback(
    (el: SelectedElement) => state.media[elementKey(el)]?.photos.length ?? 0,
    [state.media],
  );

  const activeCount = useMemo(() => state.escalations.filter(isActive).length, [state.escalations]);

  return {
    // state
    selectedElement: state.selectedElement,
    draft: state.draft,
    discardPrompt: !!state.discardPrompt,
    canUndo: !!state.draft && state.history.past.length > 0,
    canRedo: !!state.draft && state.history.future.length > 0,
    interactionMode: state.interactionMode,
    ghostCategory: state.ghostCategory,
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
    mediaFor,
    standardPhotoCount,
    // actions
    selectElement,
    clearSelection,
    selectWallAt,
    wallSpot: state.wallSpot,
    startDraft,
    proposeObjectChange,
    updateDraft,
    startGhostDraft,
    placeGhost,
    cancelDraft,
    undo,
    redo,
    requestDiscard,
    confirmDiscard,
    keepDraftOpen,
    submitEscalation,
    revokeEscalation,
    mockExpertReview,
    advanceEscalation,
    setMediaFor,
    devSetStatus,
    setDemo,
    reset,
    notify,
    dismissToast,
  };
}

export type DeviationStore = ReturnType<typeof useDeviationState>;
