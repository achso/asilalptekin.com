"use client";

import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import {
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  Loader2,
  Lock,
  Mic,
  Ruler,
  Undo2,
} from "lucide-react";
import { REVOKE_DISABLED_MESSAGE, STATUS_META, canRevoke } from "@/lib/deviationMachine";
import { issueLabel } from "@/lib/floorplan";
import type { Escalation, EscalationStatus, IssueType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * EscalationCard (molecule)
 *
 * Right-sidebar card for one reported deviation. Presentational and
 * prop-driven: everything it shows and every action it offers comes from
 * `deviationState`:
 *
 *   sending    → spinner "Sending",   Revoke available
 *   delivered  → "Delivered",         Revoke available
 *   in_review  → amber ring, "In Review", Revoke disabled + always-visible tooltip
 *   resolved   → green ring, "Resolved", no actions, blocking tag dropped
 *
 * Use `toEscalationCardProps()` to map a store `Escalation` onto these props.
 */

// ── Variants ────────────────────────────────────────────────────────────────

const card = cva(
  "overflow-hidden rounded-2xl bg-white shadow-sm ring-2 transition-[box-shadow,opacity] duration-300",
  {
    variants: {
      state: {
        sending: "ring-transparent",
        delivered: "ring-transparent",
        in_review: "ring-amber-400",
        resolved: "opacity-90 ring-emerald-500/60",
      },
    },
  },
);

const statusPill = cva("flex items-center gap-1 text-[13px] font-semibold", {
  variants: {
    state: {
      sending: "text-mp-blue",
      delivered: "text-mp-red",
      in_review: "text-amber-600",
      resolved: "text-emerald-600",
    },
  },
});

const STATUS_ICON: Record<EscalationStatus, React.ReactNode> = {
  sending: <Loader2 size={13} className="animate-spin" />,
  delivered: <CheckCheck size={13} />,
  in_review: <Eye size={13} className="animate-pulse" />,
  resolved: <CheckCircle2 size={13} />,
};

const revokeButton = cva(
  "flex h-10 items-center gap-1.5 rounded-lg border border-mp-line px-3 text-[13px] font-semibold transition-opacity",
  {
    variants: {
      enabled: {
        true: "text-mp-ink active:bg-mp-panel",
        false: "cursor-not-allowed text-mp-muted opacity-50",
      },
    },
  },
);

// ── Props ───────────────────────────────────────────────────────────────────

export type EscalationCardProps = {
  /** An escalated element is never "idle"; that state has no card. */
  deviationState: EscalationStatus;
  issueType: IssueType;
  targetLabel: string;
  photoUrl: string;
  /** When the contractor submitted the report (ms epoch). */
  reportedAt: number;
  /** When `deviationState` last changed (ms epoch). */
  stateChangedAt: number;
  blocking?: boolean;
  dimension?: { plannedM: number; measuredM: number };
  voiceMemoSeconds?: number;
  /** Makes the card body tappable (e.g. focus the wall on the canvas). */
  onPress?: () => void;
  /** Shown only while the state allows it (see `canRevoke`). */
  onRevoke?: () => void;
  className?: string;
};

// ── Component ───────────────────────────────────────────────────────────────

export function EscalationCard({
  deviationState,
  issueType,
  targetLabel,
  photoUrl,
  reportedAt,
  stateChangedAt,
  blocking = false,
  dimension,
  voiceMemoSeconds,
  onPress,
  onRevoke,
  className,
}: EscalationCardProps) {
  const resolved = deviationState === "resolved";

  return (
    <motion.article
      layout
      data-state={deviationState}
      aria-label={`${issueLabel(issueType)} on ${targetLabel}, ${STATUS_META[deviationState].label}`}
      className={cn(card({ state: deviationState }), className)}
    >
      <button
        type="button"
        onClick={onPress}
        disabled={!onPress}
        className="flex w-full gap-3 p-3 text-left disabled:cursor-default"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="" className="size-16 shrink-0 rounded-xl object-cover" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {blocking && !resolved && (
              <span className="rounded-md bg-mp-red px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Blocking
              </span>
            )}
            <span className="truncate text-[15px] font-semibold">{issueLabel(issueType)}</span>
          </div>
          <div className="truncate text-[13px] text-mp-muted">{targetLabel}</div>

          <div className="mt-1 flex items-center gap-2.5 text-[12px] text-mp-muted">
            {dimension && (
              <span className="flex items-center gap-1 font-medium text-mp-ink">
                <Ruler size={12} /> {dimension.plannedM.toFixed(2)} → {dimension.measuredM.toFixed(2)} m
              </span>
            )}
            {voiceMemoSeconds !== undefined && (
              <span className="flex items-center gap-1">
                <Mic size={12} /> {voiceMemoSeconds}s
              </span>
            )}
          </div>
        </div>

        {onPress && <ChevronRight size={18} className="mt-1 shrink-0 text-mp-muted" />}
      </button>

      {/* Footer: status, timestamps, state-dependent action */}
      <div className="flex items-center gap-2 border-t border-mp-line px-3 py-2">
        <div className="min-w-0 flex-1">
          <motion.span
            key={deviationState}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={statusPill({ state: deviationState })}
          >
            {STATUS_ICON[deviationState]} {STATUS_META[deviationState].label}
          </motion.span>
          <Timestamps
            state={deviationState}
            reportedAt={reportedAt}
            stateChangedAt={stateChangedAt}
          />
        </div>
        <RevokeAction state={deviationState} onRevoke={onRevoke} />
      </div>

      {deviationState === "in_review" && <RevokeLockedTooltip />}
    </motion.article>
  );
}

// ── Parts ───────────────────────────────────────────────────────────────────

const STATE_SINCE: Partial<Record<EscalationStatus, string>> = {
  delivered: "Delivered",
  in_review: "Opened by Munich",
  resolved: "Resolved",
};

function Timestamps({
  state,
  reportedAt,
  stateChangedAt,
}: {
  state: EscalationStatus;
  reportedAt: number;
  stateChangedAt: number;
}) {
  const since = STATE_SINCE[state];
  return (
    <div className="text-[11px] leading-tight tabular-nums text-mp-muted">
      <div>Reported {clock(reportedAt)}</div>
      {since && stateChangedAt > reportedAt && (
        <div>
          {since} {clock(stateChangedAt)}
        </div>
      )}
    </div>
  );
}

/**
 * Revoke is a function of state:
 *   sending/delivered → enabled
 *   in_review         → visible but disabled (explained by the tooltip below)
 *   resolved          → not rendered
 */
function RevokeAction({ state, onRevoke }: { state: EscalationStatus; onRevoke?: () => void }) {
  if (state === "resolved" || !onRevoke) return null;
  const enabled = canRevoke(state);
  return (
    <motion.button
      type="button"
      whileTap={enabled ? { scale: 0.96 } : undefined}
      onClick={enabled ? onRevoke : undefined}
      disabled={!enabled}
      aria-describedby={enabled ? undefined : "revoke-locked-tip"}
      className={revokeButton({ enabled })}
    >
      {enabled ? <Undo2 size={15} /> : <Lock size={14} />} Revoke Escalation
    </motion.button>
  );
}

/** Always visible, because touch has no hover. Caret points at the disabled Revoke button. */
function RevokeLockedTooltip() {
  return (
    <motion.div
      id="revoke-locked-tip"
      role="tooltip"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-3 mb-3 flex items-center gap-2 rounded-lg bg-mp-ink px-3 py-2 text-[12px] font-medium leading-snug text-white"
    >
      <span className="absolute -top-1 right-[72px] size-2 rotate-45 bg-mp-ink" />
      <Eye size={14} className="shrink-0 text-amber-300" />
      {REVOKE_DISABLED_MESSAGE}
    </motion.div>
  );
}

const clock = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// ── Adapter ─────────────────────────────────────────────────────────────────

/** Map a store `Escalation` onto the card's presentational props. */
export function toEscalationCardProps(
  e: Escalation,
): Omit<EscalationCardProps, "onPress" | "onRevoke" | "className"> {
  return {
    deviationState: e.status,
    issueType: e.issueType,
    targetLabel: e.targetLabel,
    photoUrl: e.photoUrl,
    reportedAt: e.createdAt,
    stateChangedAt: e.statusChangedAt,
    blocking: e.blocking,
    dimension:
      e.plannedM !== undefined && e.measuredM !== undefined
        ? { plannedM: e.plannedM, measuredM: e.measuredM }
        : undefined,
    voiceMemoSeconds: e.voiceMemo?.durationS,
  };
}
