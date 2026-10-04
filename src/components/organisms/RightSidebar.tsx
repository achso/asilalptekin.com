"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FileText, Info, Loader2, Lock, X } from "lucide-react";
import { PROJECT, ROOM, elementInfo, wallById } from "@/lib/floorplan";
import type { Escalation, EscalationDraft, EscalationStatus, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isActive } from "@/store/deviationMachine";
import { EscalationCard, toEscalationCardProps } from "@/components/molecules/EscalationCard";
import { DeviationForm } from "./DeviationForm";

type Props = {
  selected: SelectedElement | null;
  selectedEscalation?: Escalation;
  /** Element the DeviationForm is anchored to; non-null switches the panel to the form. */
  captureAnchor: SelectedElement | null;
  escalations: Escalation[];
  onReport: (anchor: SelectedElement) => void;
  onCancelReport: () => void;
  onSubmit: (draft: EscalationDraft) => void;
  onFocus: (t: SelectedElement) => void;
  onClear: () => void;
  onRevoke: (id: string) => void;
  /** Optimistically revoked report for the selected target, awaiting server confirmation. */
  pendingRevoke?: Escalation;
  className?: string;
};

type Mode = "summary" | "inspector" | "form";

/**
 * RightSidebar (organism): the contextual panel, three states:
 *
 *  - summary   (nothing selected)          → empty state or Active Escalations list
 *  - inspector (wall/corner/room selected) → Details / Photos & Notes / Forms, plus
 *                                            the element's EscalationCard if reported
 *  - form      (Report Deviation tapped)   → DeviationForm takes over the panel
 */
export function RightSidebar(props: Props) {
  const { selected, captureAnchor } = props;
  const mode: Mode = captureAnchor ? "form" : selected ? "inspector" : "summary";

  return (
    <aside
      aria-label="Escalations"
      className={cn("relative h-full overflow-hidden border-l border-mp-line bg-mp-panel", props.className)}
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
          {mode === "form" && captureAnchor ? (
            <DeviationForm
              anchor={captureAnchor}
              onCancel={props.onCancelReport}
              onSubmit={props.onSubmit}
            />
          ) : mode === "inspector" && selected ? (
            <Inspector
              target={selected}
              escalation={props.selectedEscalation}
              pendingRevoke={props.pendingRevoke}
              onReport={props.onReport}
              onClear={props.onClear}
              onRevoke={props.onRevoke}
            />
          ) : (
            <Summary
              escalations={props.escalations}
              onFocus={props.onFocus}
              onRevoke={props.onRevoke}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

function Summary({
  escalations,
  onFocus,
  onRevoke,
}: {
  escalations: Escalation[];
  onFocus: (t: SelectedElement) => void;
  onRevoke: (id: string) => void;
}) {
  const activeCount = escalations.filter(isActive).length;
  // Open items first, resolved ones sink to the bottom.
  const sorted = [...escalations].sort((a, b) => Number(!isActive(a)) - Number(!isActive(b)));
  return (
    <>
      <div className="px-5 pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px] font-semibold">Active Escalations</span>
          <motion.span
            key={activeCount}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-[14px] font-bold ${
              activeCount ? "bg-mp-red text-white" : "bg-mp-line text-mp-muted"
            }`}
          >
            {activeCount}
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
              {sorted.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                >
                  <EscalationCard
                    {...toEscalationCardProps(e)}
                    onPress={() => onFocus(e.target)}
                    onRevoke={() => onRevoke(e.id)}
                  />
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
  pendingRevoke,
  onReport,
  onClear,
  onRevoke,
}: {
  target: SelectedElement;
  escalation?: Escalation;
  pendingRevoke?: Escalation;
  onReport: (anchor: SelectedElement) => void;
  onClear: () => void;
  onRevoke: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("Details");
  const { label } = elementInfo(target);

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
        {pendingRevoke ? (
          <RevokeInFlight e={pendingRevoke} />
        ) : escalation ? (
          <div className="mb-4">
            <EscalationCard
              {...toEscalationCardProps(escalation)}
              onRevoke={() => onRevoke(escalation.id)}
            />
            <p className="mt-2 px-1 text-[12px] text-mp-muted">{INSPECTOR_HINT[escalation.status]}</p>
          </div>
        ) : null}

        {tab === "Details" && <DetailsTab target={target} />}
        {tab === "Photos & Notes" && <PhotosTab onReport={() => onReport(target)} escalated={isActive(escalation)} />}
        {tab === "Forms" && (
          <div className="rounded-2xl bg-white p-4 text-[14px] text-mp-muted">
            No forms attached to this {target.type}.
          </div>
        )}
      </div>
    </>
  );
}

function DetailsTab({ target }: { target: SelectedElement }) {
  return (
    <div className="flex flex-col gap-4">
      <Group title="Dimensions">
        {dimensionRows(target).map(([k, v]) => (
          <Row key={k} label={k}>
            <LockedValue>{v}</LockedValue>
          </Row>
        ))}
      </Group>
      {target.type === "wall" && (
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

function dimensionRows(target: SelectedElement): [string, string][] {
  switch (target.type) {
    case "wall": {
      const w = wallById(target.id);
      return [
        ["Length", `${w.lengthM.toFixed(2)} m`],
        ["Openings", String(w.openings?.length ?? 0)],
      ];
    }
    case "corner":
      return [["Angle", "90°"]];
    case "room":
      return [
        ["Floor area", `${(ROOM.widthM * ROOM.depthM).toFixed(2)} m²`],
        ["Perimeter", `${(2 * (ROOM.widthM + ROOM.depthM)).toFixed(2)} m`],
      ];
  }
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

const INSPECTOR_HINT: Record<EscalationStatus, string> = {
  sending: "Uploading in the background. You can keep working.",
  delivered: "No reply needed. The expert will update the plan. Carry on with other work.",
  in_review: "The Munich expert has this open. Leave this wall as it is for now.",
  resolved: "Plan updated by Munich. This wall is unblocked. Report again if it still doesn't match.",
};

/** Shown while an optimistic revoke waits for the server to confirm. */
function RevokeInFlight({ e }: { e: Escalation }) {
  return (
    <div className="mb-4 rounded-2xl border-2 border-dashed border-mp-line bg-white p-4">
      <div className="flex items-center gap-2 text-[14px] font-semibold">
        <Loader2 size={16} className="animate-spin text-mp-blue" /> Revoking {e.targetLabel} report…
      </div>
      <p className="mt-1 text-[12px] text-mp-muted">
        Wall unlocked on this iPad. Waiting for Munich to confirm. If the expert opened it in the
        meantime, it will come back.
      </p>
    </div>
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
        Plan doesn&apos;t match the room? Tap the wall, corner or floor on the plan, then{" "}
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
