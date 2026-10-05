"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, MapPinCheck, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StepLabel } from "@/components/atoms/StepLabel";
import { Switch } from "@/components/atoms/Switch";
import { CategoryChips } from "@/components/molecules/CategoryChips";
import { IssueTypePicker } from "@/components/molecules/IssueTypePicker";
import { ModalHeader } from "@/components/molecules/ModalHeader";
import { NumericStepper } from "@/components/molecules/NumericStepper";
import { PhotoEvidenceCapture } from "@/components/molecules/PhotoEvidenceCapture";
import { VoiceMemoToggle, type VoiceMemo } from "@/components/molecules/VoiceMemoToggle";
import { CATEGORY_MEASURES, PROJECT, ROOM, elementInfo } from "@/lib/floorplan";
import type { ElementCategory, EscalationDraft, IssueType, Point, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * DeviationForm (organism)
 *
 * Takes over the right sidebar (replacing magicplan's generic "Photos & Notes")
 * with structured inputs. The canvas stays visible, so the anchored element
 * remains in view. Composed from isolated molecules:
 *
 *   IssueTypePicker  → what's wrong (grouped list), with inline follow-ups:
 *     Undocumented Element, step by step:
 *       CategoryChips  → which object (one shallow level); unlocks Evidence
 *       Location       → tap the plan to drop the Ghost Marker (store-owned)
 *       NumericStepper(s) → revealed once it's placed; what's measured depends
 *                      on the category (CATEGORY_MEASURES): a wall's length,
 *                      a door's width × height, an element's length × height
 *     Dimension Mismatch:
 *       Wall (1D): one NumericStepper, "Measured Length"
 *       Room (2D): two, "Measured Width" (north–south) + "Measured Length"
 *                  (east–west); each starts empty (0.00) with the plan
 *                  value underneath, and must be > 0
 *   PhotoEvidenceCapture → photos (≥ 1 required) + note, magicplan's Photos & Notes layout
 *   VoiceMemoToggle  → optional memo
 *
 * It submits an `EscalationDraft`; the store adds the anchor, id, timestamps
 * and lifecycle status.
 */
export type DeviationFormProps = {
  /** The plan element (type + id) this ticket is anchored to. */
  anchor: SelectedElement;
  /** Close (✕): discard the form, keep the element selected. */
  onCancel: () => void;
  onSubmit: (draft: EscalationDraft) => void;
  /** Ghost Marker placed on the canvas (plan metres), null until the plan is tapped. */
  draftMarker?: Point | null;
  /** Turns canvas placement mode on/off (on once a category is picked). */
  onPlacingChange?: (on: boolean) => void;
};

export function DeviationForm({
  anchor,
  onCancel,
  onSubmit,
  draftMarker = null,
  onPlacingChange,
}: DeviationFormProps) {
  const { label, plannedM, plannedWidthM } = elementInfo(anchor);
  const isRoom = anchor.type === "room";

  const [issue, setIssue] = useState<IssueType | null>(null);
  const [category, setCategory] = useState<ElementCategory | null>(null);
  const [elementLength, setElementLength] = useState<number | null>(null);
  const [elementHeight, setElementHeight] = useState<number | null>(null);
  const lengthRef = useRef<HTMLDivElement>(null);
  // Start empty: a real on-site reading is required, not the plan value.
  const [measured, setMeasured] = useState<number | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [voiceMemo, setVoiceMemo] = useState<VoiceMemo | undefined>();
  const [recording, setRecording] = useState(false);
  const [blocking, setBlocking] = useState(true);

  const hasPhoto = photos.length > 0;
  const undocumented = issue === "undocumented-element";
  const placed = undocumented && !!draftMarker;
  const measure = category ? CATEGORY_MEASURES[category] : null;
  const hasLength = elementLength !== null && elementLength > 0;
  const needsHeight = !!measure?.height;
  const hasHeight = elementHeight !== null && elementHeight > 0;

  // Placement mode follows the flow: on once Undocumented Element has a
  // category, off when the issue type changes or the form closes.
  const placing = undocumented && !!category;
  useEffect(() => {
    onPlacingChange?.(placing);
    return () => onPlacingChange?.(false);
  }, [placing, onPlacingChange]);

  // Dimension Mismatch: a wall has one dimension, the room two. Every input
  // shown must hold a reading > 0.
  const showStepper = issue === "dimension-mismatch" && plannedM !== undefined;
  const positive = (v: number | null) => v !== null && v > 0;
  const dimensionMissing = !showStepper
    ? null
    : isRoom && !positive(measuredWidth)
      ? "width"
      : !positive(measured)
        ? "length"
        : null;

  // The structured step is done when the issue type has everything it needs.
  // Undocumented Element: category → location on the plan → length > 0.
  const issueMissing = !issue
    ? "issue type"
    : undocumented && !category
      ? "category"
      : undocumented && !placed
        ? "location"
        : undocumented && !hasLength
          ? (measure?.primary.label.toLowerCase() ?? "length")
          : undocumented && needsHeight && !hasHeight
            ? "height"
            : dimensionMissing;
  const issueDone = issueMissing === null;
  // Evidence (the camera) unlocks as soon as the category is chosen.
  const evidenceUnlocked = !!issue && (!undocumented || !!category);
  // The button names the next structured gap plus the photo, e.g. "Add length + photo".
  const missing = [issueMissing, !hasPhoto && "photo"].filter(Boolean) as string[];
  const canSend = missing.length === 0 && !recording;

  const send = () => {
    if (!issue || !issueDone || !hasPhoto) return;
    onSubmit({
      issueType: issue,
      category: undocumented ? (category ?? undefined) : undefined,
      marker: undocumented ? (draftMarker ?? undefined) : undefined,
      plannedM: showStepper ? plannedM : undefined,
      measuredM: showStepper ? (measured ?? undefined) : undocumented ? (elementLength ?? undefined) : undefined,
      plannedWidthM: showStepper && isRoom ? plannedWidthM : undefined,
      measuredWidthM: showStepper && isRoom ? (measuredWidth ?? undefined) : undefined,
      heightM: undocumented && needsHeight ? (elementHeight ?? undefined) : undefined,
      photoUrls: photos,
      note: note.trim() || undefined,
      voiceMemo,
      blocking,
    });
  };

  return (
    <form
      className="flex h-full flex-col"
      aria-label={`Report deviation on ${label}`}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      {/* Header: native modal pattern. ⓘ badge, centred title, ✕ cancels (selection kept). */}
      <ModalHeader
        leading="info"
        title="Report Deviation"
        subtitle={
          // Room: short name + both axes, so the subtitle fits without truncating.
          isRoom && plannedM !== undefined && plannedWidthM !== undefined
            ? `${PROJECT.room} · ${plannedM.toFixed(2)} × ${plannedWidthM.toFixed(2)} m`
            : `${label}${plannedM !== undefined ? ` · plan ${plannedM.toFixed(2)} m` : ""}`
        }
        onClose={onCancel}
        closeLabel="Cancel report"
        className="border-b border-mp-line"
      />

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        <section className="flex flex-col gap-2.5">
          <StepLabel n={1} done={issueDone}>
            Issue type
          </StepLabel>
          <IssueTypePicker
            value={issue}
            onChange={setIssue}
            renderDetail={(id) =>
              id === "undocumented-element" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] font-semibold text-mp-ink">
                      Object Category <span className="text-mp-red">*</span>
                    </p>
                    <CategoryChips value={category} onChange={setCategory} />
                  </div>

                  {/* Location: revealed with the category; the canvas is in placement mode. */}
                  {category && <LocationRow marker={draftMarker} />}

                  {/* Length: revealed once the Ghost Marker is on the plan. */}
                  <AnimatePresence initial={false}>
                    {placed && measure && (
                      <motion.div
                        key="length"
                        ref={lengthRef}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                        // The marker just landed: once expanded, bring the length input into view.
                        onAnimationComplete={() =>
                          lengthRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                        }
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-2">
                          <p className="text-[13px] font-semibold text-mp-ink">
                            Measured on site <span className="text-mp-red">*</span>
                          </p>
                          <NumericStepper
                            label={measure.primary.label}
                            hint={measure.primary.hint}
                            placeholder="0.00"
                            value={elementLength}
                            onChange={setElementLength}
                          />
                          {measure.height && (
                            <NumericStepper
                              label="Height"
                              hint={`${measure.height.hint} · ceiling ${ROOM.ceilingM.toFixed(2)} m`}
                              placeholder="0.00"
                              max={ROOM.ceilingM}
                              value={elementHeight}
                              onChange={setElementHeight}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : id === "dimension-mismatch" && showStepper ? (
                isRoom ? (
                  // Room (2D): both axes, stacked (side by side, the gloved
                  // − / + buttons wouldn't fit), each against its own plan value.
                  <div className="flex flex-col gap-2">
                    <NumericStepper
                      label="Measured Width"
                      value={measuredWidth}
                      onChange={setMeasuredWidth}
                      reference={plannedWidthM}
                    />
                    <NumericStepper
                      label="Measured Length"
                      value={measured}
                      onChange={setMeasured}
                      reference={plannedM}
                    />
                  </div>
                ) : (
                  // Wall (1D): a single length.
                  <NumericStepper
                    label="Measured Length"
                    value={measured}
                    onChange={setMeasured}
                    reference={plannedM}
                  />
                )
              ) : null
            }
          />
        </section>

        <section className="flex flex-col gap-2.5">
          <StepLabel n={2} done={evidenceUnlocked && hasPhoto}>
            Evidence <span className="text-mp-red">*</span>
            <span className="ml-1.5 text-[12px] font-normal text-mp-muted">at least 1 photo</span>
          </StepLabel>
          {/* Locked until we know what the photo is of (issue type, plus the
              category for Undocumented Element). */}
          {!evidenceUnlocked && (
            <p className="text-[13px] text-mp-muted">
              {undocumented ? "Pick a category to unlock the camera." : "Pick an issue type to unlock the camera."}
            </p>
          )}
          <div
            inert={!evidenceUnlocked}
            aria-disabled={!evidenceUnlocked}
            className={cn("transition-opacity duration-200", !evidenceUnlocked && "opacity-40")}
          >
            <PhotoEvidenceCapture
              photos={photos}
              onPhotosChange={setPhotos}
              note={note}
              onNoteChange={setNote}
            />
          </div>
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

      {/* Sticky submit */}
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
        <p className="mt-2 text-[11px] leading-snug text-mp-muted">
          Auto-attached: plan snapshot, dimensions, budget ≈ €
          {PROJECT.budgetEur.toLocaleString("de-DE")}, permit {PROJECT.permit.toLowerCase()}.
        </p>
      </div>
    </form>
  );
}

/**
 * Location status for the Ghost Marker. Not a control: the action happens on
 * the canvas, so this row only says what to do and confirms where it landed
 * (distances from the west and north walls, which the expert can check).
 */
function LocationRow({ marker }: { marker: Point | null }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-semibold text-mp-ink">
        Location <span className="text-mp-red">*</span>
      </p>
      <div
        role="status"
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 py-2",
          marker ? "border-transparent bg-white" : "border-dashed border-mp-blue bg-white",
        )}
      >
        {marker ? (
          <MapPinCheck size={22} className="shrink-0 text-mp-blue" />
        ) : (
          <Crosshair size={22} className="shrink-0 animate-pulse text-mp-blue" />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate whitespace-nowrap text-[15px] font-semibold text-mp-ink">
              {marker ? "Marked on plan" : "Tap the plan where it is"}
            </span>
            {marker && (
              <span className="shrink-0 whitespace-nowrap text-[12px] font-medium text-mp-blue">Tap to move</span>
            )}
          </span>
          <span className="block truncate whitespace-nowrap text-[12px] text-mp-muted">
            {marker
              ? `${marker.x.toFixed(2)} m from west · ${marker.y.toFixed(2)} m from north`
              : "Inside the room, on the canvas"}
          </span>
        </span>
      </div>
    </div>
  );
}
