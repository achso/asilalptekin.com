"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Send } from "lucide-react";
import { useState } from "react";
import { StepLabel } from "@/components/atoms/StepLabel";
import { Switch } from "@/components/atoms/Switch";
import { IssueTypePicker } from "@/components/molecules/IssueTypePicker";
import { NumericStepper } from "@/components/molecules/NumericStepper";
import { PhotoCapture, type PhotoValue } from "@/components/molecules/PhotoCapture";
import { VoiceMemoToggle, type VoiceMemo } from "@/components/molecules/VoiceMemoToggle";
import { PROJECT, elementInfo } from "@/lib/floorplan";
import type { EscalationDraft, IssueType, SelectedElement } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * DeviationForm (organism)
 *
 * Takes over the right sidebar (replacing magicplan's generic "Photos & Notes")
 * with structured inputs. The canvas stays visible, so the anchored element
 * remains in view. Composed from isolated molecules:
 *
 *   IssueTypePicker  → what's wrong (radio tiles)
 *   NumericStepper   → measured length, only for Dimension Mismatch on a wall
 *   PhotoCapture     → mandatory photo + optional caption
 *   VoiceMemoToggle  → optional memo
 *
 * It submits an `EscalationDraft`; the store adds the anchor, id, timestamps
 * and lifecycle status.
 */
export type DeviationFormProps = {
  /** The plan element (type + id) this ticket is anchored to. */
  anchor: SelectedElement;
  onCancel: () => void;
  onSubmit: (draft: EscalationDraft) => void;
};

export function DeviationForm({ anchor, onCancel, onSubmit }: DeviationFormProps) {
  const { label, plannedM } = elementInfo(anchor);

  const [issue, setIssue] = useState<IssueType | null>(null);
  const [measured, setMeasured] = useState(plannedM ?? 0);
  const [photo, setPhoto] = useState<PhotoValue | null>(null);
  const [voiceMemo, setVoiceMemo] = useState<VoiceMemo | undefined>();
  const [recording, setRecording] = useState(false);
  const [blocking, setBlocking] = useState(true);

  const missing = [!issue && "issue type", !photo && "photo"].filter(Boolean) as string[];
  const canSend = missing.length === 0 && !recording;
  const showStepper = issue === "dimension-mismatch" && plannedM !== undefined;

  const send = () => {
    if (!issue || !photo) return;
    onSubmit({
      issueType: issue,
      plannedM,
      measuredM: showStepper ? measured : undefined,
      photoUrl: photo.url,
      photoCaption: photo.caption.trim() || undefined,
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
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-mp-line px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-11 items-center gap-0.5 rounded-full pl-1 pr-3 text-[16px] font-medium text-mp-blue active:bg-black/5"
        >
          <ChevronLeft size={24} /> Cancel
        </button>
        <div className="flex-1 text-right leading-tight">
          <div className="text-[18px] font-semibold">Report Deviation</div>
          <div className="text-[13px] text-mp-muted">
            {label}
            {plannedM !== undefined && ` · plan ${plannedM.toFixed(2)} m`}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        <section className="flex flex-col gap-2.5">
          <StepLabel n={1} done={!!issue}>
            Issue type
          </StepLabel>
          <IssueTypePicker value={issue} onChange={setIssue} />
          <AnimatePresence initial={false}>
            {showStepper && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <NumericStepper
                  label="Measured on site"
                  value={measured}
                  onChange={setMeasured}
                  reference={plannedM}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="flex flex-col gap-2.5">
          <StepLabel n={2} done={!!photo}>
            Photo <span className="text-mp-red">*</span>
          </StepLabel>
          <PhotoCapture value={photo} onChange={setPhoto} />
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
          {canSend ? "Send to Munich" : recording ? "Stop recording first" : `Add ${missing.join(" + ")}`}
        </motion.button>
        <p className="mt-2 text-[11px] leading-snug text-mp-muted">
          Auto-attached: plan snapshot, dimensions, budget ≈ €
          {PROJECT.budgetEur.toLocaleString("de-DE")}, permit {PROJECT.permit.toLowerCase()}.
        </p>
      </div>
    </form>
  );
}
