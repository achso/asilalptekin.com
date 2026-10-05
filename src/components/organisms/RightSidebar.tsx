"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronsUpDown, Info, Loader2, Lock, X } from "lucide-react";
import { ROOM, elementInfo, objectById, wallById } from "@/lib/floorplan";
import type {
  ElementMedia,
  Escalation,
  EscalationDraft,
  EscalationStatus,
  ObjectDims,
  SelectedElement,
} from "@/lib/types";
import { type TabRequest, useTabRequest } from "@/lib/useTabRequest";
import { cn } from "@/lib/utils";
import { isActive } from "@/store/deviationMachine";
import { EscalationCard, toEscalationCardProps } from "@/components/molecules/EscalationCard";
import { SegmentedControl } from "@/components/atoms/SegmentedControl";
import { PhotoEvidenceCapture } from "@/components/molecules/PhotoEvidenceCapture";
import type { Draft } from "@/store/useDeviationState";
type DraftPatch = Partial<Pick<Draft, "measuredM" | "proposed">>;
import { EscalationDraftPane } from "./EscalationDraftPane";
import { RoomDefaultSidebar } from "./RoomDefaultSidebar";

type Props = {
  selected: SelectedElement | null;
  selectedEscalation?: Escalation;
  /** The intercepted proposal; non-null switches the panel to the EscalationDraftPane. */
  draft: Draft | null;
  escalations: Escalation[];
  onCancelDraft: () => void;
  /** The pane's inputs edit the draft in the store (shared with canvas + popover). */
  onDraftChange: (patch: DraftPatch) => void;
  /** Value pills → the Change Measurement popover. */
  onMeasureWall?: (wallId: string) => void;
  onMeasureObject?: (id: string, field: keyof ObjectDims) => void;
  /** Open a tab in whichever panel shows (Insert → Note / Photo / Form). */
  tabRequest?: TabRequest | null;
  onTabRequestHandled?: () => void;
  onSubmit: (draft: EscalationDraft) => void;
  onFocus: (t: SelectedElement) => void;
  onClear: () => void;
  onRevoke: (id: string) => void;
  /** Standard Photos & Notes per element (store-owned, drives the canvas paperclip). */
  mediaFor: (el: SelectedElement) => ElementMedia;
  onMediaChange: (el: SelectedElement, m: ElementMedia) => void;
  /** Optimistically revoked report for the selected target, awaiting server confirmation. */
  pendingRevoke?: Escalation;
  className?: string;
};

type Mode = "summary" | "inspector" | "form";

/**
 * RightSidebar (organism): the contextual panel, three states:
 *
 *  - summary   (nothing selected)          → RoomDefaultSidebar (room details), with the full
 *                                            EscalationCard(s) on top while any are unresolved
 *  - inspector (wall/corner/room selected) → Details / Photos & Notes / Forms, plus
 *                                            the element's EscalationCard if reported
 *  - form      (an intercepted action)     → EscalationDraftPane slides in
 */
export function RightSidebar(props: Props) {
  const { selected, draft } = props;
  const mode: Mode = draft ? "form" : selected ? "inspector" : "summary";
  // A new intent (or target) remounts the pane so its inputs start fresh.
  const draftKey = draft ? `form-${draft.anchor.id}-${draft.intent}` : "";

  // Photos & Notes live in the store (the canvas shows a paperclip for them).
  // The room panel and the floor share the room's entry.
  const { mediaFor } = props;
  const setMediaFor = (el: SelectedElement) => (m: ElementMedia) => props.onMediaChange(el, m);
  const roomEl: SelectedElement = { type: "room", id: ROOM.id };
  const activeEscalations = props.escalations.filter(isActive); // newest first

  return (
    <aside
      aria-label="Escalations"
      className={cn("relative h-full overflow-hidden border-l border-mp-line bg-mp-panel", props.className)}
    >
      {/* Panels are absolutely positioned, so enter/exit overlap without
          popLayout's synchronous layout measurement. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={mode === "summary" ? "summary" : mode === "form" ? draftKey : `${mode}-${selected?.id}`}
          initial={{ opacity: 0, x: mode === "form" ? 40 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "form" ? 40 : -16 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          className="absolute inset-0 flex flex-col will-change-transform"
        >
          {mode === "form" && draft ? (
            <EscalationDraftPane
              draft={draft}
              onCancel={props.onCancelDraft}
              onSubmit={props.onSubmit}
              onChange={props.onDraftChange}
            />
          ) : mode === "inspector" && selected ? (
            <Inspector
              target={selected}
              escalation={props.selectedEscalation}
              pendingRevoke={props.pendingRevoke}
              onClear={props.onClear}
              tabRequest={props.tabRequest}
              onTabRequestHandled={props.onTabRequestHandled}
              onMeasureWall={props.onMeasureWall}
              onMeasureObject={props.onMeasureObject}
              onRevoke={props.onRevoke}
              media={mediaFor(selected)}
              onMediaChange={setMediaFor(selected)}
            />
          ) : (
            <RoomDefaultSidebar
              className="w-full"
              media={mediaFor(roomEl)}
              onMediaChange={setMediaFor(roomEl)}
              tabRequest={props.tabRequest}
              onTabRequestHandled={props.onTabRequestHandled}
              // Full cards (photo, status, Revoke) for every unresolved report, newest first.
              // Tapping a card selects its element on the plan.
              escalations={activeEscalations.map((e) => ({
                id: e.id,
                ...toEscalationCardProps(e),
                onPress: () => props.onFocus(e.target),
                onRevoke: () => props.onRevoke(e.id),
              }))}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

const TABS = ["Details", "Photos & Notes", "Forms"] as const;
type Tab = (typeof TABS)[number];

/** magicplan's element inspector, kept familiar — but read-only while the plan is locked. */
function Inspector({
  target,
  escalation,
  pendingRevoke,
  onClear,
  onRevoke,
  media,
  onMediaChange,
  tabRequest,
  onTabRequestHandled,
  onMeasureWall,
  onMeasureObject,
}: {
  target: SelectedElement;
  escalation?: Escalation;
  pendingRevoke?: Escalation;
  onClear: () => void;
  onRevoke: (id: string) => void;
  media: ElementMedia;
  onMediaChange: (m: ElementMedia) => void;
  tabRequest?: TabRequest | null;
  onTabRequestHandled?: () => void;
  onMeasureWall?: (wallId: string) => void;
  onMeasureObject?: (id: string, field: keyof ObjectDims) => void;
}) {
  const [tab, setTab] = useState<Tab>("Details");
  const rootRef = useRef<HTMLDivElement>(null);
  useTabRequest(tabRequest, setTab, onTabRequestHandled, rootRef);
  const { label } = elementInfo(target);

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-3 pt-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white">
          <Info size={19} />
        </span>
        <div className="min-w-0 flex-1 truncate whitespace-nowrap text-[17px] font-semibold">{label}</div>
        <button
          onClick={onClear}
          aria-label="Close"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-mp-muted"
        >
          <X size={20} />
        </button>
      </div>

      <SegmentedControl
        label="Element panels"
        options={TABS}
        value={tab}
        onChange={setTab}
        className="mx-5"
      />

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

        {tab === "Details" && (
          <DetailsTab target={target} onMeasureWall={onMeasureWall} onMeasureObject={onMeasureObject} />
        )}
        {tab === "Photos & Notes" && (
          <PhotoEvidenceCapture
            photos={media.photos}
            onPhotosChange={(photos) => onMediaChange({ ...media, photos })}
            note={media.note}
            onNoteChange={(note) => onMediaChange({ ...media, note })}
          />
        )}
        {tab === "Forms" && (
          <div className="rounded-2xl bg-white p-4 text-[14px] text-mp-muted">
            No forms attached to this {target.type}.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailsTab({
  target,
  onMeasureWall,
  onMeasureObject,
}: {
  target: SelectedElement;
  onMeasureWall?: (wallId: string) => void;
  onMeasureObject?: (id: string, field: keyof ObjectDims) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Group title="Dimensions">
        {dimensionRows(target, onMeasureWall, onMeasureObject).map(({ label, value, onTap }) => (
          <Row key={label} label={label}>
            {onTap ? (
              <ValuePill label={label} value={value} onTap={onTap} />
            ) : (
              <LockedValue>{value}</LockedValue>
            )}
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
      {target.type === "object" && (
        <Group title="Settings">
          <Row label="Display Label">
            <LockedValue>Never</LockedValue>
          </Row>
        </Group>
      )}
      <p className="flex gap-2 text-[12px] leading-snug text-mp-muted">
        <Lock size={14} className="mt-0.5 shrink-0" />
        {target.type === "object"
          ? "The plan is locked. Changing a value or rotating the object on the plan (drag the arrow) proposes the change to the remote expert; the plan itself stays as it is."
          : "Geometry is read-only because the permit is approved. Tap a value (or a dimension on the plan), or use Insert, to propose a change to the remote expert."}
      </p>
    </div>
  );
}

/**
 * Inspector rows. Rows with `onTap` open the Change Measurement popover
 * (the proposal path); the rest are derived values and stay locked.
 */
function dimensionRows(
  target: SelectedElement,
  onMeasureWall?: (wallId: string) => void,
  onMeasureObject?: (id: string, field: keyof ObjectDims) => void,
): { label: string; value: string; onTap?: () => void }[] {
  switch (target.type) {
    case "wall": {
      const w = wallById(target.id);
      return [
        { label: "Length", value: `${w.lengthM.toFixed(2)} m`, onTap: onMeasureWall && (() => onMeasureWall(w.id)) },
        { label: "Openings", value: String(w.openings?.length ?? 0) },
      ];
    }
    case "corner":
      return [{ label: "Angle", value: "90°" }];
    case "room":
      return [
        { label: "Width", value: `${ROOM.depthM.toFixed(2)} m` },
        { label: "Length", value: `${ROOM.widthM.toFixed(2)} m` },
        { label: "Ceiling Height", value: `${ROOM.ceilingM.toFixed(2)} m` },
        { label: "Floor area", value: ROOM.stats.floorArea },
        { label: "Perimeter", value: ROOM.stats.perimeter },
      ];
    case "object": {
      const o = objectById(target.id);
      const tap = (field: keyof ObjectDims) => onMeasureObject && (() => onMeasureObject(o.id, field));
      return [
        { label: "Width", value: `${o.widthM.toFixed(2)} m`, onTap: tap("widthM") },
        { label: "Depth", value: `${o.depthM.toFixed(2)} m`, onTap: tap("depthM") },
        { label: "Height", value: `${o.heightM.toFixed(2)} m`, onTap: tap("heightM") },
        { label: "Rotation", value: `${o.rotation}°`, onTap: tap("rotation") },
      ];
    }
    case "ghost":
      return [];
  }
}

/** magicplan's value pill (value + ⌃⌄): opens the Change Measurement popover. */
function ValuePill({ label, value, onTap }: { label: string; value: string; onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`${label} ${value}. Change measurement`}
      className="flex min-h-11 items-center gap-2 rounded-lg bg-[#f0f0f2] px-3 text-[15px] tabular-nums text-mp-ink hover:bg-gray-200 active:bg-gray-300"
    >
      {value}
      <ChevronsUpDown size={15} className="text-mp-muted" aria-hidden />
    </button>
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
  in_review: "The remote expert has this open. Leave this wall as it is for now.",
  resolved: "Plan updated by the expert. This wall is unblocked. Report again if it still doesn't match.",
};

/** Shown while an optimistic revoke waits for the server to confirm. */
function RevokeInFlight({ e }: { e: Escalation }) {
  return (
    <div className="mb-4 rounded-2xl border-2 border-dashed border-mp-line bg-white p-4">
      <div className="flex items-center gap-2 text-[14px] font-semibold">
        <Loader2 size={16} className="animate-spin text-mp-blue" /> Revoking {e.targetLabel} report…
      </div>
      <p className="mt-1 text-[12px] text-mp-muted">
        Wall unlocked on this iPad. Waiting for the expert to confirm. If the expert opened it in the
        meantime, it will come back.
      </p>
    </div>
  );
}

