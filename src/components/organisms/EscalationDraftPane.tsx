"use client";

import { motion } from "framer-motion";
import { MapPinCheck, Move3d, PackagePlus, Ruler, Send } from "lucide-react";
import { useState } from "react";
import { StepLabel } from "@/components/atoms/StepLabel";
import { Switch } from "@/components/atoms/Switch";
import { ModalHeader } from "@/components/molecules/ModalHeader";
import { NumericStepper } from "@/components/molecules/NumericStepper";
import { PhotoEvidenceCapture } from "@/components/molecules/PhotoEvidenceCapture";
import { VoiceMemoToggle, type VoiceMemo } from "@/components/molecules/VoiceMemoToggle";
import { PROJECT, ROOM, objectById, objectDims, wallById } from "@/lib/floorplan";
import type { EscalationDraft, ObjectDims } from "@/lib/types";
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
  const plannedM = isWallLength ? wallById(anchor.id).lengthM : undefined;
  const plan = isObject ? objectDims(objectById(anchor.id)) : null;
  const proposed = draft.proposed;
  const changed = plan && proposed ? OBJECT_INPUTS.filter((i) => proposed[i.key] !== plan[i.key]) : [];

  const measured = draft.measuredM ?? null;
  const setMeasured = (v: number) => onChange({ measuredM: v });
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [voiceMemo, setVoiceMemo] = useState<VoiceMemo | undefined>();
  const [recording, setRecording] = useState(false);
  const [blocking, setBlocking] = useState(true);

  const hasLength = measured !== null && measured > 0;
  const hasPhoto = photos.length > 0;
  const structuredDone = isObject ? changed.length > 0 : hasLength;
  const missing = [!structuredDone && (isObject ? "change" : "length"), !hasPhoto && "photo"].filter(
    Boolean,
  ) as string[];
  const canSend = missing.length === 0 && !recording;

  const send = () => {
    if (!canSend) return;
    onSubmit({
      issueType: isWallLength || isObject ? "dimension-mismatch" : "undocumented-element",
      plannedM,
      measuredM: isObject ? undefined : (measured ?? undefined),
      category: intent === "missing-element" ? category : undefined,
      objectChange: isObject && plan && proposed ? { from: plan, to: proposed } : undefined,
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
        title="Escalation Draft"
        subtitle={label}
        onClose={onCancel}
        closeLabel="Discard draft"
        className="border-b border-mp-line"
      />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        {/* "Proposing: …" — what the locked plan intercepted */}
        <div role="status" className="flex items-center gap-3 rounded-2xl bg-white p-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-mp-red">
            {isWallLength ? (
              <Ruler size={22} aria-hidden />
            ) : isObject ? (
              <Move3d size={22} aria-hidden />
            ) : (
              <PackagePlus size={22} aria-hidden />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-mp-red">Proposing</span>
            <span className="block truncate whitespace-nowrap text-[16px] font-semibold text-mp-ink">
              {isWallLength || isObject ? "Dimension Mismatch" : "Undocumented Element"}
            </span>
            <span className="block text-[12px] leading-snug text-mp-muted">
              {isWallLength
                ? `${label} · plan ${plannedM!.toFixed(2)} m`
                : isObject
                  ? `${label} · drawn red on the plan`
                  : `→ ${category ?? "Element"} (not on the plan)`}
            </span>
          </span>
        </div>

        {isObject && plan && proposed ? (
          <section className="flex flex-col gap-2.5">
            <StepLabel n={1} done={structuredDone}>
              Proposed changes <span className="text-mp-red">*</span>
              <span className="ml-1.5 text-[12px] font-normal text-mp-muted">
                {changed.length ? `${changed.length} changed` : "none yet"}
              </span>
            </StepLabel>
            <p className="px-1 text-[12px] leading-snug text-mp-muted">
              Edit here, tap a value on the plan, or drag the rotate arrow. The plan stays locked.
            </p>
            {OBJECT_INPUTS.map((i) => (
              <NumericStepper
                key={i.key}
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
                <span className="block text-[15px] font-semibold text-mp-ink">Placed on plan</span>
                <span className="block text-[12px] leading-snug text-mp-muted">
                  {marker.x.toFixed(2)} m from west · {marker.y.toFixed(2)} m from north · tap the plan to move
                </span>
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
          <StepLabel n={2} done={hasPhoto}>
            Evidence <span className="text-mp-red">*</span>
            <span className="ml-1.5 text-[12px] font-normal text-mp-muted">at least 1 photo</span>
          </StepLabel>
          <PhotoEvidenceCapture photos={photos} onPhotosChange={setPhotos} note={note} onNoteChange={setNote} />
        </section>

        <section className="flex flex-col gap-2.5">
          <StepLabel n={3} done={!!voiceMemo} optional>
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
        <ul aria-label="Attached automatically" className="mb-2.5 flex flex-wrap gap-1.5">
          {[`Budget €${PROJECT.budgetEur / 1000}k`, "Permit approved", "Plan snapshot"].map((m) => (
            <li
              key={m}
              className="whitespace-nowrap rounded-full bg-mp-panel px-2.5 py-1 text-[11px] font-medium text-mp-muted"
            >
              {m}
            </li>
          ))}
        </ul>
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
      </div>
    </form>
  );
}
