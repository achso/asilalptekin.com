"use client";

import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { CheckCheck, CheckCircle2, ChevronRight, CloudOff, Eye, Loader2, Mic, Ruler, Undo2 } from "lucide-react";
import { askLabel, issueLabel } from "@/lib/floorplan";
import { useExpertAvailability } from "@/lib/useMunichCutoff";
import type { AskId, Escalation, EscalationStatus, IssueType, ObjectState } from "@/lib/types";
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
        queued: "ring-transparent",
        sending: "ring-transparent",
        delivered: "ring-transparent",
        in_review: "ring-amber-400",
        resolved: "opacity-90 ring-emerald-500/60",
      },
    },
  },
);

const statusBadge = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold",
  {
    variants: {
      status: {
        queued: "bg-gray-100 text-gray-500",
        sending: "bg-sky-50 text-mp-blue",
        delivered: "bg-red-50 text-mp-red",
        in_review: "bg-amber-100 text-amber-800",
        resolved: "bg-emerald-50 text-emerald-700",
      },
    },
  },
);

const BADGE: Record<EscalationStatus, { icon: React.ReactNode; text: string }> = {
  // Short pill; when the expert will see it sits in the line below.
  queued: { icon: <CloudOff size={13} />, text: "Queued" },
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
  /** Undocumented Element: length of the physical element measured on site. */
  lengthM?: number;
  /** Object change: what was changed, e.g. "W 0.95 → 1.10 m · ↻ 0° → 45°". */
  changeSummary?: string;
  voiceMemoSeconds?: number;
  /** Makes the card body tappable (e.g. focus the element on the canvas). */
  onPress?: () => void;
  /** The chevron: open the read-only ticket as the remote expert receives it. */
  onOpen?: () => void;
  /** The Ask: what the contractor needs back. */
  ask?: AskId;
  /**
   * Reviewer cheat: a double-tap on the card's header forces the next
   * lifecycle state (queued → sending → delivered → in review → resolved),
   * so every state can be checked without waiting for the simulated backend.
   */
  onAdvance?: () => void;
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
  changeSummary,
  voiceMemoSeconds,
  onPress,
  onOpen,
  ask,
  onAdvance,
  className,
}: EscalationCardProps) {
  const lastTap = useRef(0);
  const pressTimer = useRef<number | undefined>(undefined);
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
      <div className="flex">
      <button
        type="button"
        // Double-tap detection by hand (iPad Safari doesn't reliably fire
        // dblclick). With the cheat available, a single tap waits 280 ms so a
        // second tap can claim the gesture before onPress navigates away.
        onClick={() => {
          if (!onAdvance) return onPress?.();
          const now = Date.now();
          if (now - lastTap.current < 350) {
            lastTap.current = 0;
            window.clearTimeout(pressTimer.current);
            onAdvance();
            return;
          }
          lastTap.current = now;
          if (onPress) pressTimer.current = window.setTimeout(onPress, 280);
        }}
        disabled={!onPress && !onAdvance}
        className={cn(
          "flex min-w-0 flex-1 touch-manipulation gap-3 p-3 text-left disabled:cursor-default",
          !onPress && "cursor-default",
        )}
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
          {ask && <div className="truncate text-[13px] font-medium text-mp-ink">Ask: {askLabel(ask)}</div>}
          {note && <div className="line-clamp-2 text-[12px] italic text-mp-muted">“{note}”</div>}

          {changeSummary && (
            <div className="mt-1 flex items-start gap-1 text-[12px] font-medium leading-snug text-mp-ink">
              <Ruler size={12} className="mt-0.5 shrink-0" /> <span>{changeSummary}</span>
            </div>
          )}
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

      </button>
        {/* Chevron: what the expert receives (read-only ticket). */}
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            aria-label="See what the expert receives"
            className="grid w-12 shrink-0 place-items-center text-mp-muted active:bg-mp-panel"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

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
  // Same source as the header and the form: "Expert sees it at 08:00 tomorrow".
  const availability = useExpertAvailability();
  const waiting = status === "queued" || status === "sending" || status === "delivered";
  return (
    <div className="mt-1 text-[11px] leading-tight tabular-nums text-mp-muted">
      {waiting && availability && (
        <div data-seen-line className="mb-0.5 text-[13px] font-medium text-mp-ink">
          {availability.seenLine}
        </div>
      )}
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

/** "W 0.95 → 1.10 m · ↻ 0° → 45° · Moved": only what changed; a move is visual, no numbers. */
export function summarizeObjectChange({ from, to }: { from: ObjectState; to: ObjectState }) {
  const parts: string[] = [];
  const m = (k: "widthM" | "depthM" | "heightM", tag: string) =>
    from[k] !== to[k] && parts.push(`${tag} ${from[k].toFixed(2)} → ${to[k].toFixed(2)} m`);
  m("widthM", "W");
  m("depthM", "D");
  m("heightM", "H");
  if (from.rotation !== to.rotation) parts.push(`↻ ${from.rotation}° → ${to.rotation}°`);
  if (Math.hypot(from.center.x - to.center.x, from.center.y - to.center.y) > 0.005) parts.push("Moved");
  return parts.join(" · ");
}

/** Map a store `Escalation` onto the card's presentational props. */
export function toEscalationCardProps(
  e: Escalation,
): Omit<EscalationCardProps, "onPress" | "onOpen" | "onRevoke" | "className"> {
  return {
    status: e.status,
    issueType: e.issueType,
    timestamp: e.createdAt,
    statusChangedAt: e.statusChangedAt,
    // A proposed element rides on the anchor line: "Music Room · Plumbing".
    targetLabel: e.target.type === "ghost" ? `${e.targetLabel} · ${e.category ?? "Element"}` : e.targetLabel,
    photoUrl: e.photoUrls[0],
    photoCount: e.photoUrls.length,
    note: e.note,
    blocking: e.blocking,
    dimension:
      e.plannedM !== undefined && e.measuredM !== undefined
        ? { plannedM: e.plannedM, measuredM: e.measuredM }
        : undefined,
    lengthM: e.issueType === "undocumented-element" ? e.measuredM : undefined,
    changeSummary: e.objectChange ? summarizeObjectChange(e.objectChange) : undefined,
    voiceMemoSeconds: e.voiceMemo?.durationS,
    ask: e.ask,
  };
}
