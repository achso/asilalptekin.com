"use client";

import { motion } from "framer-motion";
import { Check, MapPinCheck, Move3d, PackagePlus, Ruler, Send, Trash2, TriangleAlert, SearchX } from "lucide-react";
import { useState } from "react";
import { StepLabel } from "@/components/atoms/StepLabel";
import { Switch } from "@/components/atoms/Switch";
import { ModalHeader } from "@/components/molecules/ModalHeader";
import { NumericStepper } from "@/components/molecules/NumericStepper";
import { PhotoEvidenceCapture } from "@/components/molecules/PhotoEvidenceCapture";
import { VoiceMemoToggle, type VoiceMemo } from "@/components/molecules/VoiceMemoToggle";
import { ISSUE_TYPES, PROJECT, ROOM, issueLabel, objectById, objectDims, wallById, wallSpotText } from "@/lib/floorplan";
import type { EscalationDraft, IssueType, ObjectDims } from "@/lib/types";
import { cn } from "@/lib/utils";
import { type Draft, draftLabel } from "@/store/useDeviationState";

/**
 * EscalationDraftPane (organism)
 *
 * "Intercept and Propose", Wizard of Oz: two hardcoded paths, no issue-type
 * list. The pane slides in with the intent already known and asks only for
 * what it needs:
 *
 *   wall-length  (4.55 popover → Propose Correction)
 *                Dimension Mismatch: Measured Length vs the plan's 4.55 m
 *   missing-element (Insert → Object → a category → tap the plan)
 *                Undocumented Element → <category>: where it is + its length
 *
 * Both need a reading > 0 and at least one photo. Budget, permit status and a
 * plan snapshot are attached automatically and shown above Send.
 */
export type EscalationDraftPaneProps = {
  draft: Draft;
  /** Close (✕): discard the draft, keep the selection. */
  onCancel: () => void;
  onSubmit: (draft: EscalationDraft) => void;
  /**
   * The values live in the draft (store), shared with the canvas (rotate
   * handle, ghost) and the Change Measurement popover, so every entry point
   * edits the same proposal.
   */
  onChange: (patch: Partial<Pick<Draft, "measuredM" | "proposed">>) => void;
};

const OBJECT_INPUTS: { key: keyof ObjectDims; label: string }[] = [
  { key: "widthM", label: "Width" },
  { key: "depthM", label: "Depth" },
  { key: "heightM", label: "Height" },
  { key: "rotation", label: "Rotation" },
];

export function EscalationDraftPane({ draft, onCancel, onSubmit, onChange }: EscalationDraftPaneProps) {
  const { anchor, intent, marker, category } = draft;
  const label = draftLabel(anchor);
  const isWallLength = intent === "wall-length";
  const isObject = intent === "object-change";
  // Delete… on a wall / corner / object: nothing to measure, only evidence.
  const isRemove = intent === "remove";
  const plannedM = isWallLength ? wallById(anchor.id).lengthM : undefined;
  const plan = isObject ? objectDims(objectById(anchor.id)) : null;
  const proposed = draft.proposed;
  const moved =
    !!plan && !!proposed && Math.hypot(proposed.center.x - plan.center.x, proposed.center.y - plan.center.y) > 0.005;
  const changed = [
    ...(plan && proposed ? OBJECT_INPUTS.filter((i) => proposed[i.key] !== plan[i.key]) : []),
    ...(moved ? [{ key: "center", label: "Position" }] : []),
  ];

  // The intercepted action implies the issue type; the contractor can still
  // change it (e.g. to Site Condition Hazard). Then the intercept's inputs
  // aren't needed: the photo and note carry it.
  const naturalType: IssueType = isRemove
    ? "element-not-on-site"
    : isWallLength || isObject
      ? "dimension-mismatch"
      : "undocumented-element";
  const [issueType, setIssueType] = useState<IssueType>(naturalType);
  const [pickingType, setPickingType] = useState(false);
  const overridden = issueType !== naturalType;

  const measured = draft.measuredM ?? null;
  const setMeasured = (v: number) => onChange({ measuredM: v });
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [voiceMemo, setVoiceMemo] = useState<VoiceMemo | undefined>();
  const [recording, setRecording] = useState(false);
  const [blocking, setBlocking] = useState(true);

  const hasLength = measured !== null && measured > 0;
  const hasPhoto = photos.length > 0;
  const structuredDone = overridden || isRemove || (isObject ? changed.length > 0 : hasLength);
  const missing = [!structuredDone && (isObject ? "change" : "length"), !hasPhoto && "photo"].filter(
    Boolean,
  ) as string[];
  const canSend = missing.length === 0 && !recording;

  const send = () => {
    if (!canSend) return;
    // Changed type: send the type, photo and note; skip the intercept's values.
    const keep = !overridden;
    onSubmit({
      issueType,
      plannedM: keep ? plannedM : undefined,
      measuredM: keep && !isObject && !isRemove ? (measured ?? undefined) : undefined,
      category: keep && intent === "missing-element" ? category : undefined,
      objectChange: keep && isObject && plan && proposed ? { from: plan, to: proposed } : undefined,
      photoUrls: photos,
      note: note.trim() || undefined,
      voiceMemo,
      blocking,
    });
  };

  return (
    <form
      className="flex h-full flex-col"
      aria-label={`Escalation draft for ${label}`}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <ModalHeader
        leading="info"
        title="Report Deviation"
        subtitle={isWallLength ? `${label} · plan ${plannedM!.toFixed(2)} m` : label}
        onClose={onCancel}
        closeLabel="Discard draft"
        className="border-b border-mp-line"
      />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        {/* "Proposing: …" — what the locked plan intercepted */}
        <div role="status" className="flex items-center gap-3 rounded-2xl bg-white p-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-mp-red">
            {overridden ? (
              issueType === "site-condition-hazard" ? (
                <TriangleAlert size={22} aria-hidden />
              ) : issueType === "element-not-on-site" ? (
                <SearchX size={22} aria-hidden />
              ) : (
                <PackagePlus size={22} aria-hidden />
              )
            ) : isRemove ? (
              <Trash2 size={22} aria-hidden />
            ) : isWallLength ? (
              <Ruler size={22} aria-hidden />
            ) : isObject ? (
              <Move3d size={22} aria-hidden />
            ) : (
              <PackagePlus size={22} aria-hidden />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-mp-red">Proposing</span>
              {/* Padded hit area (44 px tall) without pushing the title around. */}
              <button
                type="button"
                onClick={() => setPickingType((v) => !v)}
                aria-expanded={pickingType}
                className="-my-3 -mr-1 px-2 py-3 text-[13px] font-semibold text-mp-blue"
              >
                {pickingType ? "Done" : "Change type"}
              </button>
            </span>
            <span className="block truncate whitespace-nowrap text-[16px] font-semibold text-mp-ink">
              {issueLabel(issueType)}
            </span>
            <span className="block text-[12px] leading-snug text-mp-muted">
              {overridden
                ? `${label} · ${ISSUE_TYPES.find((t) => t.id === issueType)?.description ?? ""}`
                : isRemove
                ? `${label} · drawn on the plan, missing on site`
                : isWallLength
                ? `${label} · plan ${plannedM!.toFixed(2)} m`
                : isObject
                  ? `${label} · drawn red on the plan`
                  : `→ ${category ?? "Element"} (not on the plan)`}
            </span>
          </span>
        </div>

        {/* Issue type: title + subtitle, no tooltips. The intercept preselects it. */}
        {pickingType && (
          <div role="radiogroup" aria-label="Issue type" className="-mt-2 shrink-0 divide-y divide-mp-line overflow-hidden rounded-2xl bg-white">
            {ISSUE_TYPES.map((t) => {
              const active = issueType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setIssueType(t.id);
                    setPickingType(false);
                  }}
                  className={cn(
                    "flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 text-left",
                    active ? "bg-blue-50" : "bg-white active:bg-gray-50",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate whitespace-nowrap text-[15px] font-semibold text-mp-ink">
                      {t.label}
                      {t.id === naturalType && <span className="ml-1.5 text-[12px] font-normal text-mp-muted">· suggested</span>}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-gray-500">{t.description}</span>
                  </span>
                  <Check size={18} strokeWidth={2.75} aria-hidden className={cn("shrink-0 text-mp-blue", active ? "opacity-100" : "opacity-0")} />
                </button>
              );
            })}
          </div>
        )}

        {overridden ? (
          <p className="-mt-2 px-1 text-[13px] leading-snug text-mp-muted">
            Reported as {issueLabel(issueType)}: the photo and your note carry the details.
          </p>
        ) : isRemove ? (
          <p className="-mt-2 px-1 text-[13px] leading-snug text-mp-muted">
            Nothing is deleted: the plan stays locked. The remote expert reviews the removal and
            updates the plan. A photo of the spot is all that&apos;s needed.
          </p>
        ) : isObject && plan && proposed ? (
          <section className="flex flex-col gap-2.5">
            <StepLabel n={1} done={structuredDone}>
              Proposed changes <span className="text-mp-red">*</span>
              <span className="ml-1.5 text-[12px] font-normal text-mp-muted">
                {changed.length ? `${changed.length} changed` : "none yet"}
              </span>
            </StepLabel>
            <p className="px-1 text-[12px] leading-snug text-mp-muted">
              Edit here, tap a value, drag the object to move it or the arrow to rotate it. The plan
              stays locked.
            </p>
            {/* One grouped card, a compact row per value (like magicplan's Dimensions list). */}
            <div className="divide-y divide-mp-line overflow-hidden rounded-xl bg-white">
            {OBJECT_INPUTS.map((i) => (
              <NumericStepper
                key={i.key}
                compact
                label={i.label}
                value={proposed[i.key]}
                onChange={(v) => onChange({ proposed: { ...proposed, [i.key]: i.key === "rotation" ? v % 360 : v } })}
                reference={plan[i.key]}
                unit={i.key === "rotation" ? "°" : "m"}
                step={i.key === "rotation" ? 45 : 0.05}
                min={i.key === "rotation" ? 0 : 0.05}
                max={i.key === "rotation" ? 360 : i.key === "heightM" ? ROOM.ceilingM : 99.99}
              />
            ))}
            {/* Position is visual only: no coordinates, just whether it moved. */}
            <div className="flex min-h-[60px] items-center gap-2 px-3 py-2">
              <span className="w-[68px] shrink-0 text-[15px] font-medium text-mp-ink">Position</span>
              <span className={cn("min-w-0 flex-1 text-[13px] leading-snug", moved ? "font-medium text-mp-red" : "text-mp-muted")}>
                {moved ? "Moved on plan" : "Drag the object on the plan to move it"}
              </span>
              {moved && (
                <button
                  type="button"
                  onClick={() => onChange({ proposed: { ...proposed, center: plan.center } })}
                  className="h-11 shrink-0 rounded-xl bg-mp-panel px-3 text-[14px] font-semibold active:bg-mp-line"
                >
                  Reset
                </button>
              )}
            </div>
            </div>
          </section>
        ) : (
        <section className="flex flex-col gap-2.5">
          <StepLabel n={1} done={hasLength}>
            Measured on site <span className="text-mp-red">*</span>
          </StepLabel>
          {!isWallLength && marker && (
            <div className="flex min-h-14 items-center gap-3 rounded-xl bg-white px-3 py-2">
              <MapPinCheck size={22} className="shrink-0 text-mp-red" aria-hidden />
              <span className="min-w-0 flex-1">
                {draft.spot ? (
                  <>
                    <span className="block text-[15px] font-semibold text-mp-ink">
                      At the marked spot · {wallById(draft.spot.wallId).label}
                    </span>
                    <span className="block text-[12px] leading-snug text-mp-muted">
                      {wallSpotText(draft.spot)} · {draft.items ? "drag to move, rotate with the arrow" : "drag it along the wall"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block text-[15px] font-semibold text-mp-ink">
                      Placed on plan{(draft.items?.length ?? 0) > 1 ? ` · ${draft.items!.length} items` : ""}
                    </span>
                    <span className="block text-[12px] leading-snug text-mp-muted">
                      {draft.items
                        ? "Drag to move · rotate with the arrow · Duplicate adds one"
                        : `${marker.x.toFixed(2)} m from west · ${marker.y.toFixed(2)} m from north · tap the plan to move`}
                    </span>
                  </>
                )}
              </span>
            </div>
          )}
          <NumericStepper
            label="Measured Length"
            hint={isWallLength ? undefined : category === "Structural" ? "Length of physical wall" : "Length of element"}
            value={measured}
            onChange={setMeasured}
            reference={plannedM}
          />
        </section>
        )}

        <section className="flex flex-col gap-2.5">
          <StepLabel n={isRemove ? 1 : 2} done={hasPhoto}>
            Evidence <span className="text-mp-red">*</span>
            <span className="ml-1.5 text-[12px] font-normal text-mp-muted">at least 1 photo</span>
          </StepLabel>
          <PhotoEvidenceCapture photos={photos} onPhotosChange={setPhotos} note={note} onNoteChange={setNote} />
        </section>

        <section className="flex flex-col gap-2.5">
          <StepLabel n={isRemove ? 2 : 3} done={!!voiceMemo} optional>
            Voice memo
          </StepLabel>
          <VoiceMemoToggle onChange={setVoiceMemo} onRecordingChange={setRecording} />
        </section>

        <button
          type="button"
          role="switch"
          aria-checked={blocking}
          onClick={() => setBlocking((b) => !b)}
          className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[15px] font-semibold">Work is blocked here</span>
            <span className="block text-[12px] text-mp-muted">Prioritised before 15:00 CET</span>
          </span>
          <Switch checked={blocking} />
        </button>
      </div>

      {/* Sticky submit with the auto-attached metadata */}
      <div className="border-t border-mp-line bg-white px-4 pb-4 pt-3">
        <motion.button
          type="submit"
          whileTap={canSend ? { scale: 0.97 } : undefined}
          disabled={!canSend}
          className={cn(
            "flex h-14 w-full items-center justify-center gap-2.5 rounded-xl text-[18px] font-semibold transition-colors",
            canSend
              ? "bg-mp-red text-white shadow-[0_8px_24px_rgba(229,53,43,0.35)]"
              : "bg-mp-line text-mp-muted",
          )}
        >
          <Send size={20} />
          {canSend ? "Send to review" : recording ? "Stop recording first" : `Add ${missing.join(" + ")}`}
        </motion.button>
        {/* Context the expert gets without anyone typing it. */}
        <p aria-label="Attached automatically" className="mt-2.5 text-[11px] leading-snug text-mp-muted">
          <span className="font-semibold">Auto-attached to ticket:</span> Plan snapshot, dimensions. Budget: ≈ €
          {PROJECT.budgetEur.toLocaleString("en-US")}. Permit: {PROJECT.permit}. Site history: last visited 2 years ago
          (different plan). Remote expert available until 15:00 CET.
        </p>
      </div>
    </form>
  );
}
