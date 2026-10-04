"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
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
import { EscalationForm } from "./EscalationForm";

type Props = {
  selected: Target | null;
  selectedEscalation?: Escalation;
  capturing: boolean;
  escalations: Escalation[];
  onReport: () => void;
  onCancelReport: () => void;
  onSubmit: (e: Escalation) => void;
  onFocus: (t: Target) => void;
  onClear: () => void;
};

type Mode = "summary" | "inspector" | "form";

/**
 * Right contextual panel, three states:
 *
 *  - summary   (nothing selected) → "Active Escalations" + auto-attached job context
 *  - inspector (wall/corner selected) → magicplan's familiar Details / Photos & Notes / Forms
 *  - form      (Report Deviation tapped) → the Escalation Form takes over the panel
 */
export function EscalationsPanel(props: Props) {
  const { selected, capturing } = props;
  const mode: Mode = capturing && selected ? "form" : selected ? "inspector" : "summary";

  return (
    <aside
      style={{ width: PANEL_W }}
      className="relative h-full shrink-0 overflow-hidden border-l border-mp-line bg-mp-panel"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={mode === "summary" ? "summary" : `${mode}-${selected?.id}`}
          initial={{ opacity: 0, x: mode === "form" ? 40 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "form" ? 40 : -16 }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="absolute inset-0 flex flex-col"
        >
          {mode === "form" && selected ? (
            <EscalationForm
              target={selected}
              onCancel={props.onCancelReport}
              onSubmit={props.onSubmit}
            />
          ) : mode === "inspector" && selected ? (
            <Inspector
              target={selected}
              escalation={props.selectedEscalation}
              onReport={props.onReport}
              onClear={props.onClear}
            />
          ) : (
            <Summary escalations={props.escalations} onFocus={props.onFocus} />
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

function Summary({
  escalations,
  onFocus,
}: {
  escalations: Escalation[];
  onFocus: (t: Target) => void;
}) {
  return (
    <>
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
                  <EscalationCard e={e} active={false} onPress={() => onFocus(e.target)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <JobContext />
    </>
  );
}

const TABS = ["Details", "Photos & Notes", "Forms"] as const;
type Tab = (typeof TABS)[number];

/** magicplan's element inspector, kept familiar — but read-only while the plan is locked. */
function Inspector({
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
  const [tab, setTab] = useState<Tab>("Details");
  const wall = target.kind === "wall" ? wallById(target.id) : null;
  const label = wall ? wall.label : cornerById(target.id).label;

  return (
    <>
      <div className="flex items-center gap-3 px-5 pb-3 pt-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white">
          <Info size={20} />
        </span>
        <div className="flex-1 text-[19px] font-semibold">{label}</div>
        <button
          onClick={onClear}
          aria-label="Close"
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-mp-muted"
        >
          <X size={20} />
        </button>
      </div>

      {/* Segmented control */}
      <div className="mx-5 flex rounded-xl bg-mp-line/70 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative h-10 flex-1 rounded-lg text-[14px] font-medium"
          >
            {tab === t && (
              <motion.span
                layoutId="inspector-tab"
                className="absolute inset-0 rounded-lg bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {escalation ? (
          <div className="mb-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-mp-red">
              <Lock size={14} /> Escalated to Munich {timeAgo(escalation.createdAt)}
            </div>
            <EscalationCard e={escalation} active={false} onPress={() => {}} />
            <p className="mt-2 text-[12px] text-mp-muted">
              No reply needed. The expert will update the plan. Carry on with other work.
            </p>
          </div>
        ) : null}

        {tab === "Details" && <DetailsTab target={target} />}
        {tab === "Photos & Notes" && <PhotosTab onReport={onReport} escalated={!!escalation} />}
        {tab === "Forms" && (
          <div className="rounded-2xl bg-white p-4 text-[14px] text-mp-muted">
            No forms attached to this {target.kind}.
          </div>
        )}
      </div>
    </>
  );
}

function DetailsTab({ target }: { target: Target }) {
  const wall = target.kind === "wall" ? wallById(target.id) : null;
  return (
    <div className="flex flex-col gap-4">
      <Group title="Dimensions">
        <Row label={wall ? "Length" : "Angle"}>
          <LockedValue>{wall ? `${wall.lengthM.toFixed(2)} m` : "90°"}</LockedValue>
        </Row>
        {wall && (
          <Row label="Openings">
            <LockedValue>{wall.openings?.length ?? 0}</LockedValue>
          </Row>
        )}
      </Group>
      {wall && (
        <Group title="Settings">
          <Row label="Load-Bearing Wall">
            <span className="h-[31px] w-[51px] rounded-full bg-mp-line opacity-60" />
          </Row>
        </Group>
      )}
      <p className="flex gap-2 text-[12px] leading-snug text-mp-muted">
        <Lock size={14} className="mt-0.5 shrink-0" />
        Geometry is read-only because the permit is approved. If what you see on site is different,
        report a deviation and the office will revise the plan.
      </p>
    </div>
  );
}

function PhotosTab({ onReport, escalated }: { onReport: () => void; escalated: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <Group title="Photos">
        <div className="grid grid-cols-4 gap-2 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="aspect-square rounded-lg border-2 border-dashed border-mp-line" />
          ))}
        </div>
      </Group>
      {!escalated && (
        <button
          onClick={onReport}
          className="rounded-2xl border-2 border-dashed border-mp-red/40 bg-white p-4 text-left"
        >
          <div className="text-[15px] font-semibold text-mp-red">Notes replaced by Report Deviation</div>
          <div className="text-[12px] text-mp-muted">
            Structured issue type, photo and voice memo go straight to the Munich expert.
          </div>
        </button>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[14px] font-semibold text-mp-muted">{title}</div>
      <div className="divide-y divide-mp-line overflow-hidden rounded-2xl bg-white">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-14 items-center justify-between px-4 text-[16px]">
      <span>{label}</span>
      {children}
    </div>
  );
}

function LockedValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-mp-panel px-3 py-1.5 text-[15px] tabular-nums text-mp-muted">
      {children}
      <Lock size={12} />
    </span>
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
