"use client";

import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, CheckCircle2, ChevronRight, Eye, Loader2, Mic, Ruler, Undo2 } from "lucide-react";
import { issueLabel } from "@/lib/floorplan";
import type { Escalation, EscalationStatus, IssueType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { REVOKE_DISABLED_MESSAGE, STATUS_META, canRevoke } from "@/store/deviationMachine";

/**
 * EscalationCard (molecule)
 *
 * Sidebar card for one reported deviation. Presentational and prop-driven:
 * no store access, so it can be rendered in isolation (see /sandbox).
 *
 *   status        BLOCKING tag      Revoke            Badge
 *   ─────────     ─────────────     ───────────────   ──────────────────────────
 *   sending       ✓ (if blocking)   ✓                 "Sending…"
 *   delivered     ✓ (if blocking)   ✓                 "Delivered"
 *   in_review     –                 hidden            yellow "Munich is reviewing"
 *                                                     + "Revocation disabled" note
 *   resolved      –                 hidden            green "Resolved"
 *
 * Revoke is hidden (not just disabled) in review: the expert is working on it,
 * so the card says why instead of offering an action that can't succeed.
 */

// ── Variants ────────────────────────────────────────────────────────────────

const card = cva(
  "w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-2 transition-[box-shadow,opacity] duration-300",
  {
    variants: {
      status: {
        sending: "ring-transparent",
        delivered: "ring-transparent",
        in_review: "ring-amber-400",
        resolved: "opacity-90 ring-emerald-500/60",
      },
    },
  },
);

const statusBadge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
  {
    variants: {
      status: {
        sending: "bg-sky-50 text-mp-blue",
        delivered: "bg-red-50 text-mp-red",
        in_review: "bg-amber-100 text-amber-800",
        resolved: "bg-emerald-50 text-emerald-700",
      },
    },
  },
);

const BADGE: Record<EscalationStatus, { icon: React.ReactNode; text: string }> = {
  sending: { icon: <Loader2 size={13} className="animate-spin" />, text: "Sending…" },
  delivered: { icon: <CheckCheck size={13} />, text: "Delivered" },
  in_review: { icon: <Eye size={13} className="animate-pulse" />, text: "Expert is reviewing" },
  resolved: { icon: <CheckCircle2 size={13} />, text: "Resolved" },
};

// ── Props ───────────────────────────────────────────────────────────────────

export type EscalationCardProps = {
  /** Lifecycle status. An escalated element is never "idle"; that state has no card. */
  status: EscalationStatus;
  issueType: IssueType;
  /** When the report was submitted (ms epoch). */
  timestamp: number;
  /** Called when the contractor revokes. Only offered while revocable (sending/delivered). */
  onRevoke?: () => void;

  // Optional detail, used in the app; the card renders fine without it.
  targetLabel?: string;
  /** Cover thumbnail (first evidence photo). */
  photoUrl?: string;
  /** Total photos attached; shows "+n" on the thumbnail when > 1. */
  photoCount?: number;
  note?: string;
  /** Contractor marked work as blocked (default true). Shown as the BLOCKING tag. */
  blocking?: boolean;
  /** When `status` last changed (ms epoch); adds "Opened by Munich 13:42". */
  statusChangedAt?: number;
  /** Dimension Mismatch: plan vs measured length. */
  dimension?: { plannedM: number; measuredM: number };
  /** Undocumented Element: length of the physical wall measured on site. */
  lengthM?: number;
  voiceMemoSeconds?: number;
  /** Makes the card body tappable (e.g. focus the element on the canvas). */
  onPress?: () => void;
  className?: string;
};

// ── Component ───────────────────────────────────────────────────────────────

export function EscalationCard({
  status,
  issueType,
  timestamp,
  onRevoke,
  targetLabel,
  photoUrl,
  photoCount = photoUrl ? 1 : 0,
  note,
  blocking = true,
  statusChangedAt,
  dimension,
  lengthM,
  voiceMemoSeconds,
  onPress,
  className,
}: EscalationCardProps) {
  const revocable = canRevoke(status); // sending | delivered
  const showBlocking = revocable && blocking;
  const title = issueLabel(issueType);

  return (
    <motion.article
      layout
      data-status={status}
      aria-label={`${title}${targetLabel ? ` on ${targetLabel}` : ""}, ${STATUS_META[status].label}`}
      className={cn(card({ status }), className)}
    >
      <button
        type="button"
        onClick={onPress}
        disabled={!onPress}
        className="flex w-full gap-3 p-3 text-left disabled:cursor-default"
      >
        {photoUrl && (
          <span className="relative size-16 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" className="size-16 rounded-xl object-cover" />
            {photoCount > 1 && (
              <span className="absolute bottom-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                +{photoCount - 1}
              </span>
            )}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {showBlocking && (
              <span className="rounded-md bg-mp-red px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Blocking
              </span>
            )}
            <span className="max-w-full truncate whitespace-nowrap text-[15px] font-semibold leading-tight">{title}</span>
          </div>
          {targetLabel && <div className="truncate text-[13px] text-mp-muted">{targetLabel}</div>}
          {note && <div className="line-clamp-2 text-[12px] italic text-mp-muted">“{note}”</div>}

          {(dimension || lengthM !== undefined || voiceMemoSeconds !== undefined) && (
            <div className="mt-1 flex items-center gap-2.5 text-[12px] text-mp-muted">
              {dimension && (
                <span className="flex items-center gap-1 whitespace-nowrap font-medium text-mp-ink">
                  <Ruler size={12} /> {dimension.plannedM.toFixed(2)} → {dimension.measuredM.toFixed(2)} m
                </span>
              )}
              {!dimension && lengthM !== undefined && (
                <span className="flex items-center gap-1 whitespace-nowrap font-medium text-mp-ink">
                  <Ruler size={12} /> {lengthM.toFixed(2)} m long
                </span>
              )}
              {voiceMemoSeconds !== undefined && (
                <span className="flex items-center gap-1">
                  <Mic size={12} /> {voiceMemoSeconds}s
                </span>
              )}
            </div>
          )}
        </div>

        {onPress && <ChevronRight size={18} className="mt-1 shrink-0 text-mp-muted" />}
      </button>

      {/* Footer: status badge + timestamps, and Revoke while it can still succeed */}
      <div className="flex items-center gap-3 border-t border-mp-line px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <motion.span
            key={status}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={statusBadge({ status })}
          >
            {BADGE[status].icon} {BADGE[status].text}
          </motion.span>
          <Timestamps status={status} timestamp={timestamp} statusChangedAt={statusChangedAt} />
        </div>

        <AnimatePresence initial={false}>
          {revocable && onRevoke && (
            <motion.button
              key="revoke"
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRevoke}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-mp-line px-3 text-[13px] font-semibold text-mp-ink active:bg-mp-panel"
            >
              <Undo2 size={15} /> Revoke
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* In review: Revoke is gone; say why (race-condition guard, visible on touch) */}
      {status === "in_review" && (
        <motion.p
          role="note"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-medium leading-snug text-amber-900"
        >
          <Eye size={14} className="shrink-0" />
          {REVOKE_DISABLED_MESSAGE}
        </motion.p>
      )}
    </motion.article>
  );
}

// ── Parts ───────────────────────────────────────────────────────────────────

const SINCE: Partial<Record<EscalationStatus, string>> = {
  delivered: "Delivered",
  in_review: "Opened by expert",
  resolved: "Resolved",
};

function Timestamps({
  status,
  timestamp,
  statusChangedAt,
}: {
  status: EscalationStatus;
  timestamp: number;
  statusChangedAt?: number;
}) {
  const since = SINCE[status];
  return (
    <div className="mt-1 text-[11px] leading-tight tabular-nums text-mp-muted">
      <time dateTime={new Date(timestamp).toISOString()}>Reported {clock(timestamp)}</time>
      {since && statusChangedAt && statusChangedAt > timestamp && (
        <>
          {" · "}
          <time dateTime={new Date(statusChangedAt).toISOString()}>
            {since} {clock(statusChangedAt)}
          </time>
        </>
      )}
    </div>
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
    status: e.status,
    issueType: e.issueType,
    timestamp: e.createdAt,
    statusChangedAt: e.statusChangedAt,
    // A proposed wall rides on the anchor line: "Music Room · Wall".
    targetLabel: e.target.type === "ghost" ? `${e.targetLabel} · Wall` : e.targetLabel,
    photoUrl: e.photoUrls[0],
    photoCount: e.photoUrls.length,
    note: e.note,
    blocking: e.blocking,
    dimension:
      e.plannedM !== undefined && e.measuredM !== undefined
        ? { plannedM: e.plannedM, measuredM: e.measuredM }
        : undefined,
    lengthM: e.issueType === "undocumented-element" ? e.measuredM : undefined,
    voiceMemoSeconds: e.voiceMemo?.durationS,
  };
}
