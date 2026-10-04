"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCheck,
  ChevronRight,
  CloudUpload,
  FileText,
  Info,
  Lock,
  Mic,
  Ruler,
  X,
} from "lucide-react";
import { PROJECT, cornerById, issueLabel, wallById } from "@/lib/floorplan";
import { PANEL_W } from "@/lib/layout";
import type { Escalation, Target } from "@/lib/types";

type Props = {
  selected: Target | null;
  selectedEscalation?: Escalation;
  escalations: Escalation[];
  onReport: () => void;
  onFocus: (t: Target) => void;
  onClear: () => void;
};

/**
 * Right contextual panel. magicplan's generic "Photos & Notes" is replaced by
 * an "Active Escalations" summary so the contractor sees at a glance what has
 * already gone to Munich — no inbox, no thread, no waiting for replies.
 */
export function EscalationsPanel({
  selected,
  selectedEscalation,
  escalations,
  onReport,
  onFocus,
  onClear,
}: Props) {
  return (
    <aside
      style={{ width: PANEL_W }}
      className="flex h-full shrink-0 flex-col border-l border-mp-line bg-mp-panel"
    >
      <AnimatePresence mode="wait" initial={false}>
        {selected ? (
          <motion.div
            key={`sel-${selected.id}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.18 }}
            className="border-b border-mp-line p-5"
          >
            <SelectionCard
              target={selected}
              escalation={selectedEscalation}
              onReport={onReport}
              onClear={onClear}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="px-5 pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px] font-semibold">Active Escalations</span>
          <motion.span
            key={escalations.length}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-[14px] font-bold ${
              escalations.length ? "bg-mp-red text-white" : "bg-mp-line text-mp-muted"
            }`}
          >
            {escalations.length}
          </motion.span>
        </div>
        <div className="text-[13px] text-mp-muted">Sent one-way to Munich · no need to wait for a reply</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {escalations.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {escalations.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                >
                  <EscalationCard
                    e={e}
                    active={selected?.id === e.target.id}
                    onPress={() => onFocus(e.target)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <JobContext />
    </aside>
  );
}

function SelectionCard({
  target,
  escalation,
  onReport,
  onClear,
}: {
  target: Target;
  escalation?: Escalation;
  onReport: () => void;
  onClear: () => void;
}) {
  const wall = target.kind === "wall" ? wallById(target.id) : null;
  const label = wall ? wall.label : cornerById(target.id).label;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white">
          <Info size={20} />
        </span>
        <div className="flex-1">
          <div className="text-[18px] font-semibold leading-tight">{label}</div>
          <div className="text-[13px] text-mp-muted">
            {wall ? `Length ${wall.lengthM.toFixed(2)} m · ${wall.openings?.length ?? 0} openings` : "Corner · 90°"}
          </div>
        </div>
        <button
          onClick={onClear}
          aria-label="Deselect"
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-mp-muted"
        >
          <X size={20} />
        </button>
      </div>

      {escalation ? (
        <div className="flex items-center gap-2 rounded-xl bg-mp-red/10 px-3 py-2.5 text-[14px] font-medium text-mp-red">
          <Lock size={16} /> Locked · escalated {timeAgo(escalation.createdAt)}. Keep working elsewhere.
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onReport}
          className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-mp-red text-[17px] font-semibold text-white"
        >
          <AlertTriangle size={20} /> Report Deviation
        </motion.button>
      )}
    </div>
  );
}

function EscalationCard({ e, active, onPress }: { e: Escalation; active: boolean; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className={`flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-2 transition ${
        active ? "ring-mp-red" : "ring-transparent"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={e.photoUrl} alt="" className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {e.blocking && (
            <span className="rounded-md bg-mp-red px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Blocking
            </span>
          )}
          <span className="truncate text-[15px] font-semibold">{issueLabel(e.issueType)}</span>
        </div>
        <div className="truncate text-[13px] text-mp-muted">{e.targetLabel}</div>
        <div className="mt-1 flex items-center gap-2.5 text-[12px] text-mp-muted">
          {e.measuredM !== undefined && e.plannedM !== undefined && (
            <span className="flex items-center gap-1 font-medium text-mp-ink">
              <Ruler size={12} /> {e.plannedM.toFixed(2)} → {e.measuredM.toFixed(2)} m
            </span>
          )}
          {e.voiceMemo && (
            <span className="flex items-center gap-1">
              <Mic size={12} /> {e.voiceMemo.durationS}s
            </span>
          )}
          <span
            className={`ml-auto flex items-center gap-1 font-medium ${
              e.status === "delivered" ? "text-emerald-600" : "text-mp-blue"
            }`}
          >
            {e.status === "delivered" ? (
              <>
                <CheckCheck size={13} /> Delivered
              </>
            ) : (
              <>
                <CloudUpload size={13} className="animate-pulse" /> Sending
              </>
            )}
          </span>
        </div>
      </div>
      <ChevronRight size={18} className="mt-1 shrink-0 text-mp-muted" />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-mp-line px-6 py-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-mp-muted">
        <FileText size={22} />
      </span>
      <div className="text-[15px] font-semibold">Nothing escalated yet</div>
      <div className="text-[13px] leading-snug text-mp-muted">
        Plan doesn&apos;t match the room? Tap the wall or corner on the plan, then{" "}
        <span className="font-semibold text-mp-red">Report Deviation</span>.
      </div>
    </div>
  );
}

/** Context the expert gets automatically, so the contractor never has to type it. */
function JobContext() {
  const rows = [
    ["Budget", `≈ €${PROJECT.budgetEur.toLocaleString("de-DE")}`],
    ["Permit", PROJECT.permit],
    ["Last visit", PROJECT.previousVisit],
  ];
  return (
    <div className="border-t border-mp-line bg-white/60 px-5 py-4">
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-mp-muted">
        Attached to every escalation
      </div>
      <dl className="grid grid-cols-[88px_1fr] gap-y-1 text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-mp-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  return `${Math.round(s / 60)} min ago`;
}
