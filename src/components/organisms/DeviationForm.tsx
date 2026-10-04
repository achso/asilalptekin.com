"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useRef, useState } from "react";
import { StepLabel } from "@/components/atoms/StepLabel";
import { Switch } from "@/components/atoms/Switch";
import { CategoryChips } from "@/components/molecules/CategoryChips";
import { IssueTypePicker } from "@/components/molecules/IssueTypePicker";
import { ModalHeader } from "@/components/molecules/ModalHeader";
import { NumericStepper } from "@/components/molecules/NumericStepper";
import { PhotoEvidenceCapture } from "@/components/molecules/PhotoEvidenceCapture";
import { VoiceMemoToggle, type VoiceMemo } from "@/components/molecules/VoiceMemoToggle";
import { PROJECT, elementInfo } from "@/lib/floorplan";
import type { ElementCategory, EscalationDraft, IssueType, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * DeviationForm (organism)
 *
 * Takes over the right sidebar (replacing magicplan's generic "Photos & Notes")
 * with structured inputs. The canvas stays visible, so the anchored element
 * remains in view. Composed from isolated molecules:
 *
 *   IssueTypePicker  → what's wrong (grouped list), with inline follow-ups:
 *     CategoryChips  → which object (one shallow level), required for
 *                      Undocumented Element; unlocks Evidence
 *     NumericStepper → measured length, only for Dimension Mismatch on a wall
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
};

export function DeviationForm({ anchor, onCancel, onSubmit }: DeviationFormProps) {
  const { label, plannedM } = elementInfo(anchor);

  const [issue, setIssue] = useState<IssueType | null>(null);
  const [category, setCategory] = useState<ElementCategory | null>(null);
  const evidenceRef = useRef<HTMLElement>(null);
  const [measured, setMeasured] = useState(plannedM ?? 0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [voiceMemo, setVoiceMemo] = useState<VoiceMemo | undefined>();
  const [recording, setRecording] = useState(false);
  const [blocking, setBlocking] = useState(true);

  // Submit stays disabled until there's an issue type (plus its category for
  // Undocumented Element) and at least one photo. Evidence itself stays locked
  // until the issue step is complete.
  const hasPhoto = photos.length > 0;
  const needsCategory = issue === "undocumented-element";
  const issueDone = !!issue && (!needsCategory || !!category);
  const missing = [
    !issue && "issue type",
    needsCategory && !category && "category",
    !hasPhoto && "photo",
  ].filter(Boolean) as string[];
  const canSend = missing.length === 0 && !recording;
  const showStepper = issue === "dimension-mismatch" && plannedM !== undefined;

  const send = () => {
    if (!issue || !issueDone || !hasPhoto) return;
    onSubmit({
      issueType: issue,
      category: needsCategory ? (category ?? undefined) : undefined,
      plannedM,
      measuredM: showStepper ? measured : undefined,
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
        subtitle={`${label}${plannedM !== undefined ? ` · plan ${plannedM.toFixed(2)} m` : ""}`}
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
                <div className="flex flex-col gap-2">
                  <p className="text-[13px] font-semibold text-mp-ink">
                    Category <span className="text-mp-red">*</span>
                  </p>
                  <CategoryChips
                    value={category}
                    onChange={(c) => {
                      setCategory(c);
                      // Evidence just unlocked: bring the camera into view.
                      requestAnimationFrame(() =>
                        evidenceRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
                      );
                    }}
                  />
                </div>
              ) : id === "dimension-mismatch" && showStepper ? (
                <NumericStepper
                  label="Measured on site"
                  value={measured}
                  onChange={setMeasured}
                  reference={plannedM}
                />
              ) : null
            }
          />
        </section>

        <section ref={evidenceRef} className="flex scroll-mt-4 flex-col gap-2.5">
          <StepLabel n={2} done={issueDone && hasPhoto}>
            Evidence <span className="text-mp-red">*</span>
            <span className="ml-1.5 text-[12px] font-normal text-mp-muted">at least 1 photo</span>
          </StepLabel>
          {/* Locked until step 1 is complete (incl. the category), so the
              camera only opens once we know what the photo is of. */}
          {!issueDone && (
            <p className="text-[13px] text-mp-muted">
              {needsCategory ? "Pick a category to unlock the camera." : "Pick an issue type to unlock the camera."}
            </p>
          )}
          <div
            inert={!issueDone}
            aria-disabled={!issueDone}
            className={cn("transition-opacity duration-200", !issueDone && "opacity-40")}
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
